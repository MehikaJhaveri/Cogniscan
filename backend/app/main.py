"""Cogniscan FastAPI application — main entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, patients, assessments, caregivers

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cogniscan API",
    description="AI-based early cognitive decline detection system",
    version="1.0.0",
)

# CORS — allow mobile app connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(assessments.router)
app.include_router(caregivers.router)


@app.get("/")
def root():
    return {
        "app": "Cogniscan API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
