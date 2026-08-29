
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from typing import Optional

from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import json
import pandas as pd
import io

import models
import schemas
from database import engine, get_db
from optimizer_service import run_optimization
from auth import hash_password, verify_password

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="1D Kesim Optimizasyon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Kesim Optimizasyon API Çalışıyor!"}

# ========== AUTH ENDPOINTS ==========

@app.post("/api/register")
def register_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayitli.")
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        company=user.company,
        hashed_password=hash_password(user.password),
        plan="Standart"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "Kayit basarili", "user": {"id": db_user.id, "name": db_user.name, "email": db_user.email, "company": db_user.company, "plan": db_user.plan}}

@app.post("/api/login")
def login_user(creds: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == creds.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="E-posta veya sifre hatali.")
    if not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-posta veya sifre hatali.")
    return {"message": "Giris basarili", "user": {"id": user.id, "name": user.name, "email": user.email, "company": user.company, "plan": user.plan}}

@app.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(name=project.name)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(get_db)):
    # En son oluşturulan projeler en üstte
    return db.query(models.Project).order_by(models.Project.created_at.desc()).all()

@app.get("/projects/{project_id}/result")
def get_project_result(project_id: int, db: Session = Depends(get_db)):
    result = db.query(models.OptimizationResult).filter(models.OptimizationResult.project_id == project_id).order_by(models.OptimizationResult.id.desc()).first()
    if not result:
        raise HTTPException(status_code=404, detail="Bu proje için optimizasyon sonucu bulunamadı")
        
    patterns = db.query(models.CuttingPattern).filter(models.CuttingPattern.result_id == result.id).all()
    
    pattern_list = []
    for p in patterns:
        pattern_list.append({
            "usage_count": p.usage_count,
            "waste": p.waste,
            "cuts": json.loads(p.cuts_json)
        })
        
    return {
        "stock_length": result.stock_length,
        "kerf": result.kerf,
        "total_stock_used": result.total_stock_used,
        "total_waste": result.total_waste,
        "waste_percentage": result.waste_percentage,
        "patterns": pattern_list
    }

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    # Find project
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    # Delete related orders
    db.query(models.Order).filter(models.Order.project_id == project_id).delete()
    
    # Delete related results and patterns
    results = db.query(models.OptimizationResult).filter(models.OptimizationResult.project_id == project_id).all()
    for res in results:
        db.query(models.CuttingPattern).filter(models.CuttingPattern.result_id == res.id).delete()
    db.query(models.OptimizationResult).filter(models.OptimizationResult.project_id == project_id).delete()
    
    # Delete project
    db.delete(db_project)
    db.commit()
    return {"message": "Proje başarıyla silindi"}

