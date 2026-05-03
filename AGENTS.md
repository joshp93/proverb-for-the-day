# Proverb for the day backend

This is the backend for a mobile app called lemuel (previously Proverb for the day), which displays a daily proverb and encourages users to meditate on it.

This is a AWS CDK project, using typescipt and pnpm. It includes:

- [load-proverbs](./src/load-proverbs/index.ts) lambda function which is designed to accept a json file like [this](./test/src//load-proverbs/test-data/kjv.json) and load it into Dynamo DB
- [choose-proverb](./src/choose-proverb/index.ts) which chooses a random proverb from the DB and sets it as the daily proverb
- [get-proverb](./src/get-proverb/index.ts) which is used as the lambda integration function for the rest api defined in the stack, which simply retrieves the daily proverb and returns it in json format
- [lemuel-cognito](./src/lemuel-cognito/index.ts) lambda function handling authentication endpoints:
  - `/auth/sign-up` - User registration
  - `/auth/sign-in` - User login (via Admin API)
  - `/auth/forgot-password` - Request password reset
  - `/auth/confirm-forgot-password` - Confirm password reset

The stack is [here](./lib/proverb-for-the-day-stack.ts)

## Authentication

The stack includes a Cognito User Pool for user authentication:

- Email-based sign-up and sign-in
- Forgot password flow with email verification

The Lemuel Cognito Lambda handles authentication via Cognito's Admin API using `ADMIN_USER_PASSWORD_AUTH`. The Lambda authenticates with Cognito using its IAM role, which provides secure backend authentication without requiring client-side SDKs.

Please keep this file up to date as you make changes.

## Testing

This project uses jest for tests. We mock the AWS clients using aws-sdk-client-mock.

Sometimes you might see type errors like the below. The fix for this is to: Permenantly delete the node_modules folder and all content. Delete the pnpm-lock file, re-run `pnpm i`. If you see an error like this and you can't fix it with the above, don't try to fix it, stop and tell the developer.

```
Argument of type 'typeof BatchWriteCommand' is not assignable to parameter of type 'new (input: BatchWriteCommandInput) => AwsCommand<any, any, any, any>'.
  Types of construct signatures are incompatible.
    Type 'new (input: BatchWriteCommandInput) => BatchWriteCommand' is not assignable to type 'new (input: BatchWriteCommandInput) => AwsCommand<any, any, any, any>'.
      Construct signature return types 'BatchWriteCommand' and 'AwsCommand<any, any, any, any>' are incompatible.
        The types of 'middlewareStack.add' are incompatible between these types.
          Type '{ (middleware: InitializeMiddleware<BatchWriteItemCommandInput | BatchWriteCommandInput, BatchWriteItemCommandOutput | BatchWriteCommandOutput>, options?: (InitializeHandlerOptions & AbsoluteLocation) | undefined): void; (middleware: SerializeMiddleware<...>, options: SerializeHandlerOptions & AbsoluteLocation): voi...' is not assignable to type '{ (middleware: InitializeMiddleware<any, any>, options?: (InitializeHandlerOptions & AbsoluteLocation) | undefined): void; (middleware: SerializeMiddleware<...>, options: SerializeHandlerOptions & AbsoluteLocation): void; (middleware: BuildMiddleware<...>, options: BuildHandlerOptions & AbsoluteLocation): void; (mid...'.
            Types of parameters 'middleware' and 'middleware' are incompatible.
              Types of parameters 'context' and 'context' are incompatible.
                Type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/middleware").HandlerExecutionContext' is not assignable to type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/middleware").HandlerExecutionContext'.
                  Types of property '[SMITHY_CONTEXT_KEY]' are incompatible.
                    Type '{ [key: string]: unknown; service?: string | undefined; operation?: string | undefined; commandInstance?: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined; selectedHttpAuthScheme?: import("D:/apps/p...' is not assignable to type '{ [key: string]: unknown; service?: string | undefined; operation?: string | undefined; commandInstance?: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined; selectedHttpAuthScheme?: import("D:/apps/...'.
                      Type '{ [key: string]: unknown; service?: string | undefined; operation?: string | undefined; commandInstance?: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined; selectedHttpAuthScheme?: import("D:/apps/p...' is not assignable to type '{ [key: string]: unknown; service?: string | undefined; operation?: string | undefined; commandInstance?: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined; selectedHttpAuthScheme?: import("D:/apps/...'.
                        Types of property 'commandInstance' are incompatible.
                          Type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined' is not assignable to type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any> | undefined'.
                            Type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any>' is not assignable to type 'import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/command").Command<any, any, any, any, any>'.
                              The types of 'middlewareStack.add' are incompatible between these types.
                                Type '{ (middleware: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/middleware").InitializeMiddleware<any, any>, options?: (import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.3.2/node_modules/@smithy/types/dist-types/middleware").Initial...' is not assignable to type '{ (middleware: import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/middleware").InitializeMiddleware<any, any>, options?: (import("D:/apps/proverb-for-the-day/node_modules/.pnpm/@smithy+types@4.14.1/node_modules/@smithy/types/dist-types/middleware").Initi...'.
                                  Types of parameters 'options' and 'options' are incompatible.
                                    Type 'SerializeHandlerOptions & AbsoluteLocation' is not assignable to type '(InitializeHandlerOptions & AbsoluteLocation) | undefined'.
                                      Type 'SerializeHandlerOptions & AbsoluteLocation' is not assignable to type 'InitializeHandlerOptions & AbsoluteLocation'.
                                        Type 'SerializeHandlerOptions & AbsoluteLocation' is not assignable to type 'InitializeHandlerOptions'.
                                          Types of property 'step' are incompatible.
                                            Type '"serialize"' is not assignable to type '"initialize"'.

38       const call = ddbMock.commandCalls(BatchWriteCommand)[i];
```
