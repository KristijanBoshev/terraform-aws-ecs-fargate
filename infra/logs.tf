# Set up CloudWatch group and log stream and retain logs for 30 days
resource "aws_cloudwatch_log_group" "app" {
  name              = local.log_group_name
  retention_in_days = 30

  tags = merge(local.common_tags, {
    Name = local.log_group_name
  })
}

resource "aws_cloudwatch_log_stream" "app" {
  name           = "${local.name_prefix}-log-stream"
  log_group_name = aws_cloudwatch_log_group.app.name
}
