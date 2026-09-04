"""
Pydantic Models for Pediatric ASD Screening Decision Support System (CDSS)
Developed by Urvish Soni and Zankhana Mehta under the guidance of Prof. Shyam Kamal, IIT BHU.

Defines request/response schemas for Patient, Screening, and Video tables
aligned with the Supabase PostgreSQL schema in schema.sql.
"""

from datetime import date, datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ─── Enums as Literals ────────────────────────────────────────────────

BiologicalSex = Literal["male", "female", "other"]
RiskTier = Literal["typical", "moderate", "elevated"]
SubmissionStatus = Literal[
    "uploaded", "analyzing", "ai_complete", "under_review",
    "pending", "reviewed", "referred",
]
ReferralType = Literal[
    "none", "developmental_specialist", "audiology", "early_intervention",
]


# ─── Patient ─────────────────────────────────────────────────────────

class PatientBase(BaseModel):
    """Core patient fields shared across create and read operations."""
    name: str = Field(..., min_length=1, description="Child's name or pseudonym")
    date_of_birth: date = Field(..., description="Used to dynamically compute age in months")
    biological_sex: BiologicalSex
    parent_name: Optional[str] = Field(None, description="Parent / caregiver name")
    contact_email: Optional[str] = Field(None, description="Guardian email address")
    contact_phone: Optional[str] = Field(None, description="Guardian phone number")


class PatientCreate(PatientBase):
    """Schema for creating a new patient record."""
    pass


class PatientRead(PatientBase):
    """Schema returned when reading a patient from the database."""
    id: str = Field(..., description="Patient identifier (e.g. ASD-PT001)")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Video ───────────────────────────────────────────────────────────

class VideoBase(BaseModel):
    """Core video metadata fields."""
    protocol_number: int = Field(..., ge=1, le=3, description="Protocol slot: 1, 2, or 3")
    cloud_storage_url: str = Field(..., description="Direct public Supabase Storage URL")
    file_name: Optional[str] = Field(None, description="Original or saved filename")
    analysis_result: Dict[str, Any] = Field(
        default_factory=dict,
        description="Telemetry, ISAA flags & CV metrics from video analysis",
    )


class VideoCreate(VideoBase):
    """Schema for inserting a new video record."""
    screening_id: str = Field(..., description="FK to screenings table")


class VideoRead(VideoBase):
    """Schema returned when reading a video from the database."""
    id: str = Field(..., description="Video identifier (e.g. VID-XXXXXXXX)")
    screening_id: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Screening ───────────────────────────────────────────────────────

class ClinicalNotes(BaseModel):
    """Embedded JSON structure for clinical notes within a screening."""
    notes: str = ""
    diagnosticImpressions: str = ""
    referral: ReferralType = "none"
    signedOff: bool = False
    signedAt: Optional[str] = None
    reviewedBy: str = ""


class ISAAScoresSchema(BaseModel):
    """Embedded JSON structure for ISAA assessment scores."""
    items: Dict[int, int] = Field(
        default_factory=dict,
        description="Scores for items 1-40, keyed by item number",
    )
    aiPrefilledItems: List[int] = Field(
        default_factory=list,
        description="Item numbers that were AI pre-filled",
    )


class ScreeningBase(BaseModel):
    """Core screening fields."""
    patient_id: str = Field(..., description="FK to patients table")
    risk_tier: RiskTier = "typical"
    status: SubmissionStatus = "pending"
    clinical_notes: ClinicalNotes = Field(default_factory=ClinicalNotes)
    isaa_scores: ISAAScoresSchema = Field(default_factory=ISAAScoresSchema)
    biomarkers: Dict[str, Any] = Field(
        default_factory=dict,
        description="Biomarker results from video analysis pipeline",
    )


class ScreeningCreate(ScreeningBase):
    """Schema for creating a new screening record."""
    pass


class ScreeningRead(ScreeningBase):
    """Schema returned when reading a screening from the database."""
    id: str = Field(..., description="Screening identifier (e.g. SCR-ASD-PT001)")
    submission_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Nested relations (populated when joined)
    patient: Optional[PatientRead] = None
    videos: List[VideoRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


# ─── API Request / Response Schemas ──────────────────────────────────

class SubmissionRequest(BaseModel):
    """Full submission payload from the parent screening flow."""
    child_name: str = Field(..., min_length=1)
    date_of_birth: Optional[str] = Field(None, description="ISO date string YYYY-MM-DD")
    biological_sex: BiologicalSex = "male"
    parent_name: str = ""
    contact_email: str = ""
    contact_phone: str = ""


class SubmissionResponse(BaseModel):
    """Response after a screening submission is persisted."""
    success: bool
    patient_id: str
    screening_id: str
    age_in_months: int
    risk_tier: RiskTier
    status: SubmissionStatus


class FeedbackRequest(BaseModel):
    """HITL continuous learning feedback payload."""
    submission_id: str
    item_id: str = Field(..., description="ISAA item identifier, e.g. 'Item 2'")
    original_ai_score: int = Field(..., ge=0, le=5)
    doctor_new_score: int = Field(..., ge=0, le=5)
    justification_text: str = Field(..., min_length=1)


class InboxResponse(BaseModel):
    """Clinical triage inbox response."""
    source: str = Field(..., description="'supabase_postgresql' or 'fallback_store'")
    total: int
    patients: List[Dict[str, Any]]
    stats: Dict[str, int]
