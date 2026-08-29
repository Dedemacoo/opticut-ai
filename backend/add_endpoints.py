
import sys

with open("backend/main.py", "r", encoding="utf-8") as f:
    content = f.read()

new_endpoints = """
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
"""

if "def create_iwindoor_project" not in content:
    content += "\n" + new_endpoints

with open("backend/main.py", "w", encoding="utf-8") as f:
    f.write(content)

