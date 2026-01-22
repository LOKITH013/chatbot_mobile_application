# schemas/llm_action.py
from pydantic import BaseModel
from typing import Optional, List, Literal

class DraftTask(BaseModel):
    task_description: str
    hours: float

class LLMAction(BaseModel):
    intent: Literal[
        "insert",
        "insert_many",
        "select",
        "update",
        "delete",
        "aggregate",
        "group_by",
        "subquery",
        "confirm",
        "start_timesheet",
        "task_breakdown",
        "unknown",
    ]

    data: Optional[dict] = None
    data_list: Optional[List[dict]] = None
    entries: Optional[List[dict]] = None  # For insert operations
    where: Optional[list] = []
    aggregate: Optional[dict] = None
    group_by: Optional[dict] = None
    order_by: Optional[dict] = None
    limit: Optional[int] = None
    subquery: Optional[dict] = None
    confirm: Optional[Literal["yes", "no"]] = None

    tasks: Optional[List[DraftTask]] = None
    task_date: Optional[str] = None
    expected_hours: Optional[float] = None
