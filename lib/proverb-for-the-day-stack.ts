import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
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

    const userPool = new cognito.UserPool(this, "lemuel-user-pool", {
      userPoolName: "lemuel-user-pool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      "lemuel-web-client",
      {
        userPool: userPool,
        authFlows: {
          userSrp: true,
        },
        generateSecret: false,
      },
    );

    const cognitoLambda = new lambda.Function(this, "lemuel-cognito", {
      functionName: "lemuel-cognito",
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("dist/lemuel-cognito"),
      environment: {
        COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
        COGNITO_USER_POOL_ID: userPool.userPoolId,
      },
    });

    userPool.grant(cognitoLambda, "cognito-idp:AdminInitiateAuth");

    // Uncomment this when we have an auth protected endpoint ready to go.
    // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
    //   this,
    //   "lemuel-authorizer",
    //   {
    //     cognitoUserPools: [userPool],
    //   },
    // );

    api.root
      .addResource("{version}")
      .addMethod("GET", new apigateway.LambdaIntegration(getProverb), {
        authorizationType: apigateway.AuthorizationType.NONE,
      });

    const auth = api.root.addResource("auth");
    auth
      .addResource("sign-up")
      .addMethod("POST", new apigateway.LambdaIntegration(cognitoLambda));
    auth
      .addResource("sign-in")
      .addMethod("POST", new apigateway.LambdaIntegration(cognitoLambda));
    auth
      .addResource("forgot-password")
      .addMethod("POST", new apigateway.LambdaIntegration(cognitoLambda));
    auth
      .addResource("confirm-forgot-password")
      .addMethod("POST", new apigateway.LambdaIntegration(cognitoLambda));

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
    table.grantReadWriteData(loadProverbsLambda);
    table.grantReadData(getProverb);

    new events.Rule(this, "proverb-for-the-day-schedule", {
      ruleName: "proverb-for-the-day-schedule",
      schedule: events.Schedule.cron({ minute: "0", hour: "0" }),
      targets: [new targets.LambdaFunction(chooseProverb)],
    });
  }
}
