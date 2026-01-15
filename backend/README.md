# LinkifyMe Backend

Python backend for LinkedIn Profile Optimization using LangGraph, FastAPI, and Google Sheets.

## Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Set up Google Sheets:**
   - Create a new Google Sheet
   - Add worksheets: "Profile Information", "Profile Scoring", "Payment Confirmation", "Activity Log"
   - Share the sheet with your service account email

5. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/intake` | Start new analysis |
| GET | `/api/status/{unique_id}` | Check analysis status |
| GET | `/api/report/{customer_id}` | Get full report |
| GET | `/api/logs` | Get activity logs (WarRoom) |
| POST | `/api/payment/webhook` | Payment webhook |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry
│   ├── config.py            # Settings
│   ├── api/routes.py        # Endpoints
│   ├── graph/
│   │   ├── state.py         # LinkifyState
│   │   ├── edges.py         # Routing
│   │   ├── workflow.py      # Graph
│   │   └── nodes/           # All nodes
│   ├── services/
│   │   ├── sheets.py        # Google Sheets
│   │   ├── apify.py         # Scraping
│   │   ├── counter.py       # Customer ID
│   │   └── openai_scoring.py # AI scoring
│   ├── models/schemas.py    # Pydantic
│   └── utils/validators.py  # Validation
├── tests/
├── requirements.txt
└── .env.example
```

## LangGraph Workflow

```
intake → validate → allocate → payment → scrape → poll → fetch → score → write
```

## License

MIT
