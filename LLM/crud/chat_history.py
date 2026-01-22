# crud/chat_history.py
from sqlalchemy.orm import Session
from schemas.chat import ChatConversation, ChatMessage
from sqlalchemy import desc


# =====================================================
# GET OR CREATE CONVERSATION (SAFE + RESUMABLE)
# =====================================================
def get_or_create_conversation(
    db: Session,
    *,
    employee_id: str,
    company_id: str,
    session_id: str | None = None,
):
    # Resume LAST ACTIVE conversation (persistent history)
    convo = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.employee_id == employee_id,
            ChatConversation.company_id == company_id,
            ChatConversation.is_active == "Y",
        )
        .order_by(desc(ChatConversation.updated_datetime))
        .first()
    )

    if convo:
        return convo

    # Create NEW conversation
    convo = ChatConversation(
        session_id=session_id,
        employee_id=employee_id,
        company_id=company_id,
        title="New Chat",
    )
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return convo


# =====================================================
# SAVE MESSAGE (USER / ASSISTANT)
# =====================================================
def save_message(
    db: Session,
    *,
    conversation_id: int,
    role: str,
    text: str,
    intent: str | None = None,
    message_metadata: dict | None = None,
):
    msg = ChatMessage(
        conversation_id=conversation_id,
        role=role,
        message_text=text,
        intent=intent,
        message_metadata=message_metadata,
    )

    db.add(msg)

    # 🔥 Touch conversation so sidebar ordering works
    db.query(ChatConversation).filter(
        ChatConversation.conversation_id == conversation_id
    ).update({})

    db.commit()
    return msg


# =====================================================
# LIST CONVERSATIONS (SIDEBAR)
# =====================================================
def list_conversations(
    db: Session,
    *,
    employee_id: str,
    company_id: str,
):
    return (
        db.query(ChatConversation)
        .filter(
            ChatConversation.employee_id == employee_id,
            ChatConversation.company_id == company_id,
            ChatConversation.is_active == "Y",
        )
        .order_by(desc(ChatConversation.updated_datetime))
        .all()
    )
