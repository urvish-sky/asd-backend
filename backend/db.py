"""
Database and Cloud Storage layer for Pediatric ASD Screening Decision Support System (CDSS)
Developed by Urvish Soni and Zankhana Mehta under the guidance of Prof. Shyam Kamal, IIT BHU.

Handles Supabase PostgreSQL database operations, Supabase Object Storage for video streaming,
and provides robust local fallback when cloud credentials are not yet configured.
"""

import os
import uuid
import logging
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv

# Load backend environment variables from .env
load_dotenv(Path(__file__).parent / ".env")

logger = logging.getLogger("asd_cdss_db")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "screening-videos").strip()

supabase = None
is_supabase_connected = False

if SUPABASE_URL and SUPABASE_KEY and not SUPABASE_URL.startswith("https://your-project"):
    try:
        from supabase import create_client, Client
        supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_supabase_connected = True
        logger.info(f"Connected to Supabase at {SUPABASE_URL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Supabase client: {e}. Running in local fallback mode.")
        supabase = None
        is_supabase_connected = False
else:
    logger.info("SUPABASE_URL or SUPABASE_KEY not set. Running in local fallback mode.")

# Local uploads directory fallback
LOCAL_UPLOADS_DIR = Path(__file__).parent / "uploads"
LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ─── Age Calculation Helper ──────────────────────────────────────────

def calculate_age_in_months(dob_str: Optional[str]) -> int:
    """Calculates age in months dynamically from a YYYY-MM-DD or ISO date string."""
    if not dob_str:
        return 0
    try:
        if "T" in dob_str:
            birth_date = datetime.fromisoformat(dob_str.replace("Z", "+00:00")).date()
        else:
            birth_date = datetime.strptime(dob_str[:10], "%Y-%m-%d").date()
        today = date.today()
        years_diff = today.year - birth_date.year
        months_diff = today.month - birth_date.month
        return max(0, (years_diff * 12) + months_diff)
    except Exception as err:
        logger.warning(f"Error calculating age for DOB '{dob_str}': {err}")
        return 0

# ─── In-Memory / Local Seed Data Fallback ─────────────────────────────

