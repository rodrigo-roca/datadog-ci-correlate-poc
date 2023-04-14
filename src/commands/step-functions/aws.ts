import {CloudWatchLogs, IAM, StepFunctions} from 'aws-sdk'

import {AWSRequest} from './interfaces'

export const createLogGroup = (cloudWatchLogsClient: CloudWatchLogs, logGroupName: string): AWSRequest => {
  const params = {
    logGroupName,
  }

  return {
    function: cloudWatchLogsClient.createLogGroup(params),
  }
}

export const deleteSubscriptionFilter = (
  cloudWatchLogsClient: CloudWatchLogs,
  filterName: string,
  logGroupName: string
): AWSRequest => {
  const params = {
    filterName,
    logGroupName,
  }

  return {
    function: cloudWatchLogsClient.deleteSubscriptionFilter(params),
  }
}

export const enableStepFunctionLogs = (
  stepFunctionsClient: StepFunctions,
  stepFunction: StepFunctions.DescribeStateMachineOutput,
  logGroupArn: string
): AWSRequest => {
  const params = {
    stateMachineArn: stepFunction.stateMachineArn,
    loggingConfiguration: {
      destinations: [{cloudWatchLogsLogGroup: {logGroupArn}}],
      level: 'ALL',
      includeExecutionData: true,
    },
  }

  return {
    function: stepFunctionsClient.updateStateMachine(params),
    previousParams: {
      stateMachineArn: stepFunction.stateMachineArn,
      loggingConfiguration: stepFunction.loggingConfiguration,
    },
  }
}

export const createLogsAccessPolicy = (
  iamClient: IAM,
  stepFunction: StepFunctions.DescribeStateMachineOutput
): AWSRequest => {
  // according to https://docs.aws.amazon.com/step-functions/latest/dg/cw-logs.html#cloudwatch-iam-policy
  const logsAccessPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'logs:CreateLogDelivery',
          'logs:CreateLogStream',
          'logs:GetLogDelivery',
          'logs:UpdateLogDelivery',
          'logs:DeleteLogDelivery',
          'logs:ListLogDeliveries',
          'logs:PutLogEvents',
          'logs:PutResourcePolicy',
          'logs:DescribeResourcePolicies',
          'logs:DescribeLogGroups',
        ],
        Resource: '*',
      },
    ],
  }

  const params = {
    PolicyDocument: JSON.stringify(logsAccessPolicy),
    PolicyName: buildLogAccessPolicyName(stepFunction),
  }

  return {
    function: iamClient.createPolicy(params),
  }
}

const buildLogAccessPolicyName = (stepFunction: StepFunctions.DescribeStateMachineOutput): string => {
  return `LogsDeliveryAccessPolicy-${stepFunction.name}`
}

export const attachPolicyToStateMachineIamRole = (
  iamClient: IAM,
  stepFunction: StepFunctions.DescribeStateMachineOutput,
  accountId: string
): AWSRequest => {
  const roleName = stepFunction.roleArn.split('/')[1]
  const policyArn = `arn:aws:iam::${accountId}:policy/${buildLogAccessPolicyName(stepFunction)}`

  const params = {
    PolicyArn: policyArn,
    RoleName: roleName,
  }

  return {
    function: iamClient.attachRolePolicy(params),
  }
}

export const describeStateMachine = async (
  stepFunctionsClient: StepFunctions,
  stepFunctionArn: string
): Promise<StepFunctions.DescribeStateMachineOutput> => {
  const params = {stateMachineArn: stepFunctionArn}

  return stepFunctionsClient.describeStateMachine(params).promise()
}

export const describeSubscriptionFilters = (
  cloudWatchLogsClient: CloudWatchLogs,
  logGroupName: string
): Promise<CloudWatchLogs.DescribeSubscriptionFiltersResponse> => {
  const params = {logGroupName}

  return cloudWatchLogsClient.describeSubscriptionFilters(params).promise()
}

export const listTagsForResource = async (
  stepFunctionsClient: StepFunctions,
  stepFunctionArn: string
): Promise<StepFunctions.ListTagsForResourceOutput> => {
  const params = {resourceArn: stepFunctionArn}

  return stepFunctionsClient.listTagsForResource(params).promise()
}

export const putSubscriptionFilter = (
  cloudWatchLogsClient: CloudWatchLogs,
  forwarderArn: string,
  filterName: string,
  logGroupName: string
): AWSRequest => {
  const params = {
    destinationArn: forwarderArn,
    filterName,
    filterPattern: '',
    logGroupName,
  }

  return {
    function: cloudWatchLogsClient.putSubscriptionFilter(params),
  }
}

export const tagResource = (
  stepFunctionsClient: StepFunctions,
  stepFunctionArn: string,
  tags: StepFunctions.TagList
): AWSRequest => {
  const params = {
    resourceArn: stepFunctionArn,
    tags,
  }

  return {
    function: stepFunctionsClient.tagResource(params),
  }
}

export const untagResource = (
  stepFunctionsClient: StepFunctions,
  stepFunctionArn: string,
  tagKeys: StepFunctions.TagKeyList
): AWSRequest => {
  const params = {
    resourceArn: stepFunctionArn,
    tagKeys,
  }

  return {
    function: stepFunctionsClient.untagResource(params),
  }
}
