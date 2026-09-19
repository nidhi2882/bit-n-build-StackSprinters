from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="ResQGrid AI Microservice",
    description="Intelligent Emergency Classification, Hybrid Severity Scoring & Duplicate Consolidation",
    version="1.0.0"
)

# CORS configuration for Web Dashboard and NestJS/Spring Boot Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "service": "ResQGrid AI Microservice v1",
        "status": "ONLINE",
        "docs": "/docs"
    }

@app.get("/health")
def root_health():
    return {
        "status": "HEALTHY",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
