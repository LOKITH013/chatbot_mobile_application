import re
from datetime import date, timedelta
from utils.date_utils import normalize_date

# =====================================================
# NATURAL CONFIRM / CANCEL PHRASES
# =====================================================
CONFIRM_PHRASES = (
    "yes", "yeah", "yep", "ok", "okay", "sure",
    "go ahead", "proceed", "continue", "looks good", "fine"
)

CANCEL_PHRASES = (
    "no", "cancel", "stop", "abort", "don't", "do not"
)

# =====================================================
# HELPERS
# =====================================================
def resolve_relative_date(text: str):
    today = date.today()

    if "yesterday" in text:
        return today - timedelta(days=1)

    if "today" in text:
        return today

    return None


def resolve_date_range(text: str):
    today = date.today()

    if "yesterday" in text:
        d = today - timedelta(days=1)
        return d.isoformat(), d.isoformat()

    if "today" in text:
        return today.isoformat(), today.isoformat()

    if "last week" in text:
        end = today - timedelta(days=today.weekday() + 1)
        start = end - timedelta(days=6)
        return start.isoformat(), end.isoformat()

    if "this week" in text:
        start = today - timedelta(days=today.weekday())
        return start.isoformat(), today.isoformat()

    return None


def extract_tasks(text: str):
    pattern = r'(\d+(?:\.\d+)?)\s*hours?\s+on\s+([^,]+)'
    return [
        {
            "task_description": task.strip().title(),
            "hours": float(hrs),
        }
        for hrs, task in re.findall(pattern, text.lower())
    ]


def extract_total_hours(text: str):
    m = re.search(r'(\d+(?:\.\d+)?)\s*(hours?|hrs?)', text.lower())
    return float(m.group(1)) if m else None


def parse_conditions(text: str):
    conditions = []

    # --- id / hours / status / task_date / date / task operators ---
    for c, o, v in re.findall(
        r'(id|task_date|date|hours|status|task)\s*(=|!=|>=|<=|>|<)\s*(.+?)(?=\s+(?:id|task_date|date|hours|status|task)\s*=|\s*$)',
        text.lower(),
    ):
        if v in ("none", "null"):
            continue

        # normalize column
        if c == "date":
            c = "task_date"
        elif c == "task":
            c = "task_description"

        # normalize value
        if c == "status":
            v = v.upper()
        elif c == "task_description":
            v = v.title()
        elif c == "task_date":
            d = normalize_date(v)
            if d:
                v = d
            else:
                continue  # skip invalid date

        conditions.append({
            "column": c,
            "operator": o,
            "value": int(v) if c == "id"
                     else float(v) if isinstance(v, str) and v.replace(".", "").isdigit()
                     else v,
        })

    # --- natural language date comparisons ---
    if "greater than" in text or "after" in text:
        d = normalize_date(text)
        if d:
            conditions.append({
                "column": "task_date",
                "operator": ">",
                "value": d,
            })

    if "less than" in text or "before" in text:
        d = normalize_date(text)
        if d:
            conditions.append({
                "column": "task_date",
                "operator": "<",
                "value": d,
            })

    return conditions


