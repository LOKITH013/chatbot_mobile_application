# utils/chat_formatter.py
from typing import List


# =====================================================
# SUCCESS MESSAGE (CHAT)
# =====================================================
def success_message(intent: str, count: int | None = None, reply: str | None = None):
    if reply:
        return {"reply": reply}

    if intent == "insert":
        return {"reply": "✅ Timesheet entry saved successfully."}

    if intent == "update":
        return {"reply": f"✅ {count or 0} entries updated successfully."}

    if intent == "delete":
        return {"reply": f"🗑️ {count or 0} entries deleted successfully."}

    return {"reply": "✅ Operation completed successfully."}


# =====================================================
# TABLE RESPONSE (MAINSCREEN / HISTORY)
# =====================================================
def list_message(records: List, reply: str | None = None):
    columns = ["ID", "Date", "Task", "Hours", "Status", "Remarks"]

    rows = []
    for r in records or []:
        rows.append([
            getattr(r, "id", None),
            r.task_date.isoformat() if r.task_date else None,
            r.task_description,
            float(r.hours) if r.hours is not None else 0,
            r.status,
            r.remarks,
        ])

    response = {
        "payload": {
            "type": "TABLE",
            "columns": columns,
            "rows": rows,
        }
    }

    if reply:
        response["reply"] = reply

    return response


# =====================================================
# CLARIFICATION (ATLAS)
# =====================================================
def clarify_message(text: str):
    return {
        "reply": f"🤖 {text}"
    }


# =====================================================
# CONFIRMATION (ATLAS)
# =====================================================
def confirm_message(summary: str):
    return {
        "reply": f"📝 {summary}\n\nShall I go ahead?"
    }


# =====================================================
# ERROR MESSAGE (SAFE)
# =====================================================
def error_message(text: str):
    return {
        "reply": f"⚠️ {text}"
    }
