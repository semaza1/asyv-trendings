# 📈 AsyvTrendings

A modern web application for tracking trending news, sports, and opportunities.

## ✨ Features
- **Front‑end** built with Vite + React, using Radix UI, Tailwind CSS, and Shadcn components.
- **Back‑end** powered by Express.js, providing REST APIs for models such as `DidYouKnow`, `Events`, `TrendingNews`, `Visitors`, `Opportunities`, and `Projects`.
- Real‑time data handling via **Appwrite** and **Vercel Blob** storage.
- Admin interface for managing sports, news, and projects.
- Responsive design with a hero section, modals, and dynamic charts (Recharts).

## 📦 Prerequisites
- Node.js (v20 or later)
- npm (comes with Node)
- Git (optional, for cloning the repo)

## 🚀 Getting Started
### Clone the repository
```bash
git clone <repo-url>
cd asyvtrendings
```
### Install dependencies
#### Back‑end
```bash
cd Back-end
npm install
```
#### Front‑end
```bash
cd ../Front-end
npm install
```
### Environment variables
- Copy `.env.example` to `.env` in both **Back‑end** and **Front‑end** (if present) and fill in required values (e.g., DB credentials, API keys).

## 🏃 Running the Application
### Back‑end
```bash
cd Back-end
npm run dev
```
The server will start on `http://localhost:5000` (or the port defined in `.env`).

### Front‑end
```bash
cd Front-end
npm run dev
```
The development client will be available at `http://localhost:5173`.

## 📚 Documentation
- API endpoints are defined in the `routes/` directory.
- Data models reside in `models/`.
- UI components are located under `src/components/`.

## 🧪 Testing
> (Add testing instructions here if tests are available.)

## 🛠️ Building for Production
### Back‑end
```bash
cd Back-end
npm run build   # if a build script exists
```
### Front‑end
```bash
cd Front-end
npm run build
```
The optimized static files will be placed in the `dist/` directory.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes
4. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.

---
*Generated on 2026‑05‑29*
