# Only B2B Lead Management

A full-stack lead dashboard for creating and tracking sales opportunities. The React interface communicates with an Express JSON API, and MongoDB persists lead records and status changes.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer, available locally or through a MongoDB provider
- npm

## Run locally

1. Start MongoDB.
2. Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` to your database connection string. Keep real credentials out of source control.
3. In a terminal, open the backend folder and start the API:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   The API listens on port `3001` by default. It creates the unique email index before accepting requests.

4. In another terminal, open the frontend folder and start the React app:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open the Vite URL (normally `http://localhost:5173`). Vite proxies `/api` requests to `http://localhost:3001`. Set `API_PROXY_TARGET` if the API is hosted elsewhere during development.

5. To build the frontend for production, run `npm run build` from the `frontend` folder. Deploy the generated `frontend/dist` directory to a static host and configure `/api` to reach the running backend. Set `FRONTEND_ORIGIN` on the API to restrict cross-origin access to the deployed frontend origin.

## Lead rules

- Required fields are validated in the browser and again by the API.
- Email is trimmed and lowercased before storage; a MongoDB unique index prevents duplicates even when simultaneous requests race.
- Priority is calculated from the deal value: below INR 50,000 is Low; INR 50,000 to below INR 100,000 is Medium; INR 100,000 and above is High.
- New leads start in `New`. Status can be changed to `New`, `Contacted`, `Qualified`, or `Lost`.
- Search, status/priority filters, sorting, and 10-row pagination are applied by the API. Search covers name, email, and company.
- The dashboard displays created timestamps in India Standard Time (IST).

## API

All endpoints return JSON. The primary route prefix is `/api/leads` (the older `/api/contacts` prefix remains an alias).

### `POST /api/leads`

Create a lead. Priority and status are assigned by the backend; client-supplied values cannot override them.

```json
{
  "name": "Riya Patel",
  "email": "riya@example.com",
  "company": "Example Ltd",
  "phone": "+919876543210",
  "leadSource": "Website",
  "estimatedRevenue": "75000.00"
}
```

Returns `201` with the generated ID, calculated priority, and saved lead. Invalid input returns `400` with a field-keyed `errors` object. A duplicate email returns `409` with `Lead already exists with this email.`.

### `GET /api/leads`

Query parameters: `search` (optional partial text), `status` (`New`, `Contacted`, `Qualified`, `Lost`), `priority` (`High`, `Medium`, `Low`), and `page` (positive integer). Results are sorted newest first with a stable ID tie-breaker.

Example: `/api/leads?search=example&status=New&priority=Medium&page=1`

```json
{
  "leads": [],
  "total": 0,
  "page": 1,
  "totalPages": 1,
  "pageSize": 10
}
```

### `PATCH /api/leads/:id/status`

Update a lead's status:

```json
{ "status": "Contacted" }
```

Returns `200` with the updated lead. Unsupported statuses return `400`; an unknown lead returns `404`.

### `GET /api/health`

Returns `200` with `{ "status": "ok" }` when the API process is reachable.

## Tests and checks

Run backend tests, including case-insensitive duplicate email and priority boundary cases:

```powershell
cd backend
npm test
```

Run frontend checks:

```powershell
cd frontend
npm run lint
npm run build
```

## Implementation notes

- The MongoDB email index is built during startup, before the server begins listening. An existing database containing duplicate normalized email addresses must be cleaned up before this unique index can be created.
- This assessment app has no authentication or role-based access, consistent with the task scope. Add access control, rate limiting, and operational monitoring before exposing the API publicly.
