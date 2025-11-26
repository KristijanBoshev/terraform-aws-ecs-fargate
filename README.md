# AWS Application Terraform Template

A reusable Terraform template that provisions a production-style AWS stack for containerized applications. It aims to be infrastructure-agnostic, avoiding any application-specific secrets or hard-coded names so you can drop in your own workloads quickly.

## What You Get

- **Regional AWS provider setup** with pluggable remote state backends (S3 + DynamoDB recommended).
- **VPC with public subnets only** (see cost note below) plus an internet gateway and shared route table.
- **Security groups** scoped for the load balancer, ECS tasks, and the database tier.
- **Elastic Container Service (ECS Fargate)** cluster, task definition, and service wired to an **Application Load Balancer (ALB)**.
- **Elastic Container Registry (ECR)** repository and lifecycle policy retaining the last five images.
- **RDS PostgreSQL instance** placed in the VPC, kept private but still reachable from the ECS service.
- **CloudFront distribution + S3 bucket** for serving a static frontend with an Origin Access Control (OAC).
- **Application Auto Scaling** target/policies and CloudWatch alarms for CPU-based scaling.
- **CloudWatch Logs** group/stream for ECS tasks.
- **IAM roles/policies** for ECS task execution, task runtime permissions, and autoscaling.
- **Configurable application environment variables** injected into the container through a simple `map(string)` input.

## Architecture Overview

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

### Important Cost/Network Note

For cost-optimization, this template places **all subnets in the public network** and does **not** create private subnets or NAT gateways. The RDS instance is still marked `publicly_accessible = false`, but it resides in the public subnets. This keeps AWS costs minimal, at the expense of not having a fully private backend tier. If you require private networking, add private subnets, a NAT gateway, and update the ECS/RDS subnet associations accordingly.

## Prerequisites

- Terraform **v1.5.0+**
- AWS provider **~> 5.0**
- AWS credentials with permission to create the referenced resources
- An HTTPS-ready ACM certificate in the target region (for ALB) and in `us-east-1` if you plan to use CloudFront

## Configuration

### Backend

The backend is left empty so you can supply your own settings at init time:

```bash
terraform init \
  -backend-config="bucket=<state-bucket>" \
  -backend-config="key=terraform.tfstate" \
  -backend-config="region=<state-region>" \
  -backend-config="dynamodb_table=<optional-lock-table>"
```

### Variables

Key inputs are defined in [`variables.tf`](variables.tf). Highlights:

| Variable | Purpose |
| --- | --- |
| `aws_region`, `project_name`, `environment` | Global context used in naming/tagging |
| `vpc_cidr`, `az_count` | Network sizing |
| `app_port`, `app_count`, `fargate_cpu`, `fargate_memory`, `app_image_tag` | ECS service tuning |
| `db_name`, `db_username`, `db_password`, `db_instance_class`, `db_port` | RDS config |
| `frontend_bucket_name`, `certificate_arn`, `cloudfront_domain` | Frontend delivery settings |
| `autoscaling_min_capacity`, `autoscaling_max_capacity`, `cpu_threshold_high`, `cpu_threshold_low` | Scaling policy knobs |
| `app_environment_variables` | Arbitrary map of `name=value` pairs injected into the container |

### Sample `terraform.tfvars`

```hcl
aws_region   = "us-east-1"
project_name = "myapp"
environment  = "dev"

vpc_cidr = "172.17.0.0/16"
az_count = 2

app_port       = 3000
app_count      = 2
fargate_cpu    = 512
fargate_memory = 1024
app_image_tag  = "v1.0.0"

frontend_bucket_name = "myapp-frontend-dev"
certificate_arn      = "arn:aws:acm:..."
cloudfront_domain    = "app.example.com"

db_name      = "app"
db_username  = "app_admin"
db_password  = "super-secret"
db_port      = 5432

autoscaling_min_capacity = 1
autoscaling_max_capacity = 4
cpu_threshold_high       = 75
cpu_threshold_low        = 20

app_environment_variables = {
  NODE_ENV                     = "production"
  ENABLE_CLAUDE_OPUS_4_5_PREVIEW = "true" # Example feature toggle
  LOG_LEVEL                    = "info"
}
```

## Usage

```bash
# 1. Initialize (configure backend via CLI or backend.hcl)
terraform init -backend-config=backend.hcl

# 2. Validate syntax early
terraform validate

# 3. Preview changes
terraform plan -var-file=terraform.tfvars

# 4. Apply infrastructure
terraform apply -var-file=terraform.tfvars

# 5. Tear down when finished
terraform destroy -var-file=terraform.tfvars
```

### ECR Image Flow

1. Push your container image to the generated ECR repository.
2. Set `app_image_tag` to the tag you just pushed.
3. Re-run `terraform apply` (or deploy via your CI/CD pipeline) to roll out the new task definition.

### Application Environment Variables

- Use the `app_environment_variables` map for secrets and feature toggles.
- All entries render as `name/value` pairs in the ECS task definition.
- Sensitive values should be stored securely (e.g., `*.auto.tfvars` in a secrets backend or Terraform Cloud workspace variables).

## Customization Tips

- **Private networking:** Add private subnets + NAT to `network.tf`, update ECS service subnets, and create separate subnet groups for RDS if you need stricter isolation.
- **Observability:** Extend `logs.tf` with log subscription filters or ship metrics via additional IAM policies in `roles.tf`.
- **Scaling policies:** Replace CPU-based step scaling with target tracking on custom metrics if that fits your workload better.
- **Multi-environment deployments:** Use workspaces or distinct state files per `environment` value, leveraging the shared template.

## Troubleshooting & Validation

- `terraform fmt` – keep formatting consistent.
- `terraform validate` – catch configuration issues early.
- `terraform plan` – always review before applying.
- AWS console/CLI – confirm ACM certificates, Route53 aliases, or CloudFront propagation if something feels off.

## Security Considerations

- Rotate credentials and secrets fed into `app_environment_variables` regularly.
- Ensure your ACM certificate and `cloudfront_domain` DNS records are managed securely.
- Because the stack uses public subnets, apply additional security controls (e.g., WAF, Shield, stricter SG rules) for production workloads.

---
Need adjustments or want to extend the template (e.g., private networking, multi-account deployment)? Feel free to open an issue or adapt the modules as needed.
