from fastapi import FastAPI
from app.routers.compare_router import router as compare_router
from app.routers.indent_router import router as indent_router
from app.routers.syntax_router import router as syntax_router
from app.routers.ai_router import router as ai_router

app = FastAPI(title="Codepad Backend", version="1.0.0")

app.include_router(compare_router)
app.include_router(indent_router)
app.include_router(syntax_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"message": "Codepad Backend Running"}
