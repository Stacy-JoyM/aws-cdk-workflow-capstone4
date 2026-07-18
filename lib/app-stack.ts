import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as stepfunctionsTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class AwsCdkWorkflowProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create SSM Parameter
    const greetingParameter = new ssm.StringParameter(this, 'GreetingParameter', {
      parameterName: '/workflow/greeting',
      stringValue: 'Hello from AWS CDK Workflow!',
      description: 'Greeting message for the workflow'
    });

    // Create Lambda function with Node.js 20.x
    const workflowTask = new lambda.Function(this, 'WorkflowTask', {
      runtime: lambda.Runtime.NODEJS_20_X,  // Updated to Node.js 20.x
      handler: 'index.handler',              // Ensure correct handler
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        SSM_PARAMETER_NAME: greetingParameter.parameterName
      },
      timeout: cdk.Duration.seconds(30)
    });

    // Grant Lambda permission to read the SSM parameter
    greetingParameter.grantRead(workflowTask);

    // Create Lambda task for Step Functions
    const lambdaTask = new stepfunctionsTasks.LambdaInvoke(this, 'InvokeLambdaTask', {
      lambdaFunction: workflowTask,
      outputPath: '$.Payload',
      retryOnServiceExceptions: true
    });

    // Create failure state
    const taskFailed = new stepfunctions.Fail(this, 'TaskFailed', {
      cause: 'Lambda function failed after retries',
      error: 'Fail state executed'
    });

    // Create success state
    const taskSucceeded = new stepfunctions.Succeed(this, 'TaskSucceeded', {
      comment: 'Workflow completed successfully'
    });

    // Define the state machine with proper error handling
    const definition = lambdaTask
      .addRetry({
        errors: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException'],
        interval: cdk.Duration.seconds(2),  // Fixed: use 'interval' not 'intervalSeconds'
        maxAttempts: 3,
        backoffRate: 2.0
      })
      .addCatch(taskFailed, {               // Fixed: addCatch on the task, not the chain
        errors: ['States.ALL']
      })
      .next(taskSucceeded);

    // Create Step Functions state machine
    const stateMachine = new stepfunctions.StateMachine(this, 'WorkflowStateMachine', {
      definition,
      timeout: cdk.Duration.minutes(5)
    });

    // Output the state machine ARN
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.stateMachineArn,
      description: 'Step Functions State Machine ARN'
    });
  }
}
