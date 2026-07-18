import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class AwsCdkWorkflowProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Create SSM Parameter
    const configParam = new ssm.StringParameter(this, 'AppGreeting', {
      parameterName: '/app/config/greeting',
      stringValue: 'Hello from CI/CD Automated Infrastructure!',
      description: 'Greeting message for the workflow application'
    });

    // 2. Create Lambda Function
    const workflowLambda = new lambda.Function(this, 'WorkflowTask', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      environment: {
        SSM_PARAMETER_NAME: configParam.parameterName
      }
    });

    // Grant Lambda permissions to read SSM parameter
    configParam.grantRead(workflowLambda);

    // 3. Create Step Functions tasks
    const waitState = new stepfunctions.Wait(this, 'WaitState', {
      time: stepfunctions.WaitTime.duration(cdk.Duration.seconds(2))
    });

    const lambdaTask = new tasks.LambdaInvoke(this, 'InvokeLambdaTask', {
      lambdaFunction: workflowLambda,
      outputPath: '$.Payload'
    });

    // Add retry and error handling
    lambdaTask.addRetry({
      maxAttempts: 3,
      interval: cdk.Duration.seconds(2),
      backoffRate: 2.0
    });

    lambdaTask.addCatch(new stepfunctions.Fail(this, 'TaskFailed', {
      cause: 'Lambda function failed after retries'
    }));

    // 4. Define the workflow
    const definition = waitState.next(lambdaTask);

    const stateMachine =  new stepfunctions.StateMachine(this, 'WorkflowStateMachine', {
      definitionBody: stepfunctions.DefinitionBody.fromChainable(definition),
      timeout: cdk.Duration.minutes(5)
    });

    // Output important ARNs
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.stateMachineArn,
      description: 'Step Functions State Machine ARN'
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: workflowLambda.functionArn,
      description: 'Lambda Function ARN'
    });
  }
}
