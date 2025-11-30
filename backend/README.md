# Backend Service

A lightweight Express + Prisma API packaged for ECS Fargate. It demonstrates how the Terraform stack expects services to behave: container-friendly, stateless, and configured purely through environment variables.

## Requirements

- Node.js 20+
- PostgreSQL instance the app can reach 

## Quick Start

```bash
cd backend
cp .env.example .env          
npm install
npm run prisma:generate
npm run prisma:migrate     
npm run dev                   
```

Run a production build with:

```bash
npm run build
node dist/index.js
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Express server with live TypeScript execution. |
| `npm run build` | Emits the production-ready JavaScript bundle in `dist/`. |
| `npm run prisma:generate` | Regenerates the Prisma client from `prisma/schema.prisma`. |
| `npm run prisma:migrate` | Applies local migrations (dev workflow). |

## Docker Workflow

Useful for parity with the ECS task definition.

```bash
docker build -t sample-backend backend
docker run --env-file backend/.env -p 4000:4000 sample-backend
```

## API Surface

| Route | Method | Description |
| --- | --- | --- |
| `/health` | GET | Liveness probe returning service status and timestamp. |
| `/test` | GET | Persists a random floating-point number and returns the record. |
| `/history?limit=10` | GET | Lists the most recent persisted random numbers (1-50). |
| `/info` | GET | Static metadata about the service. |


## Deployment Notes

- The Terraform stack injects secrets/config via the `app_environment_variables` map. Make sure the keys you rely on are defined there before applying.
- Container images are published to the ECR repo you bootstrap with `scripts/bootstrap-ecr.sh`. The backend GitHub Actions workflow tags images and sets `app_image_tag` automatically.
- When replacing this sample with your own API, keep the same CI interface (build → push → update `app_image_tag`) and update any runtime environment variables referenced in Terraform.
