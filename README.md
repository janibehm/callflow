# Callflow

Automatic lead capture from Twilio calls → HubSpot.

**Flow:** Twilio call ends → webhook → check/create HubSpot contact → log call activity.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your tokens
```

| Variable | Description |
|---|---|
| `HUBSPOT_ACCESS_TOKEN` | HubSpot Private App token (needs `crm.objects.contacts.read` and `crm.objects.contacts.write`) |
| `TWILIO_AUTH_TOKEN` | Your Twilio auth token (for future signature validation) |

## Run

```bash
npm start          # production
npm run dev        # with --watch auto-restart
```

Server starts on `http://localhost:3000`.

## Twilio configuration

Set your Twilio phone number's **Status Callback URL** to:

```
https://your-domain.com/webhook/call
```

Method: **POST**

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/webhook/call` | Twilio call webhook |

## Deploy to Railway (recommended, free tier)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select your repo
4. Add environment variables in Railway dashboard:
   - `HUBSPOT_ACCESS_TOKEN`
   - `TWILIO_AUTH_TOKEN`
5. Railway gives you a public URL like `https://callflow-production.up.railway.app`
6. Set your Twilio Status Callback URL to `https://<your-railway-url>/webhook/call`

That's it — runs 24/7, no laptop needed.

## Deploy with Docker (any host)

```bash
docker build -t callflow .
docker run -p 3000:3000 \
  -e HUBSPOT_ACCESS_TOKEN=your-token \
  -e TWILIO_AUTH_TOKEN=your-token \
  callflow
```

Works on any VPS, Fly.io, Render, Google Cloud Run, etc.

## Local dev with ngrok

For testing without deploying:

```bash
npm run dev              # start server
ngrok http 3000          # in another terminal
```

Then use the ngrok URL (`https://xxx.ngrok-free.app/webhook/call`) in Twilio. Only works while your Mac is on.

## What happens on each call

1. Twilio POSTs call data (`From`, `To`, `CallSid`, `CallDuration`, etc.)
2. Server searches HubSpot for a contact matching the caller's phone number
3. If no contact exists → creates one as a **lead** with name "Unknown caller"
4. Logs a **call activity** on the contact with duration, direction, and recording link
# callflow
