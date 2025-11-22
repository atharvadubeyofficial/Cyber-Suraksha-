from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from io import BytesIO
from fastapi.responses import StreamingResponse
import random

# NEW: OpenAI official SDK
from openai import AsyncOpenAI

# PDF Generation
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ======== DATABASE CONNECTION ========
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ======== AI CLIENT ========
openai_client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
AI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

# ======== FASTAPI ========
app = FastAPI()
api_router = APIRouter()


# ===================== MODELS =====================
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_score: int = 0
    completed_simulations: List[str] = []


class UserCreate(BaseModel):
    name: str
    email: str


class SimulationAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    simulation_type: str
    score: int
    passed: bool
    duration_seconds: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    answers: dict


class SimulationAttemptCreate(BaseModel):
    user_id: str
    simulation_type: str
    score: int
    passed: bool
    duration_seconds: int
    answers: dict


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    ai_response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    session_id: str
    message: str


class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    issued_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    certificate_number: str


class VulnerabilityScore(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    overall_score: int
    phishing_score: int = 0
    password_score: int = 0
    malware_score: int = 0
    sql_injection_score: int = 0
    ransomware_score: int = 0
    social_engineering_score: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ===================== ROUTES =====================

@api_router.get("/")
async def root():
    return {"message": "Cybersecurity Simulator API"}


@api_router.get("/health")
async def health():
    return {"status": "OK"}



# ---------- USER CREATION ----------
@api_router.post("/users", response_model=User)
async def create_user(input: UserCreate):
    existing_user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing_user:
        if isinstance(existing_user["created_at"], str):
            existing_user["created_at"] = datetime.fromisoformat(existing_user["created_at"])
        return existing_user

    user = User(**input.model_dump())
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)
    return user


@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return user


# ---------- SIMULATION ----------
@api_router.post("/simulations", response_model=SimulationAttempt)
async def create_simulation(input: SimulationAttemptCreate):
    attempt = SimulationAttempt(**input.model_dump())
    doc = attempt.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.simulations.insert_one(doc)

    user = await db.users.find_one({"id": input.user_id}, {"_id": 0})
    if user:
        new_total = user.get("total_score", 0) + input.score
        completed = user.get("completed_simulations", [])

        if input.simulation_type not in completed:
            completed.append(input.simulation_type)

        await db.users.update_one(
            {"id": input.user_id},
            {"$set": {"total_score": new_total, "completed_simulations": completed}},
        )

    await update_vulnerability_score(input.user_id, input.simulation_type, input.score)

    return attempt


@api_router.get("/simulations/user/{user_id}", response_model=List[SimulationAttempt])
async def get_user_simulations(user_id: str):
    simulations = await db.simulations.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for sim in simulations:
        if isinstance(sim["timestamp"], str):
            sim["timestamp"] = datetime.fromisoformat(sim["timestamp"])
    return simulations


# ---------- AI CHATBOT (OpenAI Version) ----------
@api_router.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        system_prompt = """
        You are CYBER SURAKSHA OPS Assistant — a simple, friendly cybersecurity educator for MSMEs.
        - Explain concepts in simple Hindi + English (Hinglish)
        - Give practical steps, no technical jargon
        - Help users understand their mistakes and improve
        - Do NOT generate hacking instructions
        """

        completion = await openai_client.chat.completions.create(
            model=AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
        )

        response_text = completion.choices[0].message["content"]

        chat_doc = ChatMessage(
            session_id=request.session_id,
            user_message=request.message,
            ai_response=response_text,
        )
        doc = chat_doc.model_dump()
        doc["timestamp"] = doc["timestamp"].isoformat()
        await db.chat_history.insert_one(doc)

        return {"response": response_text}

    except Exception as e:
        logging.error(str(e))
        raise HTTPException(status_code=500, detail="AI error occurred.")


@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    messages = await db.chat_history.find({"session_id": session_id}, {"_id": 0}) \
        .sort("timestamp", 1).to_list(1000)

    for msg in messages:
        if isinstance(msg["timestamp"], str):
            msg["timestamp"] = datetime.fromisoformat(msg["timestamp"])

    return messages


# ---------- VULNERABILITY SCORE ----------
async def update_vulnerability_score(user_id: str, simulation_type: str, score: int):
    field_map = {
        "phishing": "phishing_score",
        "weak_password": "password_score",
        "malware": "malware_score",
        "sql_injection": "sql_injection_score",
        "ransomware": "ransomware_score",
        "social_engineering": "social_engineering_score",
    }

    existing = await db.vulnerability_scores.find_one({"user_id": user_id}, {"_id": 0})

    if existing:
        if simulation_type in field_map:
            field = field_map[simulation_type]

            await db.vulnerability_scores.update_one(
                {"user_id": user_id},
                {"$set": {field: score, "last_updated": datetime.now(timezone.utc).isoformat()}},
            )

        updated = await db.vulnerability_scores.find_one({"user_id": user_id}, {"_id": 0})
        scores = [
            updated.get("phishing_score", 0),
            updated.get("password_score", 0),
            updated.get("malware_score", 0),
            updated.get("sql_injection_score", 0),
            updated.get("ransomware_score", 0),
            updated.get("social_engineering_score", 0),
        ]

        overall = (
            sum(scores) // len([s for s in scores if s > 0])
            if any(s > 0 for s in scores)
            else 0
        )

        await db.vulnerability_scores.update_one(
            {"user_id": user_id}, {"$set": {"overall_score": overall}}
        )

    else:
        doc = VulnerabilityScore(user_id=user_id, overall_score=score).model_dump()
        doc["last_updated"] = doc["last_updated"].isoformat()

        if simulation_type in field_map:
            doc[field_map[simulation_type]] = score

        await db.vulnerability_scores.insert_one(doc)


