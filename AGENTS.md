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
