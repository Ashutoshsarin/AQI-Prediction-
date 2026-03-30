# grid are decreases 270 fit to 15 fit : system requirement Issue
# this model is Generalized
import os
import warnings
import pandas as pd
import joblib
import numpy as np
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sklearn.model_selection import (
    train_test_split, StratifiedKFold,
    cross_validate, RandomizedSearchCV
)
from sklearn.metrics import (
    accuracy_score, classification_report,
    mean_squared_error, precision_score,
    recall_score, f1_score,
)
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression

from xgboost  import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

warnings.filterwarnings("ignore")

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "global_air_pollution_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load & validate data ───────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()

FEATURE_COLS = ["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]
TARGET_COL   = "aqi_category"

missing = [c for c in FEATURE_COLS + [TARGET_COL] if c not in df.columns]
if missing:
    raise ValueError(f"Missing columns in dataset: {missing}")

df = df[FEATURE_COLS + [TARGET_COL]].dropna()

X = df[FEATURE_COLS]
y = df[TARGET_COL]

print(f"Dataset shape : {df.shape}")
print(f"Class distribution:\n{y.value_counts(normalize=True).round(3)}\n")

# ── Label encode target ────────────────────────────────────────────────────────
le = LabelEncoder()
y_encoded = le.fit_transform(y)
print(f"Classes: {le.classes_}\n")

# ── Train / test split ─────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# ── Save test set for honest evaluation ───────────────────────────────────────
test_df = X_test.copy()
test_df["y_true_encoded"] = y_test
test_df.to_csv(os.path.join(MODEL_DIR, "test_set.csv"), index=False)
print(f"Test set saved: {len(test_df)} rows\n")

# ── Preprocessor ──────────────────────────────────────────────────────────────
preprocessor = ColumnTransformer(
    transformers=[("scaler", StandardScaler(), FEATURE_COLS)]
)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# ─────────────────────────────────────────────────────────────────────────────
# Helper function to tune + evaluate each model
# Uses RandomizedSearchCV instead of GridSearchCV (much faster)
# ─────────────────────────────────────────────────────────────────────────────
def tune_and_save(name, estimator, param_dist, n_iter=20):
    print("=" * 60)
    print(f"Tuning: {name}")

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", estimator),
    ])

    search = RandomizedSearchCV(
        pipeline, param_dist,
        n_iter=n_iter,
        cv=cv,
        scoring="f1_weighted",
        n_jobs=-1,
        random_state=42,
        verbose=1,
    )
    search.fit(X_train, y_train)

    print(f"Best params : {search.best_params_}")
    print(f"Best CV F1  : {search.best_score_:.4f}")

    best = search.best_estimator_
    y_pred = best.predict(X_test)

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec  = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1   = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    mse  = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)

    print(f"Test Accuracy : {acc:.4f}")
    print(f"Test F1       : {f1:.4f}")
    print(f"Test MSE      : {mse:.4f} | RMSE: {rmse:.4f}")
    print("\nClassification Report:")
    print(classification_report(
        le.inverse_transform(y_test),
        le.inverse_transform(y_pred),
    ))

    artefact  = {"pipeline": best, "label_encoder": le}
    save_path = os.path.join(MODEL_DIR, f"{name.replace(' ', '_')}.pkl")
    joblib.dump(artefact, save_path)
    print(f"Saved -> {save_path}\n")

    return best, {
        "accuracy": acc, "precision": prec,
        "recall": rec, "f1": f1,
        "mse": mse, "rmse": rmse,
    }

# ─────────────────────────────────────────────────────────────────────────────
# MODEL 1 — Random Forest
# ─────────────────────────────────────────────────────────────────────────────
best_rf, rf_results = tune_and_save(
    "Random Forest",
    RandomForestClassifier(class_weight="balanced", random_state=42, n_jobs=-1),
    {
        "model__n_estimators":      [100, 200, 300],
        "model__max_depth":         [5, 10, 15, 20],
        "model__min_samples_split": [2, 5, 10],
        "model__max_features":      ["sqrt", "log2"],
    },
    n_iter=15,
)

# ─────────────────────────────────────────────────────────────────────────────
# MODEL 2 — XGBoost
# ─────────────────────────────────────────────────────────────────────────────
best_xgb, xgb_results = tune_and_save(
    "XGBoost",
    XGBClassifier(
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    ),
    {
        "model__n_estimators":     [100, 200, 300],
        "model__max_depth":        [3, 5, 7],
        "model__learning_rate":    [0.05, 0.1, 0.2],
        "model__subsample":        [0.7, 0.8, 1.0],
        "model__colsample_bytree": [0.7, 0.8, 1.0],
    },
    n_iter=15,
)

