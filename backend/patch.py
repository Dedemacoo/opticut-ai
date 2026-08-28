
import re

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Instead of exact string replacement, use regex to replace the entire ai_analyze function
pattern = re.compile(r"@app\.post\(\"/api/ai-analyze\"\).*?(?=@app\.post|@app\.get|$)", re.DOTALL)

new_route = """@app.post("/api/ai-analyze")
async def ai_analyze(
    file: UploadFile = File(None),
    prompt: str = Form(None)
):
    try:
        import json
        import re
        client = genai.Client()
        
        system_prompt = \"\"\"
        Sen OptiCut Copilot isimli akıllı bir yapay zeka asistanısın. OptiCut programını kullanan PVC, Alüminyum ve Ahşap ustalarına yardımcı oluyorsun.
        Kullanıcıyla doğal, samimi ve çözüm odaklı sohbet edebilirsin.
        Eğer kullanıcı sana bir KESİM LİSTESİ (resim veya metin olarak) gönderirse, mesajına ek olarak bu listedeki Boy (L) ve Adet (Q) değerlerini bul.
        JSON verisini MUTLAKA mesajının EN SONUNDA \\`\\`\\`json ve \\`\\`\\` bloğu içerisinde ver.
        Format tam olarak şu şekilde olmalı: [{"length": 1200, "quantity": 2}, {"length": 900, "quantity": 1}]
        Eğer mesajda herhangi bir kesim ölçüsü yoksa sadece normal sohbet cevabı ver, JSON bloğu ekleme.
        \"\"\"
        
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

"""

content = re.sub(pattern, new_route, content)

with open("main.py", "w", encoding="utf-8") as f:
    f.write(content)