@app.post("/projects/{project_id}/orders/", response_model=schemas.Order)
def create_order(project_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    db_order = models.Order(project_id=project_id, length=order.length, quantity=order.quantity)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.post("/projects/{project_id}/optimize", response_model=schemas.OptimizationResultOut)
def optimize_project(project_id: int, request: schemas.OptimizeRequest, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    orders = db.query(models.Order).filter(models.Order.project_id == project_id).all()
    if not orders:
        raise HTTPException(status_code=400, detail="Optimizasyon için sipariş (parça) bulunamadı")
        
    demands = {}
    for o in orders:
        if o.length in demands:
            demands[o.length] += o.quantity
        else:
            demands[o.length] = o.quantity
            
    # Algoritmayı çalıştır
    res = run_optimization(demands, request.stock_length, request.kerf)
    
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message", "Optimizasyon başarısız"))
        
    # Sonucu Veritabanına Kaydet
    db_result = models.OptimizationResult(
        project_id=project_id,
        stock_length=res["stock_length"],
        kerf=res["kerf"],
        total_stock_used=res["total_stock_used"],
        total_waste=res["total_waste"],
        waste_percentage=res["waste_percentage"]
    )
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    
    for pat in res["patterns"]:
        db_pattern = models.CuttingPattern(
            result_id=db_result.id,
            usage_count=pat["usage_count"],
            waste=pat["waste"],
            cuts_json=json.dumps(pat["cuts"])
        )
        db.add(db_pattern)
    db.commit()
    
    return res

@app.post("/projects/{project_id}/import-excel/")
async def import_excel(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
        
    contents = await file.read()
    try:
        df = pd.read_excel(io.BytesIO(contents))
        # Beklenen kolonlar: 'Boy', 'Adet'
        if 'Boy' not in df.columns or 'Adet' not in df.columns:
            raise HTTPException(status_code=400, detail="Excel dosyasında 'Boy' ve 'Adet' kolonları olmalı.")
            
        added_count = 0
        for index, row in df.iterrows():
            boy = float(row['Boy'])
            adet = int(row['Adet'])
            
            db_order = models.Order(project_id=project_id, length=boy, quantity=adet)
            db.add(db_order)
            added_count += 1
            
        db.commit()
        return {"message": f"{added_count} adet sipariş başarıyla eklendi."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Excel okunurken hata oluştu: {str(e)}")


@app.post("/api/ai-analyze")
async def ai_analyze(
    file: UploadFile = File(None),
    prompt: str = Form(None)
):
    try:
        import json
        import re
        client = genai.Client()
        
        system_prompt = """
        Sen OptiCut Copilot isimli akıllı bir yapay zeka asistanısın. OptiCut programını kullanan PVC, Alüminyum ve Ahşap ustalarına yardımcı oluyorsun.
        Kullanıcıyla doğal, samimi ve çözüm odaklı sohbet edebilirsin.
        Eğer kullanıcı sana bir KESİM LİSTESİ (resim veya metin olarak) gönderirse, mesajına ek olarak bu listedeki Boy (L) ve Adet (Q) değerlerini bul.
        JSON verisini MUTLAKA mesajının EN SONUNDA \`\`\`json ve \`\`\` bloğu içerisinde ver.
        Format tam olarak şu şekilde olmalı: [{"length": 1200, "quantity": 2}, {"length": 900, "quantity": 1}]
        Eğer mesajda herhangi bir kesim ölçüsü yoksa sadece normal sohbet cevabı ver, JSON bloğu ekleme.
        """
        
        contents_list = []
        if file is not None and file.filename != "":
            file_bytes = await file.read()
            contents_list.append(types.Part.from_bytes(data=file_bytes, mime_type=file.content_type))
            
        if prompt is not None and prompt.strip() != "":
            contents_list.append(prompt)
            
        if not contents_list:
            return {"orders": [], "reply": "Lütfen bir dosya veya metin gönderin."}
            
        contents_list.insert(0, system_prompt)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents_list
        )
        
        text = response.text.strip()
        orders = []
        reply_text = text
        
        json_match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if json_match:
            try:
                orders = json.loads(json_match.group(1).strip())
                reply_text = text.replace(json_match.group(0), "").strip()
            except Exception as e:
                print("JSON Parse Error:", e)
        
        return {"orders": orders, "reply": reply_text}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- YENI MODULLER ENDPOINTS ---

@app.post("/api/iwindoor/", response_model=schemas.IWindoorProjectOut)
def create_iwindoor_project(project: schemas.IWindoorProjectCreate, db: Session = Depends(get_db)):
    db_proj = models.IWindoorProject(
        name=project.name,
        design_data=project.design_data,
        total_price=project.total_price
    )
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@app.get("/api/iwindoor/", response_model=List[schemas.IWindoorProjectOut])
def get_iwindoor_projects(db: Session = Depends(get_db)):
    return db.query(models.IWindoorProject).order_by(models.IWindoorProject.created_at.desc()).all()

@app.post("/api/decoration/", response_model=schemas.DecorationProjectOut)
def create_decoration_project(project: schemas.DecorationProjectCreate, db: Session = Depends(get_db)):
    db_proj = models.DecorationProject(
        name=project.name,
        module_type=project.module_type,
        area_sqm=project.area_sqm,
        linear_meters=project.linear_meters,
        details=project.details,
        estimated_price=project.estimated_price
    )
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

@app.get("/api/decoration/", response_model=List[schemas.DecorationProjectOut])
def get_decoration_projects(db: Session = Depends(get_db)):
    return db.query(models.DecorationProject).order_by(models.DecorationProject.created_at.desc()).all()

@app.post("/api/ai-price-estimate")
async def ai_price_estimate(request: dict):
    # Mock AI Pricing API Endpoint
    # In a real scenario, this would ask Gemini for the latest material prices.
    module_type = request.get("module_type", "")
    area = request.get("area_sqm", 0)
    length = request.get("linear_meters", 0)
    
    # Simple hardcoded mock logic for now
    unit_price = 0
    if module_type.lower() == "parke":
        unit_price = 350 # TL/m2
        total = area * unit_price
    elif module_type.lower() == "supurgelik":
        unit_price = 65 # TL/mt
        total = length * unit_price
    elif module_type.lower() == "fayans":
        unit_price = 450 # TL/m2
        total = area * unit_price
    elif module_type.lower() == "alcipan":
        unit_price = 280 # TL/m2
        total = area * unit_price
    elif module_type.lower() == "mutfak_dolabi":
        unit_price = 6500 # TL/mt (linear)
        total = length * unit_price
    else:
        unit_price = 100
        total = (area + length) * unit_price
        
    return {
        "module_type": module_type,
        "unit_price_estimated": unit_price,
        "total_estimated_price": total,
        "currency": "TRY",
        "note": "AI tarafindan guncel piyasa ortalamasina gore tahmin edilmistir."
    }
