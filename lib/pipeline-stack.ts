import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Hardcode values for CodeBuild environment
    const githubRepo = 'Stacy-JoyM/aws-cdk-workflow-capstone4';
    const githubConnectionArn = 'arn:aws:codeconnections:us-east-1:654129064706:connection/ea5920fc-a126-4814-ae30-0563bd906aba';

    console.log(`✅ Using GitHub repo: ${githubRepo}`);
    console.log(`✅ Using connection ARN: ${githubConnectionArn}`);

    // Create artifacts
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    // Create CodeBuild project
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
    });

    // Add permissions for CDK deployment
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
      ],
      resources: ['*'],
    }));

    // Create pipeline
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
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Build',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CloudFormationCreateUpdateStackAction({
              actionName: 'Deploy',
              templatePath: buildOutput.atPath('AwsCdkWorkflowProjectStack.template.json'),
              stackName: 'AwsCdkWorkflowProjectStack',
              adminPermissions: true,
            }),
          ],
        },
      ],
    });
  }
}
