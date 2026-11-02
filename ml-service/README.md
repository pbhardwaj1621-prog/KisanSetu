# ml-service

```
app/       FastAPI (main, schemas, predictor)
src/       data_loader, preprocess, features, train, evaluate
notebooks/ EDA aur experiments
data/      raw (Agmarknet CSV), processed
models/    trained model (.joblib)
```
Run: `uvicorn app.main:app --reload --port 8000`
