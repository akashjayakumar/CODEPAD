import difflib

def compare_code(old_code: str, new_code: str):
    old_lines = old_code.splitlines()
    new_lines = new_code.splitlines()

    diff = list(difflib.unified_diff(old_lines, new_lines, fromfile="old.py", tofile="new.py", lineterm=""))

    # FIX: Handle empty diffs
    if not diff:
        diff = ["No changes detected between old and new code."]

    additions = [line for line in diff if line.startswith("+") and not line.startswith("+++") ]
    deletions = [line for line in diff if line.startswith("-") and not line.startswith("---") ]

    return {
        "diff": diff,
        "additions_count": len(additions),
        "deletions_count": len(deletions),
        "total_changes": len(additions) + len(deletions)
    }

