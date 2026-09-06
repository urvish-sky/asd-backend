"""
Authentication and Role-Based Access Control (RBAC) layer for Pediatric ASD Screening CDSS.
Developed under guidance of Prof. Shyam Kamal, IIT BHU.

Verifies Supabase JWT tokens, extracts user profile information and roles ('parent', 'doctor', 'admin'),
and enforces strict endpoint authorization and data isolation.
"""

import os
import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from db import is_supabase_connected, supabase

logger = logging.getLogger("asd_cdss_auth")

# FastAPI HTTPBearer security scheme (auto_error=False allows optional auth inspection)
security = HTTPBearer(auto_error=False)

class CurrentUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "parent"  # 'parent' | 'doctor' | 'admin'
    full_name: str = "User"

# Mock users for local/development/fallback testing without internet/Supabase
MOCK_USERS: Dict[str, CurrentUser] = {
    "mock-parent-token": CurrentUser(
        id="00000000-0000-0000-0000-000000000003",
        email="kavita.mehta@example.com",
        role="parent",
        full_name="Kavita Mehta"
    ),
    "mock-doctor-token": CurrentUser(
        id="00000000-0000-0000-0000-000000000001",
        email="doctor@aiims.edu",
        role="doctor",
        full_name="Dr. Aarushi Gupta"
    ),
    "mock-admin-token": CurrentUser(
        id="00000000-0000-0000-0000-000000000002",
        email="admin@iitbhu.ac.in",
        role="admin",
        full_name="Prof. Shyam Kamal"
    ),
}

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CurrentUser]:
    """
    Extracts Bearer token from Authorization header if present and verifies user.
    Returns CurrentUser if valid, None if no token or token is invalid.
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials.strip()

    # Check for demo/mock tokens
    if token in MOCK_USERS:
        return MOCK_USERS[token]

    # Verify against live Supabase Auth
    if is_supabase_connected and supabase:
        try:
            # Validate token via Supabase Auth API
            auth_response = supabase.auth.get_user(token)
            supabase_user = getattr(auth_response, "user", None) or auth_response
            if not supabase_user:
                return None

            user_id = str(supabase_user.id)
            user_email = supabase_user.email
            raw_meta = getattr(supabase_user, "user_metadata", {}) or {}
            role = raw_meta.get("role", "parent")
            full_name = raw_meta.get("full_name") or raw_meta.get("name") or "User"

            # Query profiles table for definitive assigned role
            try:
                profile_res = supabase.table("profiles").select("role, full_name").eq("id", user_id).execute()
                if profile_res.data and len(profile_res.data) > 0:
                    profile_data = profile_res.data[0]
                    role = profile_data.get("role", role)
                    full_name = profile_data.get("full_name", full_name)
            except Exception as pe:
                logger.debug(f"Profiles query fallback: {pe}")

            return CurrentUser(
                id=user_id,
                email=user_email,
                role=role,
                full_name=full_name
            )
        except Exception as e:
            logger.warning(f"Supabase JWT verification failed: {e}")
            return None

    return None

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> CurrentUser:
    """
    Strictly enforces authentication. Raises HTTP 401 if missing or invalid token.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer token in Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await get_optional_user(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def require_role(allowed_roles: List[str]):
    """
    Dependency factory that verifies current_user possesses one of the allowed roles.
    Raises HTTP 403 Forbidden if user role is insufficient.
    """
    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access Forbidden: This operation requires one of {allowed_roles} roles. "
                    f"Your account currently has the '{current_user.role}' role."
                ),
            )
        return current_user

    return role_checker

# Preconfigured RBAC dependencies
require_parent_or_clinician = require_role(["parent", "doctor", "admin"])
require_doctor_or_admin = require_role(["doctor", "admin"])
require_admin = require_role(["admin"])
