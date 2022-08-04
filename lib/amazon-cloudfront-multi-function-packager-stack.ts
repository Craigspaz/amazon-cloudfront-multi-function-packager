import { Duration,Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class AmazonCloudfrontMultiFunctionPackagerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    let s3Bucket = new s3.Bucket(this, 'mfp-artifacts');
    // 👇 Lambda Chainer Function definition
    let lambdaFunctionChainer = new lambda.Function(this, 'LambdaFunctionChainer', {
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 128,
      timeout: Duration.seconds(4),
      handler: 'lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda-functions/chainer-function')),
    });

    // 👇 Create IAM Permission Policy
    const customPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: ['*'],
          actions: ['iam:ListAttachedRolePolicies','iam:CreateRole','iam:AttachRolePolicy'],
        }),
        new iam.PolicyStatement({
          resources: [s3Bucket.bucketArn],
          actions: ['s3:PutObject','s3:GetObject'],
        }),
      ],
    });

    let customRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        customPolicy: customPolicy,
      },
      managedPolicies:[
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'IAMReadOnlyAccess',
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AWSLambda_ReadOnlyAccess',
        ),
      ],
    });

    // 👇 Lambda Function Assemble helper
    let lambdaFunctionAssembly = new lambda.Function(this, 'LambdaFunctionAssembly', {
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 1024,
      timeout: Duration.seconds(120),
      handler: 'lambda_function.lambda_handler',
      role: customRole,
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/lambda-functions/assembly-lambda-function/')),
      environment: {
        LAMBDA_CHAINER_ARN: lambdaFunctionChainer.functionArn,
        S3_BUCKET: s3Bucket.bucketName,
        STACK_NAME: this.stackName
      },
    });

    // 👇 CloudFront Function Assemble helper
    let cfFunctionAssembly = new lambda.Function(this, 'CloudFrontFunctionAssembly', {
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 512,
      timeout: Duration.seconds(120),
      handler: 'lambda_function.lambda_handler',
      role: customRole,
      code: lambda.Code.fromAsset(path.join(__dirname, '/../src/lambda-functions/assembly-function/')),
      environment: {
        S3_BUCKET: s3Bucket.bucketName,
        STACK_NAME: this.stackName
      },
    });
  }
}
