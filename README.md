# Multi-function packager tool - Amazon CloudFront

This tool allows you to package multiple Edge Functions - Lambda@Edge or CloudFront Functions into a single function with minimal code changes.

## Pre-requisites:

1. Install 'CDK'.
1. Install 'NPM'.
1. Install 'AWS CLI' and configure default profile with necessary permissions to deploy resources.

## Steps to build

1. Clone and deploy the CDK solution in AWS N.Virginia region (*us-east-1)*

git clone https://github.com/aws-samples/amazon-cloudfront-multi-function-packager

2. Change into the directory and run below commands
- `cd amazon-cloudfront-multi-function-package`
- `npm install`
- `cdk deploy`

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
