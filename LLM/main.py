# main.py
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from datetime import date, timedelta, datetime
import traceback

from database import get_db
from llm.nlp_parser import parse_nlp
from utils.chat_formatter import list_message, error_message

from models import Employee
from schemas import LoginRequest
from schemas.chat import ChatMessage, ChatConversation

from crud.chat_history import (
    get_or_create_conversation,
    save_message,
    list_conversations,
)

from crud.chat_context import (
    save_context,
    get_context,
    clear_context,
)

from crud.task_log import (
    insert_timesheet_entry,
    select_timesheets,
    update_by_conditions,
    soft_delete_by_conditions,
    select_aggregate,
)

load_dotenv()

# =====================================================
# APP SETUP
# =====================================================
app = FastAPI(title="Timesheet NLP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
default_employee_id = "EMP01"
default_company_id = "COMP01"

# =====================================================
# LAST WEEK FOLLOW-UP
# =====================================================
def get_last_week_prompt(db: Session, employee_id: str):
    today = date.today()
    end = today - timedelta(days=today.weekday() + 1)
    start = end - timedelta(days=6)

    records = select_timesheets(
        db,
        employee_id=employee_id,
        conditions=[{
            "column": "task_date",
            "operator": "between",
            "value": [start.isoformat(), end.isoformat()],
        }],
    )

    if not records:
        return {
            "reply": (
                "⚠️ I noticed you haven't entered timesheets for last week.\n"
                "Would you like to add them now?"
            )
        }

    return {
        "reply": "📅 Do you want to view last week data?",
        "payload": list_message(records)["payload"],
    }

# =====================================================
# CONVERSATION TITLE AUTO-UPDATE (ChatGPT-style)
# =====================================================
def update_conversation_title_if_empty(
    db: Session,
    conversation_id: int,
    user_message: str,
):
    convo = (
        db.query(ChatConversation)
        .filter(ChatConversation.conversation_id == conversation_id)
        .first()
    )

    if convo and (not convo.title or convo.title == "New Chat"):
        title = " ".join(user_message.split()[:6])
        convo.title = title
        db.commit()

# =====================================================
# LOGIN
# =====================================================
@app.post("/auth/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    if payload.employee_id == default_employee_id and payload.email == "lokith@gmail.com" and payload.password == "1234":
        return {
            "employee_id": default_employee_id,
            "employee_name": "Lokith",
            "email": "lokith@gmail.com",
        }
    
    user = (
        db.query(Employee)
        .filter(
            Employee.employee_id == payload.employee_id,
            Employee.email_id == payload.email,
            Employee.password == payload.password,
            Employee.isactive == "Y",
        )
        .first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "employee_id": user.employee_id,
        "employee_name": user.employee_name,
        "email": user.email_id,
    }

@app.get("/timesheets")
def get_all_timesheets(employee_id: str = Query(default_employee_id), db: Session = Depends(get_db)):
    records = select_timesheets(db, employee_id=employee_id)
    return list_message(records)
# =====================================================
# SIDEBAR – LIST CONVERSATIONS
# =====================================================
@app.get("/chat/conversations")
def get_conversations(employee_id: str = Query(default_employee_id), db: Session = Depends(get_db)):
    conversations = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.employee_id == employee_id,
            ChatConversation.is_active == "Y",
        )
        .order_by(ChatConversation.updated_datetime.desc())
        .all()
    )

    return [
        {
            "conversation_id": c.conversation_id,
            "title": c.title or "New Chat",
            "updated_at": c.updated_datetime,
        }
        for c in conversations
    ]


# =====================================================
# CHAT HISTORY
# =====================================================
@app.get("/chat/history/{conversation_id}")
def get_chat_history(conversation_id: int, db: Session = Depends(get_db)):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_datetime)
        .all()
    )

    return [
        {
            "role": m.role,
            "message": m.message_text,
            "intent": m.intent,
            "payload": m.message_metadata,
            "time": m.created_datetime,
        }
        for m in messages
    ]

