from datetime import datetime, timedelta, timezone
import bcrypt, jwt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from models import Base, engine, SessionLocal, User, Crop, Offer
from schemas import UserCreate, UserOut, CropCreate, CropOut, PriceRequest, OfferCreate, OfferOut
import joblib
import pandas as pd
from pathlib import Path
SECRET_KEY = "change-this-secret-later"
ALGORITHM = "HS256"

Base.metadata.create_all(bind=engine)
MODEL_PATH = Path(__file__).parent / "ml" / "pricemodel.pkl"
price_model = joblib.load(MODEL_PATH)
app = FastAPI(title="KisanSetu API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.get(User, int(payload["sub"]))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/")
def home():
    return {"message": "KisanSetu API is running"}

# ---------- Auth ----------
@app.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if data.role not in ("farmer", "buyer"):
        raise HTTPException(400, "role must be 'farmer' or 'buyer'")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user = User(name=data.name, email=data.email, password_hash=hashed, role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not bcrypt.checkpw(form.password.encode(), user.password_hash.encode()):
        raise HTTPException(401, "Wrong email or password")
    return {"access_token": create_token(user.id), "token_type": "bearer", "role": user.role}

# ---------- Crops ----------
@app.post("/crops", response_model=CropOut)
def add_crop(data: CropCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(403, "Only farmers can add crops")
    crop = Crop(**data.model_dump(), farmer_id=user.id)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@app.get("/crops", response_model=list[CropOut])
def list_crops(name: str | None = None, location: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Crop)
    if name:
        query = query.filter(Crop.name.ilike(f"%{name}%"))
    if location:
        query = query.filter(Crop.location.ilike(f"%{location}%"))
    return query.all()

@app.delete("/crops/{crop_id}")
def delete_crop(crop_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    crop = db.get(Crop, crop_id)
    if not crop or crop.farmer_id != user.id:
        raise HTTPException(404, "Crop not found")
    db.delete(crop)
    db.commit()
    return {"message": "Deleted"}

@app.post("/predict")
def predict(data: PriceRequest):
    if not 1 <= data.month <= 12:
        raise HTTPException(400, "month must be between 1 and 12")
    row = pd.DataFrame([{
        "state": data.state,
        "district": data.district,
        "commodity": data.commodity,
        "month": data.month,
        "year": data.year,
    }])
    values = price_model.predict(row).flatten().tolist()
    return {
        "state": data.state,
        "district": data.district,
        "commodity": data.commodity,
        "predicted_values": [round(v, 2) for v in values],
    }

# ---------- Offers ----------
@app.post("/offers", response_model=OfferOut)
def make_offer(data: OfferCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "buyer":
        raise HTTPException(403, "Only buyers can make offers")
    if data.offered_price <= 0:
        raise HTTPException(400, "offered_price must be greater than 0")
    crop = db.get(Crop, data.crop_id)
    if not crop:
        raise HTTPException(404, "Crop not found")
    offer = Offer(crop_id=data.crop_id, buyer_id=user.id, offered_price=data.offered_price)
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer

@app.get("/offers/mine", response_model=list[OfferOut])
def my_offers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Offer).filter(Offer.buyer_id == user.id).all()

@app.get("/offers/received", response_model=list[OfferOut])
def received_offers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != "farmer":
        raise HTTPException(403, "Only farmers can see received offers")
    return (
        db.query(Offer)
        .join(Crop, Offer.crop_id == Crop.id)
        .filter(Crop.farmer_id == user.id)
        .all()
    )

