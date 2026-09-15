import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.database.mongodb import db
from app.models.conversation import ConversationModel, TravelContext
from app.models.message import MessageModel

conversations_col = db["conversations"]
messages_col = db["messages"]

def setup_indexes():
    """Create sensible MongoDB indexes for conversations and messages."""
    try:
        conversations_col.create_index("conversation_id", unique=True)
        conversations_col.create_index([("updated_at", -1)])
        messages_col.create_index([("conversation_id", 1), ("created_at", 1)])
        print("--- CONVERSATION SERVICE: Database indexes verified/created ---")
    except Exception as e:
        print(f"Warning: Index creation error: {e}")

# Run index setup
setup_indexes()

def create_conversation(title: str = "New Travel Chat") -> ConversationModel:
    conv_id = f"conv_{uuid.uuid4().hex[:10]}"
    conv = ConversationModel(
        conversation_id=conv_id,
        title=title,
        status="active",
        travel_context=TravelContext(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    doc = conv.model_dump()
    conversations_col.insert_one(doc)
    return conv

def get_conversation(conversation_id: str) -> Optional[ConversationModel]:
    doc = conversations_col.find_one({"conversation_id": conversation_id})
    if not doc:
        return None
    # Remove _id from dict if present
    doc.pop("_id", None)
    return ConversationModel(**doc)

def get_or_create_conversation(conversation_id: Optional[str] = None) -> ConversationModel:
    if conversation_id:
        conv = get_conversation(conversation_id)
        if conv:
            return conv
    return create_conversation()

def update_travel_context(conversation_id: str, new_context: Dict[str, Any], current_trip_id: Optional[str] = None) -> ConversationModel:
    now = datetime.utcnow()
    update_fields = {"updated_at": now}
    if current_trip_id is not None:
        update_fields["current_trip_id"] = current_trip_id
        new_context["current_trip_id"] = current_trip_id

    update_fields["travel_context"] = new_context

    # Auto-update title if destination is set
    dest = new_context.get("destination")
    if dest:
        update_fields["title"] = f"Trip to {dest.title()}"

    conversations_col.update_one(
        {"conversation_id": conversation_id},
        {"$set": update_fields}
    )
    return get_conversation(conversation_id)

def add_message(
    conversation_id: str,
    role: str,
    content: str,
    intent: Optional[str] = None,
    structured_data: Optional[Dict[str, Any]] = None
) -> MessageModel:
    msg_id = f"msg_{uuid.uuid4().hex[:10]}"
    msg = MessageModel(
        message_id=msg_id,
        conversation_id=conversation_id,
        role=role,
        content=content,
        intent=intent,
        structured_data=structured_data,
        created_at=datetime.utcnow()
    )
    doc = msg.model_dump()
    messages_col.insert_one(doc)
    
    # Touch updated_at on conversation
    conversations_col.update_one(
        {"conversation_id": conversation_id},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    return msg

def get_conversation_messages(conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    cursor = messages_col.find({"conversation_id": conversation_id}).sort("created_at", 1).limit(limit)
    messages = []
    for doc in cursor:
        doc.pop("_id", None)
        messages.append(doc)
    return messages

def list_conversations(limit: int = 20) -> List[Dict[str, Any]]:
    cursor = conversations_col.find({"status": "active"}).sort("updated_at", -1).limit(limit)
    convs = []
    for doc in cursor:
        doc.pop("_id", None)
        convs.append(doc)
    return convs

def delete_conversation(conversation_id: str) -> bool:
    res = conversations_col.delete_one({"conversation_id": conversation_id})
    messages_col.delete_many({"conversation_id": conversation_id})
    return res.deleted_count > 0
