from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("sqlite:///./farm.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # "farmer" or "buyer"

class Crop(Base):
    __tablename__ = "crops"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    quantity_kg = Column(Float)
    price_per_kg = Column(Float)
    location = Column(String)
    farmer_id = Column(Integer, ForeignKey("users.id"))

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    offered_price = Column(Float)
    status = Column(String, default="pending")