// Response shapes taken directly from main.py.
export interface PredictResponse {
  predicted_price: string; // e.g. "$245,000"
  predicted_price_short: string; // e.g. "$2.45 hundred thousand"
  estimated_range: string; // e.g. "$206,000 to $284,000"
}

export interface HealthResponse {
  status: string;
  model: string;
  features: string[];
}
