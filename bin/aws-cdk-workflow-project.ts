#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCdkWorkflowProjectStack } from '../lib/app-stack';
import { PipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

// Deploy the pipeline stack (for CI/CD automation)
new PipelineStack(app, 'WorkflowPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

// For local development/testing (optional - can be removed if only using pipeline)
new AwsCdkWorkflowProjectStack(app, 'AwsCdkWorkflowProjectStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
