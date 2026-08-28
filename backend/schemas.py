from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderBase(BaseModel):
    length: float
    quantity: int

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime
    orders: List[Order] = []
    class Config:
        from_attributes = True

class OptimizeRequest(BaseModel):
    project_id: int
    stock_length: float = 6000.0
    kerf: float = 3.0

class CuttingPatternOut(BaseModel):
    usage_count: int
    waste: float
    cuts: List[float]

class OptimizationResultOut(BaseModel):
    stock_length: float
    kerf: float
    total_stock_used: int
    total_waste: float
    waste_percentage: float
    patterns: List[CuttingPatternOut]
