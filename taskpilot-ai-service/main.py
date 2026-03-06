from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import assistant

app = FastAPI(title="TaskPilot AI Service", version="1.0.0")

# Enable CORS for the Spring Boot backend
app.add_middleware(
    
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to Spring Boot origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assistant.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
