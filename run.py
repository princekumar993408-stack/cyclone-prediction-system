"""
Cyclone Prediction Intelligence Platform - Main Application Runner
Author: Prince Kumar (princekumar993408-stack)
Academic Affiliation: B.Tech CSE (IoT), Jain University
"""

import sys
import os
import argparse
import subprocess

def run_tests():
    """Run the pytest test suite for backend components."""
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    print("=" * 70)
    print("CYCLONE PREDICTION SYSTEM - RUNNING TEST SUITE")
    print("=" * 70)
    cmd = [sys.executable, "-m", "pytest", "tests", "-v"]
    result = subprocess.run(cmd, cwd=backend_dir)
    return result.returncode

def start_server(host="127.0.0.1", port=8000, reload=True):
    """Start the FastAPI backend with uvicorn."""
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)
    
    import uvicorn
    print("=" * 70)
    print("CYCLONE PREDICTION SYSTEM - STARTING API SERVER")
    print(f"Host: {host} | Port: {port} | Reload: {reload}")
    print("Docs: http://{}:{}/docs".format(host, port))
    print("Health: http://{}:{}/health".format(host, port))
    print("=" * 70)
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)

def main():
    parser = argparse.ArgumentParser(description="Cyclone Prediction Intelligence Platform Launcher")
    parser.add_argument("--test", action="store_true", help="Run automated test suite and exit")
    parser.add_argument("--host", default="127.0.0.1", help="Server host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8000, help="Server port (default: 8000)")
    parser.add_argument("--no-reload", action="store_true", help="Disable auto-reload")

    args = parser.parse_args()

    if args.test:
        code = run_tests()
        sys.exit(code)
    else:
        start_server(host=args.host, port=args.port, reload=not args.no-reload)

if __name__ == "__main__":
    main()
