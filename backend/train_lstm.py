import os
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "data", "historical_aqi.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

SEQUENCE_LENGTH = 30   # Use last 30 days to predict next 7
FORECAST_DAYS   = 7
FEATURE_COLS    = ["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]
TARGET_COL      = "aqi_value"

print("Loading historical data...")
df = pd.read_csv(DATA_PATH)
df["date"] = pd.to_datetime(df["date"])
df = df.sort_values(["city_name", "date"]).reset_index(drop=True)

print(f"Total records : {len(df)}")
print(f"Cities        : {df['city_name'].nunique()}")
print(f"Date range    : {df['date'].min()} to {df['date'].max()}")

# ── Scale features ────────────────────────────────────────────────────────────
feature_scaler = MinMaxScaler()
target_scaler  = MinMaxScaler()

df[FEATURE_COLS] = feature_scaler.fit_transform(df[FEATURE_COLS])
df[[TARGET_COL]] = target_scaler.fit_transform(df[[TARGET_COL]])

# ── Create sequences per city ─────────────────────────────────────────────────
def create_sequences(city_df):
    X, y = [], []
    values = city_df[FEATURE_COLS + [TARGET_COL]].values
    for i in range(len(values) - SEQUENCE_LENGTH - FORECAST_DAYS + 1):
        X.append(values[i : i + SEQUENCE_LENGTH, :len(FEATURE_COLS)])
        y.append(values[i + SEQUENCE_LENGTH : i + SEQUENCE_LENGTH + FORECAST_DAYS, -1])
    return np.array(X), np.array(y)

X_all, y_all = [], []
for city in df["city_name"].unique():
    city_df = df[df["city_name"] == city].reset_index(drop=True)
    if len(city_df) < SEQUENCE_LENGTH + FORECAST_DAYS:
        continue
    X_city, y_city = create_sequences(city_df)
    X_all.append(X_city)
    y_all.append(y_city)

X_all = np.vstack(X_all)
y_all = np.vstack(y_all)

print(f"\nSequences shape : X={X_all.shape}, y={y_all.shape}")

# ── Train / test split ────────────────────────────────────────────────────────
split = int(len(X_all) * 0.8)
X_train, X_test = X_all[:split], X_all[split:]
y_train, y_test = y_all[:split], y_all[split:]

print(f"Train: {X_train.shape}, Test: {X_test.shape}")

# ── Build LSTM model ──────────────────────────────────────────────────────────
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(SEQUENCE_LENGTH, len(FEATURE_COLS))),
    BatchNormalization(),
    Dropout(0.2),

    LSTM(64, return_sequences=False),
    BatchNormalization(),
    Dropout(0.2),

    Dense(32, activation="relu"),
    Dropout(0.1),

    Dense(FORECAST_DAYS),
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="mse",
    metrics=["mae"],
)

model.summary()

# ── Callbacks ─────────────────────────────────────────────────────────────────
callbacks = [
    EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=5, verbose=1),
]

# ── Train ─────────────────────────────────────────────────────────────────────
print("\nTraining LSTM...")
history = model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=32,
    validation_split=0.1,
    callbacks=callbacks,
    verbose=1,
)

# ── Evaluate ──────────────────────────────────────────────────────────────────
y_pred_scaled = model.predict(X_test)
y_pred = target_scaler.inverse_transform(y_pred_scaled)
y_true = target_scaler.inverse_transform(y_test)

rmse = np.sqrt(mean_squared_error(y_true.flatten(), y_pred.flatten()))
mae  = mean_absolute_error(y_true.flatten(), y_pred.flatten())

print(f"\nTest RMSE : {rmse:.2f}")
print(f"Test MAE  : {mae:.2f}")

# ── Save everything ───────────────────────────────────────────────────────────
model.save(os.path.join(MODEL_DIR, "lstm_model.h5"))
joblib.dump(feature_scaler, os.path.join(MODEL_DIR, "lstm_feature_scaler.pkl"))
joblib.dump(target_scaler,  os.path.join(MODEL_DIR, "lstm_target_scaler.pkl"))

# Save last 30 days per city for inference
last_sequences = {}
for city in df["city_name"].unique():
    city_df = df[df["city_name"] == city].reset_index(drop=True)
    if len(city_df) >= SEQUENCE_LENGTH:
        last_sequences[city] = city_df[FEATURE_COLS].values[-SEQUENCE_LENGTH:].tolist()

joblib.dump(last_sequences, os.path.join(MODEL_DIR, "lstm_last_sequences.pkl"))

print("\nAll files saved:")
print(f"  models/lstm_model.h5")
print(f"  models/lstm_feature_scaler.pkl")
print(f"  models/lstm_target_scaler.pkl")
print(f"  models/lstm_last_sequences.pkl")
print(f"\nLSTM training complete!")