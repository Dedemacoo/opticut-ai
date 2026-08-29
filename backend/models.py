from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    plan = Column(String, default="Standart")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    projects = relationship("Project", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="projects")
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
    usage_count = Column(Integer)
    waste = Column(Float)
    cuts_json = Column(String)

    result = relationship("OptimizationResult", back_populates="patterns")

