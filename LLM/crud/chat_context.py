from sqlalchemy.orm import Session
from schemas.chat import ChatContextState


def save_context(
    db: Session,
    *,
    employee_id: str,
    conversation_id: int | None,
    context_data: dict,
):
    ctx = (
        db.query(ChatContextState)
        .filter(ChatContextState.employee_id == employee_id)
        .first()
    )

    if ctx:
        ctx.context_data = context_data
        ctx.conversation_id = conversation_id
    else:
        ctx = ChatContextState(
            employee_id=employee_id,
            conversation_id=conversation_id,
            context_data=context_data,
        )
        db.add(ctx)

    db.commit()


def get_context(db: Session, *, employee_id: str, conversation_id: int | None = None) -> dict | None:
    query = db.query(ChatContextState).filter(ChatContextState.employee_id == employee_id)
    
    if conversation_id is not None:
        query = query.filter(ChatContextState.conversation_id == conversation_id)
    
    ctx = query.first()
    return ctx.context_data if ctx else None


def clear_context(db: Session, *, employee_id: str, conversation_id: int | None = None):
    query = db.query(ChatContextState).filter(ChatContextState.employee_id == employee_id)
    
    if conversation_id is not None:
        query = query.filter(ChatContextState.conversation_id == conversation_id)
    
    query.delete()
    db.commit()
