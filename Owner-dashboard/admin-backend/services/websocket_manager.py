from fastapi import WebSocket
from typing import List

class WebSocketManager:
    def __init__(self):
        # List of all currently connected admin browsers
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Send the same data to every connected admin dashboard
        import json
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

# One shared instance used across the whole app
manager = WebSocketManager()