# Hydropass-SAM

Serverless backend that you can deploy with the AWS Serverless Application Model (AWS SAM) command line interface (CLI). It includes the following files and folders:

- `src` - Code for the application's Lambda functions.
- `events` - Invocation events that you can use to invoke the functions.
- `__tests__` - Unit tests for the application code.
- `templates` - Nested templates referenced in the main SAM template.yaml file.
- `template.yaml` - The main SAM template that defines the application's AWS resources.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit extension, [available in VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html).

## Sync your application to the cloud

AWS SAM Prerequisites:

- AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
- Node.js - [Install Node.js 18](https://nodejs.org/en/), including the npm package management tool.
- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

To sync the application to the cloud, you can use the AWS: Sync SAM Application command in the AWS Toolkit for VS Code. When prompted, select the following options:

1. **AWS Region** - us-west-2
2. **SAM Cloudformation Template** - template.yaml
3. **CloudFormation Stack** - hydropass-root-cf-stack
4. **S3 Bucket** - hydropass-sam-dev-bucket-01

The AWS Toolkit for VS Code uses the AWS SAM CLI to deploy your application to AWS. The AWS SAM CLI builds a deployment package, uploads it to an S3 bucket, and creates a CloudFormation stack that includes the application's AWS resources.

## Use the AWS SAM CLI to build and test locally

Build your application by using the `sam build` command.

```bash
my-application$ sam build
```

The AWS SAM CLI installs dependencies that are defined in `package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
$ sam local invoke putUserFunction --event events/event-post-user.json
$ sam local invoke getAllIUsersFunction --event events/event-get-all-users.json
```

The AWS SAM CLI can also emulate your application's API. Use the `sam local start-api` command to run the API locally on port 3000.

```bash
my-application$ sam local start-api
my-application$ curl http://localhost:3000/
```

## Fetch, tail, and filter Lambda function logs

To simplify troubleshooting, the AWS SAM CLI has a command called `sam logs`. `sam logs` lets you fetch logs that are generated by your Lambda function from the command line. In addition to printing the logs on the terminal, this command has several nifty features to help you quickly find the bug.

**NOTE:** This command works for all Lambda functions, not just the ones you deploy using AWS SAM.

**NOTE:** This uses the logical name of the function within the stack. This is the correct name to use when searching logs inside an AWS Lambda function within a CloudFormation stack, even if the deployed function name varies due to CloudFormation's unique resource name generation.

You can find more information and examples about filtering Lambda function logs in the [AWS SAM CLI documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html).

## Unit tests

Tests are defined in the `__tests__` folder in this project. Use `npm` to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
my-application$ npm install
my-application$ npm test
```

## Cleanup

To delete the application from the cloud, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name hydropass-sam-cf-stack
```
