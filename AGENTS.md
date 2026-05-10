# Proverb for the day backend

This is an AWS CDK project using TypeScript and pnpm. It includes two stacks:

## Stacks

### LemuelUserManagementStack (`lib/lemuel-user-management-stack.ts`)
- Cognito User Pool for user authentication
- User Pool Client with SRP authentication
- User Pool Domain for hosted UI

### ProverbForTheDayStack (`lib/proverb-for-the-day-stack.ts`)
- DynamoDB table for storing proverbs
- Lambda functions:
  - `load-proverbs` - loads proverbs into DynamoDB from JSON
  - `choose-proverb` - selects random daily proverb
  - `get-proverb` - retrieves the daily proverb
  - `check-user-exists` - checks if a user exists in Cognito
- REST API Gateway endpoints:
  - `GET /{version}` - returns daily proverb
  - `POST /auth/check-user-exists` - checks user existence (rate limited)
- EventBridge rule for daily proverb selection

## API Endpoints

- `GET /{version}` - Returns daily proverb (no auth required)
- `POST /auth/check-user-exists` - Checks if user exists in Cognito
  - Request: `{"email": "user@example.com"}`
  - Response: `{"exists": true}` or `{"exists": false}`
  - Rate limited: 10 req/s, 20 burst, 10,000/day

## Environment Variables

Lambda functions use Zod schemas to validate environment variables at runtime.

## Testing

This project uses jest with aws-sdk-client-mock. Please don't run user tests unless the developer asks as this slows down the feedback loop.

```
Argument of type 'typeof BatchWriteCommand' is not assignable to parameter of type 'new (input: BatchWriteCommandInput) => AwsCommand<any, any, any, any>'.
...
```
The fix for this type error is to permanently delete node_modules, delete pnpm-lock file, then run `pnpm i`. If that doesn't work, stop and tell the developer.

**Please keep this file up to date.**