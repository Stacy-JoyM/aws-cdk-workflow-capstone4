#!/bin/bash

# scripts/setup-env.sh
echo "Setting up AWS CDK Workflow Project environment variables..."

# AWS Configuration
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
export CDK_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

# GitHub Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
export GITHUB_REPO="StacyJoyM/aws-cdk-workflow-capstone4"
export GITHUB_CONNECTION_ARN="arn:aws:codeconnections:us-east-1:654129064706:connection/ea5920fc-a126-4814-ae30-0563bd906aba"

# Validation
if [ -z "$CDK_DEFAULT_ACCOUNT" ]; then
    echo "Error: Could not determine AWS account. Make sure AWS CLI is configured."
    exit 1
fi

if [ -z "$GITHUB_CONNECTION_ARN" ]; then
    echo "Error: GITHUB_CONNECTION_ARN not set"
    exit 1
fi

# Display current settings
echo " Environment variables set:"
echo "   CDK_DEFAULT_ACCOUNT: $CDK_DEFAULT_ACCOUNT"
echo "   CDK_DEFAULT_REGION: $CDK_DEFAULT_REGION"
echo "   GITHUB_REPO: $GITHUB_REPO"
echo "   GITHUB_CONNECTION_ARN: $GITHUB_CONNECTION_ARN"

echo ""
echo " Ready to deploy! Run: npm run deploy:pipeline"
