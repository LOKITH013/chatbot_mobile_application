from pydantic import BaseModel
from typing import List, Optional, Literal, Union


# =====================================================
# WHERE CONDITION
# =====================================================
class Condition(BaseModel):
    column: Literal[
        "id",
        "task_date",
        "task_description",
        "hours",
        "status",
        "remarks",
        "created_datetime",
    ]
    operator: Literal[
        "=",
        "!=",
        ">",
        "<",
        ">=",
        "<=",
        "in",
        "between",
        "like",
    ]
    value: Union[str, int, float, List]


# =====================================================
# INSERT ITEM
# =====================================================
class InsertItem(BaseModel):
    task_date: str
    task_description: str
    hours: float
    status: Optional[str] = "DRAFT"
    remarks: Optional[str] = None


# =====================================================
# UPDATE SET
# =====================================================
class UpdateItem(BaseModel):
    task_description: Optional[str] = None
    hours: Optional[float] = None
    status: Optional[str] = None
    remarks: Optional[str] = None


# =====================================================
# AGGREGATE
# =====================================================
class AggregateItem(BaseModel):
    function: Literal["sum", "count", "min", "max", "avg"]
    column: Literal["hours"]


# =====================================================
# TASK BREAKDOWN (ATLAS)
# =====================================================
class DraftTask(BaseModel):
    task_description: str
    hours: float


# =====================================================
# MAIN LLM ACTION
# =====================================================
class LLMAction(BaseModel):
    intent: Literal[
        "insert",
        "select",
        "update",
        "delete",
        "aggregate",
        "confirm",
        "cancel",
        "clarify",
        "start_timesheet",
        "task_breakdown",
        "unknown",
    ]

    # ---------- INSERT ----------
    entries: Optional[List[InsertItem]] = None

    # ---------- UPDATE ----------
    set: Optional[UpdateItem] = None

    # ---------- CONDITIONS ----------
    where: Optional[List[Condition]] = None

    # ---------- AGGREGATE ----------
    aggregate: Optional[AggregateItem] = None

    # ---------- CONFIRM ----------
    confirm: Optional[Literal["yes", "no"]] = None

    # ---------- ATLAS DRAFT ----------
    tasks: Optional[List[DraftTask]] = None
    task_date: Optional[str] = None
    total_hours: Optional[float] = None

    # ---------- CLARIFY ----------
    message: Optional[str] = None


# =====================================================
# LOGIN REQUEST
# =====================================================
class LoginRequest(BaseModel):
    employee_id: str
    email: str
    password: str
