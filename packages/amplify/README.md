# Nx-Amplify

This project is a [Nx](https://nx.dev) plugin to generate Typescript NodeJS apps after creating an [AWS Amplify](https://aws.amazon.com/de/amplify/) function in your Nx repo.

The `amplify:function` Generator will create a [@nrwl/node:application](https://nx.dev/latest/angular/plugins/node/generators/application) based on the existing AWS Amplify Function. It will also 

* configure the tsconfig.json to support the AWS Lambda NodeJS 12.x environment, so you can use ES2019 features
* add package.json scripts to build and run/test the function locally
* add @types devDependencies for `aws-lambda` and `aws-sdk`
* adjust the CloudFormation template
* update to workspace.json to output the build artifacts to the Amplify Function's `src` folder
* update to workspace.json to optimize build
* update to workspace.json to include the app's package.json during build
* update to workspace.json to define `aws-lambda` and `aws-sdk` packages as external dependencies, since the Lambda execution runtime provides them by default
* add `amplify/backend/function/<function-name>/src` to `.gitignore` as this will be cleared and filled during the build process

## Install

Install the package as dev-dependency

```
npm i -D @mgustmann/amplify
```

```
yarn add -D @mgustmann/amplify
```
## Instructions

Create a function with one of the many ways with AWS Amplify:

- `amplify function add`
- `amplify auth add` or `amplify auth update` and configure the advanced settings to generate Cognito Triggers
- `amplify storage add` or `amplify storage update` and configure or add Storage Triggers for S3 or DynamoDB
- ... and many other

Commit the changes!

> Using the Generator does not delete anything from the Amplify Function folder, but the first build will!

## Generate

Run this Generator `amplify:function` with the existing function name (created by Amplify CLI) as the first parameter. 

Suppose the Amplify CLI created a function called `gqlResolver`, then  there should be a `gql-resolver` folder under /amplify/backend/function directory in our Nx Repo.

```
nx generate @mgustmann/amplify:function gqlResolver
```

The existing files of that AWS Amplify Function will be copied over to the newly generated app. All _.js files will be renamed to _.ts and it tries to replace some of the imports and exports to account for TypeScript.

## Types

This Generator also creates some files with TypeScript types to be used in your handlers. As with all types, this will be stripped out during the build process.

> Currently the typing-files are generated for every @nrwl/node application. They could be extracted to a shared lib, but this would impose some more knowledge of your repo. Concider looking at them as add-ons and move, delete or use them however you like.

### AppSync Types

Say you want to create a GraqphQL Resolver Function, you can use the typings to create an `AsyncHandler` that returns a Promise like this:

```ts
/* apps/functions/gql-resolver/src/main.ts */
import { AppSyncEvent, AsyncHandler, Handler } from './app/types';
import { resolvers } from './app/resolvers';

export const handler: AsyncHandler<Handler<AppSyncEvent, unknown>> = async (
  event,
  context
) => {
  const typeHandler = resolvers[event.typeName];
  if (typeHandler) {
    const resolver = typeHandler[event.fieldName];
    if (resolver) {
      return await resolver(event);
    }
  }
  throw new Error('Resolver not found!');
};
```

The parameters `event` and `context` are implicitly typed. If you know your return type, you can change the generic from unkown to you type.

### Cognito UserPool Trigger Types

Cognito Types for Lambda-Trigger functions are also included. Here is an example of a Cognito Trigger Function that handles 
several events:

```ts
import { CognitoTriggerEvent, Handler } from './app/types';

export const handler: Handler<CognitoTriggerEvent, CognitoTriggerEvent> = (
  event,
  context,
  callback
) => {
  console.log('Cognito Trigger Handler called ', {
    event: JSON.stringify(event, null, 2),
    context,
  });
  switch (event.triggerSource) {
    case 'PreSignUp_AdminCreateUser':
      // Call another sub-handler
      // preSignUpHandler(event, context, callback);
      break;

    case 'PostConfirmation_ConfirmSignUp':
      // Do something
      event.response.myData = 'my data';
      callback(null, event);
      break;

    default:
      callback(null, event);
      break;
  }
};
```

## Options

You can add most of the options of [@nrwl/node:application](https://nx.dev/latest/angular/plugins/node/generators/application) to configure it.

### --directory

This will add a @nrwl/node app `gqlResolver` under a `functions` folder, ie. `apps/functions/gqlResolver`. If you want to collect your NodeJS-Functions in another directory, you can specify it with `--directory`.

### --tags

By default this Generator will add the tags `domain:backend, type:function` to the `nx.json` file. You can change it by including `--tags` or simply edit the `nx.json` file.
