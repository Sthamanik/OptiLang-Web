from app.core.serialization import (
    build_legacy_score_breakdown,
    serialize_profiling,
    serialize_score_report,
    serialize_suggestions,
    serialize_tokens,
    to_json_safe,
)
from optilang import analyze, calculate_score, execute
from optilang.lexer import tokenize
from optilang.parser import parse


def test_serialize_tokens_and_ast_shapes() -> None:
    source = "x = 1\nprint(x)\n"
    tokens = tokenize(source)
    ast = parse(tokens)

    serialized_tokens = serialize_tokens(tokens)
    serialized_ast = to_json_safe(ast)

    assert serialized_tokens[0]["type"] == "IDENTIFIER"
    assert serialized_ast["node_type"] == "ProgramNode"
    assert serialized_ast["statements"][0]["node_type"] == "AssignmentNode"


def test_serialize_profiling_and_score_report_keep_core_fields() -> None:
    source = "total = 0\nfor i in range(3):\n    total += i\nprint(total)\n"
    result = execute(source)
    report = analyze(parse(tokenize(source)), result.profiling, result.symbol_table)
    score = calculate_score(
        profiling_data=result.profiling.to_dict() if result.profiling else None,
        optimizer_report=report,
        source_lines=len(source.splitlines()),
        errors=result.errors,
    )

    profiling_payload = serialize_profiling(result.profiling)
    score_payload = serialize_score_report(score)
    suggestions_payload = serialize_suggestions(report)
    breakdown = build_legacy_score_breakdown(score)

    assert profiling_payload is not None
    assert "peak_memory_bytes" in profiling_payload
    assert profiling_payload["total_lines"] == profiling_payload["total_lines_executed"]
    assert score_payload["score"] >= 0
    assert "dimensions" in score_payload
    assert isinstance(suggestions_payload, list)
    assert breakdown["complexity_penalty"] >= 0
