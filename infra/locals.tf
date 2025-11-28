locals {
  name_prefix       = "${var.project_name}-${var.environment}"
  container_name    = "${local.name_prefix}-app"
  log_group_name    = "/ecs/${local.name_prefix}"
  alb_name          = "${local.name_prefix}-alb"
  target_group_name = "${local.name_prefix}-tg"

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
