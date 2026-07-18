import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AwsCdkWorkflowProjectStack } from './app-stack';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get values from environment variables (REPLACE THE HARDCODED VALUES)
    const githubRepo = process.env.GITHUB_REPO || 'StacyJoyM/aws-cdk-workflow-capstone4';
    const connectionArn = process.env.GITHUB_CONNECTION_ARN || 'arn:aws:codeconnections:us-east-1:654129064706:connection/ea5920fc-a126-4814-ae30-0563bd906aba';
    
    if (!connectionArn || connectionArn.includes('YOUR_CONNECTION_ARN')) {
      throw new Error('GITHUB_CONNECTION_ARN environment variable must be set');
    }

    console.log(`Using GitHub repo: ${githubRepo}`);
    console.log(`Using connection ARN: ${connectionArn}`);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'WorkflowPipeline',
      synth: new pipelines.ShellStep('Synth', {
        // CHANGE THIS LINE - use variables instead of hardcoded strings
        input: pipelines.CodePipelineSource.connection(githubRepo, 'main', {
          connectionArn: connectionArn  // CHANGE THIS LINE too
        }),
        commands: [
          // Debug environment
          'echo "=== Environment Debug ==="',
          'echo "AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION"',
          'echo "CDK_DEFAULT_ACCOUNT: $CDK_DEFAULT_ACCOUNT"',
          'echo "CDK_DEFAULT_REGION: $CDK_DEFAULT_REGION"',
          'aws sts get-caller-identity || echo "AWS CLI not configured"',
          
          // Set environment variables explicitly
          'export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)',
          'export CDK_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}',
          'echo "Set CDK_DEFAULT_ACCOUNT: $CDK_DEFAULT_ACCOUNT"',
          'echo "Set CDK_DEFAULT_REGION: $CDK_DEFAULT_REGION"',
          
          // Install and build
          'npm ci',
          'npm run build',
          
          // Debug before synth
          'echo "=== Files Check ==="',
          'ls -la lib/',
          'ls -la bin/',
          'ls -la lambda/',
          
          // Try synth with verbose output
          'npx cdk synth --verbose'
        ]
      })
    });

    // Add application stage
    pipeline.addStage(new WorkflowStage(this, 'Deploy', {
      env: {
        account: this.account,
        region: this.region,
      }
    }));
  }
}

class WorkflowStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AwsCdkWorkflowProjectStack(this, 'WorkflowStack', {
      env: props?.env
    });
  }
}

