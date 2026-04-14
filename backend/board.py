from typing import Dict, Any, List
from datetime import datetime
import threading
import uuid


class BoardEntry:
    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        model: str,
        content: str,
        entry_type: str = "claim",
        reacting_to: str = None,
        sent_to: List[str] = None,
        confidence: float = None,
    ):
        self.id = str(uuid.uuid4())
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.model = model
        self.content = content
        self.entry_type = entry_type
        self.timestamp = datetime.now().isoformat()
        self.reacting_to = reacting_to
        self.sent_to = sent_to or []
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "agent": self.agent_name,
            "agentId": self.agent_id,
            "model": self.model,
            "content": self.content,
            "type": self.entry_type,
            "timestamp": self.timestamp,
            "reactingTo": self.reacting_to,
            "sentTo": self.sent_to,
            "confidence": self.confidence,
        }


class SharedBoard:
    def __init__(self, session_id: str, problem: str):
        self.session_id = session_id
        self.problem = problem
        self.entries: List[BoardEntry] = []
        self.status = "running"
        self.lock = threading.Lock()
        self.conflicts: List[Dict[str, Any]] = []

    def add_entry(self, entry: BoardEntry):
        with self.lock:
            self.entries.append(entry)

    def get_entries(self) -> List[Dict[str, Any]]:
        with self.lock:
            return [e.to_dict() for e in self.entries]

    def add_conflict(self, between: List[str], on_entry: str):
        with self.lock:
            self.conflicts.append(
                {"between": between, "on": on_entry, "resolved": False}
            )

    def to_dict(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "session_id": self.session_id,
                "problem": self.problem,
                "status": self.status,
                "entries": [e.to_dict() for e in self.entries],
                "conflicts": self.conflicts,
            }


class SessionManager:
    _boards: Dict[str, SharedBoard] = {}
    _lock = threading.Lock()

    @classmethod
    def create_session(cls, problem: str) -> str:
        session_id = str(uuid.uuid4())
        board = SharedBoard(session_id, problem)
        with cls._lock:
            cls._boards[session_id] = board
        return session_id

    @classmethod
    def get_board(cls, session_id: str) -> SharedBoard:
        with cls._lock:
            return cls._boards.get(session_id)

    @classmethod
    def close_session(cls, session_id: str):
        with cls._lock:
            cls._boards.pop(session_id, None)
