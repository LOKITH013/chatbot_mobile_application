from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from models import TimesheetEntry
from utils.date_utils import normalize_date
from datetime import date, timedelta
from sqlalchemy import distinct


# =====================================================
# SAFE COLUMN MAP (LLM-SAFE)
# =====================================================
ALLOWED_COLUMNS = {
    "id": TimesheetEntry.id,
    "task_date": TimesheetEntry.task_date,
    "task_description": TimesheetEntry.task_description,
    "hours": TimesheetEntry.hours,
    "status": TimesheetEntry.status,
    "remarks": TimesheetEntry.remarks,
    "created_datetime": TimesheetEntry.created_datetime,
    "update_datetime": TimesheetEntry.update_datetime,
}


# =====================================================
# COMPARISON OPERATORS
# =====================================================
ALLOWED_OPERATORS = {
    "=": lambda c, v: c == v,
    "!=": lambda c, v: c != v,
    ">": lambda c, v: c > v,
    "<": lambda c, v: c < v,
    ">=": lambda c, v: c >= v,
    "<=": lambda c, v: c <= v,
    "in": lambda c, v: c.in_(v),
    "between": lambda c, v: c.between(v[0], v[1]),
    "like": lambda c, v: c.like(f"%{v}%"),
    "ilike": lambda c, v: c.ilike(f"%{v}%"),
}


# =====================================================
# AGGREGATE FUNCTIONS
# =====================================================
ALLOWED_AGG_FUNCS = {
    "sum": func.sum,
    "min": func.min,
    "max": func.max,
    "avg": func.avg,
    "count": func.count,
}


