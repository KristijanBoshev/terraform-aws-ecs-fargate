#!/bin/bash
set -e

# Usage function
usage() {
  echo "Usage: $0 <ecr-repo-name> <aws-region>"
  echo ""
  echo "Arguments:"
  echo "  ecr-repo-name   Name of the ECR repository (e.g., my-repo)"
  echo "  aws-region      AWS region (e.g., us-east-1)"
  echo ""
  echo "Example:"
  echo "  $0 my-repo us-east-1"
  exit 1
}

# Validate arguments
if [ $# -ne 2 ]; then
  echo "Error: Exactly 2 arguments required"
  usage
fi

ECR_REPO="$1"
AWS_REGION="$2"


echo "Checking if ECR repository exists..."
if aws ecr describe-repositories --repository-names ${ECR_REPO} --region ${AWS_REGION} 2>/dev/null; then
  echo "ECR repository ${ECR_REPO} already exists, skipping creation"
else
  echo "Creating ECR repository ${ECR_REPO} in ${AWS_REGION}"
  aws ecr create-repository \
    --repository-name ${ECR_REPO} \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256

  echo "ECR repository created successfully"
fi

echo ""
echo "Add to your terraform.tfvars:"
echo "  ecr_repository_name = \"${ECR_REPO}\""