from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

client = TestClient(app)
client.headers.update(
    {"X-Internal-Service-Secret": settings.internal_api_secret}
)


def test_execute_route_exposes_symbol_table_and_profiling() -> None:
    response = client.post(
        "/execute",
        json={
            "code": "x = 1\nprint(x)\n",
            "timeout": 5,
            "enable_profiling": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["symbol_table"]["x"] == 1
    assert payload["profiling"]["peak_memory_bytes"] >= 0
    assert "total_lines_executed" in payload["profiling"]


def test_analyze_route_returns_full_score_report() -> None:
    response = client.post(
        "/analyze",
        json={
            "code": "total = 0\nfor i in range(5):\n    total += i\nprint(total)\n",
            "timeout": 5,
            "enable_profiling": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "score_report" in payload
    assert "dimensions" in payload["score_report"]
    assert payload["score_report"]["score"] >= 0
    assert payload["score_report"]["complexity_class"]


def test_optimize_route_returns_optimizer_suggestions_shape() -> None:
    response = client.post(
        "/optimize",
        json={
            "code": "unused = 42\nfor i in range(20):\n    for j in range(20):\n        x = i + j\nprint(x)\n",
            "timeout": 5,
            "enable_profiling": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["suggestion_count"] == len(payload["suggestions"])
    assert payload["suggestion_count"] >= 1


def test_language_routes_expose_tokens_and_ast() -> None:
    tokenize_response = client.post("/tokenize", json={"code": "x = 1\n"})
    parse_response = client.post("/parse", json={"code": "x = 1\n"})

    assert tokenize_response.status_code == 200
    assert parse_response.status_code == 200

    tokenize_payload = tokenize_response.json()
    parse_payload = parse_response.json()

    assert tokenize_payload["success"] is True
    assert tokenize_payload["token_count"] >= 1
    assert parse_payload["success"] is True
    assert parse_payload["ast"]["node_type"] == "ProgramNode"


def test_interpreter_rejects_requests_without_internal_secret() -> None:
    unauthenticated_client = TestClient(app)
    response = unauthenticated_client.post(
        "/execute",
        json={
            "code": "print(1)\n",
            "timeout": 5,
            "enable_profiling": True,
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Forbidden"
