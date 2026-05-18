import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { LemuelUserManagementStack } from "../../lib/lemuel-user-management-stack";

describe("LemuelUserManagementStack", () => {
  it("should match snapshot", () => {
    const app = new cdk.App();
    const stack = new LemuelUserManagementStack(app, "TestStack");
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  it("should create a Cognito User Pool with password authentication", () => {
    const app = new cdk.App();
    const stack = new LemuelUserManagementStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Cognito::UserPool", {
      UserPoolName: "lemuel-user-pool",
      Schema: [
        {
          Name: "email",
          Required: true,
          Mutable: true,
        },
      ],
    });
  });

  it("should create a Cognito User Pool Client with password auth flow", () => {
    const app = new cdk.App();
    const stack = new LemuelUserManagementStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
      GenerateSecret: false,
    });

    // Verify password auth flow is included
    const match = template.findResources("AWS::Cognito::UserPoolClient");
    const clientProps = Object.values(match)[0].Properties;
    expect(clientProps.ExplicitAuthFlows).toContain("ALLOW_USER_PASSWORD_AUTH");
  });

  it("should create a Cognito User Pool Domain", () => {
    const app = new cdk.App();
    const stack = new LemuelUserManagementStack(app, "TestStack");
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Cognito::UserPoolDomain", {
      Domain: "lemuel",
    });
  });

  it("should expose userPool, userPoolClient, and userPoolDomain as public members", () => {
    const app = new cdk.App();
    const stack = new LemuelUserManagementStack(app, "TestStack");

    expect(stack.userPool).toBeDefined();
    expect(stack.userPoolClient).toBeDefined();
    expect(stack.userPoolDomain).toBeDefined();
  });
});
