from fastapi import FastAPI
from .routers.compare_router import router as compare_router
from .routers.indent_router import router as indent_router
from .routers.syntax_router import router as syntax_router
from .routers.ai_router import router as ai_router

app = FastAPI(title="Codepad Backend", version="1.0.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(compare_router)
app.include_router(indent_router)
app.include_router(syntax_router)
app.include_router(ai_router)

@app.get("/")
def root():
    return {"message": "Codepad Backend Running"}
