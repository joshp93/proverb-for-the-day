import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ProverbForTheDayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "proverbs-store", {
      tableName: "proverbs-store",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const chooseProverb = new lambda.Function(this, "choose-proverb", {
      functionName: "choose-proverb",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("dist/choose-proverb"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const getProverb = new lambda.Function(this, "get-proverb", {
      functionName: "get-proverb",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("dist/get-proverb"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const api = new apigateway.RestApi(this, "proverb-for-the-day-api", {
      restApiName: "proverb-for-the-day-api",
    });

    api.root
      .addResource("{version}")
      .addMethod("GET", new apigateway.LambdaIntegration(getProverb), {
        authorizationType: apigateway.AuthorizationType.NONE,
      });

    const loadProverbsLambda = new lambda.Function(this, "load-proverbs", {
      functionName: "load-proverbs",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("dist/load-proverbs"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(chooseProverb);
    table.grantWriteData(loadProverbsLambda);
    table.grantReadData(getProverb);

    new events.Rule(this, "proverb-for-the-day-schedule", {
      ruleName: "proverb-for-the-day-schedule",
      schedule: events.Schedule.cron({ minute: "0", hour: "0" }),
      targets: [new targets.LambdaFunction(chooseProverb)],
    });
  }
}
