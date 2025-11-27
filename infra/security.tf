# ALB Security Group
resource "aws_security_group" "lb" {
  name        = "${local.name_prefix}-alb-sg"
  description = "Controls access to the application load balancer"
  vpc_id      = aws_vpc.main.id

  # HTTP ingress for redirect to HTTPS
  ingress {
    protocol    = "tcp"
    from_port   = 80
    to_port     = 80
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS ingress
  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb-sg"
  })
}

# Traffic to the ECS cluster should only come from the ALB
resource "aws_security_group" "ecs_tasks" {
  name        = "${local.name_prefix}-ecs-sg"
  description = "Allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = var.app_port
    to_port         = var.app_port
    security_groups = [aws_security_group.lb.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-ecs-sg"
  })
}

# Database security group
resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-db-sg"
  description = "Controls access to the database"
  vpc_id      = aws_vpc.main.id

  # Only allow PostgreSQL from ECS tasks
  ingress {
    description     = "Database access from ECS"
    protocol        = "tcp"
    from_port       = var.db_port
    to_port         = var.db_port
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # Allow outbound for RDS maintenance if needed
  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db-sg"
  })
}