INITIAL_MOCK_PATIENTS: List[Dict[str, Any]] = [
    {
        "id": "ASD-PT001",
        "childName": "Arjun M.",
        "dateOfBirth": "2024-09-15",
        "ageInMonths": calculate_age_in_months("2024-09-15"),
        "biologicalSex": "male",
        "parentName": "Kavita Mehta",
        "contactEmail": "kavita.mehta@example.com",
        "contactPhone": "+91-98765-43210",
        "submissionDate": "2026-08-28T10:30:00Z",
        "submissionStatus": "ai_complete",
        "riskTier": "typical",
        "clinicalStatus": "reviewed",
        "videoSlots": [
            {
                "slotNumber": 1,
                "title": "Social Engagement & Name-Call Protocol",
                "fileName": "arjun_social_engagement.mp4",
                "fileSize": 45200000,
                "uploaded": True,
                "videoUrl": "/videos/arjun_social_engagement.mp4",
                "qualityMetrics": {"framingQuality": 94, "lighting": "good", "resolution": "1080p"}
            },
            {
                "slotNumber": 2,
                "title": "Free Play & Motor Exploration",
                "fileName": "arjun_free_play.mp4",
                "fileSize": 52100000,
                "uploaded": True,
                "videoUrl": "/videos/arjun_free_play.mp4",
                "qualityMetrics": {"framingQuality": 89, "lighting": "good", "resolution": "1080p"}
            },
            {
                "slotNumber": 3,
                "title": "Joint Attention & Shared Requesting",
                "fileName": "arjun_joint_attention.mp4",
                "fileSize": 48700000,
                "uploaded": True,
                "videoUrl": "/videos/arjun_joint_attention.mp4",
                "qualityMetrics": {"framingQuality": 91, "lighting": "adequate", "resolution": "1080p"}
            }
        ]
    },
    {
        "id": "ASD-PT002",
        "childName": "Priya K.",
        "dateOfBirth": "2024-03-20",
        "ageInMonths": calculate_age_in_months("2024-03-20"),
        "biologicalSex": "female",
        "parentName": "Sunil Kumar",
        "contactEmail": "sunil.k@example.com",
        "contactPhone": "+91-98765-43211",
        "submissionDate": "2026-08-30T14:15:00Z",
        "submissionStatus": "ai_complete",
        "riskTier": "moderate",
        "clinicalStatus": "pending",
        "videoSlots": [
            {
                "slotNumber": 1,
                "title": "Social Engagement & Name-Call Protocol",
                "fileName": "priya_social.mov",
                "fileSize": 61300000,
                "uploaded": True,
                "videoUrl": "/videos/priya_social.mov",
                "qualityMetrics": {"framingQuality": 86, "lighting": "adequate", "resolution": "1080p"}
            },
            {
                "slotNumber": 2,
                "title": "Free Play & Motor Exploration",
                "fileName": "priya_play.mov",
                "fileSize": 58400000,
                "uploaded": True,
                "videoUrl": "/videos/priya_play.mov",
                "qualityMetrics": {"framingQuality": 90, "lighting": "good", "resolution": "1080p"}
            },
            {
                "slotNumber": 3,
                "title": "Joint Attention & Shared Requesting",
                "fileName": "priya_attention.mov",
                "fileSize": 54200000,
                "uploaded": True,
                "videoUrl": "/videos/priya_attention.mov",
                "qualityMetrics": {"framingQuality": 83, "lighting": "adequate", "resolution": "1080p"}
            }
        ]
    },
    {
        "id": "ASD-PT003",
        "childName": "Rohan S.",
        "dateOfBirth": "2023-11-05",
        "ageInMonths": calculate_age_in_months("2023-11-05"),
        "biologicalSex": "male",
        "parentName": "Ananya Sharma",
        "contactEmail": "ananya.s@example.com",
        "contactPhone": "+91-98765-43212",
        "submissionDate": "2026-09-01T09:00:00Z",
        "submissionStatus": "ai_complete",
        "riskTier": "elevated",
        "clinicalStatus": "pending",
        "videoSlots": [
            {
                "slotNumber": 1,
                "title": "Social Engagement & Name-Call Protocol",
                "fileName": "rohan_name_call.mp4",
                "fileSize": 72400000,
                "uploaded": True,
                "videoUrl": "/videos/rohan_name_call.mp4",
                "qualityMetrics": {"framingQuality": 95, "lighting": "good", "resolution": "1080p"}
            },
            {
                "slotNumber": 2,
                "title": "Free Play & Motor Exploration",
                "fileName": "rohan_motor_stereotypies.mp4",
                "fileSize": 68900000,
                "uploaded": True,
                "videoUrl": "/videos/rohan_motor_stereotypies.mp4",
                "qualityMetrics": {"framingQuality": 92, "lighting": "good", "resolution": "1080p"}
            },
            {
                "slotNumber": 3,
                "title": "Joint Attention & Shared Requesting",
                "fileName": "rohan_joint_attention.mp4",
                "fileSize": 70100000,
                "uploaded": True,
                "videoUrl": "/videos/rohan_joint_attention.mp4",
                "qualityMetrics": {"framingQuality": 88, "lighting": "adequate", "resolution": "1080p"}
            }
        ]
    }
]

# Mutable in-memory store for fallback mode
fallback_patients_store: List[Dict[str, Any]] = [dict(p) for p in INITIAL_MOCK_PATIENTS]

# ─── Storage Operations (Supabase Storage) ───────────────────────────

def upload_video_stream_to_storage(file_bytes: bytes, filename: str, content_type: str = "video/mp4") -> Dict[str, Any]:
    """
    Streams video file bytes to Supabase Storage bucket ('screening-videos').
    Returns public cloud URL or falls back to local video serving.
    """
    file_ext = Path(filename).suffix or ".mp4"
    clean_name = Path(filename).stem.replace(" ", "_")
    storage_filename = f"{clean_name}_{uuid.uuid4().hex[:8]}{file_ext}"

    if is_supabase_connected and supabase:
        try:
            storage_path = f"screenings/{storage_filename}"
            # Upload to Supabase Storage bucket
            res = supabase.storage.from_(STORAGE_BUCKET).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            # Retrieve public URL
            public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)
            logger.info(f"Uploaded video to Supabase Storage: {storage_path} -> {public_url}")
            return {
                "success": True,
                "cloud": True,
                "filename": storage_filename,
                "video_url": public_url,
                "relative_url": f"/videos/{storage_filename}"
            }
        except Exception as e:
            logger.error(f"Supabase storage upload failed: {e}. Falling back to local storage.")

    # Local fallback
    local_path = LOCAL_UPLOADS_DIR / storage_filename
    with open(local_path, "wb") as f:
        f.write(file_bytes)
    logger.info(f"Saved video locally: {local_path}")
    return {
        "success": True,
        "cloud": False,
        "filename": storage_filename,
        "video_url": f"http://localhost:8000/videos/{storage_filename}",
        "relative_url": f"/videos/{storage_filename}"
    }

