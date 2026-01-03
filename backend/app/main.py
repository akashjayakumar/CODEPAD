from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.compare_router import router as compare_router
from app.routers.indent_router import router as indent_router
from app.routers.syntax_router import router as syntax_router
from app.routers.ai_router import router as ai_router

app = FastAPI(
    title="Codepad Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ IMPORTANT: prefixes handled in router files
app.include_router(compare_router)
app.include_router(indent_router)
app.include_router(syntax_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"status": "Codepad backend running"}
