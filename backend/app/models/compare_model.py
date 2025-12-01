from pydantic import BaseModel

class CompareRequest(BaseModel):
    old_code: str
    new_code: str
