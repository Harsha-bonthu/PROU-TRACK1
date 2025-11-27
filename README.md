# Mock Store — Frontend Demo

Small, responsive frontend demo built with plain HTML, CSS, and JavaScript using mock JSON data.

Features
- Search, sort, and tag filters
- Cart & favorites (persisted to localStorage)
- Accessible modal and drawers (keyboard support)
- Client-side pagination and skeleton loading
- Admin analytics page (`admin.html`) with Chart.js and demo seeding

Quick start
1. Serve the project from the `e:/pro1/pro` folder (recommended)

PowerShell:
```powershell
cd e:\pro1\pro
python -m http.server 8000
# or use the included npm start script if you installed dependencies
npm install
npm start
```

Open http://127.0.0.1:8000 (or the port shown by the server).

Notes
- `admin.html` uses browser `localStorage` to read `orders` and `favs`. Use the Seed Demo Data button to populate charts.
- This project contains a small, client-only mock auth (`login.html`) — it stores a simple user object in `localStorage` for demo purposes.
- A basic service worker (`sw.js`) and `manifest.json` are included for PWA behavior (caching + offline fallback).

Next improvements you might want
- Replace mock auth with Firebase Auth for real user accounts
- Persist orders server-side (serverless function or small API)
- Add image optimization (srcset/WebP) and automated accessibility checks
