import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

try:
    from .pipeline import run_pipeline, build_training_frame
except Exception:
    # Allow running as a script: python backend/app/train_sample.py
    import sys as _sys
    _sys.path.append(os.path.dirname(__file__))
    from pipeline import run_pipeline, build_training_frame


def main():
    out_csv = os.path.join(os.path.dirname(__file__), "../openaq_72h.csv")
    df = run_pipeline(csv_out_path=out_csv, hours=72)
    train_df = build_training_frame(df, horizon_hours=12)
    if train_df.empty:
        print("No training data available.")
        return
    feature_cols = [
        col for col in train_df.columns
        if any(s in col for s in ["_z"]) or col in ["hour", "day", "weekday", "is_weekend"]
    ]
    X = train_df[feature_cols]
    y = train_df["target_aqi_h+12"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=200, random_state=42, max_depth=None, n_jobs=-1)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"MAE: {mae:.2f}")
    model_path = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(model_path, exist_ok=True)
    joblib.dump({"model": model, "features": feature_cols}, os.path.join(model_path, "rf_aqi_12h.joblib"))
    print("Model saved.")


if __name__ == "__main__":
    main()


