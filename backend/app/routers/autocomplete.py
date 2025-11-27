from fastapi import APIRouter, HTTPException
from app.schemas import AutocompleteRequest, AutocompleteResponse
from app.services import autocomplete_service

router = APIRouter(prefix="/autocomplete", tags=["autocomplete"])


@router.post("/", response_model=AutocompleteResponse)
def get_autocomplete(request: AutocompleteRequest):
    try:
        suggestion = autocomplete_service.get_autocomplete_suggestion(request)
        return AutocompleteResponse(suggestion=suggestion)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

