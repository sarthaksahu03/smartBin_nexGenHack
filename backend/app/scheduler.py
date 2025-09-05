import os
import time
try:
    from .pipeline import run_pipeline
    from .train_sample import main as train_main
except Exception:
    # Allow running as a script: python backend/app/scheduler.py
    import sys as _sys
    _sys.path.append(os.path.dirname(__file__))
    from pipeline import run_pipeline
    from train_sample import main as train_main


def main():
    out_csv = os.path.join(os.path.dirname(__file__), "../openaq_72h.csv")
    while True:
        try:
            _ = run_pipeline(csv_out_path=out_csv, hours=72)
            train_main()
        except Exception:
            pass
        time.sleep(3600)


if __name__ == "__main__":
    main()


