#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

PROJECT_ID="observability-488317"
REGION="us-central1"
SERVICE_NAME="optikk-marketing"

echo "=========================================================="
echo "🚀 Building and Deploying Optikk Frontend to Cloud Run..."
echo "=========================================================="

echo "📦 Running Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

echo "⚡ Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

echo "=========================================================="
echo "🎉 Deployment successful!"
echo "=========================================================="
