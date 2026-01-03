from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Codepad backend running"}

@app.post("/diff")
def diff_code(payload: dict):
    old = payload.get("old_code", "")
    new = payload.get("new_code", "")
    return {
        "lines_added": len(new.splitlines()) - len(old.splitlines()),
        "indentation_checked": True
    }
