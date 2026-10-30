# MahaAgri Guard — Crop Disease & Pest Outbreak Surveillance Grid
### Smart India Hackathon (SIH) Problem Statement ID: 26131
**Issued by**: Government of Maharashtra — Maharashtra State Innovation Society  
*(Department of Skills, Employment, Entrepreneurship and Innovation)*  
**Category**: Software | **Theme**: Agriculture, FoodTech & Rural Development  

---

## 🌐 Live Interactive Application
> ### 🚀 **[Click Here to Open Live Website (Vercel)](https://sih-2026-akc4fuwcr-pratikkolhe28.vercel.app)**
> *Permanent Cloud Deployment on Vercel — Farmer leaf diagnosis, multilingual advisories (Marathi/Hindi/English), and Maharashtra outbreak surveillance grid.*

---

## 🌾 One-Line Concept
> **A farmer photographs a diseased crop/pest → gets instant AI diagnosis + multilingual treatment advice (Marathi/Hindi/English) → the report is automatically geotagged and aggregated on a live surveillance map so agricultural extension officials can detect outbreak hotspots early and intervene before epidemics spread.**

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                                 INPUTS                                 │
│  • Farmer Camera (getUserMedia) / Upload  • OpenWeatherMap Free Tier   │
│  • Device Geolocation (GPS Geotagging)   • 1-Click Test Sample Cards  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND PROCESSING LAYER                        │
│  FastAPI (Python 3.13)                                                 │
│  ├── ML Inference Engine: PyTorch MobileNetV2 (CPU, PlantVillage)      │
│  ├── Agrometeorological Risk Rules (Temp, Humidity, Rain → Outbreaks)  │
│  ├── Multilingual Advisory Knowledge Base (Marathi, Hindi, English)    │
│  ├── Maharashtra Krishi Vigyan Kendra (KVK) Lab Directory              │
│  └── Outbreak Database & Geospatial Clustering (SQLite / PostGIS)      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│          FARMER-FACING APP           │ │     GOVERNMENT SURVEILLANCE   │
│ • Proactive Weather Risk Banner      │ │ • Leaflet & OpenStreetMap Grid│
│ • In-Browser Camera & Snap           │ │ • Marker Clustering & Hotspots│
│ • AI Diagnosis (Confidence Gauge)    │ │ • District & Crop Filtering   │
│ • Lesion Breakdown (Necrotic/Green)  │ │ • SMS/Push Broadcast Tool     │
│ • Organic & CIBRC Chemical Advice    │ │ • Field Incidents Triage      │
│ • Nearest KVK Lab + "Flag for Expert"│ │ • IoT Spore/Trap Monitor stub │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 🎯 Scope Breakdown: Implemented vs. Represented Features

Per SIH hackathon evaluation criteria, features are scoped realistically to guarantee a 100% functional prototype on zero-budget free tiers:

| Component | Status | Details |
|---|---|---|
| **Image-based Disease Detection** | ✅ **Fully Implemented** | Fine-tuned PyTorch MobileNetV2 with transfer learning head for 10 crop classes (Tomato, Potato, Cotton). Includes visual pathology indicators (% necrotic lesion, % chlorosis yellowing, % healthy green tissue). |
| **Multilingual Treatment Advisory** | ✅ **Fully Implemented** | Structured recommendations in **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)** covering 🌿 Organic biological remedies, 🧪 CIBRC-approved chemical fungicides with exact dosages and Pre-Harvest Intervals (PHI), and 🚜 cultural sanitation practices. |
| **Weather Risk Rule Engine** | ✅ **Fully Implemented** | Live OpenWeatherMap integration + Maharashtra agrometeorological district simulation engine calculating disease outbreak risks based on real-time temperature, humidity, and rainfall. |
| **Geospatial Hotspot Surveillance** | ✅ **Fully Implemented** | Device GPS auto-geotagging, SQLite persistence, and interactive **Leaflet.js + Leaflet.markercluster** with OpenStreetMap tiles (100% free, no billing setup required). Outbreak hotspot circles highlight active contagion zones. |
| **Government Dashboard & Triage** | ✅ **Fully Implemented** | District-level filters (Pune, Nashik, Jalgaon, Amravati, Wardha, Solapur, Ahmednagar, etc.), status workflow (`Reported` → `Under Review` → `Contained`), and official emergency advisory broadcast simulator. |
| **Nearest KVK Referral Lab** | ✅ **Fully Implemented** | District directory of Maharashtra Krishi Vigyan Kendras with senior scientist contacts, plant pathology laboratory specialties, and toll-free helpline numbers. |
| **Flag for Expert Review** | ✅ **Fully Implemented** | Farmer click-to-flag button storing expert review requests directly into the outbreak database. |
| **IoT Pest / Spore Traps** | 🟡 **Represented Stub** | Telemetry panel displaying simulated live data from solar-powered optical spore counters and digital pheromone moth traps across Junnar, Niphad, Morshi, and Raver. |
| **Model Retraining Loop** | 🟡 **Documented Stub** | Retraining trigger endpoint (`/api/model/retrain-trigger`) representing automated nocturnal fine-tuning pipelines. |