#==========================================
# CHAT ENDPOINT
# =====================================================
@app.post("/chat")
def chat_handler(payload: dict, db: Session = Depends(get_db)):
    try:
        message = payload.get("message", "").strip()
        session_id = payload.get("session_id")
        employee_id = payload.get("employee_id", default_employee_id)

        if not message:
            return error_message("Please enter a message.")

        company_id = default_company_id

        # Ensure session_id is str
        if not session_id:
            import time
            session_id = str(int(time.time() * 1000000))
        else:
            session_id = str(session_id)

        # ---------------- Conversation (RESUME SAFE) ----------------
        conversation = get_or_create_conversation(
            db,
            employee_id=employee_id,
            company_id=company_id,
            session_id=session_id,
        )

        save_message(
            db,
            conversation_id=conversation.conversation_id,
            role="user",
            text=message,
        )
        update_conversation_title_if_empty(
            db,
            conversation_id=conversation.conversation_id,
            user_message=message,
        )

        parsed = parse_nlp(message)
        intent = parsed.get("intent")
        response = None

        # =====================================================
        # CLARIFY
        # =====================================================
        if intent == "clarify":
            if parsed.get("task_date") and parsed.get("expected_hours"):
                save_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                    context_data=parsed,
                )

            response = {"reply": parsed.get("message")}

        # =====================================================
        # SINGLE TASK FOLLOW-UP
        # =====================================================
        elif intent == "task_only":
            pending = get_context(
                db,
                employee_id=employee_id,
                conversation_id=conversation.conversation_id,
            )

            if not pending:
                response = error_message("Please provide task details with hours.")
            else:
                final = {
                    "task_date": pending["task_date"],
                    "tasks": [{
                        "task_description": parsed["task_description"],
                        "hours": pending["expected_hours"],
                    }],
                    "total_hours": pending["expected_hours"],
                }

                save_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                    context_data=final,
                )

                response = {
                    "reply": (
                        f"I'm preparing the following timesheet for {final['task_date']}:\n\n"
                        f"1. {parsed['task_description']} – {final['total_hours']} hours\n\n"
                        "Shall I proceed?"
                    )
                }

        # =====================================================
        # MULTI-TASK BREAKDOWN
        # =====================================================
        elif intent == "task_breakdown":
            save_context(
                db,
                employee_id=employee_id,
                conversation_id=conversation.conversation_id,
                context_data=parsed,
            )

            lines = [
                f"{i+1}. {t['task_description']} – {t['hours']} hours"
                for i, t in enumerate(parsed["tasks"])
            ]

            response = {
                "reply": (
                    f"I'm preparing the following timesheet for {parsed['task_date']}:\n\n"
                    + "\n".join(lines)
                    + f"\n\nTotal: {parsed['total_hours']} hours\n\nShall I proceed?"
                )
            }

        # =====================================================
        # CONFIRM → INSERT or UPDATE
        # =====================================================
        elif intent == "confirm":
            pending = get_context(
                db,
                employee_id=employee_id,
                conversation_id=conversation.conversation_id,
            )

            if not pending:
                response = error_message("There is nothing to confirm.")
            # Handle pending update
            elif pending.get("pending_update"):
                updated_count = update_by_conditions(
                    db,
                    employee_id=employee_id,
                    set_data=pending.get("update_set"),
                    conditions=pending.get("update_where"),
                )
                response = {"reply": f"✅ {updated_count} entry updated successfully."}
                clear_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                )
            # Handle pending delete
            elif pending.get("pending_delete"):
                deleted_count = soft_delete_by_conditions(
                    db,
                    employee_id=employee_id,
                    conditions=pending.get("delete_where"),
                )
                response = {"reply": f"🗑️ {deleted_count} entry deleted successfully."}
                clear_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                )
            # Handle insert/update choice
            elif pending.get("conflict_choice"):
                for t in pending["tasks"]:
                    existing = select_timesheets(
                        db,
                        employee_id=employee_id,
                        conditions=[
                            {"column": "task_date", "operator": "=", "value": pending["task_date"]},
                            {"column": "task_description", "operator": "=", "value": t["task_description"]},
                        ],
                    )
                    
                    if existing and message.lower() in ("insert", "new"):
                        # Insert as separate entry
                        insert_timesheet_entry(
                            db,
                            employee_id=employee_id,
                            company_id=company_id,
                            llm_data={
                                "task_date": pending["task_date"],
                                "task_description": t["task_description"],
                                "hours": t["hours"],
                            },
                        )
                    elif existing and message.lower() in ("update", "replace"):
                        # Update existing
                        update_by_conditions(
                            db,
                            employee_id=employee_id,
                            set_data={"hours": t["hours"]},
                            conditions=[
                                {"column": "task_date", "operator": "=", "value": pending["task_date"]},
                                {"column": "task_description", "operator": "=", "value": t["task_description"]},
                            ],
                        )
                    else:
                        # No conflict, just insert
                        insert_timesheet_entry(
                            db,
                            employee_id=employee_id,
                            company_id=company_id,
                            llm_data={
                                "task_date": pending["task_date"],
                                "task_description": t["task_description"],
                                "hours": t["hours"],
                            },
                        )
                
                clear_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                )

                records = select_timesheets(db, employee_id=employee_id)

                response = {
                    "reply": "✅ Timesheet entry completed successfully.",
                    "payload": list_message(records)["payload"],
                }

                followup = get_last_week_prompt(db, employee_id)
                if followup:
                    response["followup"] = followup
            else:
                # Normal task insert
                for t in pending["tasks"]:
                    # Check if same date and task exists
                    existing = select_timesheets(
                        db,
                        employee_id=employee_id,
                        conditions=[
                            {"column": "task_date", "operator": "=", "value": pending["task_date"]},
                            {"column": "task_description", "operator": "=", "value": t["task_description"]},
                        ],
                    )
                    
                    if existing and not pending.get("check_conflict"):
                        # Ask user to insert or update
                        response = {
                            "reply": (
                                f"⚠️ A task '{t['task_description']}' already exists on {pending['task_date']} "
                                f"with {existing[0].get('hours')} hours.\n\n"
                                "Would you like to:\n"
                                "1. **insert** - Add this as a separate entry\n"
                                "2. **update** - Update the existing entry to {t['hours']} hours"
                            )
                        }
                        # Save context with conflict choice flag
                        pending["conflict_choice"] = True
                        save_context(
                            db,
                            employee_id=employee_id,
                            conversation_id=conversation.conversation_id,
                            context_data=pending,
                        )
                        break
                    else:
                        # Insert or update based on check_conflict flag
                        if existing and pending.get("check_conflict"):
                            # Update existing
                            update_by_conditions(
                                db,
                                employee_id=employee_id,
                                set_data={"hours": t["hours"]},
                                conditions=[
                                    {"column": "task_date", "operator": "=", "value": pending["task_date"]},
                                    {"column": "task_description", "operator": "=", "value": t["task_description"]},
                                ],
                            )
                        else:
                            # Insert new
                            insert_timesheet_entry(
                                db,
                                employee_id=employee_id,
                                company_id=company_id,
                                llm_data={
                                    "task_date": pending["task_date"],
                                    "task_description": t["task_description"],
                                    "hours": t["hours"],
                                },
                            )

                if not existing or pending.get("check_conflict"):
                    clear_context(
                        db,
                        employee_id=employee_id,
                        conversation_id=conversation.conversation_id,
                    )

                    records = select_timesheets(db, employee_id=employee_id)

                    response = {
                        "reply": "✅ Timesheet entry completed successfully.",
                        "payload": list_message(records)["payload"],
                    }

                    followup = get_last_week_prompt(db, employee_id)
                    if followup:
                        response["followup"] = followup

        # =====================================================
        # SELECT / UPDATE / DELETE / AGGREGATE
        # =====================================================
        elif intent == "select":
            records = select_timesheets(
                db,
                employee_id=employee_id,
                conditions=parsed.get("where"),
            )
            response = {
                "reply": "📋 Here are your timesheet entries.",
                "payload": list_message(records)["payload"],
            }

        elif intent == "update":
            where = parsed.get("where")
            # Check how many match
            count = select_aggregate(
                db,
                employee_id=employee_id,
                aggregate={"function": "count", "column": "id"},
                conditions=where,
            )
            if count > 1:
                # Show matching records and ask which to update
                matching_records = select_timesheets(
                    db,
                    employee_id=employee_id,
                    conditions=where,
                )
                response = {
                    "reply": "⚠️ Multiple entries match your criteria. Which one would you like to update?",
                    "payload": {
                        "type": "TABLE",
                        "columns": ["ID", "Date", "Task", "Hours", "Status"],
                        "rows": [
                            [r.get("id"), r.get("task_date"), r.get("task_description"), r.get("hours"), r.get("status")]
                            for r in matching_records
                        ],
                    },
                }
                # Save context for next input
                save_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                    context_data={"pending_update": True, "update_set": parsed.get("set"), "update_where": where},
                )
            elif count == 0:
                response = error_message("No records found to update.")
            else:
                updated_count = update_by_conditions(
                    db,
                    employee_id=employee_id,
                    set_data=parsed.get("set"),
                    conditions=where,
                )
                response = {"reply": f"✅ {updated_count} entry updated successfully."}
                clear_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                )

        elif intent == "delete":
            where = parsed.get("where")
            # Check how many match
            records = select_timesheets(
                db,
                employee_id=employee_id,
                conditions=where,
            )
            count = len(records)
            if count > 1:
                # Show matching records and ask which to delete
                response = {
                    "reply": "⚠️ Multiple entries match your criteria. Which one(s) would you like to delete?",
                    "payload": {
                        "type": "TABLE",
                        "columns": ["ID", "Date", "Task", "Hours", "Status"],
                        "rows": [
                            [r.get("id"), r.get("task_date"), r.get("task_description"), r.get("hours"), r.get("status")]
                            for r in records
                        ],
                    },
                }
                # Save context for next input
                save_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                    context_data={"pending_delete": True, "delete_where": where},
                )
            elif count == 0:
                response = error_message("No records found to delete.")
            else:
                deleted_count = soft_delete_by_conditions(
                    db,
                    employee_id=employee_id,
                    conditions=where,
                )
                response = {"reply": f"🗑️ {deleted_count} entry deleted successfully."}
                clear_context(
                    db,
                    employee_id=employee_id,
                    conversation_id=conversation.conversation_id,
                )

        elif intent == "aggregate":
            agg = parsed.get("aggregate")
            value = select_aggregate(
                db,
                employee_id=employee_id,
                aggregate=agg,
                conditions=parsed.get("where") or [],
            )
            # Convert Decimal to float for JSON serialization
            if value is not None:
                value = float(value)
            else:
                value = 0
            response = {
                "reply": "📊 Summary",
                "payload": {
                    "type": "TABLE",
                    "columns": [f"{agg['function']}(hours)"],
                    "rows": [[value]],
                },
            }

        else:
            response = error_message("I didn’t understand. Please rephrase.")

        # ---------------- Save assistant message ----------------
        save_message(
            db,
            conversation_id=conversation.conversation_id,
            role="assistant",
            text=response.get("reply"),
            intent=intent,
            message_metadata=response.get("payload"),
        )

        return response
    except Exception as e:
        tb = traceback.format_exc()
        try:
            with open("llm_error.log", "a", encoding="utf-8") as f:
                f.write(f"{datetime.now().isoformat()} - Exception in chat_handler:\n")
                f.write(tb)
                f.write(f"\nPayload: {payload}\n\n")
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Internal server error")
