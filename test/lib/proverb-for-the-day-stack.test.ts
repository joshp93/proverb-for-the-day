import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ProverbForTheDayStack } from "../../lib/proverb-for-the-day-stack";

describe("ProverbForTheDayStack", () => {
  it("should match snapshot", () => {
    const app = new cdk.App();
    const stack = new ProverbForTheDayStack(app, "TestStack");
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  it("should create a DynamoDB table for proverbs", () => {
    const app = new cdk.App();
    const stack = new ProverbForTheDayStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::DynamoDB::Table", {
      TableName: "proverbs-store",
      KeySchema: [
        { AttributeName: "pk", KeyType: "HASH" },
        { AttributeName: "sk", KeyType: "RANGE" },
      ],
      BillingMode: "PAY_PER_REQUEST",
    });
  });

  it("should create Lambda functions for choose-proverb, get-proverb, and load-proverbs", () => {
    const app = new cdk.App();
    const stack = new ProverbForTheDayStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "choose-proverb",
      Runtime: "nodejs22.x",
    });

    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "get-proverb",
      Runtime: "nodejs22.x",
    });

    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "load-proverbs",
      Runtime: "nodejs22.x",
    });
  });

  it("should create a REST API", () => {
    const app = new cdk.App();
    const stack = new ProverbForTheDayStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "proverb-for-the-day-api",
    });
  });

  it("should create an EventBridge rule for daily schedule", () => {
    const app = new cdk.App();
    const stack = new ProverbForTheDayStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Events::Rule", {
      Name: "proverb-for-the-day-schedule",
      ScheduleExpression: "cron(0 0 * * ? *)",
      State: "ENABLED",
    });
  });
});
