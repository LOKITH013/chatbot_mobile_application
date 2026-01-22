# utils/session_context.py

CURRENT_USER = {
    "employee_id": None
}

def set_current_user(employee_id: str):
    CURRENT_USER["employee_id"] = employee_id

def get_current_user():
    return CURRENT_USER["employee_id"]
