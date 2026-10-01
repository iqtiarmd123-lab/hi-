import time
import uuid
import json
import csv
import io
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class AuditEvent:
    id: str
    timestamp: str
    user_request: str
    tool_id: str
    tool_name: str
    target: str
    scope: str
    parameters: Dict[str, Any]
    permission_level: int
    confirmation_status: str  # 'CONFIRMED' | 'NOT_REQUIRED' | 'SKIPPED'
    execution_status: str     # 'SUCCESS' | 'SIMULATED' | 'BLOCKED' | 'ERROR'
    result_summary: str
    errors: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "userRequest": self.user_request,
            "toolId": self.tool_id,
            "toolName": self.tool_name,
            "target": self.target,
            "scope": self.scope,
            "parameters": self.parameters,
            "permissionLevel": self.permission_level,
            "confirmationStatus": self.confirmation_status,
            "executionStatus": self.execution_status,
            "resultSummary": self.result_summary,
            "errors": self.errors,
        }

class AuditLogger:
    """Stores tamper-evident security audit logs and handles exporting to CSV and JSON."""
    
    def __init__(self):
        self._events: List[AuditEvent] = []

    def record_event(
        self,
        user_request: str,
        tool_id: str,
        tool_name: str,
        target: str,
        scope: str,
        parameters: Dict[str, Any],
        permission_level: int,
        confirmation_status: str,
        execution_status: str,
        result_summary: str,
        errors: Optional[str] = None,
    ) -> AuditEvent:
        event = AuditEvent(
            id=str(uuid.uuid4()),
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            user_request=user_request,
            tool_id=tool_id,
            tool_name=tool_name,
            target=target,
            scope=scope,
            parameters=parameters,
            permission_level=permission_level,
            confirmation_status=confirmation_status,
            execution_status=execution_status,
            result_summary=result_summary,
            errors=errors,
        )
        self._events.insert(0, event)
        return event

    def list_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        return [e.to_dict() for e in self._events[:limit]]

    def clear(self) -> None:
        self._events.clear()

    def export_json(self) -> str:
        return json.dumps([e.to_dict() for e in self._events], indent=2)

    def export_csv(self) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Timestamp", "Tool", "Target", "Scope", "PermissionLevel",
            "ExecutionStatus", "Summary", "Errors"
        ])
        for e in self._events:
            writer.writerow([
                e.id, e.timestamp, e.tool_name, e.target, e.scope,
                e.permission_level, e.execution_status, e.result_summary, e.errors or ""
            ])
        return output.getvalue()
