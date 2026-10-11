import joblib
import pandas as pd
from pathlib import Path
import io

from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastapi import UploadFile, File

app = FastAPI(title="California House Prediction API")

# Allow the Next.js frontend to call this API from the browser.
# Add your deployed frontend URL here when you publish it.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved model and feature names
try:
    model = joblib.load("house_model.joblib")
    feature = joblib.load("house.features.joblib")  # filename matches the uploaded file
except FileNotFoundError as e:
    raise RuntimeError(
        f"Required model file not found: {e.filename}. "
        "Check the filenames and working directory."
    ) from e


# Input schema
class HouseFeatures(BaseModel):
    MedInc: float = Field(ge=0, description="Median income in tens of thousands of dollars")
    HouseAge: float = Field(ge=0, description="Median house age")
    AveRooms: float = Field(ge=0, description="Average number of rooms per household")
    AveBedrms: float = Field(ge=0, description="Average number of bedrooms per household")
    Population: float = Field(ge=0, description="Total population in the block group")
    AveOccup: float = Field(gt=0, description="Average number of household members")
    Latitude: float = Field(ge=32, le=42, description="Latitude")
    Longitude: float = Field(ge=-125, le=-114, description="Longitude")


@app.get("/")
def home():
    return {
        "message": "California House Prediction API",
        "status": "running",
        "endpoint": "Send a POST request to /predict",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {
        "status": "running",
        "model": "Random Forest Regressor",
        "features": feature
    }


@app.post("/predict")
def predict(house: HouseFeatures):
    try:
        input_data = pd.DataFrame([house.model_dump()])

        # Match the exact feature order used during training
        input_data = input_data[feature]

        predicted = float(model.predict(input_data)[0])

        # California Housing target is measured in units of $100,000
        price_usd = predicted * 100000

        # Approximate range using the stated $39,000 error
        error = 39000

        return {
            "predicted_price": f"${price_usd:,.0f}",
            "predicted_price_short": f"${predicted:.2f} hundred thousand",
            "estimated_range": (
                f"${max(0, price_usd - error):,.0f} "
                f"to ${price_usd + error:,.0f}"
            )
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        ) from e


@app.post("/predict-file")
async def predict_file(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file only."
        )

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        df = pd.read_csv(io.BytesIO(content))

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file has no data rows."
            )

        required_columns = feature

        missing_columns = [
            col for col in required_columns
            if col not in df.columns
        ]

        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns: {missing_columns}"
            )

        # Keep only the model's expected columns and order
        input_data = df[required_columns].apply(
            pd.to_numeric, errors="coerce"
        )

        if input_data.isnull().any().any():
            raise HTTPException(
                status_code=400,
                detail="Feature columns must contain valid numeric values."
            )

        if not input_data.map(
            lambda x: float("-inf") < x < float("inf")
        ).all().all():
            raise HTTPException(
                status_code=400,
                detail="Feature columns cannot contain infinite values."
            )

        if (input_data["AveOccup"] <= 0).any():
            raise HTTPException(
                status_code=400,
                detail="AveOccup must be greater than zero."
            )

        if not input_data["Latitude"].between(32, 42).all():
            raise HTTPException(
                status_code=400,
                detail="Latitude must be between 32 and 42."
            )

        if not input_data["Longitude"].between(-125, -114).all():
            raise HTTPException(
                status_code=400,
                detail="Longitude must be between -125 and -114."
            )

        nonnegative_columns = [
            col for col in required_columns
            if col != "Longitude"
        ]

        if (input_data[nonnegative_columns] < 0).any().any():
            raise HTTPException(
                status_code=400,
                detail="Feature values other than longitude cannot be negative."
            )

        predictions = model.predict(input_data)

        # Target values are in units of $100,000
        df["predicted_price_usd"] = predictions * 100000

        output = df.to_csv(index=False)

        return StreamingResponse(
            io.BytesIO(output.encode("utf-8")),
            media_type="text/csv",
            headers={
                "Content-Disposition":
                    'attachment; filename="predictions.csv"'
            }
        )

    except HTTPException:
        raise

    except (pd.errors.ParserError, UnicodeDecodeError) as e:
        raise HTTPException(
            status_code=400,
            detail="Could not read the file. Please upload a valid CSV."
        ) from e

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        ) from e

    finally:
        await file.close()
