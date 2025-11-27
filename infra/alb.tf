resource "aws_alb" "main" {
  name            = local.alb_name
  subnets         = aws_subnet.public[*].id
  security_groups = [aws_security_group.lb.id]

  tags = merge(local.common_tags, {
    Name = local.alb_name
  })
}

resource "aws_alb_target_group" "app" {
  name        = local.target_group_name
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    healthy_threshold   = "3"
    interval            = "30"
    protocol            = "HTTP"
    matcher             = "200"
    timeout             = "3"
    path                = var.health_check_path
    unhealthy_threshold = "2"
    port                = var.app_port
  }
  tags = merge(local.common_tags, {
    Name = local.target_group_name
  })
}

# HTTP listener that redirects to HTTPS
resource "aws_alb_listener" "http_redirect" {
  load_balancer_arn = aws_alb.main.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS listener with SSL certificate
resource "aws_alb_listener" "https" {
  load_balancer_arn = aws_alb.main.id
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn

  default_action {
    target_group_arn = aws_alb_target_group.app.id
    type             = "forward"
  }
}
