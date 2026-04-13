from __future__ import annotations

from dataclasses import fields, is_dataclass
from enum import Enum
from typing import Any, Dict, Iterable, List, Mapping

import logging

logger = logging.getLogger(__name__)


def to_json_safe(value: Any) -> Any:
    """Recursively convert OptiLang runtime objects into JSON-safe primitives."""
    if is_dataclass(value):
        payload = {"node_type": type(value).__name__}
        for field in fields(value):
            payload[field.name] = to_json_safe(getattr(value, field.name))
        return payload
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, Mapping):
        return {str(k): to_json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_json_safe(item) for item in value]
    if isinstance(value, set):
        return [to_json_safe(item) for item in sorted(value, key=repr)]
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return repr(value)
def serialize_tokens(tokens: Iterable[Any]) -> list[Dict[str, Any]]:
    return [
        {
            "type": getattr(token.type, "value", str(token.type)),
            "value": to_json_safe(token.value),
            "line": token.line,
            "column": token.column,
        }
        for token in tokens
    ]

def serialize_profiling(profiling: Any) -> Dict[str, Any] | None:
    if profiling is None:
        return None
    raw = profiling.to_dict() if hasattr(profiling, "to_dict") else dict(profiling)
    raw = to_json_safe(raw)
    # backward-compatible alias
    if "total_lines" not in raw and "total_lines_executed" in raw:
        raw["total_lines"] = raw["total_lines_executed"]
    return raw


def serialize_suggestions(report: Any) -> List[Dict[str, Any]]:
    suggestions = getattr(report, "suggestions", [])
    return [to_json_safe(s) for s in suggestions]


def serialize_score_report(score_report: Any) -> Dict[str, Any]:
    raw = score_report.to_dict() if hasattr(score_report, "to_dict") else to_json_safe(score_report)
    return to_json_safe(raw)