resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  tags = local.common_tags
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${local.name_prefix}-task"
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory

  container_definitions = templatefile("${path.module}/templates/pay_app.json.tpl", {
    container_name        = local.container_name
    app_image             = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${data.aws_ecr_repository.app.name}:${var.app_image_tag}"
    app_port              = var.app_port
    fargate_cpu           = var.fargate_cpu
    fargate_memory        = var.fargate_memory
    aws_region            = var.aws_region
    log_group             = aws_cloudwatch_log_group.app.name
    db_host               = aws_db_instance.main.address
    db_port               = var.db_port
    db_name               = var.db_name
    db_username           = var.db_username
    db_password           = var.db_password
    environment_variables = var.app_environment_variables
  })

  tags = local.common_tags
}

resource "aws_ecs_service" "main" {
  name            = "${local.name_prefix}-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.public[*].id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.arn
    container_name   = local.container_name
    container_port   = var.app_port
  }

  health_check_grace_period_seconds = 300

  tags = local.common_tags
}
