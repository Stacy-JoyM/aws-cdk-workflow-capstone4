# Welcome to your CDK TypeScript project
## Deliverables : A complete AWS cloud serverless using CDK 

### What Was Accomplished 

1.Infrastructure As Code(CDK)
2.CI/CD Pipeline
3.Serverless Workflow 
4.Problem Solving and Debugging 

## How Infrastructure As Code was Implemented 
### 1.Project Initialization 

npx create-cdk-app aws-cdk-workflow-project --language=typescript
cd aws-cdk-workflow-project

npm install

### 2. CDK Stack Definition 
The CDK stack was defined in lib/app-stack.ts. The file includes imports for lambda, cdk , step functions and ssm 
Inside the stack class within the file is a collection of AWS resources such as the SSM Parameter Store , Lambda Functions, IAM permissions, Step Function Tasks , Step Function State Machine.

The SSM Parameter Store AWS Resource is used to store the value of the greeting variable : "Hello from AWS CDK Workflow!"

The IAM Permissions grant permissions for lambda to read the SSM parameter

Step Function Task calls the Lambda Function 

##### CDK Code Structure 
lib/app-stack.ts (main infrastructure code)
lambda/index.js (Lambda function code)
lib/pipeline-stack.ts (CI/CD pipeline)


### 3. Infrastructure Resources 
#### Lambda Resources 
![Lambda](FC609AF2-204D-4BC2-80CE-AF91FF6C9FBD-1.jpeg)
#### Step Functions Console 
![Step Functions](9858A389-3BF9-46E7-B6EE-4CA2090BD37C_1_105_c.jpeg)
#### SSM Console 
![greeting_parameter](90951E8B-F862-443F-B878-09665666A740_1_105_c.jpeg)
![cdk_parameter](90951E8B-F862-443F-B878-09665666A740_1_105_c-1.jpeg)
#### IAM Console 
![IAM_role](DB7A0C97-2B03-4AAE-865C-ECC4A7BEF900_1_105_c.jpeg)

### 4. Pipeline Success 
![Pipeline Success](E74C61AF-948A-44AB-8E94-9AA77EE70DB8.jpeg)

### 5. Working Application 
#### Step Function Execution 
![step_function_execution](FF9DA6B7-C2CD-4EB2-B9C0-56AAE388B54E_1_105_c.jpeg)
![step_function_graph](2EDE0185-9F0D-4735-BE1E-9156F5F6689B_1_105_c.jpeg)

#### Lambda Test Succeeding
![lamda_test_succeeding](BA8BC71D-B1F6-4E7C-8961-E2F4514DE024_1_105_c.jpeg)

#### Cloudwatch Logs 
![cloudwatch_logs](75B48BFD-C2DA-4BD0-B9EC-B73A3D20DC4B_1_105_c.jpeg)


### 6 . CDK Synthesis Output 
CDK Synthesis is the process of converting your TypeScript Infrastructure as Code into AWS CloudFormation templates that can be deployed to AWS.

After, running npx cdk synth , it displays two stacks : WorkflowPipelineStack, AwsCdkWorkflowProjectStack
![npx-cdk-synth](3B4EBB54-25E3-4CF5-8632-7E9714F7754C.jpeg)

The stacks are inside the cdk.out folder 
![cdk-out](08000F4D-01CE-4686-9677-5AF353EA077A.jpeg)

View Main Application after running npx cdk synth AwsCdkWorkflowProjectStack. The terminal shows a Cloudformation JSON with:
-Lambda function definition
-Step Functions state machine
-SSM parameter
-IAM roles and policies
![alt text](CCF60A44-2BA9-4646-9D05-B446B146E34C.jpeg)
![alt text](604D61A3-668F-4179-9F00-FC4EFBE7B6D4.jpeg)
![alt text](CB231434-8C2F-45EB-9F7C-898141730243.jpeg)
![alt text](8BD5B46F-3D68-4F9C-8BA2-DAD0BB790C34.jpeg)


View Pipeline stack after running npx cdk synth WorkflowPipelineStack. The terminal shows a Cloudformation JSON for CI/CD Pipe;ine which ultimately indicates : 
-Successful Infrastructure as Code
-Two Stack Architecture
-No blocking errors 

![alt text](AA13548F-3256-4FB7-83A2-D9D3F66695F5.jpeg)
![alt text](17428A20-EA21-4674-BC88-B4F55B824D01.jpeg)
![alt text](8D29D2F1-EFAD-4159-884A-5C3409288F24.jpeg)

The Pipeine Stages included : 
![alt text](5B39D423-8B53-4662-AA56-39A1C948838B-1.jpeg)
![alt text](3BBBE653-F017-4898-B9CD-BF84E50E347D.jpeg)
![alt text](5CBD71FD-28DF-47F9-89A1-C8452DF87E60.jpeg)
![alt text](ECD86370-E64D-4D20-900C-99708B924EBD.jpeg)

