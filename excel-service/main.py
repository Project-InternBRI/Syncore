from fastapi import FastAPI

app = FastAPI(
    title="SYNCORE Excel Service",
    description="Service for reading, validating, and generating Excel files for SYNCORE",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to SYNCORE Excel Service API"}
