from app.schemas import AutocompleteRequest


def get_autocomplete_suggestion(request: AutocompleteRequest) -> str:
    code = request.code or ""
    cursor_pos = request.cursorPosition
    language = request.language

    # Clamp cursor position
    if cursor_pos < 0:
        cursor_pos = 0
    if cursor_pos > len(code):
        cursor_pos = len(code)

    text_before_cursor = code[:cursor_pos]
    rstrip_text = text_before_cursor.rstrip()
    last_line = text_before_cursor.split("\n")[-1]
    stripped_last_line = last_line.lstrip()

    # --- Python / general patterns ---

    # Function definition: "def" or "def " at the start of the current line, before "("
    if stripped_last_line.startswith("def") and "(" not in stripped_last_line:
        if language == "python":
            return " my_function():"
        return " myFunction() {"

    # If statement
    if stripped_last_line.startswith("if ") or rstrip_text.endswith(" if "):
        return "condition:"

    # For loop
    if stripped_last_line.startswith("for ") or rstrip_text.endswith(" for "):
        if language == "python":
            return "item in items:"
        return "let i = 0; i < length; i++) {"

    # Imports
    if stripped_last_line.startswith("import ") or rstrip_text.endswith(" import "):
        if language == "python":
            return "os"
        return "React"

    # Class definition
    if stripped_last_line.startswith("class ") or rstrip_text.endswith(" class "):
        return "MyClass:"

    # Return statement
    if stripped_last_line.startswith("return ") or rstrip_text.endswith(" return "):
        return "value"

    # Print / console.log
    if "print(" in stripped_last_line or "console.log(" in stripped_last_line:
        return '"Hello, World!"'

    # Bracket helpers
    if rstrip_text.endswith("("):
        return ")"

    if rstrip_text.endswith("["):
        return "]"

    if rstrip_text.endswith("{"):
        return "}"

    # No useful suggestion
    return ""
