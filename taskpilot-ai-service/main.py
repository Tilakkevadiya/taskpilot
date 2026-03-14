from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables FIRST before other imports
load_dotenv()

from routes import assistant
from services.llm_service import groq_stats
import asyncio

app = FastAPI(title="TaskPilot AI Service", version="1.0.0")

async def periodic_summary():
    while True:
        await asyncio.sleep(600)  # 10 minutes
        print("\n=== GROQ USAGE SUMMARY ===")
        print(f"Total Calls: {groq_stats['total_calls']}")
        print(f"Failed Calls: {groq_stats['failed_calls']}")
        
        avg_time = 0
        if groq_stats["durations"]:
            avg_time = sum(groq_stats["durations"]) / len(groq_stats["durations"])
        print(f"Average Response Time: {avg_time:.2f}s")
        
        most_used = "None"
        if groq_stats["endpoints"]:
            most_used = max(groq_stats["endpoints"], key=groq_stats["endpoints"].get)
        print(f"Most Used Endpoint: {most_used}\n")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_summary())


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
