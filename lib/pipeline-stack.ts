import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AwsCdkWorkflowProjectStack } from './app-stack';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get values from environment variables - NO HARDCODED FALLBACKS
    const githubRepo = process.env.GITHUB_REPO;
    const connectionArn = process.env.GITHUB_CONNECTION_ARN;
    
    // Validation
    if (!githubRepo) {
      throw new Error('GITHUB_REPO environment variable must be set. Run: npm run setup-env');
    }
    
    if (!connectionArn) {
      throw new Error('GITHUB_CONNECTION_ARN environment variable must be set. Run: npm run setup-env');
    }

    console.log(` Using GitHub repo: ${githubRepo}`);
    console.log(` Using connection ARN: ${connectionArn}`);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'WorkflowPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(githubRepo, 'main', {
          connectionArn: connectionArn
        }),
        commands: [
          // Debug environment and versions
          'echo "=== Environment Debug ==="',
          'node --version',
          'npm --version',
          'echo "AWS_DEFAULT_REGION: $AWS_DEFAULT_REGION"',
          'echo "CDK_DEFAULT_ACCOUNT: $CDK_DEFAULT_ACCOUNT"',
          'echo "CDK_DEFAULT_REGION: $CDK_DEFAULT_REGION"',
          'pwd',
          'ls -la',
          
          // Check package files
          'echo "=== Package Files Check ==="',
          'ls -la package*.json || echo "Package files missing"',
          'cat package.json || echo "Cannot read package.json"',
          
          // Set environment variables explicitly
          'export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)',
          'export CDK_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}',
          'echo "Set CDK_DEFAULT_ACCOUNT: $CDK_DEFAULT_ACCOUNT"',
          'echo "Set CDK_DEFAULT_REGION: $CDK_DEFAULT_REGION"',
          
          // Install dependencies with detailed output
          'echo "=== Installing Dependencies ==="',
          'npm ci --verbose || (echo "npm ci failed, trying npm install" && npm install --verbose)',
          
          // Build with error handling
          'echo "=== Building Project ==="',
          'npm run build || (echo "Build failed, checking TypeScript files" && ls -la lib/ && ls -la bin/)',
          
          // Debug before synth
          'echo "=== Files Check After Build ==="',
          'ls -la lib/ || echo "No lib directory"',
          'ls -la bin/ || echo "No bin directory"',
          'ls -la lambda/ || echo "No lambda directory"',
          
          // CDK synth with verbose output
          'echo "=== CDK Synth ==="',
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