# ─────────────────────────────────────────────────────────────────────────────
# MODEL 3 — LightGBM
# ─────────────────────────────────────────────────────────────────────────────
best_lgbm, lgbm_results = tune_and_save(
    "LightGBM",
    LGBMClassifier(
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
        verbose=-1,
    ),
    {
        "model__n_estimators":  [100, 200, 300],
        "model__max_depth":     [3, 5, 7],
        "model__learning_rate": [0.05, 0.1, 0.2],
        "model__num_leaves":    [20, 31, 50],
        "model__subsample":     [0.7, 0.8, 1.0],
    },
    n_iter=15,
)

# ─────────────────────────────────────────────────────────────────────────────
# MODEL 4 — CatBoost
# ─────────────────────────────────────────────────────────────────────────────
best_catboost, catboost_results = tune_and_save(
    "CatBoost",
    CatBoostClassifier(
        auto_class_weights="Balanced",
        random_state=42,
        verbose=0,
    ),
    {
        "model__iterations":    [100, 200, 300],
        "model__depth":         [4, 6, 8],
        "model__learning_rate": [0.05, 0.1, 0.2],
        "model__l2_leaf_reg":   [1, 3, 5],
    },
    n_iter=15,
)

# ─────────────────────────────────────────────────────────────────────────────
# MODEL 5 — Stacking Ensemble
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("Training: Stacking Ensemble")

stacking_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", StackingClassifier(
        estimators=[
            ("rf",       RandomForestClassifier(n_estimators=200, max_depth=10, class_weight="balanced", random_state=42)),
            ("xgb",      XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.1, use_label_encoder=False, eval_metric="mlogloss", random_state=42)),
            ("lgbm",     LGBMClassifier(n_estimators=200, max_depth=5, learning_rate=0.1, class_weight="balanced", random_state=42, verbose=-1)),
            ("catboost", CatBoostClassifier(iterations=200, depth=6, learning_rate=0.1, auto_class_weights="Balanced", random_state=42, verbose=0)),
        ],
        final_estimator=LogisticRegression(max_iter=1000, class_weight="balanced"),
        cv=5,
        n_jobs=-1,
        passthrough=False,
    )),
])

stacking_pipeline.fit(X_train, y_train)
y_pred_stack = stacking_pipeline.predict(X_test)

stack_acc  = accuracy_score(y_test, y_pred_stack)
stack_prec = precision_score(y_test, y_pred_stack, average="weighted", zero_division=0)
stack_rec  = recall_score(y_test, y_pred_stack, average="weighted", zero_division=0)
stack_f1   = f1_score(y_test, y_pred_stack, average="weighted", zero_division=0)
stack_mse  = mean_squared_error(y_test, y_pred_stack)
stack_rmse = np.sqrt(stack_mse)

print(f"Test Accuracy : {stack_acc:.4f}")
print(f"Test F1       : {stack_f1:.4f}")
print("\nClassification Report:")
print(classification_report(
    le.inverse_transform(y_test),
    le.inverse_transform(y_pred_stack),
))

stack_artefact = {"pipeline": stacking_pipeline, "label_encoder": le}
joblib.dump(stack_artefact, os.path.join(MODEL_DIR, "Stacking.pkl"))
print("Saved -> models/Stacking.pkl\n")

stacking_results = {
    "accuracy": stack_acc, "precision": stack_prec,
    "recall": stack_rec, "f1": stack_f1,
    "mse": stack_mse, "rmse": stack_rmse,
}

# ── Summary ────────────────────────────────────────────────────────────────────
all_results = {
    "Random Forest": rf_results,
    "XGBoost":       xgb_results,
    "LightGBM":      lgbm_results,
    "CatBoost":      catboost_results,
    "Stacking":      stacking_results,
}

print("\n" + "=" * 60)
print("SUMMARY TABLE")
print("=" * 60)
summary_df = (
    pd.DataFrame(all_results).T
    .sort_values("f1", ascending=False)
    .round(4)
)
print(summary_df.to_string())

best_model = max(all_results, key=lambda k: all_results[k]["f1"])
print("\n" + "=" * 60)
print(f"Best Model   : {best_model}")
print(f"Test F1      : {all_results[best_model]['f1']:.4f}")
print(f"Test Accuracy: {all_results[best_model]['accuracy']:.4f}")
print("=" * 60)