import subprocess
import os
import sys
import time

def run_flask():
    print("Starting Flask Backend Server...")
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Backend')
    # Using python executable
    return subprocess.Popen([sys.executable, 'app.py'], cwd=backend_dir)

def run_vite():
    print("Starting Vite React Frontend Server...")
    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Frontend')
    # Using npm run dev (shell=True is often required for npm on Windows)
    return subprocess.Popen(['npm', 'run', 'dev', '--', '--port', '5173'], cwd=frontend_dir, shell=True)

def run_admin_dashboard():
    print("Starting Vite React Owner Dashboard Server...")
    admin_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Owner-dashboard', 'admin-dashboard')
    # Using npm run dev on port 5174
    return subprocess.Popen(['npm', 'run', 'dev', '--', '--port', '5174'], cwd=admin_dir, shell=True)

if __name__ == '__main__':
    try:
        backend_process = run_flask()
        time.sleep(2) # Give backend a slight head start
        frontend_process = run_vite()
        admin_process = run_admin_dashboard()
        
        print("\n===============================================")
        print("🚀 Smart AI Exam Portal is now running!")
        print("Backend running on http://localhost:5000")
        print("Student Frontend running on http://localhost:5173")
        print("Owner Dashboard running on http://localhost:5174")
        print("Press Ctrl+C to stop all servers.")
        print("===============================================\n")

        # Keep the main process alive
        backend_process.wait()
        frontend_process.wait()
        admin_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        admin_process.terminate()
        print("Goodbye!")
