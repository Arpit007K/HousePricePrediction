# Golden State Home Values (frontend)

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend for the FastAPI California house price API.

## Run it

```bash
# 1. Backend (from your existing project folder)
pip install fastapi uvicorn pandas scikit-learn joblib python-multipart
uvicorn main:app --reload --port 8000

# 2. Frontend (from this folder)
npm install
cp .env.example .env.local      # then edit if your API is not on localhost:8000
npm run dev                     # http://localhost:3000
```

Production: `npm run build && npm start`. Type check: `npm run typecheck`.

## Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

Restart `npm run dev` after changing `.env.local`.

## Required backend changes (2 small ones)

**1. CORS.** `main.py` has no CORS middleware, so the browser blocks requests from `localhost:3000`. Add this right after `app = FastAPI(...)`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add your deployed frontend URL too
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**2. Feature filename.** `main.py` and `train.py` use `house.features.joblib` (dot), but the file you uploaded is `house_features.joblib` (underscore). Make the name on disk match the name in `main.py`, or the API exits at startup with "Required model file not found".

## Structure

```
src/app            layout, page, global styles
src/components     Navbar, Hero, ApiStatus, PredictForm, ResultCard, BatchUpload, About, Footer, ui
src/lib/api.ts     fetch wrappers for GET /health, POST /predict, POST /predict-file
src/lib/features.ts feature list, labels, and validation rules mirroring main.py
src/lib/csv.ts     CSV parser and pre-upload validation
```
