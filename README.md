# MindCare AI — Mental Wellness & Emotional Support Platform

Full-stack AI mental wellness web application built with **React 18 + Vite + Tailwind CSS** and **Django 5 + Django REST Framework**.

## Quick Start in VS Code
1. Extract `mindcare-ai.zip` and open the `mindcare-ai` folder in VS Code.
2. Press `Ctrl+Shift+P` -> `Tasks: Run Task` -> `1. Setup & Start Backend (Port 8000)`
3. Press `Ctrl+Shift+P` -> `Tasks: Run Task` -> `2. Setup & Start Frontend (Port 5173)`
4. Open `http://localhost:5173` in your browser.

## Manual Terminal Commands
```bash
# Terminal 1 (Backend)
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/manage.py makemigrations core
python backend/manage.py migrate
python backend/manage.py test core.tests
python backend/manage.py runserver 0.0.0.0:8000

# Terminal 2 (Frontend)
cd frontend
npm install
npm test
npm run dev
```
