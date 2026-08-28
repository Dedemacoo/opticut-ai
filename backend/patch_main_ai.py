
import os
with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

import_form = "from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Optional\n"
if "Form, Optional" not in content:
    content = content.replace("from fastapi import FastAPI, Depends, HTTPException, UploadFile, File", import_form)

old_route = """@app.post("/api/ai-analyze")
async def ai_analyze(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        client = genai.Client() # Uses GEMINI_API_KEY from env
        
        prompt = \"\"\"
        Bu görüntüdeki bir PVC veya profil kesim tablosudur (veya elle çizilmiş bir listedir).
        Lütfen görüntüdeki listede bulunan tüm kesilecek parçaları analiz et.
        Her satır veya parça için Boy (mm cinsinden sayı, L) ve Adet (sayı, Q) değerlerini bul.
        SADECE VE SADECE JSON dizisi olarak döndür. Başka hiçbir açıklama yazma. Markdown formatı KULLANMA. 
        Format tam olarak şu şekilde olmalı: 
        [{"length": 1200, "quantity": 2}, {"length": 900, "quantity": 1}]
        Eğer hiçbir şey bulamazsan boş dizi döndür: []
        \"\"\"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=contents,
                    mime_type=file.content_type,
                ),
                prompt,
            ]
        )"""

new_route = """@app.post("/api/ai-analyze")
async def ai_analyze(
    file: UploadFile = File(None),
    prompt: str = Form(None)
):
    try:
        client = genai.Client() # Uses GEMINI_API_KEY from env
        
        system_prompt = \"\"\"
        Sen OptiCut Copilot isimli yapay zeka asistanısın. Görevin, kullanıcının gönderdiği resimden veya metinden kesilecek PVC profil listesini bulmaktır.
        Her satır veya parça için Boy (mm cinsinden sayı, L) ve Adet (sayı, Q) değerlerini bul.
        SADECE VE SADECE JSON dizisi olarak döndür. Başka hiçbir açıklama, selamlama veya markdown yazma! 
        Format tam olarak şu şekilde olmalı: 
        [{"length": 1200, "quantity": 2}, {"length": 900, "quantity": 1}]
        Eğer hiçbir şey bulamazsan boş dizi döndür: []
        \"\"\"
        
        contents_list = []
        if file is not None and file.filename != "":
            file_bytes = await file.read()
            contents_list.append(types.Part.from_bytes(data=file_bytes, mime_type=file.content_type))
            
        if prompt is not None and prompt.strip() != "":
            contents_list.append("Kullanıcı metni: " + prompt)
            
        if not contents_list:
            return {"orders": [], "reply": "Lütfen bir dosya veya metin gönderin."}
            
        contents_list.append(system_prompt)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents_list
        )"""

if old_route in content:
    content = content.replace(old_route, new_route)
else:
    print("Could not find the exact old route to replace. Maybe it was corrupted by encoding?")
    # Try fuzzy matching
    
with open("main.py", "w", encoding="utf-8") as f:
    f.write(content)
print("done")

