# E-commerce Project - How to Run

This project consists of a Django backend and React frontend. Here are several ways to run the project on Windows PowerShell.

## Quick Start (Recommended)

The easiest way to start the project is using the quick start script:

```powershell
.\start_project.ps1
```

This will:
- Start the Django backend in one PowerShell window
- Start the React frontend in another PowerShell window
- Show you the URLs to access the applications

## Full-Featured Launcher

For more control, use the comprehensive launcher:

```powershell
.\run_project.ps1
```

### Options:
- `.\run_project.ps1 -InstallDeps` - Install dependencies before starting
- `.\run_project.ps1 -BackendOnly` - Start only the backend
- `.\run_project.ps1 -FrontendOnly` - Start only the frontend

## Manual Start

If you prefer to start components manually:

### Backend (Django)
```powershell
cd Backend
python manage.py migrate
python manage.py runserver 127.0.0.1:8001
```

### Frontend (React)
```powershell
cd Frontend
npm run dev:both
```

## URLs

Once started, access the applications at:

- **Backend API**: http://127.0.0.1:8001
- **Django Admin**: http://127.0.0.1:8001/admin
- **Storefront**: http://localhost:5173
- **Admin Panel**: http://localhost:5174

## Prerequisites

Make sure you have:
- Python 3.8+ installed
- Node.js 16+ installed
- All dependencies installed (run `.\run_project.ps1 -InstallDeps` if needed)

## Troubleshooting

1. **Port conflicts**: If ports 8000, 5173, or 5174 are in use, the scripts will attempt to stop existing processes
2. **Dependencies**: Run the install command if you get import/require errors
3. **Windows Execution Policy**: If scripts don't run, execute:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## Project Structure

- `Backend/` - Django REST API
- `Frontend/` - React applications (Storefront + Admin Panel)
- `Assets/` - Static assets and images
- `run_project.ps1` - Full-featured launcher
- `start_project.ps1` - Quick start launcher
