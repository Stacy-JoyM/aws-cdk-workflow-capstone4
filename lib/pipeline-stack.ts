import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { AwsCdkWorkflowProjectStack } from './app-stack';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use CDK Pipelines - handles assets automatically!
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'AwsCdkWorkflowPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection('Stacy-JoyM/aws-cdk-workflow-capstone4', 'main', {
          connectionArn: 'arn:aws:codeconnections:us-east-1:654129064706:connection/ea5920fc-a126-4814-ae30-0563bd906aba',
        }),
        commands: [
          'echo "Installing dependencies..."',
          'npm install',
          'cd lambda && npm install && cd ..',
          'echo "Building project..."',
          'npm run build',
          'echo "Synthesizing CDK..."',
          'npx cdk synth'
        ],
      }),
    });

    // Add the application stage
    pipeline.addStage(new AppStage(this, 'Deploy'));
  }
}

// Application Stage
class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new AwsCdkWorkflowProjectStack(this, 'AwsCdkWorkflowProjectStack');
  }
}
