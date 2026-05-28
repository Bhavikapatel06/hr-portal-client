# HR Portal — Manpower Management

A clean, production-grade HR dashboard built with **React + Vite + Tailwind CSS**.

## Features
- **MRF Form** — full 4-section Manpower Request Form (Position, Reason, JD, Qualifications)
- **Resume Upload** — drag-and-drop multi-file upload with candidate detail expansion
- **Tabbed Dashboard** with live stats
- **Dark theme** with professional design
- **Validation** with inline error messages
- **API service layer** ready to wire to Node/Express backend

---

## Folder Structure

```
hr-portal/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              ← Entry point
    ├── App.jsx               ← Routes
    ├── index.css             ← Global styles + Tailwind
    ├── components/
    │   ├── Navbar.jsx        ← Top navigation bar
    │   ├── MRFForm.jsx       ← Manpower Request Form (4 sections)
    │   └── ResumeUpload.jsx  ← File upload + candidate detail entry
    ├── pages/
    │   └── HRDashboard.jsx   ← Main dashboard page with tabs & stats
    └── services/
        └── api.js            ← API layer (connect to your backend here)
```

---

## Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Build for Production

```bash
npm run build
npm run preview
```

---

## Connecting to Backend

Edit `src/services/api.js` or create `.env`:

```
VITE_API_URL=http://your-backend.com/api
```

The `api.js` service file has ready-to-use functions for:
- `mrfApi.submit(data)` — POST /mrf
- `mrfApi.list()` — GET /mrf
- `resumeApi.upload(files, mrfId)` — POST /resumes/upload (multipart)
- `resumeApi.list()` — GET /resumes
- `resumeApi.updateDetails(id, data)` — PATCH /resumes/:id

---

## Next Steps (per the Flow diagram)
1. ✅ Upload MRF
2. ✅ Upload Resumes
3. ⬜ Auto-fetch basic details from resumes (integrate AI/OCR API)
4. ✅ Manual other details entry
5. ⬜ Interview schedule (date, time, online/offline)
6. ⬜ Interview feedback (Shortlisted / Reject / Select)
