# Frontend Dashboard

A React + Vite + Material UI single-page dashboard that exercises each backend endpoint. Use it to validate the infrastructure quickly or as a reference when wiring your own SPA into the Terraform deployment pipeline.

## Requirements

- Node.js 20+
- npm

## Quick Start

```bash
cd frontend
cp .env.example .env      
npm install
npm run dev                
```

Create a production build with:

```bash
npm run build                  # emits assets into dist/
```

Preview the optimized build locally:

```bash
npm run preview
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with React Fast Refresh. |
| `npm run build` | Type-check and bundle into static assets. |
| `npm run preview` | Serve `dist/` locally for smoke tests. |
| `npm run lint` | Run ESLint using the supplied flat config. |


## UI Behavior

- Buttons for `/health`, `/test`, `/info`, and `/history` endpoints with inline response payloads.
- Adjustable history limit (1-50) prior to calling `/history`.
- Success/error states surfaced via Material UI alerts so you can debug at a glance.

## Deployment Notes

- `npm run build` places static files in `frontend/dist`. Terraform uploads these assets to the S3 bucket fronted by CloudFront (see `infra/cloudfront.tf` and `infra/s3.tf`).
- The `deploy-frontend.yaml` GitHub Actions workflow syncs the `dist/` folder to S3 and invalidates CloudFront. Configure `AWS_FRONTEND_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`, and `VITE_API_BASE_URL` secrets in CI before using it.
