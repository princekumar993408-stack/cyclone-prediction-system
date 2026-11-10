from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import cyclones, analysis

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Intelligent cyclone detection, intensity estimation, and trajectory forecasting platform using computer vision and satellite meteorological data."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cyclones.router, prefix=settings.api_prefix)
app.include_router(analysis.router, prefix=settings.api_prefix)

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "basin": settings.basin_name,
        "status": "operational",
        "docs_url": "/docs",
        "academic_notice": settings.academic_disclaimer
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