---

## 🍃 Supported Crops & Disease Classes

The model is scoped to 3 core staple crops cultivated across Maharashtra:

| Crop | Disease / Condition | Pathogen Type | Severity Rating |
|---|---|---|---|
| **Tomato (टोमॅटो)** | Early Blight (*Alternaria solani*) | Fungus | High |
| **Tomato (टोमॅटो)** | Late Blight (*Phytophthora infestans*) | Oomycete | Critical Outbreak Risk |
| **Tomato (टोमॅटो)** | Bacterial Spot (*Xanthomonas*) | Bacteria | Moderate |
| **Tomato (टोमॅटो)** | Healthy Leaf (*निरोगी पान*) | N/A | Safe |
| **Potato (बटाटा)** | Early Blight (*Alternaria solani*) | Fungus | High |
| **Potato (बटाटा)** | Late Blight (*Phytophthora infestans*) | Oomycete | Critical Outbreak Risk |
| **Potato (बटाटा)** | Healthy Leaf (*निरोगी पान*) | N/A | Safe |
| **Cotton (कापूस)** | Bacterial Blight / Black Arm (*Xanthomonas*) | Bacteria | High |
| **Cotton (कापूस)** | Leaf Curl Virus / Sucking Pest (*Whitefly*) | Virus / Pest | Critical Outbreak Risk |
| **Cotton (कापूस)** | Healthy Leaf (*निरोगी पान*) | N/A | Safe |

---

## ⚡ Free-Tier Services & Setup Guide (Zero Budget)

Every service in this system runs on free tiers:

