from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "farmer" or "buyer"

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    model_config = {"from_attributes": True}

class CropCreate(BaseModel):
    name: str
    quantity_kg: float
    price_per_kg: float
    location: str

class CropOut(CropCreate):
    id: int
    farmer_id: int
    model_config = {"from_attributes": True}

class PriceRequest(BaseModel):
    crop: str
    state: str
    month: int