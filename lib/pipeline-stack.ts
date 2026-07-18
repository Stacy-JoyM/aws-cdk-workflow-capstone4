import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubRepo = 'Stacy-JoyM/aws-cdk-workflow-capstone4';
    const githubConnectionArn = 'arn:aws:codeconnections:us-east-1:654129064706:connection/ea5920fc-a126-4814-ae30-0563bd906aba';

    // Create artifacts
    const sourceOutput = new codepipeline.Artifact();

    // Create CodeBuild project for build AND deploy
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 18
            },
            commands: [
              'echo "Node version:"',
              'node --version',
              'npm --version',
              'echo "Installing project dependencies..."',
              'npm install',
              'echo "Installing Lambda dependencies..."',
              'cd lambda && npm install && cd ..'
            ]
          },
          pre_build: {
            commands: [
              'echo "Setting up environment variables..."',
              'export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)',
              'export CDK_DEFAULT_REGION=us-east-1'
            ]
          },
          build: {
            commands: [
              'echo "Building the project..."',
              'npm run build',
              'echo "Deploying with CDK..."',
              'npx cdk deploy AwsCdkWorkflowProjectStack --require-approval never'
            ]
          }
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
    });

    // Add comprehensive permissions for CDK deployment
    buildProject.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sts:AssumeRole',
        'cloudformation:*',
        'iam:*',
        's3:*',
        'ssm:*',
        'ec2:*',
        'lambda:*',
        'apigateway:*',
        'logs:*',
        'states:*'
      ],
      resources: ['*'],
    }));

    // Create simplified pipeline with just Source and Build/Deploy
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'AwsCdkWorkflowPipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: `${githubRepo.replace('/', '_')}_Source`,
              owner: githubRepo.split('/')[0],
              repo: githubRepo.split('/')[1],
              branch: 'main',
              output: sourceOutput,
              connectionArn: githubConnectionArn,
            }),
          ],
        },
        {
          stageName: 'BuildAndDeploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'BuildAndDeploy',
              project: buildProject,
              input: sourceOutput,
            }),
          ],
        },
      ],
    });
  }
}
