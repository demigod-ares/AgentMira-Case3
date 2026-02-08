# Running the Application with Cloudflare Tunnel

This guide explains how to run both the frontend and backend services and expose them via Cloudflare Tunnel using path-based routing.

## Architecture Overview

- **Frontend**: Runs on `localhost:5173` (Vite dev server)
- **Backend**: Runs on `localhost:5000` (Express API server)
- **Cloudflare Tunnel**: Exposes both services through a single public URL with path-based routing
  - Root path (`/`) → Frontend
  - API path (`/api/*`) → Backend

## Prerequisites

1. Node.js and npm installed
2. Cloudflare Tunnel installed (`cloudflared`)
3. MongoDB running (optional - app works without it)

## Step-by-Step Instructions

### 1. Start the Backend Server

```powershell
cd backend
npm run start
```

The backend will start on `http://localhost:5000`

You should see:
```
🚀 Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

### 2. Start the Frontend Development Server

```powershell
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

The Vite config includes a proxy that forwards `/api` requests to `localhost:5000` during local development.

### 3. Start Cloudflare Tunnel

**Option A: Quick Tunnel (No account required)**

```powershell
cloudflared tunnel --url http://localhost:5173 --config C:\Users\profe\.cloudflared\config.yml
```

This will generate a temporary URL like: `https://random-words-here.trycloudflare.com`

**Option B: Named Tunnel (Requires Cloudflare account)**

If you have a named tunnel configured:

```powershell
cloudflared tunnel run
```

### 4. Access Your Application

Once the tunnel is running, you'll see a URL in the terminal. Open that URL in your browser.

**How it works:**
- `https://your-tunnel-url.trycloudflare.com/` → Shows frontend
- `https://your-tunnel-url.trycloudflare.com/api/properties/recommend` → Proxied to backend

The frontend makes requests to `/api/*` which:
- In local development: Proxied by Vite to `localhost:5000`
- Through Cloudflare Tunnel: Routed by ingress rules to `localhost:5000`

## Testing the Setup

### Local Development (without tunnel)
Visit `http://localhost:5173` - all features should work

### Through Cloudflare Tunnel
Visit your tunnel URL - all features should work without CORS errors

### Verify API Connection
```powershell
# Test via tunnel
curl https://your-tunnel-url.trycloudflare.com/api/health

# Should return:
# {"status":"ok","mongodb":"connected"}
```

## Troubleshooting

### CORS Errors
- Ensure the Cloudflare config file exists at: `C:\Users\profe\.cloudflared\config.yml`
- Verify the ingress rules have `/api/*` before the frontend catch-all
- Check that both frontend and backend servers are running

### Tunnel Not Starting
- Verify cloudflared is installed: `cloudflared --version`
- Check the config file syntax (YAML is indentation-sensitive)
- Ensure ports 5000 and 5173 are not blocked by firewall

### Frontend Can't Reach Backend Locally
- Verify Vite proxy is configured in `vite.config.js`
- Restart the frontend dev server after config changes
- Check backend is running on port 5000

### API Requests Return 404
- Ensure backend routes are prefixed with `/api` (already configured)
- Verify tunnel ingress order (API path must come before catch-all)
- Check cloudflared tunnel logs for routing errors

## Running All Services at Once

You can use PowerShell to start all services in separate terminal windows:

```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Codes\9AIPython\companies\AgentMira\CaseStudy3\backend'; npm run start"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Codes\9AIPython\companies\AgentMira\CaseStudy3\frontend'; npm run dev"

# Start Cloudflare tunnel (wait a few seconds for servers to start)
Start-Sleep -Seconds 5
cloudflared tunnel --url http://localhost:5173 --config C:\Users\profe\.cloudflared\config.yml
```

## Stopping Everything

Press `Ctrl+C` in each terminal window to stop the respective service:
1. Stop Cloudflare Tunnel
2. Stop Frontend (Vite)
3. Stop Backend (Express)

## Configuration Files Modified

1. **Frontend API calls** (`frontend/src/App.jsx`)
   - Changed from: `http://localhost:5000/api`
   - Changed to: `/api`

2. **Vite proxy config** (`frontend/vite.config.js`)
   - Added proxy to forward `/api` → `http://localhost:5000`

3. **Cloudflare Tunnel config** (`C:\Users\profe\.cloudflared\config.yml`)
   - Path-based routing: `/api/*` → backend, everything else → frontend

4. **Backend CORS** (`backend/server.js`)
   - Already configured to accept tunnel origin
