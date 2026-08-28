
const fs = require("fs");
let content = fs.readFileSync("main.py", "utf8");
content = content.replace("from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Optional", "from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form\nfrom typing import Optional");
fs.writeFileSync("main.py", content, "utf8");

