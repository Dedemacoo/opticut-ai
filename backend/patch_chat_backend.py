
import re

with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

old_route = """@app.post("/api/ai-analyze")
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
        raise HTTPException(status_code=500, detail=str(e))"""

new_route = """@app.post("/api/ai-analyze")
async def ai_analyze(
    file: UploadFile = File(None),
    prompt: str = Form(None)
):
    try:
        client = genai.Client() # Uses GEMINI_API_KEY from env
        
        system_prompt = \"\"\"
        Sen OptiCut Copilot isimli akıllı bir yapay zeka asistanısın. OptiCut programını kullanan PVC, Alüminyum ve Ahşap ustalarına yardımcı oluyorsun.
        Kullanıcıyla doğal, samimi ve çözüm odaklı sohbet edebilirsin. Onlara kesim optimizasyonu, fire hesaplama veya programın kullanımı hakkında tavsiyeler verebilirsin.
        
        Eğer kullanıcı sana bir KESİM LİSTESİ (resim veya metin olarak) gönderirse, mesajına ek olarak bu listedeki Boy (L) ve Adet (Q) değerlerini JSON formatında çıkarmalısın.
        JSON verisini MUTLAKA mesajının EN SONUNDA ````json ... ```` bloğu içerisinde vermelisin.
        JSON formatı tam olarak şu şekilde olmalı: [{"length": 1200, "quantity": 2}, {"length": 900, "quantity": 1}]
        
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
        
        # JSON bloğunu bul
        orders = []
        reply_text = text
        
        json_match = re.search(r"```json\s*(.*?)\s*```", text, re.DOTALL)
        if json_match:
            try:
                orders = json.loads(json_match.group(1).strip())
                # Reply text is everything EXCEPT the JSON block
                reply_text = text.replace(json_match.group(0), "").strip()
            except Exception as e:
                print("JSON Parse Error:", e)
        
        return {"orders": orders, "reply": reply_text}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))"""

if old_route in content:
    content = content.replace(old_route, new_route)
    with open("main.py", "w", encoding="utf-8") as f:
        f.write(content)
    print("Done")
else:
    print("Could not find old route")