# =====================================================
# MAIN NLP PARSER
# =====================================================
def parse_nlp(message: str) -> dict:
    text = message.strip()
    lower = text.lower()

    # ---------------- CONFIRM ----------------
    for phrase in CONFIRM_PHRASES:
        if re.search(rf'\b{re.escape(phrase)}\b', lower):
            return {"intent": "confirm"}

    # ---------------- CANCEL ----------------
    for phrase in CANCEL_PHRASES:
        if re.search(rf'\b{re.escape(phrase)}\b', lower):
            return {"intent": "cancel"}

    # ---------------- AGGREGATE (DATE-AWARE) ----------------
    if (
        any(k in lower for k in ("sum", "total", "avg", "average", "min", "max", "count"))
        and any(h in lower for h in ("hours", "hour","hrs", "hr"))
    ):
        func = "sum"
        if "avg" in lower or "average" in lower:
            func = "avg"
        elif "min" in lower:
            func = "min"
        elif "max" in lower:
            func = "max"
        elif "count" in lower:
            func = "count"

        where = []
        date_range = resolve_date_range(lower)
        if date_range:
            where.append({
                "column": "task_date",
                "operator": "between",
                "value": list(date_range),
            })

        return {
            "intent": "aggregate",
            "aggregate": {
                "function": func,
                "column": "hours",
            },
            "where": where or None,
        }

    # ---------------- SELECT (EXTENDED) ----------------
    if any(w in lower for w in ("show", "list", "display", "view")):
        where = []
        
        # Extract date
        date_match = re.search(r'date\s+(.+?)(?=\s+(?:task|id|status|hours|$))', lower)
        if date_match:
            date_str = date_match.group(1).strip()
            d = normalize_date(date_str)
            if d:
                where.append({
                    "column": "task_date",
                    "operator": "=",
                    "value": d,
                })
        
        # Extract task
        task_match = re.search(r'task\s+(.+?)(?=\s+(?:date|id|status|hours|$))', lower)
        if task_match:
            task_str = task_match.group(1).strip().title()
            where.append({
                "column": "task_description",
                "operator": "=",
                "value": task_str,
            })
        
        # Extract id
        id_match = re.search(r'id\s+(\d+)', lower)
        if id_match:
            where.append({
                "column": "id",
                "operator": "=",
                "value": int(id_match.group(1)),
            })
        
        # Extract status
        status_match = re.search(r'status\s+(\w+)', lower)
        if status_match:
            where.append({
                "column": "status",
                "operator": "=",
                "value": status_match.group(1).upper(),
            })
        
        return {
            "intent": "select",
            "where": where if where else None,
        }

    # ---------------- UPDATE ----------------
    if lower.startswith(("update", "change")):
        set_data = {}
        where = []

        # Extract what to update (hours, status)
        m = re.search(r'hours?\s*(?:to|=)\s*(\d+(?:\.\d+)?)', lower)
        if m:
            set_data["hours"] = float(m.group(1))

        m = re.search(r'status\s*(?:to|=)\s*(\w+)', lower)
        if m:
            set_data["status"] = m.group(1).upper()

        # Extract which record to update (id, date, task)
        id_match = re.search(r'id\s+(\d+)', lower)
        if id_match:
            where.append({
                "column": "id",
                "operator": "=",
                "value": int(id_match.group(1)),
            })
        
        # Extract date
        date_match = re.search(r'date\s+(.+?)(?=\s+(?:task|$))', lower)
        if date_match:
            date_str = date_match.group(1).strip()
            d = normalize_date(date_str)
            if d:
                where.append({
                    "column": "task_date",
                    "operator": "=",
                    "value": d,
                })
        
        # Extract task
        task_match = re.search(r'task\s+(.+?)(?=\s+(?:date|$))', lower)
        if task_match:
            task_str = task_match.group(1).strip().title()
            where.append({
                "column": "task_description",
                "operator": "=",
                "value": task_str,
            })

        if not set_data or not where:
            return {
                "intent": "clarify",
                "message": "Please specify what to update and which record.",
            }

        return {
            "intent": "update",
            "set": set_data,
            "where": where,
        }

    # ---------------- DELETE ----------------
    if lower.startswith("delete"):
        where = []
        
        # Extract id
        id_match = re.search(r'id\s+(\d+)', lower)
        if id_match:
            where.append({
                "column": "id",
                "operator": "=",
                "value": int(id_match.group(1)),
            })
        
        # Extract task
        task_match = re.search(r'task\s+(.+?)(?=\s+(?:date|$))', lower)
        if task_match:
            task_str = task_match.group(1).strip().title()
            where.append({
                "column": "task_description",
                "operator": "=",
                "value": task_str,
            })
        
        # Extract date
        date_match = re.search(r'date\s+(.+?)(?=\s+(?:task|$))', lower)
        if date_match:
            date_str = date_match.group(1).strip()
            d = normalize_date(date_str)
            if d:
                where.append({
                    "column": "task_date",
                    "operator": "=",
                    "value": d,
                })
        
        if not where:
            return {
                "intent": "clarify",
                "message": "Please specify what to delete (id, task, or date).",
            }
        
        return {
            "intent": "delete",
            "where": where,
        }

    # =====================================================
    # TASK ENTRY FLOW (UNCHANGED)
    # =====================================================
    task_date = normalize_date(text)
    rel = resolve_relative_date(lower)

    if not task_date and isinstance(rel, date):
        task_date = rel.isoformat()

    total_hours = extract_total_hours(text)
    tasks = extract_tasks(text)

    if total_hours and task_date and not tasks:
        return {
            "intent": "clarify",
            "task_date": task_date,
            "expected_hours": total_hours,
            "message": (
                f"You want to enter timesheet data for {task_date} "
                f"for {total_hours} hours. "
                "Please mention the list of tasks and duration for each."
            ),
        }

    if tasks and not task_date:
        return {
            "intent": "clarify",
            "message": "Which date should I record these tasks for?",
        }

    if tasks and task_date:
        # Check for insert conflict flag
        check_conflict = "update" in lower or "replace" in lower or "or update" in lower
        return {
            "intent": "task_breakdown",
            "task_date": task_date,
            "tasks": tasks,
            "total_hours": sum(t["hours"] for t in tasks),
            "check_conflict": check_conflict,
        }

    # ---------------- SINGLE TASK FOLLOW-UP ----------------
    if re.fullmatch(r'[a-zA-Z\s&]+', lower):
        return {
            "intent": "task_only",
            "task_description": text.title(),
        }

    # ---------------- FALLBACK ----------------
    return {
        "intent": "clarify",
        "message": "I couldn’t understand. Please rephrase your request.",
    }
