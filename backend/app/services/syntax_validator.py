def validate_syntax(code: str):
    try:
        compile(code, "<string>", "exec")
        return {"valid": True, "error": None}
    except Exception as e:
        return {"valid": False, "error": str(e)}
