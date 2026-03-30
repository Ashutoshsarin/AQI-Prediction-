# import os
# import warnings
# import pandas as pd
# import joblib
# import numpy as np
# import sys
# import warnings
# warnings.filterwarnings("ignore", category=UserWarning)
# sys.stdout.reconfigure(encoding='utf-8')

# from sklearn.model_selection import (
#     train_test_split, StratifiedKFold,
#     cross_validate, GridSearchCV
# )
# from sklearn.metrics import (
#     accuracy_score, classification_report,
#     mean_squared_error, precision_score,
#     recall_score, f1_score,
# )
# from sklearn.preprocessing import StandardScaler, LabelEncoder
# from sklearn.compose import ColumnTransformer
# from sklearn.pipeline import Pipeline
# from sklearn.ensemble import (
#     RandomForestClassifier, StackingClassifier
# )
# from sklearn.linear_model import LogisticRegression

# from xgboost  import XGBClassifier
# from lightgbm import LGBMClassifier
# from catboost import CatBoostClassifier

# warnings.filterwarnings("ignore")

# # ── Paths ──────────────────────────────────────────────────────────────────────
# BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
# DATA_PATH = os.path.join(BASE_DIR, "data", "global_air_pollution_data.csv")
# MODEL_DIR = os.path.join(BASE_DIR, "models")
# os.makedirs(MODEL_DIR, exist_ok=True)

# # ── Load & validate data ───────────────────────────────────────────────────────
# df = pd.read_csv(DATA_PATH)
# df.columns = df.columns.str.strip()

# FEATURE_COLS = ["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]
# TARGET_COL   = "aqi_category"

# missing = [c for c in FEATURE_COLS + [TARGET_COL] if c not in df.columns]
# if missing:
#     raise ValueError(f"Missing columns in dataset: {missing}")

# df = df[FEATURE_COLS + [TARGET_COL]].dropna()

# X = df[FEATURE_COLS]
# y = df[TARGET_COL]

# print(f"Dataset shape : {df.shape}")
# print(f"Class distribution:\n{y.value_counts(normalize=True).round(3)}\n")

# # ── Label encode target ────────────────────────────────────────────────────────
# le = LabelEncoder()
# y_encoded = le.fit_transform(y)
# print(f"Classes: {le.classes_}\n")

# # ── Train / test split (stratified) ───────────────────────────────────────────
# X_train, X_test, y_train, y_test = train_test_split(
#     X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
# )

# # ── Save test set for honest evaluation later ──────────────────────────────────
# test_df = X_test.copy()
# test_df["y_true_encoded"] = y_test
# test_df.to_csv(os.path.join(MODEL_DIR, "test_set.csv"), index=False)
# print(f"Test set saved: {len(test_df)} rows -> models/test_set.csv\n")

# # ── Preprocessor ──────────────────────────────────────────────────────────────
# preprocessor = ColumnTransformer(
#     transformers=[("scaler", StandardScaler(), FEATURE_COLS)]
# )

# # ── Cross-validation ──────────────────────────────────────────────────────────
# cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# # ── Compute class weights for models that support it ──────────────────────────
# from sklearn.utils.class_weight import compute_sample_weight
# sample_weights = compute_sample_weight("balanced", y_train)

# # ─────────────────────────────────────────────────────────────────────────────
# # MODEL 1 — Random Forest with GridSearchCV
# # ─────────────────────────────────────────────────────────────────────────────
# print("=" * 60)
# print("Tuning: Random Forest")

# rf_param_grid = {
#     "model__n_estimators":    [100, 200, 300],
#     "model__max_depth":       [5, 10, 15],
#     "model__min_samples_split": [5, 10, 20],
#     "model__max_features":    ["sqrt", "log2"],
# }

# rf_pipeline = Pipeline([
#     ("preprocessor", preprocessor),
#     ("model", RandomForestClassifier(
#         class_weight="balanced",
#         random_state=42,
#         n_jobs=-1,
#     )),
# ])

