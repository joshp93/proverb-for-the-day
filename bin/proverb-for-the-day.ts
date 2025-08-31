#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProverbForTheDayStack } from "../lib/proverb-for-the-day-stack";

const app = new cdk.App();
new ProverbForTheDayStack(app, "ProverbForTheDayStack", {
  env: { account: "640223110844", region: "eu-west-2" },
});
