from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    orders = relationship("Order", back_populates="project")
    results = relationship("OptimizationResult", back_populates="project")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    length = Column(Float)
    quantity = Column(Integer)
    
    project = relationship("Project", back_populates="orders")

class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    stock_length = Column(Float)
    kerf = Column(Float)
    total_stock_used = Column(Integer)
    total_waste = Column(Float)
    waste_percentage = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    project = relationship("Project", back_populates="results")
    patterns = relationship("CuttingPattern", back_populates="result")

class CuttingPattern(Base):
    __tablename__ = "cutting_patterns"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, ForeignKey("optimization_results.id"))
    usage_count = Column(Integer) # Bu desenden kaç adet kesilecek
    waste = Column(Float)         # Bu desendeki fire
    cuts_json = Column(String)    # Örn: "[1400, 1400, 1420]" şeklinde JSON formatında kesimler
    
    result = relationship("OptimizationResult", back_populates="patterns")
