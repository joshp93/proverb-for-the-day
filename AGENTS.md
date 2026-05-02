# Proverb for the day backend

This is the backend for a mobile app called Lemnuel (previously Proverb for the day), which displays a daily proverb and encourages users to meditate on it.

This is a AWS CDK project, using typescipt and pnpm. It includes:

- [load-proverbs](./src/load-proverbs/index.ts) lambda function which is designed to accept a json file like [this](./test/src//load-proverbs/test-data/kjv.json) and load it into Dynamo DB
- [choose-proverb](./src/choose-proverb/index.ts) which chooses a random proverb from the DB and sets it as the daily proverb
- [get-proverb](./src/get-proverb/index.ts) which is used as the lambda integration function for the rest api defined in the stack, which simply retrieves the daily proverb and returns it in json format

The stack is [here](./lib/proverb-for-the-day-stack.ts)

Please keep this file up to date as you make changes.
