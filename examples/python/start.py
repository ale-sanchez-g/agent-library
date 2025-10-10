#!/usr/bin/env python3
"""
Simple startup script for the FastAPI application
"""
import subprocess
import sys
import os

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def run_server():
    """Run the FastAPI server"""
    port = os.getenv("PORT", "8000")
    print(f"Starting FastAPI server on port {port}...")
    subprocess.call([
        sys.executable, "-m", "uvicorn", 
        "app:app", 
        "--host", "0.0.0.0", 
        "--port", port,
        "--reload"
    ])

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "install":
        install_dependencies()
    else:
        try:
            run_server()
        except KeyboardInterrupt:
            print("\nServer stopped.")
        except ImportError:
            print("Dependencies not installed. Run: python start.py install")
            sys.exit(1)