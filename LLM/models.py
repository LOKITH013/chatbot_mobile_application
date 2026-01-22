from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Date,
    DateTime,
    DECIMAL,
    CHAR,
    ForeignKey,
    func,
    Index,
)
from database import Base



# ============================================================
# EMPLOYEE TABLE (LOGIN SOURCE OF TRUTH)
# ============================================================
class Employee(Base):
    __tablename__ = "employee"

    # ---------------- PRIMARY KEY ----------------
    id = Column(Integer, primary_key=True, index=True)

    # ---------------- COMPANY ----------------
    company_id = Column(String, nullable=False, index=True)
    #company_name = Column(String(100), nullable=False, index=True)

    # ---------------- EMPLOYEE ----------------
    employee_id = Column(String(50), nullable=False, unique=True, index=True)
    employee_name = Column(String(100), nullable=False)
    email_id = Column(String(150), nullable=False, unique=True, index=True)

    # ---------------- AUTH ----------------
    password = Column(String(255), nullable=False)

    # ---------------- AUDIT ----------------
    created_datetime = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    update_datetime = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True,
    )

    # ---------------- ACTIVE FLAG ----------------
    isactive = Column(CHAR(1), nullable=False, default="Y")

# ============================================================
# MAIN TABLE : timesheet_entries
# ============================================================
class TimesheetEntry(Base):
    __tablename__ = "timesheet_entries"

    # ---------------- PRIMARY KEY ----------------
    id = Column(Integer, primary_key=True, index=True)

    # ---------------- CONTEXT (FROM LOGIN / TOKEN) ----------------
    employee_id = Column(String(50), nullable=False, index=True)
    company_id = Column(String, nullable=False, index=True)

    # ---------------- TASK DATA (FROM LLM) ----------------
    task_date = Column(Date, nullable=False, index=True)
    task_description = Column(String(255), nullable=False)
    hours = Column(DECIMAL(5, 2), nullable=False)

    # ---------------- STATUS ----------------
    status = Column(String(10), nullable=False, default="completed", index=True)

    # ---------------- REMARKS ----------------
    remarks = Column(Text, nullable=True)

    # ---------------- AUDIT FIELDS ----------------
    created_datetime = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
        index=True
    )

    created_by = Column(String(50), nullable=False)

    update_datetime = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True
    )

    update_by = Column(String(50), nullable=True)

    # ---------------- ACTIVE FLAG ----------------
    isactive = Column(CHAR(1), nullable=False, default="Y")


# ---------------- INDEXES ----------------
Index(
    "idx_timesheet_emp_date",
    TimesheetEntry.employee_id,
    TimesheetEntry.task_date
)


Index(
    "idx_timesheet_status",
    TimesheetEntry.status
)


# ============================================================
# OPTIONAL SUPPORT TABLE : timesheet_status
# (Used for approval / reminders / workflow)
# ============================================================
class TimesheetStatus(Base):
    __tablename__ = "timesheet_status"

    id = Column(String(10), primary_key=True, index=True)

    task_date = Column(Date, nullable=False, index=True)
    employee_id = Column(String(50), nullable=False, index=True)
    company_id = Column(String(50), nullable=False, index=True)

    status = Column(String(10), nullable=False)
    remainder_sent = Column(CHAR(1), nullable=False, default="N")

    created_datetime = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    created_by = Column(String(50), nullable=False)

    update_datetime = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True
    )

    update_by = Column(String(50), nullable=True)

    isactive = Column(CHAR(1), nullable=False, default="Y")
