from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random

from routers import exams, students, violations, analytics
from services.websocket_manager import manager
from data.mock_data import students as students_data, submission_timeline

# Create the FastAPI app
app = FastAPI(title="Smart Exam Portal — Admin API", version="1.0.0")

# CORS — this allows your React app (port 5173) to talk to Python (port 8000)
# Without this, the browser blocks the connection for security reasons
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers (connect all the route files)
app.include_router(exams.router)
app.include_router(students.router)
app.include_router(violations.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Smart Exam Portal API is running"}

# ─── WebSocket — Real-time live updates ──────────────────────────────────────
# This is the "live wire" between Python and React
# Every 5 seconds Python pushes updated stats to the React dashboard

@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Simulate live data changing every 5 seconds
            submitted   = len([s for s in students_data if s["submitted"]])
            in_progress = len([s for s in students_data if not s["submitted"] and s["progress"] > 0])
            violations  = sum(s["tab_switches"] for s in students_data)
            high_risk   = len([s for s in students_data if s["risk_score"] >= 70])

            # Small random changes to simulate live exam activity
            if random.random() > 0.5 and submitted < 58:
                # Randomly pick a student and mark progress increase
                for s in students_data:
                    if not s["submitted"] and s["progress"] < 100:
                        s["progress"] = min(s["progress"] + random.randint(1, 5), 100)
                        break

            payload = {
                "type": "live_update",
                "live_stats": {
                    "submitted":   submitted,
                    "in_progress": in_progress,
                    "not_started": max(60 - submitted - in_progress, 0),
                    "violations":  violations,
                    "high_risk":   high_risk,
                    "enrolled":    60,
                },
                "students": students_data,
            }

            await manager.broadcast(payload)
            await asyncio.sleep(5)  # Wait 5 seconds then send again

    except WebSocketDisconnect:
        manager.disconnect(websocket)