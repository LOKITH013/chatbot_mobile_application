from pydantic import BaseModel
from typing import Optional



from sqlalchemy import Column, BigInteger, String, Text, Enum, JSON, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    conversation_id = Column(BigInteger, primary_key=True, autoincrement=True)
    session_id = Column(String(50), nullable=False)
    employee_id = Column(String(20), nullable=False)
    company_id = Column(String(20), nullable=False)
    title = Column(String(255))
    is_active = Column(String(1), default="Y")

    created_datetime = Column(DateTime, server_default=func.now())
    updated_datetime = Column(DateTime, onupdate=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(BigInteger, primary_key=True)
    conversation_id = Column(
        BigInteger,
        ForeignKey("chat_conversations.conversation_id", ondelete="CASCADE"),
        nullable=False,
    )

    role = Column(Enum("user", "assistant"), nullable=False)
    message_text = Column(Text, nullable=False)

    intent = Column(String(50))
    message_metadata = Column(JSON)

    created_datetime = Column(DateTime, server_default=func.now())


class ChatContextState(Base):
    __tablename__ = "chat_context_state"

    employee_id = Column(String(20), primary_key=True)
    conversation_id = Column(BigInteger, nullable=True)

    context_data = Column(JSON)
    updated_datetime = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )