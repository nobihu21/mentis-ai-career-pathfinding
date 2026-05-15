"""
MENTIS AI v2.0 - Backend (FastAPI)
Complete implementation with all endpoints
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import os
import json
import base64
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
import requests
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
import logging
import time

# Initialize
load_dotenv()
app = FastAPI(title="MENTIS AI v2.0 Backend", version="2.0.0")
logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parent
FIREBASE_STATUS = "not initialized"

# CORS
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase
def _initialize_firebase():
    """Initialize Firebase Admin from Vercel-safe env vars or a local key file."""
    global FIREBASE_STATUS
    if firebase_admin._apps:
        FIREBASE_STATUS = "already initialized"
        return True

    try:
        encoded = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64", "").strip()
        raw_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()

        if encoded:
            info = json.loads(base64.b64decode(encoded).decode("utf-8"))
            firebase_admin.initialize_app(credentials.Certificate(info))
            FIREBASE_STATUS = "initialized from FIREBASE_SERVICE_ACCOUNT_BASE64"
            return True

        if raw_json:
            firebase_admin.initialize_app(credentials.Certificate(json.loads(raw_json)))
            FIREBASE_STATUS = "initialized from FIREBASE_SERVICE_ACCOUNT_JSON"
            return True

        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "").strip()
        if service_account_path and os.path.exists(service_account_path):
            firebase_admin.initialize_app(credentials.Certificate(service_account_path))
            FIREBASE_STATUS = f"initialized from FIREBASE_SERVICE_ACCOUNT_PATH: {service_account_path}"
            return True

        local_key_path = BACKEND_DIR / "serviceAccountKey.json"
        if local_key_path.exists():
            firebase_admin.initialize_app(credentials.Certificate(str(local_key_path)))
            FIREBASE_STATUS = f"initialized from {local_key_path}"
            return True

        FIREBASE_STATUS = f"missing service account. checked {local_key_path}"
        logger.warning(FIREBASE_STATUS)
        return False
    except Exception as exc:
        FIREBASE_STATUS = f"Firebase initialization failed: {exc}"
        logger.error(FIREBASE_STATUS)
        return False


FIREBASE_READY = _initialize_firebase()
db = firestore.client() if FIREBASE_READY else None
security = HTTPBearer()

# OpenRouter config
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
MAX_TOKENS = int(os.getenv("OPENROUTER_MAX_TOKENS", "300"))

# ===== PYDANTIC MODELS =====

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""
    careerGoal: Optional[str] = None
    tier: Optional[str] = None
    queryType: Optional[str] = "student"

class ActivityLogRequest(BaseModel):
    actionType: str = Field(..., pattern="resource_viewed|task_completed|quiz_taken|milestone_completed")
    domain: str
    careerRelated: Optional[str] = None
    details: Optional[dict] = {}

class CareerValidationRequest(BaseModel):
    careerId: str

class StudentProfileUpdate(BaseModel):
    learningStyle: Optional[str] = None
    tier: Optional[str] = None
    customCareerChoice: Optional[str] = None

class FlagStudentRequest(BaseModel):
    severity: str
    reason: str
    description: str
    suggestedActions: List[str] = []

class BulkMessageRequest(BaseModel):
    studentIds: List[str]
    subject: str
    message: str

# ===== HEALTH CHECK =====

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "mentis-fastapi-v2",
        "version": "2.0",
        "openrouter_loaded": bool(OPENROUTER_API_KEY),
    }

@app.get("/health")
def health_alias():
    return health_check()

@app.get("/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "mentis-fastapi-v2",
        "version": "2.0",
        "model": OPENROUTER_MODEL,
        "max_tokens": MAX_TOKENS,
        "firebase_ready": FIREBASE_READY,
        "firebase_status": FIREBASE_STATUS,
    }

# ===== AUTH HELPER =====

def get_current_user(credentials = Depends(security)):
    """Extract Firebase user from token"""
    if not FIREBASE_READY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin is not configured on this backend.",
        )
    try:
        decoded_token = firebase_auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


CAREER_CATALOG = [
    {
        "id": "css-officer",
        "careerName": "CSS Officer",
        "tier": ["matric", "intermediate", "degree"],
        "domains": {"law": 0.35, "english": 0.25, "governance": 0.25, "business": 0.15},
        "requiredSkills": ["English essay writing", "Current affairs", "Public policy"],
        "marketData": {
            "avgSalary": "PKR 50K-180K/month",
            "jobGrowth": "+8% /5y",
            "demand": "High",
            "competitionLevel": "Very High",
        },
        "timeToReadiness": "8-14 months",
        "trendingRank": 1,
    },
    {
        "id": "software-engineer",
        "careerName": "Software Engineer",
        "tier": ["intermediate", "degree"],
        "domains": {"programming": 0.5, "engineering": 0.25, "math": 0.15, "business": 0.1},
        "requiredSkills": ["JavaScript or Python", "Data structures", "Project portfolio"],
        "marketData": {
            "avgSalary": "PKR 80K-350K/month",
            "jobGrowth": "+22% /5y",
            "demand": "High",
            "competitionLevel": "Medium",
        },
        "timeToReadiness": "6-10 months",
        "trendingRank": 2,
    },
    {
        "id": "data-scientist",
        "careerName": "Data Scientist",
        "tier": ["degree"],
        "domains": {"data": 0.45, "programming": 0.25, "math": 0.2, "business": 0.1},
        "requiredSkills": ["Python", "Statistics", "Machine learning portfolio"],
        "marketData": {
            "avgSalary": "PKR 120K-450K/month",
            "jobGrowth": "+27% /5y",
            "demand": "High",
            "competitionLevel": "Medium-High",
        },
        "timeToReadiness": "8-12 months",
        "trendingRank": 3,
    },
    {
        "id": "digital-marketer",
        "careerName": "Digital Marketer",
        "tier": ["matric", "intermediate", "degree"],
        "domains": {"marketing": 0.4, "business": 0.3, "design": 0.15, "data": 0.15},
        "requiredSkills": ["Content strategy", "Analytics", "Paid ads basics"],
        "marketData": {
            "avgSalary": "PKR 45K-220K/month",
            "jobGrowth": "+18% /5y",
            "demand": "High",
            "competitionLevel": "Medium",
        },
        "timeToReadiness": "3-6 months",
        "trendingRank": 4,
    },
    {
        "id": "doctor-medical",
        "careerName": "Medical Field",
        "tier": ["intermediate", "degree"],
        "domains": {"medicine": 0.55, "biology": 0.25, "research": 0.1, "service": 0.1},
        "requiredSkills": ["Biology mastery", "Entry test preparation", "Clinical discipline"],
        "marketData": {
            "avgSalary": "PKR 70K-300K/month",
            "jobGrowth": "+10% /5y",
            "demand": "High",
            "competitionLevel": "Very High",
        },
        "timeToReadiness": "12+ months",
        "trendingRank": 5,
    },
    {
        "id": "product-manager",
        "careerName": "Product Manager",
        "tier": ["degree"],
        "domains": {"business": 0.3, "programming": 0.2, "design": 0.2, "data": 0.2, "marketing": 0.1},
        "requiredSkills": ["Product analytics", "User research", "Roadmap planning"],
        "marketData": {
            "avgSalary": "PKR 150K-500K/month",
            "jobGrowth": "+16% /5y",
            "demand": "Medium-High",
            "competitionLevel": "Medium",
        },
        "timeToReadiness": "6-9 months",
        "trendingRank": 6,
    },
]


def _domain_scores(student_data: dict) -> Dict[str, int]:
    domains = student_data.get("interestProfile", {}).get("domains", {})
    return {key: int(value.get("score", 0)) for key, value in domains.items()}


def calculate_career_matches(student_data: dict) -> Dict[str, dict]:
    """Deterministic suitability model used as the production baseline."""
    profile = student_data.get("profile", {}) or student_data
    tier = (profile.get("tier") or student_data.get("tier") or "intermediate").lower()
    domain_scores = _domain_scores(student_data)

    matches = {}
    for career in CAREER_CATALOG:
        if tier not in career["tier"]:
            continue

        weighted_interest = 0
        total_weight = 0
        reasoning = []
        skill_gaps = []

        for domain, weight in career["domains"].items():
            score = domain_scores.get(domain, 0)
            weighted_interest += score * weight
            total_weight += weight
            if score >= 65:
                reasoning.append(f"{domain.title()} interest is strong at {score}%")
            elif score < 35:
                skill_gaps.append(f"Build more evidence in {domain}")

        interest_fit = weighted_interest / total_weight if total_weight else 0
        trend_fit = max(0, 100 - (career["trendingRank"] - 1) * 8)
        readiness = calculate_readiness(student_data)
        suitability = round((interest_fit * 0.45) + (readiness * 0.25) + (trend_fit * 0.2) + 8)
        suitability = max(1, min(100, suitability))

        if not reasoning:
            reasoning.append("Early signal based on your recent activity pattern")

        matches[career["id"]] = {
            "careerName": career["careerName"],
            "suitabilityScore": suitability,
            "reasoning": reasoning[:3],
            "timeToReadiness": career["timeToReadiness"],
            "skillGaps": (skill_gaps or career["requiredSkills"])[:3],
            "marketData": career["marketData"],
            "trendingRank": career["trendingRank"],
            "matchedAt": datetime.utcnow().isoformat(),
        }

    return dict(sorted(matches.items(), key=lambda item: item[1]["suitabilityScore"], reverse=True))


def json_safe(value):
    """Convert Firestore/native values into JSON-safe structures."""
    if isinstance(value, dict):
        return {str(k): json_safe(v) for k, v in value.items()}
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, tuple):
        return [json_safe(item) for item in value]
    if hasattr(value, "isoformat"):
        try:
            return value.isoformat()
        except Exception:
            return str(value)
    return value

# ===== STUDENT ENDPOINTS =====

@app.get("/v1/student/profile")
async def get_student_profile(user = Depends(get_current_user)):
    """Get complete student profile with interests, career matches, learning path"""
    try:
        doc = db.collection("users").document(user['uid']).get()
        if not doc.exists:
            profile = {
                "displayName": user.get("name") or user.get("email", "Student"),
                "email": user.get("email"),
                "role": "student",
                "tier": "intermediate",
                "learningStyle": "visual",
            }
            data = {
                "profile": profile,
                "interestProfile": {"domains": {}, "topDomains": []},
                "careerMatches": {},
                "learningPath": {},
                "customCareerChoice": None,
            }
            db.collection("users").document(user["uid"]).set({
                **data,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }, merge=True)
        else:
            data = doc.data() or {}

        return {
            "profile": data.get("profile"),
            "interestProfile": data.get("interestProfile"),
            "careerMatches": data.get("careerMatches"),
            "learningPath": data.get("learningPath"),
            "customCareerChoice": data.get("customCareerChoice"),
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"response": "AI mentor is temporarily unavailable, but your dashboard signals are still being tracked. Try again in a moment."}

@app.post("/v1/student/activity")
async def log_student_activity(
    request: ActivityLogRequest,
    user = Depends(get_current_user)
):
    """Log student action → update interest profile → recalculate recommendations"""
    try:
        student_doc = db.collection("users").document(user['uid']).get()
        if not student_doc.exists:
            db.collection("users").document(user["uid"]).set({
                "profile": {
                    "displayName": user.get("name") or user.get("email", "Student"),
                    "email": user.get("email"),
                    "role": "student",
                    "tier": "intermediate",
                },
                "interestProfile": {"domains": {}, "topDomains": []},
                "createdAt": firestore.SERVER_TIMESTAMP,
            }, merge=True)
            student_data = {}
        else:
            student_data = student_doc.data() or {}
        
        # Step 1: Log activity
        activity = {
            "timestamp": firestore.SERVER_TIMESTAMP,
            "actionType": request.actionType,
            "domain": request.domain,
            "careerRelated": request.careerRelated,
            "details": request.details,
        }
        db.collection("users").document(user['uid']).collection("activityLog").add(activity)
        
        # Step 2: Update interest profile
        interest_profile = student_data.get("interestProfile", {}).get("domains", {})
        
        # Decay existing scores
        decay_factor = 0.9
        for domain_key, domain_value in list(interest_profile.items()):
            if not isinstance(domain_value, dict):
                try:
                    score = int(domain_value or 0)
                except (TypeError, ValueError):
                    score = 0
                interest_profile[domain_key] = {"score": score, "sources": []}
            interest_profile[domain_key]["score"] = int(interest_profile[domain_key].get("score", 0) * decay_factor)
            interest_profile[domain_key].setdefault("sources", [])
        
        # Add new action impact
        domain = request.domain
        action_weights = {
            "resource_viewed": 10,
            "task_completed": 25,
            "quiz_taken": 30,
            "milestone_completed": 40,
        }
        
        impact = action_weights.get(request.actionType, 10)
        
        if domain not in interest_profile:
            interest_profile[domain] = {"score": 0, "sources": []}
        interest_profile[domain].setdefault("sources", [])
        
        interest_profile[domain]["score"] = min(100, interest_profile[domain]["score"] + impact)
        interest_profile[domain]["sources"].append(request.actionType)
        
        # Get top domains
        top_domains = sorted(
            interest_profile.items(),
            key=lambda x: x[1].get("score", 0),
            reverse=True
        )[:3]
        
        updated_student_data = {
            **student_data,
            "interestProfile": {
                **student_data.get("interestProfile", {}),
                "domains": interest_profile,
                "topDomains": [d[0] for d in top_domains],
            },
        }
        career_matches = calculate_career_matches(updated_student_data)

        # Update Firestore
        db.collection("users").document(user['uid']).set({
            "interestProfile": {
                "domains": interest_profile,
                "topDomains": [d[0] for d in top_domains],
                "lastUpdated": firestore.SERVER_TIMESTAMP,
            },
            "careerMatches": career_matches,
        }, merge=True)
        
        return json_safe({
            "success": True,
            "interestUpdated": True,
            "topDomains": [d[0] for d in top_domains],
            "newRecommendations": [
                {"id": career_id, **career}
                for career_id, career in list(career_matches.items())[:3]
            ],
            "message": "Interest profile updated"
        })
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"success": False, "interestUpdated": False, "topDomains": [], "newRecommendations": [], "error": str(e)}

@app.get("/v1/student/career-matches")
async def get_career_matches(user = Depends(get_current_user)):
    """Get all career matches sorted by suitability"""
    try:
        doc = db.collection("users").document(user['uid']).get()
        data = doc.data() if doc.exists else {}
        career_matches = calculate_career_matches(data)
        db.collection("users").document(user['uid']).set({"careerMatches": career_matches}, merge=True)
        
        sorted_matches = sorted(
            career_matches.items(),
            key=lambda x: x[1].get("suitabilityScore", 0),
            reverse=True
        )
        
        return json_safe({
            "careers": [
                {
                    "id": career_id,
                    **career_data
                }
                for career_id, career_data in sorted_matches
            ]
        })
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        fallback_matches = calculate_career_matches({})
        return {"careers": [{"id": career_id, **career} for career_id, career in fallback_matches.items()], "error": str(e)}


@app.put("/v1/student/profile")
async def update_student_profile(request: StudentProfileUpdate, user = Depends(get_current_user)):
    """Update student tier, learning style, and custom career goal."""
    try:
        values = request.dict(exclude_none=True)
        payload = {"profile": {**values, "updatedAt": firestore.SERVER_TIMESTAMP}}
        db.collection("users").document(user["uid"]).set(payload, merge=True)
        return {"success": True, "updated": list(values.keys())}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"success": False, "updated": [], "error": str(e)}


@app.post("/v1/student/custom-career-validation")
async def validate_custom_career(request: CareerValidationRequest, user = Depends(get_current_user)):
    """Validate a student-selected career against their live interest profile."""
    try:
        doc = db.collection("users").document(user["uid"]).get()
        student_data = doc.data() if doc.exists else {}
        matches = calculate_career_matches(student_data)
        selected = matches.get(request.careerId)

        if selected:
            score = selected["suitabilityScore"]
            feedback = f"{selected['careerName']} is a strong option. Focus next on: {', '.join(selected['skillGaps'][:2])}."
        else:
            score = 55
            feedback = "This career is possible, but MENTIS needs more activity data to validate it confidently."

        approved = score >= 60
        payload = {
            "careerId": request.careerId,
            "validationScore": score,
            "isApproved": approved,
            "feedback": feedback,
            "selectedAt": datetime.utcnow().isoformat(),
        }
        db.collection("users").document(user["uid"]).set({"customCareerChoice": payload}, merge=True)
        return payload
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            "careerId": request.careerId,
            "validationScore": 55,
            "isApproved": False,
            "feedback": "Validation is temporarily using fallback mode. Keep logging interests to improve confidence.",
            "error": str(e),
        }

@app.post("/v1/student/chat")
async def student_chat(
    request: ChatRequest,
    user = Depends(get_current_user)
):
    """Student AI mentor chat"""
    student_data = {}
    try:
        student_doc = db.collection("users").document(user['uid']).get()
        if not student_doc.exists:
            student_data = {
                "profile": {
                    "displayName": user.get("name") or user.get("email", "Student"),
                    "email": user.get("email"),
                    "role": "student",
                    "tier": request.tier or "intermediate",
                },
                "interestProfile": {"domains": {}, "topDomains": []},
            }
            db.collection("users").document(user["uid"]).set(student_data, merge=True)
        else:
            student_data = student_doc.data() or {}
    except Exception as profile_error:
        logger.error(f"Student chat profile load failed: {profile_error}")
        student_data = {}

    profile = student_data.get("profile") if isinstance(student_data, dict) else {}
    if not isinstance(profile, dict):
        profile = {}

    interest_profile = student_data.get("interestProfile") if isinstance(student_data, dict) else {}
    if not isinstance(interest_profile, dict):
        interest_profile = {}

    interests = interest_profile.get("topDomains", [])
    if not isinstance(interests, list):
        interests = []
    interests = [str(item) for item in interests if item]

    tier = request.tier or profile.get("tier") or student_data.get("tier") or "intermediate"
    learning_style = profile.get("learningStyle") or student_data.get("learningStyle") or "not set"
    career_goal = request.careerGoal or student_data.get("customCareerChoice", {}).get("careerName") if isinstance(student_data.get("customCareerChoice"), dict) else request.careerGoal

    system_prompt = f"""
You are MENTIS AI, a personalized career mentor for Pakistani students.

Student Profile:
- Tier: {tier}
- Learning style: {learning_style}
- Top interests: {', '.join(interests) if interests else 'Exploring'}
- Career goal: {career_goal or 'Exploring'}

Be encouraging, actionable, and concise (2-3 sentences max).
Focus on next steps and skill-building.
"""

    prompt = f"{system_prompt}\n\nStudent: {request.message}"
    response = call_openrouter_api(prompt)

    # Chat history should never break the user-facing response.
    try:
        db.collection("users").document(user['uid']).collection("chatHistory").add({
            "role": "user",
            "content": request.message,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "careerContext": career_goal,
        })

        db.collection("users").document(user['uid']).collection("chatHistory").add({
            "role": "assistant",
            "content": response,
            "timestamp": firestore.SERVER_TIMESTAMP,
        })
    except Exception as history_error:
        logger.error(f"Chat history save failed: {history_error}")

    return {"response": response}

# ===== PARENT ENDPOINTS =====

@app.get("/v1/parent/children")
async def get_parent_children(user = Depends(get_current_user)):
    """Get list of parent's children with quick stats"""
    try:
        parent_doc = db.collection("parents").document(user['uid']).get()
        if not parent_doc.exists:
            raise HTTPException(status_code=404, detail="Parent profile not found")
        
        parent_data = parent_doc.data()
        children_ids = parent_data.get("children", [])
        
        children = []
        for child_id in children_ids:
            child_doc = db.collection("users").document(child_id).get()
            if child_doc.exists:
                child_data = child_doc.data()
                interests = child_data.get("interestProfile", {}).get("topDomains", [])
                readiness = calculate_readiness(child_data)
                
                children.append({
                    "studentId": child_id,
                    "name": child_data.get("profile", {}).get("displayName"),
                    "tier": child_data.get("profile", {}).get("tier"),
                    "interests": interests,
                    "readiness": readiness,
                    "lastActivity": get_last_activity(child_id),
                })
        
        return {"children": children}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"children": [], "error": str(e)}

@app.get("/v1/parent/child/{child_id}/overview")
async def get_child_overview(child_id: str, user = Depends(get_current_user)):
    """Get child overview for parent"""
    try:
        # Verify parent owns this child
        parent_doc = db.collection("parents").document(user['uid']).get()
        if not parent_doc.exists or child_id not in parent_doc.data().get("children", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        child_doc = db.collection("users").document(child_id).get()
        child_data = child_doc.data()
        
        readiness = calculate_readiness(child_data)
        top_career = get_top_career(child_data)
        health_score = readiness
        
        return {
            "overview": {
                "name": child_data.get("profile", {}).get("displayName"),
                "tier": child_data.get("profile", {}).get("tier"),
                "readiness": readiness,
                "topCareer": top_career,
                "healthScore": health_score,
                "lastActivity": get_last_activity(child_id),
            }
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"overview": None, "error": str(e)}

@app.get("/v1/parent/child/{child_id}/interest-heatmap")
async def get_child_interest_heatmap(child_id: str, user = Depends(get_current_user)):
    """Get child's interest heatmap"""
    try:
        parent_doc = db.collection("parents").document(user['uid']).get()
        if not parent_doc.exists or child_id not in parent_doc.data().get("children", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        child_doc = db.collection("users").document(child_id).get()
        child_data = child_doc.data()
        
        domains = child_data.get("interestProfile", {}).get("domains", {})
        
        return {
            "domains": {domain: data.get("score") for domain, data in domains.items()},
            "lastUpdated": child_data.get("interestProfile", {}).get("lastUpdated"),
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"domains": {}, "trend": "stable", "error": str(e)}

@app.get("/v1/parent/child/{child_id}/career-forecast")
async def get_child_career_forecast(child_id: str, user = Depends(get_current_user)):
    """Get child's career forecast with market data"""
    try:
        parent_doc = db.collection("parents").document(user['uid']).get()
        if not parent_doc.exists or child_id not in parent_doc.data().get("children", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        child_doc = db.collection("users").document(child_id).get()
        child_data = child_doc.data()
        
        career_matches = child_data.get("careerMatches", {})
        sorted_matches = sorted(
            career_matches.items(),
            key=lambda x: x[1].get("suitabilityScore", 0),
            reverse=True
        )[:3]
        
        return {
            "topCareers": [
                {
                    "id": career_id,
                    "careerName": career_data.get("careerName"),
                    "suitabilityScore": career_data.get("suitabilityScore"),
                    "marketData": career_data.get("marketData"),
                    "timeToReadiness": career_data.get("timeToReadiness"),
                    "skillGaps": career_data.get("skillGaps", []),
                }
                for career_id, career_data in sorted_matches
            ]
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"topCareers": [], "error": str(e)}

@app.post("/v1/parent/chat")
async def parent_chat(request: ChatRequest, user = Depends(get_current_user)):
    """Parent chat with AI assistant"""
    try:
        parent_doc = db.collection("parents").document(user['uid']).get()
        if not parent_doc.exists:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        system_prompt = """
You are MENTIS AI, a parent's career guidance assistant for Pakistan.

Your role:
1. Help parents understand their child's career potential
2. Suggest how parents can support preparation
3. Provide perspective on market trends and opportunities

Be warm, supportive, and actionable.
"""
        
        prompt = f"{system_prompt}\n\nParent: {request.message}"
        response = call_openrouter_api(prompt)
        
        return {"response": response}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"response": "Parent AI is temporarily unavailable. Please review the dashboard signals and try again."}


@app.get("/v1/parent/notifications")
async def get_parent_notifications(user = Depends(get_current_user)):
    """Return latest parent notifications."""
    try:
        parent_doc = db.collection("parents").document(user["uid"]).get()
        if not parent_doc.exists:
            return {"notifications": []}
        notifications = parent_doc.data().get("notifications", [])
        return {"notifications": sorted(notifications, key=lambda n: str(n.get("createdAt", "")), reverse=True)[:20]}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"notifications": [], "error": str(e)}


@app.get("/v1/parent/reports/generate")
async def generate_parent_report(childId: str, user = Depends(get_current_user)):
    """Generate a report payload the frontend can export/print as PDF."""
    try:
        parent_doc = db.collection("parents").document(user["uid"]).get()
        if not parent_doc.exists or childId not in parent_doc.data().get("children", []):
            raise HTTPException(status_code=403, detail="Not authorized")

        child_doc = db.collection("users").document(childId).get()
        if not child_doc.exists:
            raise HTTPException(status_code=404, detail="Child not found")

        child_data = child_doc.data()
        matches = calculate_career_matches(child_data)
        return {
            "report": {
                "studentName": child_data.get("profile", {}).get("displayName", "Student"),
                "tier": child_data.get("profile", {}).get("tier"),
                "readiness": calculate_readiness(child_data),
                "topCareers": [{"id": career_id, **career} for career_id, career in list(matches.items())[:3]],
                "generatedAt": datetime.utcnow().isoformat(),
                "guidance": "Support consistent weekly practice, review skill gaps, and celebrate completed milestones.",
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"report": None, "error": str(e)}

# ===== COUNSELOR ENDPOINTS =====

@app.get("/v1/counselor/batches")
async def get_counselor_batches(user = Depends(get_current_user)):
    """Get batches managed by counselor"""
    try:
        counselor_doc = db.collection("counselors").document(user['uid']).get()
        if not counselor_doc.exists:
            raise HTTPException(status_code=404, detail="Counselor not found")
        
        batch_ids = counselor_doc.data().get("managedBatches", [])
        batches = []
        
        for batch_id in batch_ids:
            batch_doc = db.collection("batches").document(batch_id).get()
            if batch_doc.exists:
                batch_data = batch_doc.data()
                analytics = batch_data.get("analytics", {})
                
                batches.append({
                    "batchId": batch_id,
                    "name": batch_data.get("name"),
                    "tier": batch_data.get("tier"),
                    "studentCount": len(batch_data.get("studentIds", [])),
                    "avgReadiness": analytics.get("avgReadiness", 0),
                    "topCareers": analytics.get("topCareers", []),
                })
        
        return {"batches": batches}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"batches": [], "error": str(e)}

@app.get("/v1/counselor/batch/{batch_id}/overview")
async def get_batch_overview(batch_id: str, user = Depends(get_current_user)):
    """Get batch analytics overview"""
    try:
        counselor_doc = db.collection("counselors").document(user['uid']).get()
        if not counselor_doc.exists or batch_id not in counselor_doc.data().get("managedBatches", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        batch_doc = db.collection("batches").document(batch_id).get()
        if not batch_doc.exists:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        batch_data = batch_doc.data()
        analytics = batch_data.get("analytics", {})
        
        return {
            "analytics": {
                "totalStudents": len(batch_data.get("studentIds", [])),
                "avgReadiness": analytics.get("avgReadiness", 0),
                "engagementRate": analytics.get("engagementRate", 0),
                "topCareers": analytics.get("topCareers", []),
                "interestDistribution": analytics.get("interestDistribution", {}),
                "atRiskCount": len(counselor_doc.data().get("studentFlags", {})),
            }
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"analytics": {"totalStudents": 0, "avgReadiness": 0, "engagementRate": 0, "topCareers": [], "interestDistribution": {}, "atRiskCount": 0}, "error": str(e)}

@app.get("/v1/counselor/batch/{batch_id}/students")
async def get_batch_students(
    batch_id: str,
    tier: Optional[str] = None,
    page: int = 1,
    user = Depends(get_current_user)
):
    """Get students in batch with filters"""
    try:
        counselor_doc = db.collection("counselors").document(user['uid']).get()
        if not counselor_doc.exists or batch_id not in counselor_doc.data().get("managedBatches", []):
            raise HTTPException(status_code=403, detail="Not authorized")
        
        batch_doc = db.collection("batches").document(batch_id).get()
        batch_data = batch_doc.data()
        student_ids = batch_data.get("studentIds", [])
        
        students = []
        counselor_data = counselor_doc.data()
        
        for student_id in student_ids:
            student_doc = db.collection("users").document(student_id).get()
            if student_doc.exists:
                student_data = student_doc.data()
                
                if tier and student_data.get("profile", {}).get("tier") != tier:
                    continue
                
                interests = student_data.get("interestProfile", {}).get("topDomains", [])
                readiness = calculate_readiness(student_data)
                flags = counselor_data.get("studentFlags", {}).get(student_id, [])
                
                students.append({
                    "studentId": student_id,
                    "name": student_data.get("profile", {}).get("displayName"),
                    "tier": student_data.get("profile", {}).get("tier"),
                    "interests": interests,
                    "readiness": readiness,
                    "riskFlag": flags[0] if flags else None,
                    "lastActivity": get_last_activity(student_id),
                })
        
        # Pagination
        page_size = 20
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "students": students[start:end],
            "totalCount": len(students),
            "currentPage": page,
            "totalPages": (len(students) + page_size - 1) // page_size,
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"students": [], "totalCount": 0, "currentPage": page, "totalPages": 0, "error": str(e)}

@app.post("/v1/counselor/student/{student_id}/flag")
async def flag_student(
    student_id: str,
    request: FlagStudentRequest,
    user = Depends(get_current_user)
):
    """Flag student for intervention"""
    try:
        counselor_doc = db.collection("counselors").document(user['uid']).get()
        if not counselor_doc.exists:
            raise HTTPException(status_code=404, detail="Counselor not found")
        
        flag_data = {
            "flagId": f"flag_{student_id}_{int(time.time())}",
            "severity": request.severity,
            "reason": request.reason,
            "description": request.description,
            "suggestedActions": request.suggestedActions,
            "flaggedAt": firestore.SERVER_TIMESTAMP,
            "status": "open",
        }
        
        counselor_doc_ref = db.collection("counselors").document(user['uid'])
        student_flags = counselor_doc.data().get("studentFlags", {})
        
        if student_id not in student_flags:
            student_flags[student_id] = []
        
        student_flags[student_id].append(flag_data)
        counselor_doc_ref.update({"studentFlags": student_flags})
        
        return {"flagId": flag_data["flagId"], "success": True}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"flagId": None, "success": False, "error": str(e)}


@app.get("/v1/counselor/batch/{batch_id}/analytics")
async def get_batch_analytics(batch_id: str, user = Depends(get_current_user)):
    """Aggregate batch interests, top careers, skill gaps, and risk counts."""
    try:
        counselor_doc = db.collection("counselors").document(user["uid"]).get()
        if not counselor_doc.exists or batch_id not in counselor_doc.data().get("managedBatches", []):
            raise HTTPException(status_code=403, detail="Not authorized")

        batch_doc = db.collection("batches").document(batch_id).get()
        if not batch_doc.exists:
            raise HTTPException(status_code=404, detail="Batch not found")

        student_ids = batch_doc.data().get("studentIds", [])
        interest_totals = {}
        career_counts = {}
        skill_gap_counts = {}
        readiness_scores = []
        at_risk = []

        for student_id in student_ids:
            student_doc = db.collection("users").document(student_id).get()
            if not student_doc.exists:
                continue
            student_data = student_doc.data()
            readiness = calculate_readiness(student_data)
            readiness_scores.append(readiness)
            if readiness < 35 or not get_last_activity(student_id):
                at_risk.append(student_id)

            for domain, score in _domain_scores(student_data).items():
                interest_totals[domain] = interest_totals.get(domain, 0) + score

            matches = student_data.get("careerMatches") or calculate_career_matches(student_data)
            for career_id, career in list(matches.items())[:3]:
                career_counts[career.get("careerName", career_id)] = career_counts.get(career.get("careerName", career_id), 0) + 1
                for gap in career.get("skillGaps", []):
                    skill_gap_counts[gap] = skill_gap_counts.get(gap, 0) + 1

        count = max(1, len(student_ids))
        analytics = {
            "totalStudents": len(student_ids),
            "avgReadiness": round(sum(readiness_scores) / max(1, len(readiness_scores))),
            "engagementRate": round(((len(student_ids) - len(at_risk)) / count) * 100),
            "interestHeatmap": {k: round(v / count) for k, v in interest_totals.items()},
            "topCareers": sorted(career_counts.items(), key=lambda item: item[1], reverse=True)[:10],
            "skillGaps": sorted(skill_gap_counts.items(), key=lambda item: item[1], reverse=True)[:10],
            "atRiskStudentIds": at_risk,
        }

        db.collection("batches").document(batch_id).set({"analytics": analytics}, merge=True)
        return {"analytics": analytics}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"analytics": {"totalStudents": 0, "avgReadiness": 0, "engagementRate": 0, "interestHeatmap": {}, "topCareers": [], "skillGaps": [], "atRiskStudentIds": []}, "error": str(e)}


@app.post("/v1/counselor/bulk-message")
async def send_bulk_message(request: BulkMessageRequest, user = Depends(get_current_user)):
    """Persist counselor bulk messages for selected students."""
    try:
        counselor_doc = db.collection("counselors").document(user["uid"]).get()
        if not counselor_doc.exists:
            raise HTTPException(status_code=404, detail="Counselor not found")

        message = {
            "counselorId": user["uid"],
            "studentIds": request.studentIds,
            "subject": request.subject,
            "message": request.message,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        ref = db.collection("bulkMessages").add(message)[1]
        for student_id in request.studentIds:
            db.collection("users").document(student_id).collection("messages").add(message)
        return {"messageId": ref.id, "recipientCount": len(request.studentIds)}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"messageId": None, "recipientCount": 0, "error": str(e)}

@app.post("/v1/counselor/chat")
async def counselor_chat(request: ChatRequest, user = Depends(get_current_user)):
    """Counselor chat with AI for insights"""
    try:
        counselor_doc = db.collection("counselors").document(user['uid']).get()
        if not counselor_doc.exists:
            raise HTTPException(status_code=404, detail="Counselor not found")
        
        system_prompt = """
You are MENTIS AI, a counselor's intelligence assistant.

Your role:
1. Provide batch-level insights and trends
2. Identify at-risk students
3. Suggest intervention strategies
4. Analyze interest distributions

Be data-driven and actionable.
"""
        
        prompt = f"{system_prompt}\n\nCounselor: {request.message}"
        response = call_openrouter_api(prompt)
        
        return {"response": response}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"response": "Counselor AI is temporarily unavailable. Batch analytics can still be reviewed from the dashboard."}

# ===== AI HELPER FUNCTIONS =====

def call_openrouter_api(prompt: str) -> str:
    """Call OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return "API key not configured. Using mock response."
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MENTIS AI",
    }
    
    payload = {
        "model": OPENROUTER_MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {
                "role": "system",
                "content": "You are MENTIS AI, a professional career guidance platform. Provide concise, actionable responses.",
            },
            {"role": "user", "content": prompt},
        ],
    }
    
    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=90,
        )
        
        if r.ok:
            data = r.json()
            return data["choices"][0]["message"]["content"]
        else:
            logger.error(f"OpenRouter error: {r.status_code}")
            return f"API Error: {r.status_code}. Please try again."
    except Exception as e:
        logger.error(f"Error calling OpenRouter: {str(e)}")
        return "Error communicating with AI. Please try again."

def calculate_readiness(student_data: dict) -> int:
    """Calculate student readiness score"""
    domains = student_data.get("interestProfile", {}).get("domains", {})
    if not domains:
        return 0
    scores = [d.get("score", 0) for d in domains.values()]
    return int(sum(scores) / len(scores)) if scores else 0

def get_top_career(student_data: dict) -> str:
    """Get top career match"""
    matches = student_data.get("careerMatches", {})
    if not matches:
        return "Explore careers"
    top = max(matches.items(), key=lambda x: x[1].get("suitabilityScore", 0))
    return top[1].get("careerName", "Unknown")

def get_last_activity(student_id: str) -> Optional[str]:
    """Get last activity timestamp"""
    try:
        logs = db.collection("users").document(student_id).collection("activityLog").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1).get()
        if logs:
            return str(logs[0].get("timestamp"))
        return None
    except:
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
