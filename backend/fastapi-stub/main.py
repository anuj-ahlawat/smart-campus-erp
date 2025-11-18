from fastapi import FastAPI

app = FastAPI(
    title="Smart Campus ERP (FastAPI Stub)",
    description="Reference scaffolding mirroring Express routes for future Python services.",
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/ping")
async def ping():
    return {"message": "FastAPI adapter ready"}