# rf_grid = GridSearchCV(
#     rf_pipeline, rf_param_grid,
#     cv=cv, scoring="f1_weighted",
#     n_jobs=-1, verbose=0,
# )
# rf_grid.fit(X_train, y_train)
# print(f"Best RF params : {rf_grid.best_params_}")
# print(f"Best RF CV F1  : {rf_grid.best_score_:.4f}")
# best_rf = rf_grid.best_estimator_

# # ─────────────────────────────────────────────────────────────────────────────
# # MODEL 2 — XGBoost with GridSearchCV
# # ─────────────────────────────────────────────────────────────────────────────
# print("\n" + "=" * 60)
# print("Tuning: XGBoost")

# xgb_param_grid = {
#     "model__n_estimators":  [100, 200, 300],
#     "model__max_depth":     [3, 5, 7],
#     "model__learning_rate": [0.05, 0.1, 0.2],
#     "model__subsample":     [0.7, 0.8, 1.0],
#     "model__colsample_bytree": [0.7, 0.8, 1.0],
# }

# xgb_pipeline = Pipeline([
#     ("preprocessor", preprocessor),
#     ("model", XGBClassifier(
#         use_label_encoder=False,
#         eval_metric="mlogloss",
#         random_state=42,
#         n_jobs=-1,
#     )),
# ])

# xgb_grid = GridSearchCV(
#     xgb_pipeline, xgb_param_grid,
#     cv=cv, scoring="f1_weighted",
#     n_jobs=-1, verbose=0,
# )
# xgb_grid.fit(X_train, y_train)
# print(f"Best XGB params : {xgb_grid.best_params_}")
# print(f"Best XGB CV F1  : {xgb_grid.best_score_:.4f}")
# best_xgb = xgb_grid.best_estimator_

# # ─────────────────────────────────────────────────────────────────────────────
# # MODEL 3 — LightGBM with GridSearchCV
# # ─────────────────────────────────────────────────────────────────────────────
# print("\n" + "=" * 60)
# print("Tuning: LightGBM")

# lgbm_param_grid = {
#     "model__n_estimators":  [100, 200, 300],
#     "model__max_depth":     [3, 5, 7],
#     "model__learning_rate": [0.05, 0.1, 0.2],
#     "model__num_leaves":    [20, 31, 50],
#     "model__subsample":     [0.7, 0.8, 1.0],
# }

# lgbm_pipeline = Pipeline([
#     ("preprocessor", preprocessor),
#     ("model", LGBMClassifier(
#         class_weight="balanced",
#         random_state=42,
#         n_jobs=-1,
#         verbose=-1,
#     )),
# ])

# lgbm_grid = GridSearchCV(
#     lgbm_pipeline, lgbm_param_grid,
#     cv=cv, scoring="f1_weighted",
#     n_jobs=-1, verbose=0,
# )
# lgbm_grid.fit(X_train, y_train)
# print(f"Best LGBM params : {lgbm_grid.best_params_}")
# print(f"Best LGBM CV F1  : {lgbm_grid.best_score_:.4f}")
# best_lgbm = lgbm_grid.best_estimator_

# # ─────────────────────────────────────────────────────────────────────────────
# # MODEL 4 — CatBoost with GridSearchCV
# # ─────────────────────────────────────────────────────────────────────────────
# print("\n" + "=" * 60)
# print("Tuning: CatBoost")

# catboost_param_grid = {
#     "model__iterations":   [100, 200, 300],
#     "model__depth":        [4, 6, 8],
#     "model__learning_rate":[0.05, 0.1, 0.2],
#     "model__l2_leaf_reg":  [1, 3, 5],
# }

# catboost_pipeline = Pipeline([
#     ("preprocessor", preprocessor),
#     ("model", CatBoostClassifier(
#         auto_class_weights="Balanced",
#         random_state=42,
#         verbose=0,
#     )),
# ])

# catboost_grid = GridSearchCV(
#     catboost_pipeline, catboost_param_grid,
#     cv=cv, scoring="f1_weighted",
#     n_jobs=-1, verbose=0,
# )
# catboost_grid.fit(X_train, y_train)
# print(f"Best CatBoost params : {catboost_grid.best_params_}")
# print(f"Best CatBoost CV F1  : {catboost_grid.best_score_:.4f}")
# best_catboost = catboost_grid.best_estimator_

