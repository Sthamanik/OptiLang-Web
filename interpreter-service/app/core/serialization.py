from __future__ import annotations

from dataclasses import fields, is_dataclass
from enum import Enum
from typing import Any, Dict, Iterable, Mapping


def to_json_safe(value: Any) -> Any:
    """Convert OptiLang runtime objects into JSON-safe data."""
    if is_dataclass(value):
        payload = {"node_type": type(value).__name__}
        for field in fields(value):
            payload[field.name] = to_json_safe(getattr(value, field.name))
        return payload

    if isinstance(value, Enum):
        return value.value

    if isinstance(value, Mapping):
        return {str(key): to_json_safe(item) for key, item in value.items()}

    if isinstance(value, tuple):
        return [to_json_safe(item) for item in value]

    if isinstance(value, list):
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

    # Backward-compatible alias for older clients.
    if "total_lines" not in raw and "total_lines_executed" in raw:
        raw["total_lines"] = raw["total_lines_executed"]

    return raw


def serialize_suggestions(report: Any) -> list[Dict[str, Any]]:
    suggestions = getattr(report, "suggestions", [])
    return [to_json_safe(suggestion) for suggestion in suggestions]


def serialize_score_report(score_report: Any) -> Dict[str, Any]:
    raw = score_report.to_dict() if hasattr(score_report, "to_dict") else to_json_safe(score_report)
    return to_json_safe(raw)


def build_legacy_score_breakdown(score_report: Any) -> Dict[str, float]:
    dimensions = getattr(score_report, "dimensions", None)
    if dimensions is None:
        return {
            "severity_penalty": 0.0,
            "complexity_penalty": 0.0,
            "performance_penalty": 0.0,
            "memory_penalty": 0.0,
        }

    quality = float(getattr(dimensions, "quality", 0.0))
    complexity = float(getattr(dimensions, "complexity_subscore", 0.0))
    efficiency = float(getattr(dimensions, "efficiency_subscore", 0.0))

    return {
        "severity_penalty": round(max(0.0, 20.0 - quality), 2),
        "complexity_penalty": round(max(0.0, 15.0 - complexity), 2),
        "performance_penalty": round(max(0.0, 15.0 - efficiency), 2),
        # The current scorer has no standalone memory penalty field.
        "memory_penalty": 0.0,
    }
