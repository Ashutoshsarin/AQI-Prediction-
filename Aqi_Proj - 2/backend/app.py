from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, mean_squared_error
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "global_air_pollution_data.csv")

MODEL_FILES = {
    "Random Forest": "Random_Forest.pkl",
    "XGBoost":       "XGBoost.pkl",
    "LightGBM":      "LightGBM.pkl",
    "CatBoost":      "CatBoost.pkl",
    "Stacking":      "Stacking.pkl",
}

FEATURE_COLS = ["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]
CITY_COLUMN  = "city_name"

pipelines     = {}
label_encoder = None

for display_name, filename in MODEL_FILES.items():
    candidates = [
        os.path.join(BASE_DIR, "models", filename),
        os.path.join(BASE_DIR, filename),
    ]
    for path in candidates:
        if os.path.exists(path):
            artefact = joblib.load(path)
            if isinstance(artefact, dict) and "pipeline" in artefact:
                pipelines[display_name] = artefact["pipeline"]
                label_encoder           = artefact["label_encoder"]
            else:
                pipelines[display_name] = artefact
            print(f"Loaded: {display_name} <- {path}")
            break

if not pipelines:
    raise RuntimeError("No models loaded. Run train_model.py first.")

df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()

if CITY_COLUMN not in df.columns:
    raise Exception(f"Column '{CITY_COLUMN}' not found. Available: {df.columns.tolist()}")

df["_city_lower"] = df[CITY_COLUMN].astype(str).str.strip().str.lower()
print(f"Dataset ready - {len(df)} rows")


# ── LSTM Setup ─────────────────────────────────────────────────────────────────
lstm_model          = None
lstm_feature_scaler = None
lstm_target_scaler  = None
lstm_last_sequences = None

try:
    import tensorflow as tf
    model_path = os.path.join(BASE_DIR, "models", "lstm_model.h5")
    fs_path    = os.path.join(BASE_DIR, "models", "lstm_feature_scaler.pkl")
    ts_path    = os.path.join(BASE_DIR, "models", "lstm_target_scaler.pkl")
    seq_path   = os.path.join(BASE_DIR, "models", "lstm_last_sequences.pkl")

    if all(os.path.exists(p) for p in [model_path, fs_path, ts_path, seq_path]):
        lstm_model          = tf.keras.models.load_model(model_path)
        lstm_feature_scaler = joblib.load(fs_path)
        lstm_target_scaler  = joblib.load(ts_path)
        lstm_last_sequences = joblib.load(seq_path)
        print("LSTM model loaded successfully.")
    else:
        print("LSTM model files not found — run train_lstm.py first.")
except Exception as e:
    print(f"LSTM load skipped: {e}")


# ── Helpers ────────────────────────────────────────────────────────────────────
def predict_all(features: dict) -> dict:
    X = pd.DataFrame([features])[FEATURE_COLS]
    results = {}
    for name, pipeline in pipelines.items():
        try:
            pred_encoded = pipeline.predict(X)[0]
            proba        = pipeline.predict_proba(X)[0]
            confidence   = float(np.max(proba))
            if label_encoder is not None:
                prediction = label_encoder.inverse_transform([pred_encoded])[0]
            else:
                prediction = str(pred_encoded)
            results[name] = {
                "prediction": prediction,
                "confidence": round(confidence * 100, 2),
            }
        except Exception as e:
            results[name] = {"error": str(e)}
    return results


def best_prediction(all_models: dict):
    valid = {k: v for k, v in all_models.items() if "error" not in v}
    if not valid:
        return None, "Unknown", 0.0
    best = max(valid, key=lambda k: valid[k]["confidence"])
    return best, valid[best]["prediction"], valid[best]["confidence"]


def aqi_to_category(val):
    if val <= 50:  return "Good"
    if val <= 100: return "Moderate"
    if val <= 150: return "Unhealthy for Sensitive Groups"
    if val <= 200: return "Unhealthy"
    if val <= 300: return "Very Unhealthy"
    return "Hazardous"


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return jsonify({
        "status":        "AQI Prediction API is running",
        "models_loaded": list(pipelines.keys()),
        "lstm_ready":    lstm_model is not None,
    })


@app.route("/predict-city", methods=["POST"])
def predict_city():
    try:
        data = request.get_json(force=True)
        city = data.get("city", "").strip().lower()
        if not city:
            return jsonify({"error": "City is required"}), 400

        city_data = df[df["_city_lower"] == city]
        if city_data.empty:
            city_data = df[df["_city_lower"].str.contains(city, na=False, regex=False)]
        if city_data.empty:
            return jsonify({
                "error": f"City '{city}' not found.",
                "available_cities": sorted(df[CITY_COLUMN].unique().tolist())
            }), 404

        row      = city_data.iloc[0]
        features = {col: float(row[col]) for col in FEATURE_COLS}

        all_models                         = predict_all(features)
        best_model, prediction, confidence = best_prediction(all_models)

        return jsonify({
            "city":         str(row.get(CITY_COLUMN, city)).title(),
            "country":      str(row.get("country", "")),
            "aqi_category": prediction,
            "confidence":   round(confidence, 2),
            "best_model":   best_model,
            "all_models":   all_models,
            "pollutants": {
                "co":    features["co_aqi_value"],
                "ozone": features["ozone_aqi_value"],
                "no2":   features["no2_aqi_value"],
                "pm25":  features["pm2.5_aqi_value"],
            },
        })
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/predict-manual", methods=["POST"])
def predict_manual():
    try:
        data = request.get_json(force=True)
        features = {
            "co_aqi_value":    float(data["co_aqi_value"]),
            "ozone_aqi_value": float(data["ozone_aqi_value"]),
            "no2_aqi_value":   float(data["no2_aqi_value"]),
            "pm2.5_aqi_value": float(data["pm2.5_aqi_value"]),
        }
        all_models                         = predict_all(features)
        best_model, prediction, confidence = best_prediction(all_models)
        return jsonify({
            "aqi_category": prediction,
            "confidence":   round(confidence, 2),
            "best_model":   best_model,
            "all_models":   all_models,
            "pollutants": {
                "co":    features["co_aqi_value"],
                "ozone": features["ozone_aqi_value"],
                "no2":   features["no2_aqi_value"],
                "pm25":  features["pm2.5_aqi_value"],
            },
        })
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict-forecast", methods=["POST", "OPTIONS"])
def predict_forecast():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        if lstm_model is None:
            return jsonify({"error": "LSTM model not loaded. Run train_lstm.py first."}), 503

        data = request.get_json(force=True)
        city = data.get("city", "").strip().lower()
        if not city:
            return jsonify({"error": "City is required"}), 400

        available = list(lstm_last_sequences.keys())
        match     = next((c for c in available if c.lower() == city), None)
        if not match:
            match = next((c for c in available if city in c.lower()), None)
        if not match:
            return jsonify({
                "error":            f"No forecast data for '{city}'.",
                "available_cities": available,
            }), 404

        sequence        = np.array(lstm_last_sequences[match])
        sequence_scaled = lstm_feature_scaler.transform(sequence)
        X               = sequence_scaled.reshape(1, 30, 4)

        pred_scaled = lstm_model.predict(X, verbose=0)
        pred_aqi    = lstm_target_scaler.inverse_transform(pred_scaled)[0]

        forecast = []
        for i, aqi_val in enumerate(pred_aqi):
            aqi_val = max(0, float(aqi_val))
            date    = (datetime.now() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
            day     = (datetime.now() + timedelta(days=i + 1)).strftime("%a")
            forecast.append({
                "day":      day,
                "date":     date,
                "aqi":      round(aqi_val, 1),
                "category": aqi_to_category(aqi_val),
            })

        return jsonify({"city": match, "forecast": forecast})

    except Exception as e:
        print("FORECAST ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/model-stats", methods=["GET"])
def model_stats():
    stats    = {}
    test_path = os.path.join(BASE_DIR, "models", "test_set.csv")
    if not os.path.exists(test_path):
        return jsonify({"error": "Test set not found. Run train_model.py first."}), 404

    test_df    = pd.read_csv(test_path)
    X_test     = test_df[FEATURE_COLS]
    y_test_enc = test_df["y_true_encoded"].values

    if label_encoder is not None:
        y_true = label_encoder.inverse_transform(y_test_enc)
    else:
        y_true = y_test_enc

    for name, pipeline in pipelines.items():
        try:
            pred_encoded = pipeline.predict(X_test)
            if label_encoder is not None:
                y_pred = label_encoder.inverse_transform(pred_encoded)
            else:
                y_pred = pred_encoded

            acc  = round(accuracy_score(y_true, y_pred) * 100, 1)
            prec = round(precision_score(y_true, y_pred, average="weighted", zero_division=0) * 100, 1)
            rec  = round(recall_score(y_true, y_pred, average="weighted", zero_division=0) * 100, 1)
            f1   = round(f1_score(y_true, y_pred, average="weighted", zero_division=0) * 100, 1)

            y_true_num = pd.factorize(pd.Series(y_true), sort=True)[0]
            y_pred_num = pd.factorize(pd.Series(y_pred), sort=True)[0]
            mse  = round(float(mean_squared_error(y_true_num, y_pred_num)), 3)
            rmse = round(float(np.sqrt(mse)), 3)

            stats[name] = {
                "accuracy":  acc,
                "precision": prec,
                "recall":    rec,
                "f1":        f1,
                "mse":       mse,
                "rmse":      rmse,
            }
        except Exception as e:
            stats[name] = {"error": str(e)}

    return jsonify(stats)


@app.route("/cities", methods=["GET"])
def list_cities():
    return jsonify({"cities": sorted(df[CITY_COLUMN].unique().tolist())})


@app.route("/models", methods=["GET"])
def list_models():
    return jsonify({"models": list(pipelines.keys())})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "models_loaded": len(pipelines),
        "lstm_ready":   lstm_model is not None,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

    # if __name__ == "__main__":
    # app.run(debug=True, port=5000)