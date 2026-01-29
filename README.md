# LinkifyMe - LinkedIn Profile Optimizer

<p align="center">
  <img src="frontend/public/logo.svg" alt="LinkifyMe Logo" width="120"/>
</p>

<p align="center">
  <strong>AI-powered LinkedIn profile analysis and optimization tool</strong>
</p>

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Google Cloud Service Account** (for Sheets integration)
- **OpenAI API Key** (for AI scoring)
- **Apify API Token** (for LinkedIn scraping)

---

## 📦 Installation

### 1. Clone the Repository

```bash
cd /Users/hardik/AI/Deployable/LinkifyMe
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## ⚙️ Configuration

### Backend `.env` File

Create `backend/.env` with:

```env
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Apify
APIFY_API_TOKEN=apify_api_your-token

# Google Sheets
GOOGLE_SHEET_ID=your-google-sheet-id

# Server
HOST=0.0.0.0
PORT=8000
```

### Frontend `.env.local` File

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Google Sheets Credentials

1. Place your Google Cloud service account JSON file in `backend/`
2. Rename it to match what's configured in `backend/app/config.py`
3. Share your Google Sheet with the service account email

---

## 🏃 Running the Servers

### Option 1: Run Both Servers (Recommended)

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd /Users/hardik/AI/Deployable/LinkifyMe/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/hardik/AI/Deployable/LinkifyMe/frontend
npm run dev
```

### Option 2: Quick One-Liner (Background)

```bash
# From project root
cd /Users/hardik/AI/Deployable/LinkifyMe

# Start backend in background
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Start frontend
cd ../frontend && npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |

---

## 📊 Google Sheets Structure

The application uses two sheets:

### Sheet 1: Profile Information (25 columns)
| Column | Field |
|--------|-------|
| 1 | Customer ID |
| 2 | Attempt ID |
| 3 | LinkedIn Profile |
| 4-8 | Scrape Status, DateTime, Email, Mobile, Target Group |
| 9 | Complete Scraped Data (JSON) |
| 10-25 | First Name, Last Name, Headline, Connections, Followers, About, Profile Pic, Cover Pic, Location, Birthday, Experience, Education, Skills, Certifications, Verified, Premium |

### Sheet 2: Profile Scoring (31 columns)
| Column | Field |
|--------|-------|
| 1-4 | Customer ID, Attempt ID, LinkedIn URL, First Name |
| 5-16 | 12 Section Scores (all /10) |
| 17 | Final Score (weighted /100) |
| 18-28 | 11 Reasonings |
| 29-31 | Timestamp, Status, Remarks (contribution breakdown) |

---

## 🎯 Scoring System

All sections scored on **10-point scale**, with weighted contributions to final 100-point score:

| Section | Weight | Max Contribution |
|---------|--------|------------------|
| Experience | 20% | 20 pts |
| About | 15% | 15 pts |
| Headline | 10% | 10 pts |
| Profile Photo | 10% | 10 pts |
| Education | 10% | 10 pts |
| Skills | 10% | 10 pts |
| Connections | 5% | 5 pts |
| Followers | 5% | 5 pts |
| Cover Photo | 5% | 5 pts |
| Certifications | 5% | 5 pts |
| Verified Badge | 3% | 3 pts |
| Premium Status | 2% | 2 pts |

---

## 🔧 Troubleshooting

### Backend Won't Start

```bash
# Make sure venv is activated
source backend/venv/bin/activate

# Check if port 8000 is in use
lsof -i :8000

# Kill existing process if needed
kill -9 <PID>
```

### Frontend Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear Next.js cache if issues
rm -rf frontend/.next
npm run dev
```

### Google Sheets Errors

1. Verify `GOOGLE_SHEET_ID` is a native Google Sheet (not .xlsx)
2. Ensure service account email has Editor access
3. Check credentials JSON path is correct

### AI Scoring Issues

1. Verify `OPENAI_API_KEY` is valid
2. Check API quota/billing
3. Review backend logs for detailed errors

---

## 📁 Project Structure

```
LinkifyMe/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── graph/         # LangGraph workflow nodes
│   │   ├── services/      # Google Sheets, OpenAI services
│   │   └── main.py        # FastAPI app entry
│   ├── venv/              # Python virtual environment
│   └── .env               # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   └── components/    # React components
│   ├── public/            # Static assets
│   └── .env.local         # Frontend environment variables
│
└── README.md              # This file
```

---

## 🛠️ Development

### Hot Reload

Both servers support hot reload:
- **Backend**: Uses `--reload` flag with uvicorn
- **Frontend**: Built-in Next.js Fast Refresh

### API Testing

Access Swagger UI at: http://localhost:8000/docs

---

## 📄 License

MIT License - Feel free to use and modify!

---

<p align="center">
  Made with RENTBASKET's Support for LinkedIn optimization
</p>