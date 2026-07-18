#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { execSync } from 'child_process';
import { AwsCdkWorkflowProjectStack } from '../lib/app-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// Function to get AWS account ID dynamically
function getAwsAccount(): string {
  try {
    if (process.env.CDK_DEFAULT_ACCOUNT) {
      return process.env.CDK_DEFAULT_ACCOUNT;
    }
    return execSync('aws sts get-caller-identity --query Account --output text', { 
      encoding: 'utf8' 
    }).trim();
  } catch (error) {
    throw new Error('Failed to get AWS account ID. Make sure AWS CLI is configured and you have valid credentials.');
  }
}

// Function to get AWS region dynamically
function getAwsRegion(): string {
  try {
    if (process.env.CDK_DEFAULT_REGION) {
      return process.env.CDK_DEFAULT_REGION;
    }
    if (process.env.AWS_DEFAULT_REGION) {
      return process.env.AWS_DEFAULT_REGION;
    }
    const region = execSync('aws configure get region', { 
      encoding: 'utf8' 
    }).trim();
    
    if (region) {
      return region;
    }
    
    return 'us-east-1';
  } catch (error) {
    console.warn('Could not determine region from AWS CLI, using us-east-1 as default');
    return 'us-east-1';
  }
}

// Get values dynamically
const account = getAwsAccount();
const region = getAwsRegion();

console.log(` Deploying to account: ${account}, region: ${region}`);

// Validate required environment variables for pipeline
const requiredEnvVars = ['GITHUB_REPO', 'GITHUB_CONNECTION_ARN'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`  Missing environment variables: ${missingVars.join(', ')}`);
  console.warn('   Run: npm run setup-env');
}

// Deploy the pipeline stack (for CI/CD automation)
new PipelineStack(app, 'WorkflowPipelineStack', {
  env: { account, region },
});

// For local development/testing
new AwsCdkWorkflowProjectStack(app, 'AwsCdkWorkflowProjectStack', {
  env: { account, region },
});
