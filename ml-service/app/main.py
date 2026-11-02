from fastapi import FastAPI

app = FastAPI(title="Kisan Setu ML Service")


@app.get("/health")
def health():
    return {"status": "ok"}


# TODO: @app.post("/predict") -> predictor.predict() call karo
