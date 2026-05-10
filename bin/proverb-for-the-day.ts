#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { LemuelUserManagementStack } from "../lib/lemuel-user-management-stack";
import { ProverbForTheDayStack } from "../lib/proverb-for-the-day-stack";

const app = new cdk.App();

const env = { account: "640223110844", region: "eu-west-2" };

const userManagementStack = new LemuelUserManagementStack(app, "LemuelUserManagementStack", { env });
new ProverbForTheDayStack(app, "ProverbForTheDayStack", {
  env,
  userPoolId: userManagementStack.userPool.userPoolId,
});
