import json
import os
from datetime import datetime

import joblib
import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)

try:
    from flask_cors import CORS
    CORS(app)
except ImportError:
    pass

BASE = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE, "price_model.pkl"))
with open(os.path.join(BASE, "locations.json")) as f:
    data = json.load(f)

locations = data["locations"]
crops = data["crops"]


@app.route("/")
def home():
    return jsonify({"message": "Kisan Setu price API chal rahi hai"})


@app.route("/locations")
def get_locations():
    return jsonify(data)


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(silent=True) or {}

    state = body.get("state")
    district = body.get("district")
    crop = body.get("crop")
    now = datetime.now()
    month = body.get("month", now.month)
    year = body.get("year", now.year)

    if not state or not district or not crop:
        return jsonify({"error": "state, district aur crop zaroori hain"}), 400
    if state not in locations:
        return jsonify({"error": "Ye state list mein nahi hai: " + str(state)}), 400
    if district not in locations[state]:
        return jsonify({"error": "Ye district is state mein nahi hai: " + str(district)}), 400
    if crop not in crops:
        return jsonify({"error": "Ye fasal list mein nahi hai: " + str(crop)}), 400
    try:
        month = int(month)
        year = int(year)
    except (TypeError, ValueError):
        return jsonify({"error": "month aur year number hone chahiye"}), 400
    if not 1 <= month <= 12:
        return jsonify({"error": "month 1 se 12 ke beech hona chahiye"}), 400

    row = pd.DataFrame([{"state": state, "district": district, "commodity": crop,
                         "month": month, "year": year}])
    mn, mx, modal = model.predict(row)[0]

    return jsonify({
        "state": state, "district": district, "crop": crop,
        "month": month, "year": year,
        "min_price": round(float(mn)),
        "max_price": round(float(mx)),
        "modal_price": round(float(modal)),
        "unit": "Rs per quintal",
    })


if __name__ == "__main__":
    app.run(debug=True)
