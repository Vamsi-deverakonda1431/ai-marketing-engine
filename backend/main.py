from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests

# Load env
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class Campaign(BaseModel):
    brand_name: str
    industry: str
    audience: str
    tone: list[str]
    goal: str
    platforms: list[str]

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

@app.post("/campaign")
def create_campaign(data: Campaign):

    prompt = f"""
You are a marketing expert.

Brand: {data.brand_name}
Industry: {data.industry}
Audience: {data.audience}
Tone: {', '.join(data.tone)}
Platforms: {', '.join(data.platforms)}
Goal: {data.goal}

Task:
Analyze if the selected tone is suitable for the platforms.

Give:
1. Verdict
2. Reason
3. Suggest better tone
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                # ✅ FIXED MODEL (IMPORTANT)
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            }
        )

        result = response.json()

        # ✅ BETTER ERROR HANDLING
        if "choices" in result:
            ai_output = result["choices"][0]["message"]["content"]
        elif "error" in result:
            ai_output = f"API Error: {result['error']['message']}"
        else:
            ai_output = "Unexpected response from API"

        return {
            "message": "Campaign analyzed",
            "ai_feedback": ai_output
        }

    except Exception as e:
        return {
            "error": str(e)
        }