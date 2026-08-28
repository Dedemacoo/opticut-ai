
import os
import io
import json

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

import_block = """
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json

load_dotenv()
"""
content = import_block + content

route_block = """
@app.post("/api/ai-analyze")
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
        )
        
        # Temizle ve JSON olarak parse et
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        data = json.loads(text.strip())
        return {"orders": data}
        
    except Exception as e:
        print("AI Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
"""

content = content + "\n" + route_block

with open("main.py", "w", encoding="utf-8") as f:
    f.write(content)

print("AI Route Patched!")

