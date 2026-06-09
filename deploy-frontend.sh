#!/bin/bash
set -e

echo "🏗️  Building Xpressmen frontend for production..."
cd app
VITE_API_URL="https://xpressmen-api.onrender.com/api" npx vite build

echo "🚀 Deploying to Cloudflare Pages..."
cd ..
npx wrangler pages deploy app/dist --project-name=xpressmendelivery --branch=main

echo "✅ Done! Your site is live at https://xpressmendelivery.com"