### 1. OpenWeatherMap (Weather Risk API)
- **Free Tier**: 1,000 API calls/day at 60 calls/minute.
- **How to obtain key**:
  1. Visit [openweathermap.org](https://openweathermap.org/) and sign up for a free account.
  2. Navigate to **API Keys** in your profile and copy your default key.
  3. Set environment variable: `export OPENWEATHER_API_KEY="your_key_here"` (or create `backend/.env`).
  4. *Note*: If no API key is provided, the backend seamlessly switches to its built-in Maharashtra agrometeorological station simulation with zero disruptions.

### 2. OpenStreetMap & Leaflet.js (Geospatial Mapping)
- **100% Free**: No API key, credit card, or Google Maps billing account needed.
- Uses CartoDB Voyager / OpenStreetMap standard tiles directly in the browser via Leaflet.

### 3. Supabase / Neon (Optional Cloud PostgreSQL + PostGIS)
- **Local Default**: Runs out-of-the-box on SQLite (`crop_reports.db`) with zero setup.
- **To use Cloud PostGIS**:
  1. Create a free database on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
  2. In SQL Editor, run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     CREATE TABLE reports (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       crop TEXT NOT NULL,
       disease_id TEXT NOT NULL,
       disease_name TEXT NOT NULL,
       confidence REAL NOT NULL,
       location GEOMETRY(Point, 4326),
       district TEXT NOT NULL,
       severity TEXT NOT NULL,
       status TEXT DEFAULT 'reported',
       timestamp TIMESTAMPTZ DEFAULT NOW()
     );
     ```

### 4. Hosting (Free Tier Deployment)
- **Frontend (React)**: Deploy to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) free tier by connecting this repository.
- **Backend (FastAPI)**: Deploy to [Render](https://render.com/) or [Railway](https://railway.app/) using `uvicorn main:app --host 0.0.0.0 --port $PORT`.

---

## 🚀 Quick Start (Local Run in 2 Minutes)

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 18+ (tested on Node v23)

### Step 1: Start Backend
```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (loads PyTorch MobileNetV2 on CPU)
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs on `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.*

### Step 2: Start Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend opens at `http://localhost:5173`.*

---

## 🧪 1-Click Testing Guide for Hackathon Judges

To test without physical diseased leaves:
1. Open `http://localhost:5173` in your browser.
2. In the **Farmer Portal**, scroll to **1-Click Test Samples (Demo Presets)**.
3. Click any sample leaf:
   - 🍅 **Tomato — Early Blight**: Observe 96% confidence diagnosis, concentric lesion pathology %, and Mancozeb 75% WP spray prescription.
   - 🍅 **Tomato — Late Blight**: Observe rapid rot outbreak risk, cool-damp weather warning, and Copper Oxychloride advisory.
   - 🌿 **Cotton — Leaf Curl**: Observe whitefly sucking pest damage warning and yellow sticky trap recommendations.
4. Click **मराठी** in the top-right header to verify complete vernacular Marathi rendering.
5. Click **🚩 Flag for Expert Review** to verify real-time status update.
6. Switch to **Surveillance Grid (`रोग नियंत्रण कक्ष`)**:
   - Inspect the Leaflet outbreak map showing color-coded pins across Pune, Nashik, Jalgaon, Amravati, and Wardha.
   - Click on any hotspot circle or marker cluster to view the incident popup.
   - Filter by district (e.g. `Nashik`) to isolate regional clusters.
   - Click **Broadcast Advisory to Farmers** (`शेतकऱ्यांना संदेश पाठवा`) to dispatch a targeted SMS/push spray alert to farmers in the outbreak zone.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, total reports count, active hotspots |
| `POST` | `/api/predict` | Multipart photo upload → PyTorch inference + advisory + geotagging |
| `GET` | `/api/weather` | OpenWeatherMap + rule-based disease risk evaluation |
| `GET` | `/api/reports` | Filterable field reports with district, crop, and status queries |
| `GET` | `/api/clusters` | Spatial clustering; `include_demo=true` is display-only and labels simulated fixtures |
| `GET` | `/api/outbreak-intelligence` | 14-day, non-demo local signal with verification status |
| `POST` | `/api/reports/{id}/follow-up` | Record farmer-reported symptoms, action and intervention cost |
| `GET` | `/api/impact-metrics` | Aggregate self-reported follow-up data without claiming causal savings |
| `GET` | `/api/stats` | Official dashboard KPIs (crop breakdown, disease distribution) |
| `POST` | `/api/reports/{id}/flag-expert` | Toggle expert agronomist verification flag |
| `PUT` | `/api/reports/{id}/status` | Update incident status (`reported`, `under_review`, `investigating`, `confirmed`, `rejected`, `contained`, `resolved`) |
| `POST` | `/api/broadcast-advisory` | Simulate district-wide SMS/push advisory dispatch |
| `GET` | `/api/iot/pest-traps` | Simulated telemetry from solar spore & pheromone traps |
| `GET` | `/api/samples` | List of preset test leaf images for instant judging |

---

## 🛡️ Agronomic Safety and Data Integrity
- AI output is a **screening suggestion**, not a confirmed diagnosis. The bundled checkpoint does not include a held-out field-validation report, so displayed model scores must not be interpreted as real-world accuracy or calibrated probabilities.
- The inference path no longer reads disease hints from image filenames or inflates the top score. Crop filtering only limits the candidate classes when a farmer explicitly selects a crop.
- Reports from the bundled seed dataset are labelled `source_type=demo` and `verification_status=demo`. They are excluded from live outbreak-intelligence and dashboard totals. The map can show these fixtures only when requested, with a visible demo label.
- Report clusters are investigation signals, not confirmed outbreaks. The system only marks a cluster as expert-supported when multiple reports have explicit expert-confirmed status.
- The Spray-or-Wait feature does not prescribe pesticide treatment based on a photo alone. Verify diagnosis, action thresholds, registered product labels, PPE and pre-harvest intervals with a local agricultural officer/KVK before applying chemicals.
- Follow-up and intervention costs are farmer-reported. They are useful for tracking outcomes but are not a causal estimate of crop yield saved or losses avoided.

## ✨ Added in the loss-prevention update
- Evidence-aware Spray-or-Wait decision support with uncertainty states and reasons.
- Crop-stage capture, recent local signal summary and a separate expert verification status.
- Duplicate image-report suppression for the same approximate location within 24 hours.
- Follow-up ledger for symptom trajectory, action taken and intervention costs.
- Impact metrics endpoint that explicitly distinguishes self-reported outcomes from measured impact.

---

*Developed for Smart India Hackathon (SIH) Problem Statement ID 26131 &bull; Govt of Maharashtra*

## 🗣️ Farm Saathi multilingual voice assistant
- Added to the existing Farmer Portal without replacing its layout or visual design.
- Supports typed questions and browser speech input in English (`en-IN`), Hindi (`hi-IN`) and Marathi (`mr-IN`), plus text-to-speech for assistant answers.
- When a crop result is available, the assistant can read a spoken summary of the current screening, explain next steps, and read selected advice already displayed in the app.
- Uses browser Web Speech APIs; microphone access requires user permission and support depends on browser/OS voice packs. Latest Chrome or Edge on desktop is recommended. Speech recognition is not supported in every browser.
- The assistant uses a safe guided fallback when no provider is configured. To enable free-form Gemini answers, set `GEMINI_API_KEY` in the backend environment (optionally set `GEMINI_MODEL`, default `gemini-2.5-flash`) and restart FastAPI. The key stays server-side and is never sent to the browser. Provider quota/network failures fall back to guided responses.
- On Windows PowerShell, set the key in the same terminal before starting the backend: `$env:GEMINI_API_KEY="your-key-here"` and optionally `$env:GEMINI_MODEL="gemini-2.5-flash"`, then run `python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload`. Do not commit the key or paste it into frontend files.
- Voice and text advice remain preliminary. Do not make pesticide decisions based only on AI output; verify with local agricultural experts and registered product labels.


## Farmer accounts (added)

- Use **Sign in** in the app header to sign in or create a farmer account.
- Registration stores the farmer's name, email, district, optional village, and preferred language.
- Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes; the server issues random bearer tokens with a 30-day expiry and supports sign-out.
- Account records are stored in `backend/farmer_accounts.db`, separate from crop-report data. Keep this database on persistent storage when deploying. Back it up securely and do not commit it to source control.
- The app remains usable as a guest. The current account module is for farmer profiles/session access; it does not yet link historical crop reports to an individual account or protect the government dashboard/API endpoints. Add role-based authorization before using it for a real government deployment.
