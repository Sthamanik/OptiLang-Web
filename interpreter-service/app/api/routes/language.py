from __future__ import annotations

from datetime import datetime
import logging

from fastapi import APIRouter, HTTPException, status

from app.core.serialization import serialize_tokens, to_json_safe
from app.schemas.requests import ParseRequest, TokenizeRequest
from app.schemas.responses import ParseResponse, TokenizeResponse
from optilang.lexer import tokenize
from optilang.parser import parse
from optilang.utils.errors import OptiLangError

router = APIRouter(tags=["language"])
logger = logging.getLogger(__name__)


@router.post("/tokenize", response_model=TokenizeResponse, status_code=status.HTTP_200_OK)
async def tokenize_code(request: TokenizeRequest) -> TokenizeResponse:
    """Expose the OptiLang lexer output."""
    try:
        tokens = tokenize(request.code)
        serialized_tokens = serialize_tokens(tokens)
        return TokenizeResponse(
            success=True,
            tokens=serialized_tokens,
            token_count=len(serialized_tokens),
            errors=[],
            timestamp=datetime.utcnow(),
        )
    except OptiLangError as exc:
        logger.info("Tokenization error: %s", exc)
        return TokenizeResponse(
            success=False,
            tokens=[],
            token_count=0,
            errors=[str(exc)],
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Unexpected tokenize error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal tokenize error: {exc}",
        ) from exc


@router.post("/parse", response_model=ParseResponse, status_code=status.HTTP_200_OK)
async def parse_code(request: ParseRequest) -> ParseResponse:
    """Expose tokenization plus AST generation for OptiLang source."""
    try:
        tokens = tokenize(request.code)
        ast = parse(tokens)
        serialized_tokens = serialize_tokens(tokens)
        return ParseResponse(
            success=True,
            tokens=serialized_tokens,
            token_count=len(serialized_tokens),
            ast=to_json_safe(ast),
            errors=[],
            timestamp=datetime.utcnow(),
        )
    except OptiLangError as exc:
        logger.info("Parse error: %s", exc)
        return ParseResponse(
            success=False,
            tokens=[],
            token_count=0,
            ast=None,
            errors=[str(exc)],
            timestamp=datetime.utcnow(),
        )
    except Exception as exc:
        logger.error("Unexpected parse error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal parse error: {exc}",
        ) from exc
