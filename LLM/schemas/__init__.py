# Schemas package
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
# schemas/__init__.py

from .auth import LoginRequest, EmployeeResponse
from .llm_action import LLMAction, DraftTask