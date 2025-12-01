def check_indentation(code: str):
    issues = []
    lines = code.splitlines()

    for i, line in enumerate(lines, start=1):
        # Detect tabs
        if "\t" in line:
            issues.append({"line": i, "issue": "Tab indentation found (use spaces)"})

        # Detect inconsistent space indentation
        stripped = line.lstrip(" ")
        indent_spaces = len(line) - len(stripped)

        if indent_spaces % 4 != 0 and indent_spaces != 0:
            issues.append({
                "line": i,
                "issue": f"Inconsistent indentation: {indent_spaces} spaces"
            })

    return {"indentation_issues": issues}