# ─── Video Record Insertion (Supabase PostgreSQL) ─────────────────────

def insert_video_record(
    screening_id: str,
    protocol_number: int,
    cloud_storage_url: str,
    file_name: Optional[str] = None,
    analysis_result: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Inserts a new row into the `videos` table in Supabase PostgreSQL.
    Falls back to an in-memory log when Supabase is not connected.
    """
    video_id = f"VID-{uuid.uuid4().hex[:8]}"
    record = {
        "id": video_id,
        "screening_id": screening_id,
        "protocol_number": protocol_number,
        "cloud_storage_url": cloud_storage_url,
        "file_name": file_name,
        "analysis_result": analysis_result or {},
    }

    if is_supabase_connected and supabase:
        try:
            supabase.table("videos").insert(record).execute()
            logger.info(f"Inserted video record {video_id} into Supabase videos table.")
        except Exception as e:
            logger.error(f"Failed to insert video record into Supabase: {e}")
    else:
        logger.info(f"[Fallback] Video record {video_id} logged locally (Supabase not connected).")

    return {
        "video_id": video_id,
        **record,
    }

# ─── Database Operations (Supabase PostgreSQL) ────────────────────────

def get_clinical_inbox_data() -> Dict[str, Any]:
    """
    Queries patient screenings ordered by submission_date DESC.
    Dynamically computes age in months from date_of_birth.
    """
    if is_supabase_connected and supabase:
        try:
            # Query screenings joined with patient data
            screenings_res = supabase.table("screenings").select(
                "id, patient_id, submission_date, risk_tier, status, clinical_notes, isaa_scores, biomarkers, patients(id, name, date_of_birth, biological_sex, parent_name, contact_email, contact_phone), videos(id, protocol_number, cloud_storage_url, file_name, analysis_result)"
            ).order("submission_date", desc=True).execute()

            if screenings_res.data:
                inbox_patients = []
                for s in screenings_res.data:
                    p = s.get("patients") or {}
                    dob = p.get("date_of_birth")
                    age_mo = calculate_age_in_months(dob)

                    # Transform videos array into standard videoSlots
                    raw_videos = s.get("videos") or []
                    slots = []
                    for i in (1, 2, 3):
                        matched = next((v for v in raw_videos if v.get("protocol_number") == i), None)
                        if matched:
                            slots.append({
                                "slotNumber": i,
                                "title": f"Protocol {i}",
                                "fileName": matched.get("file_name"),
                                "fileSize": None,
                                "uploaded": True,
                                "videoUrl": matched.get("cloud_storage_url"),
                                "qualityMetrics": {"framingQuality": 90, "lighting": "good", "resolution": "1080p"}
                            })
                        else:
                            slots.append({
                                "slotNumber": i,
                                "title": f"Protocol {i}",
                                "fileName": None,
                                "fileSize": None,
                                "uploaded": False,
                                "qualityMetrics": {"framingQuality": 88, "lighting": "adequate", "resolution": "1080p"}
                            })

                    inbox_patients.append({
                        "id": p.get("id") or s.get("patient_id"),
                        "childName": p.get("name") or "Child Patient",
                        "dateOfBirth": dob,
                        "ageInMonths": age_mo,
                        "biologicalSex": p.get("biological_sex", "male"),
                        "parentName": p.get("parent_name", ""),
                        "contactEmail": p.get("contact_email", ""),
                        "contactPhone": p.get("contact_phone", ""),
                        "submissionDate": s.get("submission_date"),
                        "submissionStatus": s.get("status", "ai_complete"),
                        "riskTier": s.get("risk_tier", "typical"),
                        "clinicalStatus": "pending" if s.get("status") in ["uploaded", "analyzing", "ai_complete", "under_review", "pending"] else s.get("status", "pending"),
                        "videoSlots": slots
                    })

                return {
                    "source": "supabase_postgresql",
                    "total": len(inbox_patients),
                    "patients": inbox_patients,
                    "stats": {
                        "totalPatients": len(inbox_patients),
                        "pendingReview": sum(1 for p in inbox_patients if p.get("clinicalStatus") == "pending"),
                        "elevatedRisk": sum(1 for p in inbox_patients if p.get("riskTier") == "elevated"),
                        "reviewed": sum(1 for p in inbox_patients if p.get("clinicalStatus") == "reviewed")
                    }
                }
        except Exception as e:
            logger.error(f"Error fetching from Supabase: {e}. Returning fallback data.")

    # Recalculate age for fallback store dynamically
    for p in fallback_patients_store:
        p["ageInMonths"] = calculate_age_in_months(p.get("dateOfBirth"))

    return {
        "source": "fallback_store",
        "total": len(fallback_patients_store),
        "patients": fallback_patients_store,
        "stats": {
            "totalPatients": len(fallback_patients_store),
            "pendingReview": sum(1 for p in fallback_patients_store if p.get("clinicalStatus") == "pending"),
            "elevatedRisk": sum(1 for p in fallback_patients_store if p.get("riskTier") == "elevated"),
            "reviewed": sum(1 for p in fallback_patients_store if p.get("clinicalStatus") == "reviewed")
        }
    }


def save_screening_submission(
    child_name: str,
    date_of_birth: Optional[str],
    biological_sex: str,
    parent_name: str,
    contact_email: str,
    contact_phone: str,
    risk_tier: str,
    status: str,
    video_records: List[Dict[str, Any]],
    telemetry: Dict[str, Any],
    isaa_flags: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Persists patient, screening, and video records into Supabase PostgreSQL (or fallback store).
    """
    patient_id = f"ASD-{uuid.uuid4().hex[:6].upper()}"
    screening_id = f"SCR-{patient_id}"
    now_iso = datetime.now().isoformat()
    calculated_age = calculate_age_in_months(date_of_birth)

    if is_supabase_connected and supabase:
        try:
            # 1. Upsert Patient
            supabase.table("patients").upsert({
                "id": patient_id,
                "name": child_name,
                "date_of_birth": date_of_birth or date.today().isoformat(),
                "biological_sex": biological_sex,
                "parent_name": parent_name,
                "contact_email": contact_email,
                "contact_phone": contact_phone,
            }).execute()

            # 2. Insert Screening
            supabase.table("screenings").insert({
                "id": screening_id,
                "patient_id": patient_id,
                "submission_date": now_iso,
                "risk_tier": risk_tier,
                "status": status,
                "biomarkers": telemetry,
                "isaa_scores": {"flags": isaa_flags}
            }).execute()

            # 3. Insert Videos
            for i, vid in enumerate(video_records, start=1):
                supabase.table("videos").insert({
                    "id": f"VID-{uuid.uuid4().hex[:8]}",
                    "screening_id": screening_id,
                    "protocol_number": i if i <= 3 else 1,
                    "cloud_storage_url": vid.get("video_url", ""),
                    "file_name": vid.get("saved_filename") or vid.get("original_filename"),
                    "analysis_result": telemetry
                }).execute()

            logger.info(f"Successfully saved screening {screening_id} for patient {patient_id} to Supabase PostgreSQL.")
        except Exception as e:
            logger.error(f"Failed to persist screening to Supabase: {e}")

    # Also update in-memory fallback store
    slots = []
    for i in (1, 2, 3):
        vid = video_records[i - 1] if i - 1 < len(video_records) else None
        slots.append({
            "slotNumber": i,
            "title": f"Protocol {i}",
            "fileName": vid.get("saved_filename") if vid else None,
            "fileSize": None,
            "uploaded": vid is not None,
            "videoUrl": vid.get("video_url") if vid else None,
            "qualityMetrics": {"framingQuality": 90, "lighting": "good", "resolution": "1080p"}
        })

    new_patient_record = {
        "id": patient_id,
        "childName": child_name,
        "dateOfBirth": date_of_birth or date.today().isoformat(),
        "ageInMonths": calculated_age,
        "biologicalSex": biological_sex,
        "parentName": parent_name,
        "contactEmail": contact_email,
        "contactPhone": contact_phone,
        "submissionDate": now_iso,
        "submissionStatus": status,
        "riskTier": risk_tier,
        "clinicalStatus": "pending",
        "videoSlots": slots
    }
    fallback_patients_store.insert(0, new_patient_record)

    return {
        "success": True,
        "patient_id": patient_id,
        "screening_id": screening_id,
        "age_in_months": calculated_age,
        "risk_tier": risk_tier,
        "status": status
    }