@api_router.get("/vulnerability-score/{user_id}")
async def get_vulnerability_score(user_id: str):
    score = await db.vulnerability_scores.find_one({"user_id": user_id}, {"_id": 0})
    if not score:
        return {
            "user_id": user_id,
            "overall_score": 0,
            "phishing_score": 0,
            "password_score": 0,
            "malware_score": 0,
            "sql_injection_score": 0,
            "ransomware_score": 0,
            "social_engineering_score": 0,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    if isinstance(score["last_updated"], str):
        score["last_updated"] = datetime.fromisoformat(score["last_updated"])

    return score


# ---------- REPORT GENERATION ----------
@api_router.get("/report/{user_id}")
async def generate_report(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    simulations = await db.simulations.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    vuln_score = await db.vulnerability_scores.find_one({"user_id": user_id}, {"_id": 0})

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=24,
        textColor=colors.HexColor("#1e40af"),
        spaceAfter=30,
    )

    story.append(Paragraph("Cybersecurity Vulnerability Assessment Report", title_style))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"<b>Name:</b> {user['name']}", styles["Normal"]))
    story.append(Paragraph(f"<b>Email:</b> {user['email']}", styles["Normal"]))
    story.append(Paragraph(
        f"<b>Report Date:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
        styles["Normal"],
    ))
    story.append(Spacer(1, 0.3 * inch))

    if vuln_score:
        overall = vuln_score.get("overall_score", 0)
        story.append(Paragraph(f"<b>Overall Security Score: {overall}/100</b>", styles["Heading2"]))
        story.append(Spacer(1, 0.2 * inch))

        score_data = [
            ["Threat Type", "Score", "Status"],
            ["Phishing Detection", f"{vuln_score.get('phishing_score', 0)}/100",
             get_status(vuln_score.get('phishing_score', 0))],
            ["Password Security", f"{vuln_score.get('password_score', 0)}/100",
             get_status(vuln_score.get('password_score', 0))],
            ["Malware Awareness", f"{vuln_score.get('malware_score', 0)}/100",
             get_status(vuln_score.get('malware_score', 0))],
            ["SQL Injection", f"{vuln_score.get('sql_injection_score', 0)}/100",
             get_status(vuln_score.get('sql_injection_score', 0))],
            ["Ransomware Defense", f"{vuln_score.get('ransomware_score', 0)}/100",
             get_status(vuln_score.get('ransomware_score', 0))],
            ["Social Engineering", f"{vuln_score.get('social_engineering_score', 0)}/100",
             get_status(vuln_score.get('social_engineering_score', 0))],
        ]

        table = Table(score_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 12),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
            ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ]))
        story.append(table)

    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("<b>Recommendations:</b>", styles["Heading2"]))
    story.append(Paragraph("1. Enable Two-Factor Authentication (2FA) on all business accounts", styles["Normal"]))
    story.append(Paragraph("2. Conduct regular cybersecurity training for staff", styles["Normal"]))
    story.append(Paragraph("3. Maintain strong unique passwords with a password manager", styles["Normal"]))
    story.append(Paragraph("4. Keep all systems updated", styles["Normal"]))
    story.append(Paragraph("5. Maintain regular data backups", styles["Normal"]))

    doc.build(story)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=security_report_{user_id}.pdf"}
    )


def get_status(score):
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Fair"
    else:
        return "Needs Improvement"


# ---------- CERTIFICATE ----------
@api_router.post("/certificate/{user_id}")
async def issue_certificate(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if len(user.get("completed_simulations", [])) < 6:
        raise HTTPException(status_code=400, detail="Complete all simulations to earn certificate")

    existing_cert = await db.certificates.find_one({"user_id": user_id}, {"_id": 0})
    if existing_cert:
        if isinstance(existing_cert["issued_date"], str):
            existing_cert["issued_date"] = datetime.fromisoformat(existing_cert["issued_date"])
        return existing_cert

    cert = Certificate(
        user_id=user_id,
        certificate_number=f"CYBER-{random.randint(10000, 99999)}"
    )
    doc = cert.model_dump()
    doc["issued_date"] = doc["issued_date"].isoformat()
    await db.certificates.insert_one(doc)
    return cert


@api_router.get("/certificate/{user_id}")
async def get_certificate(user_id: str):
    cert = await db.certificates.find_one({"user_id": user_id}, {"_id": 0})
    if not cert:
        return None

    if isinstance(cert["issued_date"], str):
        cert["issued_date"] = datetime.fromisoformat(cert["issued_date"])

    return cert


# --------- CORS + ROUTER ---------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