# =====================================================
# INSERT (SINGLE)
# =====================================================
def insert_timesheet_entry(
    db: Session,
    *,
    employee_id: str,
    company_id: str,
    llm_data: dict,
):
    from datetime import date
    
    task_date_str = llm_data.get("task_date")
    if task_date_str:
        if isinstance(task_date_str, str):
            task_date = date.fromisoformat(task_date_str)
        else:
            task_date = task_date_str
    else:
        task_date = date.today()
    
    # Generate a simple ID
    import time
    manual_id = int(time.time() * 1000) % 1000000
    
    entry = TimesheetEntry(
        id=manual_id,
        employee_id=employee_id,
        company_id=company_id,
        task_date=task_date,
        task_description=llm_data.get("task_description", ""),
        hours=float(llm_data.get("hours", 0)),
        status=llm_data.get("status", "complpeted"),
        remarks=llm_data.get("remarks"),
        created_by=1,  # Use a dummy integer value
        isactive="Y",
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# =====================================================
# INSERT (MULTIPLE)
# =====================================================
def insert_multiple_timesheets(
    db: Session,
    *,
    employee_id: str,
    entries: list,
):
    objects = []

    for e in entries:
        obj = TimesheetEntry(
            employee_id=employee_id,
            task_date=normalize_date(e.get("task_date")),
            task_description=e.get("task_description", ""),
            hours=float(e.get("hours", 0)),
            status=e.get("status", "completed"),
            remarks=e.get("remarks"),
            created_by=employee_id,
            isactive="Y",
        )
        db.add(obj)
        objects.append(obj)

    db.commit()
    for o in objects:
        db.refresh(o)

    return objects


# =====================================================
# WHERE BUILDER
# =====================================================
def build_filters(conditions: list):
    filters = []
    
    if not conditions:
        return filters

    for cond in conditions:
        col_name = cond.get("column")
        operator = cond.get("operator")
        raw_value = cond.get("value")

        col = ALLOWED_COLUMNS.get(col_name)
        op = ALLOWED_OPERATORS.get(operator)

        if not col or not op:
            raise ValueError("Invalid condition")

        # -------------------------------
        # TYPE-SAFE VALUE HANDLING
        # -------------------------------
        if col_name == "task_date":
            value = normalize_date(raw_value)

        elif col_name == "hours":
            value = float(raw_value) if raw_value is not None else None

        else:
            value = raw_value

        # -------------------------------
        # SAFETY CHECK
        # -------------------------------
        if value is None and operator not in ("=", "!="):
            raise ValueError(
                f"Invalid comparison: {col_name} {operator} None"
            )

        filters.append(op(col, value))

    return filters


# =====================================================
# SELECT
# =====================================================
def select_timesheets(
    db: Session,
    *,
    employee_id: str,
    conditions: list | None = None,
    order_by: str = "task_date",
    desc: bool = True,
    limit: int | None = None,
):
    query = db.query(TimesheetEntry).filter(
        TimesheetEntry.employee_id == employee_id,
        TimesheetEntry.isactive == "Y",
    )

    if conditions:
        query = query.filter(and_(*build_filters(conditions)))

    if order_by in ALLOWED_COLUMNS:
        col = ALLOWED_COLUMNS[order_by]
        query = query.order_by(col.desc() if desc else col)

    if limit:
        query = query.limit(limit)

    return query.all()


# =====================================================
# UPDATE (SAFE)
# =====================================================
def update_by_conditions(
    db: Session,
    *,
    employee_id: str,
    set_data: dict,
    conditions: list,
):
    filters = [
        TimesheetEntry.employee_id == employee_id,
        TimesheetEntry.isactive == "Y",
    ] + build_filters(conditions)

    update_values = {}
    for k, v in set_data.items():
        col = ALLOWED_COLUMNS.get(k)
        if col:
            update_values[col.key] = normalize_date(v)

    if not update_values:
        raise ValueError("No valid update fields")

    count = (
        db.query(TimesheetEntry)
        .filter(and_(*filters))
        .update(update_values, synchronize_session=False)
    )

    db.commit()
    return count


# =====================================================
# SOFT DELETE (SAFE)
# =====================================================
def soft_delete_by_conditions(
    db: Session,
    *,
    employee_id: str,
    conditions: list,
):
    filters = [
        TimesheetEntry.employee_id == employee_id,
        TimesheetEntry.isactive == "Y",
    ] + build_filters(conditions)

    count = (
        db.query(TimesheetEntry)
        .filter(and_(*filters))
        .update({"isactive": "N"}, synchronize_session=False)
    )

    db.commit()
    return count


# =====================================================
# AGGREGATE
# =====================================================
def select_aggregate(
    db: Session,
    *,
    employee_id: str,
    aggregate: dict,
    conditions: list | None = None,
):
    agg_func = ALLOWED_AGG_FUNCS.get(aggregate["function"])
    col = ALLOWED_COLUMNS.get(aggregate["column"])

    if not agg_func or not col:
        raise ValueError("Invalid aggregate")

    query = db.query(agg_func(col)).filter(
        TimesheetEntry.employee_id == employee_id,
        TimesheetEntry.isactive == "Y",
    )

    if conditions:
        filters = build_filters(conditions)
        if filters:
            query = query.filter(and_(*filters))

    return query.scalar()


# =====================================================
# GROUP BY
# =====================================================
def select_group_by(
    db: Session,
    *,
    employee_id: str,
    group_column: str,
    aggregate: dict,
    conditions: list | None = None,
):
    group_col = ALLOWED_COLUMNS.get(group_column)
    agg_func = ALLOWED_AGG_FUNCS.get(aggregate["function"])
    agg_col = ALLOWED_COLUMNS.get(aggregate["column"])

    if not group_col or not agg_func or not agg_col:
        raise ValueError("Invalid group by")

    query = (
        db.query(group_col, agg_func(agg_col).label("value"))
        .filter(
            TimesheetEntry.employee_id == employee_id,
            TimesheetEntry.isactive == "Y",
        )
    )

    if conditions:
        query = query.filter(and_(*build_filters(conditions)))

    return query.group_by(group_col).all()


# =====================================================
# COUNT
# =====================================================
def count_by_conditions(
    db: Session,
    *,
    employee_id: str,
    conditions: list | None = None,
):
    query = db.query(func.count(TimesheetEntry.id)).filter(
        TimesheetEntry.employee_id == employee_id,
        TimesheetEntry.isactive == "Y",
    )

    if conditions:
        query = query.filter(and_(*build_filters(conditions)))

    return query.scalar()

def _get_existing_dates(
    db: Session,
    *,
    employee_id: str,
    start_date: date,
    end_date: date,
):
    rows = (
        db.query(distinct(TimesheetEntry.task_date))
        .filter(
            TimesheetEntry.employee_id == employee_id,
            TimesheetEntry.isactive == "Y",
            TimesheetEntry.task_date.between(start_date, end_date),
        )
        .all()
    )
    return {r[0] for r in rows}

def get_missing_dates(
    db: Session,
    *,
    employee_id: str,
    start_date: date,
    end_date: date,
):
    existing_dates = _get_existing_dates(
        db,
        employee_id=employee_id,
        start_date=start_date,
        end_date=end_date,
    )

    missing = []
    current = start_date
    while current <= end_date:
        # Skip weekends (optional – comment if not needed)
        if current.weekday() < 5:
            if current not in existing_dates:
                missing.append(current)
        current += timedelta(days=1)

    return missing

def get_missing_last_week_timesheets(
    db: Session,
    *,
    employee_id: str,
):
    today = date.today()
    start_of_last_week = today - timedelta(days=today.weekday() + 7)
    end_of_last_week = start_of_last_week + timedelta(days=4)  # Mon–Fri

    missing_dates = get_missing_dates(
        db,
        employee_id=employee_id,
        start_date=start_of_last_week,
        end_date=end_of_last_week,
    )

    return {
        "week": "last_week",
        "start_date": start_of_last_week.isoformat(),
        "end_date": end_of_last_week.isoformat(),
        "missing_dates": [d.isoformat() for d in missing_dates],
    }



def get_missing_dates_for_range(
    db: Session,
    *,
    employee_id: str,
    dates: list[date],
):
    existing = _get_existing_dates(
        db,
        employee_id=employee_id,
        start_date=min(dates),
        end_date=max(dates),
    )

    return [d for d in dates if d not in existing and d.weekday() < 5]



