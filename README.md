# AWS Application Terraform Template

A Terraform-first blueprint for provisioning a production-style AWS stack that runs any containerized workload. The repo ships with a lightweight React + Vite + Node + Express sample so you can validate the infrastructure quickly, but the template itself is designed for your own services. Provide your own Application with Dockerfile and you are ready to go!

> **Note:** The provided GitHub Actions assume this repository layout (`/backend`, `/frontend`, `/infra`, etc.); keep that structure or update the workflows before relying on CI/CD.


## Why This Template

- **Terraform-native workflow** – opinionated modules, remote state ready, and CI-friendly defaults.
- **Full production surface** – networking, compute, data, distribution, and security are included so you can focus on application logic.
- **Swap-in workloads** – point the ECS task at your own container image/ECR repo and reuse the rest unchanged.
- **Starter demo** – optional backend/frontend app proves the infra works end-to-end before you onboard real traffic.

## Stack Highlights

- **Regional AWS provider setup** with pluggable remote state backends (S3).
- **VPC with public subnets** (cost-optimized) plus an internet gateway and shared route table.
- **Security groups** scoped for the load balancer, ECS tasks, and database tier.
- **ECS Fargate + ALB** wiring for stateless container workloads.
- **ECR repository** with lifecycle policy retaining the last five images.
- **RDS PostgreSQL** instance reachable from the ECS service.
- **CloudFront + S3** for static frontend deploys via Origin Access Control (OAC).
- **Application Auto Scaling** target/policies and CloudWatch alarms for CPU-based scaling.
- **CloudWatch Logs** group for ECS tasks.
- **IAM roles/policies** covering task execution, runtime permissions, and autoscaling.
- **`app_environment_variables` map** for configurable env vars injected into the task definition.

## Architecture Snapshot

```
Clients ➜ CloudFront ➜ S3 (static assets)
        ➜ Route53/Custom Domain ➜ ACM Certificate
        ➜ Application Load Balancer ➜ ECS Fargate Service ➜ Task Definition
                                             │
                                             ├── Logs ➜ CloudWatch Log Group
                                             └── RDS PostgreSQL (same VPC)

ECS image source ➜ ECR repository
Auto scaling ➜ Application AutoScaling + CloudWatch alarms
```

> **Cost/Network Callout:** All subnets are public by default to avoid NAT Gateway spend. RDS stays `publicly_accessible = false`, but it lives in those public subnets. Add private subnets and NAT if you need stricter isolation.

## Prerequisites

- Terraform **v1.5.0+**
- AWS provider **~> 5.0**
- AWS credentials that can manage ACM, S3, ECS, ECR, RDS, CloudFront, IAM, and CloudWatch
- Issued ACM certificate in the workload region

## Deploy Any App With This Template

Use these Terraform-oriented steps to stand up infrastructure for any containerized service. The optional sample app simply verifies the stack; swap in your own image when ready or simply clone the repo if you haven't started yet.

1. **Request ACM certificates** – Cover both your frontend (e.g., `app.example.com`) and backend/API (e.g., `api.example.com`) domains. Complete DNS validation and wait for the `Issued` status.
2. **Create the Terraform backend bucket** – Provision an S3 bucket (for example `test-app-backend`) for `terraform.tfstate`. Enable versioning/encryption manually for now.
3. **Prepare `terraform.tfvars`** – Copy values from `variables.tf`, then set every required input. Keep app-level settings inside `app_environment_variables` so Terraform injects them into ECS:
   ```hcl
   app_environment_variables = {
     DATABASE_URL = "postgresql://..."
     NODE_ENV     = "production"
   }
   ```
4. **Provision IAM access** – Use an IAM role or user with rights over ACM, S3, ECS, ECR, RDS, CloudFront, IAM, and CloudWatch. Prefer SSO/short-lived credentials when possible.
5. **Bootstrap the ECR repository** – From the repo root run `cd scripts && chmod +x bootstrap-ecr.sh && ./bootstrap-ecr.sh <ecr-name> <aws-region>` to create the repo and capture its URI. NOTE: You need to be logged in inside your AWS account. Use `aws configure`
6. **Wire up CI secrets** – Populate GitHub (or your CI) with `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BACKEND_BUCKET`, and `ECR_REPOSITORY_NAME` for the backend workflow. Add frontend secrets (`VITE_API_BASE_URL`, `AWS_FRONTEND_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`) after Terraform outputs exist.
7. **Run Terraform pipelines** – Trigger `deploy-backend.yaml` to build/push your container, then run `terraform init/plan/apply` (locally or via CI) against the stack.
8. **Capture outputs & configure DNS** – Note `alb_hostname`, `cloudfront_distribution_id`, `cloudfront_domain_name`, and `frontend_bucket_name`. Create DNS CNAMEs pointing backend ➜ ALB and frontend ➜ CloudFront. Use the EC2 console if the ALB hostname was truncated in logs.
9. **Deploy the frontend** – After DNS and secrets are ready, execute `deploy-frontend.yaml` to publish the static assets to S3 and invalidate CloudFront.
10. **Verify end-to-end** – Hit your frontend domain, exercise each API route, and confirm CloudWatch/ECS/RDS signals look healthy.

## Configuration Essentials

### Remote Backend & Workflow

The Terraform backend block is intentionally empty so you can provide environment-specific settings at init time:

```bash
terraform init \
  -backend-config="bucket=<state-bucket>" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=<state-region>"

terraform fmt
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
terraform destroy
```

### Image Promotion Flow

1. Build and push your container image to the generated ECR repo.
2. Set `app_image_tag` during runtime with the freshly generated hash.
3. Re-run your deployment pipeline to roll out the new task definition.

### Application Environment Variables

- Keep every runtime toggle or secret in `app_environment_variables` (map of strings).
- Entries render as K/V pairs inside the ECS task definition.
- Store sensitive `.tfvars` files securely (`*.auto.tfvars`, Terraform Cloud workspace vars, or your CI secrets store).

## Sample Application Docs

An optional React + Express demo is included strictly for smoke-tests. Detailed setup/run instructions now live beside the code:

- `backend/README.md` – Express + Prisma API, local/dev workflows, Docker commands, and API reference.
- `frontend/README.md` – React + Vite dashboard, environment expectations, and deployment guidance.

Feel free to delete these folders once you have your own workloads.

## Customization Paths

- **Private networking:** Extend `network.tf` with private subnets + NAT, update ECS subnets, and create a dedicated RDS subnet group.
- **Observability:** Add log subscription filters or extra IAM permissions in `logs.tf`/`roles.tf` to forward metrics.
- **Scaling policies:** Replace CPU-based step scaling with target tracking on custom metrics if you need tighter control.
- **Multi-environment deployments:** Use Terraform workspaces or separate state files per environment.

---
Need more adjustments (private networking, multi-account rollout, etc.)? Clone the repository and customize by your needs!
