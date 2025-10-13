API Access for third-party integrations
=====================================

Overview
--------
This project exposes a small API-key based integration surface so third-party systems (insurance, smart-city, fleet mgmt, etc.) can fetch EV dataset metadata and files.

Key concepts
------------
- APIKey model: stores keys, quota and usage.
- `x-api-key` header: third-parties send this header with requests.
- `apiKeyAuth` middleware: validates the API key and attaches `req.apiKey` and optionally `req.user`.
- External endpoints are mounted under `/external`.

Routes (backend)
-----------------
- GET /external/datasets/:datasetId
  - Returns dataset file content as attachment (CSV) if file exists. Requires valid `x-api-key`.

- GET /external/datasets/:datasetId/metadata
  - Returns JSON metadata (id, title, description, dataCategory, dataFormat, fileUrl). Requires `x-api-key`.

- GET /api/key (authenticated)
  - For logged-in users: get or create an API key for your account (JWT auth required). Returns { data: { key, quota, used } }

- POST /api/key/renew (authenticated)
  - For logged-in users: increases quota for your API key. (JWT auth required)

Dev helper (create a test key quickly)
--------------------------------------
Only available when NODE_ENV !== 'production'. Use this to create a test key for an existing user.

- POST /api/dev/create-test-key
  - Body: { userId?: number } (optional)
  - Returns: { data: { id, key, userId } }

Example flow (local testing)
---------------------------
1) Start backend in sqlite mode (recommended for local dev):

```powershell
$env:DB_USE_SQLITE='true'
$env:PORT='5000'
node "backend/src/server.js"
```

2) Create a test API key (dev route):

```powershell
curl -X POST http://localhost:5000/api/dev/create-test-key -H "Content-Type: application/json" -d '{}'
# Response contains the `key` value
```

3) Call metadata endpoint as third-party:

```powershell
curl -H "x-api-key: <your-key>" http://localhost:5000/external/datasets/9/metadata
```

4) Download dataset file as third-party:

```powershell
curl -H "x-api-key: <your-key>" http://localhost:5000/external/datasets/9 -o sample_dataset.csv
```

Notes and next steps
--------------------
- Quota enforcement: middleware checks for quota exhaustion. Controller increments `used` on successful download.
- Production hardening: implement rate limiting, revoke/rotate keys, usage dashboards, and policy scopes (read vs. download).
- Security: ensure HTTPS in production, audit keys, and restrict origins when necessary.

If you want, I can:
- Add an admin UI to create/manage API keys.
- Add rate-limiting using `express-rate-limit` per API key.
- Add an OpenAPI spec for these endpoints.

