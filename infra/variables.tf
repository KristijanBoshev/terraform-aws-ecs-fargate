variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "ecr_repository_name" {
  description = "AWS ECR repository name"
  type        = string
}

variable "project_name" {
  description = "Project identifier used for tagged resource names"
  type        = string
}

variable "environment" {
  description = "Deployment environment, e.g. dev, staging, prod"
  type        = string
}

variable "az_count" {
  description = "Number of availability zones for public subnets"
  type        = number
  default     = 2
}

variable "vpc_cidr" {
  description = "CIDR block allocated to the VPC"
  type        = string
  default     = "172.17.0.0/16"
}

variable "app_port" {
  description = "Port exposed by the application container"
  type        = number
}

variable "app_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

variable "fargate_cpu" {
  description = "CPU units for each Fargate task"
  type        = number
  default     = 256
}

variable "fargate_memory" {
  description = "Memory (MB) for each Fargate task"
  type        = number
  default     = 512
}

variable "app_image_tag" {
  description = "Docker image tag deployed to ECS"
  type        = string
  default     = "latest"
}

variable "health_check_path" {
  description = "HTTP path used by the ALB health check"
  type        = string
  default     = "/health"
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "db_name" {
  description = "Database name"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Database admin username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Instance class for the RDS database"
  type        = string
  default     = "db.t3.micro"
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
}

variable "cloudfront_domain" {
  description = "Optional custom domain for CloudFront"
  type        = string
  default     = ""
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for static frontend assets"
  type        = string
}

variable "autoscaling_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1
}

variable "autoscaling_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 6
}

variable "cpu_threshold_high" {
  description = "CPU percentage that triggers scale out"
  type        = number
  default     = 85
}

variable "cpu_threshold_low" {
  description = "CPU percentage that triggers scale in"
  type        = number
  default     = 10
}

variable "app_environment_variables" {
  description = "Additional environment variables injected into the container"
  type        = map(string)
  default     = {}
  sensitive   = true
}
