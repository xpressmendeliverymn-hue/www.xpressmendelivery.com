# Deployment Guide

## Architecture

- **Frontend**: Cloudflare Pages (static site, free tier) → **xpressmendelivery.com**
- **Backend**: Render Web Service (Node.js, free tier)
- **Database**: Render PostgreSQL (free tier)
- **File Storage**: Render Disk (1GB, for uploads until you move to S3)
- **Email**: SendGrid (free tier — 100 emails/day)
- **SMS**: Twilio (pay-as-you-go)
- **AI OCR**: OpenAI GPT-4 Vision (pay-as-you-go — ~$0.01 per form scan)

---

## ✅ CURRENT STATUS

| Component | Status | URL |
|-----------|--------|-----|
| Domain Registered | ✅ Done | xpressmendelivery.com |
| Frontend Deployed | ✅ Done | https://xpressmendelivery.pages.dev |
| Custom Domain | ⏳ Needs DNS | xpressmendelivery.com |
| Backend (Render) | ❌ Not deployed | — |
| Database (Render) | ❌ Not deployed | — |

---

## 1. Connect Custom Domain (5 minutes)

Your frontend is live on Cloudflare Pages. Now connect your domain:

### Option A: Cloudflare Dashboard (Recommended)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages** → **xpressmendelivery**
2. Click **Custom domains**
3. Click **Set up** next to `xpressmendelivery.com`
4. Click **Activate domain** — Cloudflare auto-adds DNS records
5. Repeat for `www.xpressmendelivery.com`

### Option B: Manual DNS Records
Add these DNS records in your Cloudflare dashboard → DNS:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `@` | `xpressmendelivery.pages.dev` | ✅ Proxied |
| CNAME | `www` | `xpressmendelivery.pages.dev` | ✅ Proxied |

> **Note**: Cloudflare supports CNAME flattening for the root (`@`) domain.

---

## 2. Deploy Backend (Render)

### 2a. Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Name: `xpressmen-db`
4. Region: `Ohio (US East)`
5. Plan: **Free**
6. Click **Create Database**
7. Copy the **Internal Database URL** — this becomes `DATABASE_URL`

### 2b. Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub/GitLab repo
3. Name: `xpressmen-api`
4. Region: `Ohio (US East)`
5. Root Directory: `server`
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Plan: **Free**

### 2c. Environment Variables

Add these in Render dashboard → Environment:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(paste from PostgreSQL internal URL)* |
| `JWT_SECRET` | *(generate a random 64-char string)* |
| `FRONTEND_URL` | `https://xpressmendelivery.com` |
| `SENDGRID_API_KEY` | *(optional — get from sendgrid.com)* |
| `TWILIO_ACCOUNT_SID` | *(optional — get from twilio.com)* |
| `TWILIO_AUTH_TOKEN` | *(optional)* |
| `TWILIO_PHONE_NUMBER` | *(optional)* |
| `OPENAI_API_KEY` | *(optional — get from platform.openai.com)* |

> **Note**: Without `OPENAI_API_KEY`, the form scanning feature falls back to demo/mock mode.

### 2d. Disk (for uploads)

1. In your Web Service → **Disks**
2. Add Disk:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/server/uploads`
   - Size: 1 GB

---

## 3. Update Frontend API URL

After deploying the backend to Render, you'll get a URL like `https://xpressmen-api.onrender.com`.

**Update the frontend build:**

```bash
# From project root
VITE_API_URL="https://xpressmen-api.onrender.com/api" ./deploy-frontend.sh
```

Or manually:
```bash
cd app
VITE_API_URL="https://xpressmen-api.onrender.com/api" npx vite build
cd ..
npx wrangler pages deploy app/dist --project-name=xpressmendelivery --branch=main
```

---

## 4. Quick Redeploy Script

A deploy script is included at `deploy-frontend.sh`:

```bash
./deploy-frontend.sh
```

This builds the frontend with the production API URL and deploys to Cloudflare Pages.

---

## 5. Local Development

```bash
# Terminal 1 — Backend
cd server
npm install
JWT_SECRET="dev-secret" npm start

# Terminal 2 — Frontend
cd app
npm install
npm run dev
```

Make sure PostgreSQL is running locally:
```bash
brew services start postgresql@16
```

Create local DB:
```bash
psql postgres -c "CREATE DATABASE xpressmen;"
psql postgres -c "CREATE USER xpress_user WITH PASSWORD 'xpress_dev_pass';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE xpressmen TO xpress_user;"
psql postgres -c "GRANT ALL ON SCHEMA public TO xpress_user;"
```

---

## 6. First Deploy Checklist

- [x] Domain registered (xpressmendelivery.com)
- [x] Frontend deployed to Cloudflare Pages
- [ ] Custom domain connected (DNS activated)
- [ ] Backend deployed on Render
- [ ] PostgreSQL database connected
- [ ] `FRONTEND_URL` env var set on backend
- [ ] `VITE_API_URL` env var set on frontend build
- [ ] Test customer booking flow end-to-end
- [ ] Test admin login
- [ ] Test salesperson portal
- [ ] Test order tracking
- [ ] Test AI form scan (upload a paper sales order photo)
- [ ] Test invoice generation
- [ ] Test proof-of-delivery email
