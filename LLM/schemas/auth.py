# schemas/auth.py
from pydantic import BaseModel

class LoginRequest(BaseModel):
    # company_id: str
    employee_id: str
    # employee_name: str
    email: str
    password: str

class EmployeeResponse(BaseModel):
    company_id: str
    employee_id: str
    employee_name: str
    email: str