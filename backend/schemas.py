from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime

# --- Auth ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Optional[str] = None
    plan: Optional[str] = "Standart"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    company: Optional[str]
    plan: str
    class Config:
        orm_mode = True

# --- Order & Project ---
class OrderBase(BaseModel):
    length: float
    quantity: int

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    project_id: int
    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime.datetime
    orders: List[Order] = []
    class Config:
        orm_mode = True

class OptimizeRequest(BaseModel):
    project_id: int
    stock_length: float = 6000.0
    kerf: float = 3.0

class PatternOut(BaseModel):
    usage_count: int
    waste: float
    cuts: List[float]

class OptimizationResultOut(BaseModel):
    stock_length: float
    blade_width: float
    total_stocks_used: int
    total_waste: float
    waste_percentage: float
    patterns: List[PatternOut]

# --- IWindoor ---
class IWindoorProjectCreate(BaseModel):
    name: str
    design_data: str
    total_price: Optional[float] = 0.0

class IWindoorProjectOut(IWindoorProjectCreate):
    id: int
    user_id: Optional[int]
    created_at: datetime.datetime
    class Config:
        orm_mode = True

# --- Decoration ---
class DecorationProjectCreate(BaseModel):
    name: str
    module_type: str
    area_sqm: Optional[float] = 0.0
    linear_meters: Optional[float] = 0.0
    details: Optional[str] = "{}"
    estimated_price: Optional[float] = 0.0

class DecorationProjectOut(DecorationProjectCreate):
    id: int
    user_id: Optional[int]
    created_at: datetime.datetime
    class Config:
        orm_mode = True

