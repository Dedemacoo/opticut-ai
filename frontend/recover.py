
import json

transcript_path = r"C:\Users\arjin\.gemini\antigravity\brain\f41ad551-68b2-4179-a0fd-712682707438\.system_generated\logs\transcript_full.jsonl"
with open(transcript_path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        if data.get("type") == "GENERIC" and "src/app/page.tsx" in data.get("content", ""):
            content = data["content"]
            # Extract everything after "The following code has been modified..."
            if "remove the line number, colon, and leading space." in content:
                code_part = content.split("remove the line number, colon, and leading space.")[1]
                # Remove the "The above content shows the entire, complete file contents..." at the end
                if "The above content shows the entire" in code_part:
                    code_part = code_part.split("The above content shows the entire")[0]
                
                # Remove line numbers
                lines = code_part.strip().split("\n")
                clean_lines = []
                for l in lines:
                    if ": " in l:
                        clean_lines.append(l.split(": ", 1)[1])
                    else:
                        clean_lines.append(l)
                
                with open("src/app/page.tsx", "w", encoding="utf-8") as out:
                    out.write("\n".join(clean_lines))
                print("Recovered page.tsx!")
                break

