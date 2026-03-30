# Environment Variables for Vercel Deployment

## Required Environment Variables

Set these in your Vercel project settings (Settings > Environment Variables):

### Backend API URL

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `API_URL` | Backend API server URL (server-side) | `https://api.yourdomain.com` or `https://your-backend.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Backend API URL (client-side, same as API_URL) | `https://api.yourdomain.com` |

### Database

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

### Authentication

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `JWT_SECRET` | Secret for JWT token signing | Your random 32+ character string |

### Cloudinary (Image Storage)

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

### Email (SMTP)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port (usually 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |

## How Architecture Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vercel Frontend │     │  Next.js API   │     │   Backend API   │
│  (Server/Client) │     │  Proxy Routes  │     │   (Express.js)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                         │                       │
         │  fetch('/api/blog')     │                       │
         │────────────────────────>│                       │
         │                         │  fetch(API_URL/api/blog)
         │                         │──────────────────────>│
         │                         │                       │
         │                         │<──────────────────────│
         │<────────────────────────│                       │
         │                         │                       │
```

## Key Points

1. **API Proxy Pattern**: All API calls go through Next.js API routes (`/api/*`), which forward requests to the backend.

2. **Environment Variables**:
   - `API_URL` = Used by Next.js API routes (server-side)
   - `NEXT_PUBLIC_API_URL` = Used by client-side code (falls back to API_URL)

3. **Image URLs**:
   - Images stored in Cloudinary should be full URLs (already handled)
   - Relative paths need `NEXT_PUBLIC_API_URL` to construct full URLs

## Troubleshooting

### 500 Error on Dynamic Routes

1. Check if `API_URL` is set correctly in Vercel
2. Check Vercel logs for API route errors
3. Verify backend is accessible from Vercel

### Broken Images

1. Verify images are Cloudinary URLs (start with `https://res.cloudinary.com/`)
2. If using custom uploads, ensure `NEXT_PUBLIC_API_URL` is set

### Blog Posts Not Loading

1. Check browser console for API errors
2. Verify `/api/blog` endpoint works: `https://your-frontend.vercel.app/api/blog`
3. Check backend logs for errors