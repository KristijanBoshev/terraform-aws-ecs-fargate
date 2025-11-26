# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-db"

  # Engine and version
  engine         = "postgres"
  instance_class = var.db_instance_class

  # Storage configuration
  allocated_storage     = 20
  max_allocated_storage = 20
  storage_type          = "gp2"
  storage_encrypted     = false

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = var.db_port

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false

  # MINIMAL backup configuration
  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Cost-saving options
  skip_final_snapshot      = true  # Don't create snapshot on destroy
  delete_automated_backups = true  # Clean up backups on delete
  deletion_protection      = false # Allow easy deletion for dev

  # Performance - cheapest options
  multi_az                   = false
  auto_minor_version_upgrade = true

  monitoring_interval             = 0
  enabled_cloudwatch_logs_exports = [] # Disable log exports
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-db"
  })
}
