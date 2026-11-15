from pydantic import BaseModel
from datetime import date
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
    state: str
    district: str
    commodity: str
    month: int
    year: int = date.today().year

class OfferCreate(BaseModel):
    crop_id: int
    offered_price: float

class OfferOut(OfferCreate):
    id: int
    buyer_id: int
    status: str
    model_config = {"from_attributes": True}