# # ─────────────────────────────────────────────────────────────────────────────
# # MODEL 5 — Stacking Ensemble
# # ─────────────────────────────────────────────────────────────────────────────
# print("\n" + "=" * 60)
# print("Training: Stacking Ensemble")

# estimators = [
#     ("rf",       best_rf["model"]       if hasattr(best_rf, '__getitem__') else RandomForestClassifier(class_weight="balanced", random_state=42)),
#     ("xgb",      XGBClassifier(use_label_encoder=False, eval_metric="mlogloss", random_state=42)),
#     ("lgbm",     LGBMClassifier(class_weight="balanced", random_state=42, verbose=-1)),
#     ("catboost", CatBoostClassifier(auto_class_weights="Balanced", random_state=42, verbose=0)),
# ]

# stacking_pipeline = Pipeline([
#     ("preprocessor", preprocessor),
#     ("model", StackingClassifier(
#         estimators=estimators,
#         final_estimator=LogisticRegression(max_iter=1000, class_weight="balanced"),
#         cv=5,
#         n_jobs=-1,
#         passthrough=False,
#     )),
# ])

# stacking_pipeline.fit(X_train, y_train)
# print("Stacking Ensemble trained.")

# # ─────────────────────────────────────────────────────────────────────────────
# # EVALUATE ALL MODELS ON TEST SET
# # ─────────────────────────────────────────────────────────────────────────────
# all_models = {
#     "Random Forest":   best_rf,
#     "XGBoost":         best_xgb,
#     "LightGBM":        best_lgbm,
#     "CatBoost":        best_catboost,
#     "Stacking":        stacking_pipeline,
# }

# results   = {}
# cv_scores = {}

# for name, pipeline in all_models.items():
#     y_pred = pipeline.predict(X_test)

#     accuracy  = accuracy_score(y_test, y_pred)
#     precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
#     recall    = recall_score(y_test, y_pred, average="weighted", zero_division=0)
#     f1        = f1_score(y_test, y_pred, average="weighted", zero_division=0)
#     mse       = mean_squared_error(y_test, y_pred)
#     rmse      = np.sqrt(mse)

#     results[name] = {
#         "accuracy":  accuracy,
#         "precision": precision,
#         "recall":    recall,
#         "f1":        f1,
#         "mse":       mse,
#         "rmse":      rmse,
#     }
#     cv_scores[name] = f1

#     print("\n" + "=" * 60)
#     print(f"Model         : {name}")
#     print(f"Test Accuracy : {accuracy:.4f}")
#     print(f"Test Precision: {precision:.4f}")
#     print(f"Test Recall   : {recall:.4f}")
#     print(f"Test F1       : {f1:.4f}")
#     print(f"Test MSE      : {mse:.4f} | RMSE: {rmse:.4f}")
#     print("\nClassification Report:")
#     print(classification_report(
#         le.inverse_transform(y_test),
#         le.inverse_transform(y_pred),
#     ))

#     artefact  = {"pipeline": pipeline, "label_encoder": le}
#     save_path = os.path.join(MODEL_DIR, f"{name.replace(' ', '_')}.pkl")
#     joblib.dump(artefact, save_path)
#     print(f"Saved -> {save_path}")

# # ── Summary ────────────────────────────────────────────────────────────────────
# print("\n" + "=" * 60)
# print("SUMMARY TABLE")
# print("=" * 60)
# summary_df = (
#     pd.DataFrame(results).T
#     .sort_values("f1", ascending=False)
#     .round(4)
# )
# print(summary_df.to_string())

# best_model = max(cv_scores, key=cv_scores.get)
# print("\n" + "=" * 60)
# print(f"Best Model  : {best_model}")
# print(f"Test F1     : {results[best_model]['f1']:.4f}")
# print(f"Test Accuracy: {results[best_model]['accuracy']:.4f}")
# print("=" * 60)