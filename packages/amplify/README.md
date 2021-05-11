# Nx-Amplify

This project is a [Nx](https://nx.dev) plugin to generate Typescript NodeJS apps after creating an [AWS Amplify](https://aws.amazon.com/de/amplify/) function in your Nx repo.

The `amplify:function` Generator will create a [@nrwl/node:application](https://nx.dev/latest/angular/plugins/node/generators/application) based on the existing AWS Amplify Function. It will also

- configure the tsconfig.json to support the AWS Lambda NodeJS 12.x environment, so you can use ES2019 features
- add package.json scripts to build and run/test the function locally
- add @types devDependencies for `aws-lambda` and `aws-sdk`
- adjust the CloudFormation template
- adjust the amplify.state file
- update to workspace.json to output the build artifacts to the Amplify Function's `src` folder
- update workspace.json to optimize build
- update workspace.json to include the app's package.json during build
- add `amplify/backend/function/<function-name>/src` to `.gitignore` as this will be cleared and filled during the build process

## Install

Install the package as dev-dependency

```sh
npm i -D @mgustmann/amplify
```

```sh
yarn add -D @mgustmann/amplify
```

## Instructions

Create a function with one of the many ways with AWS Amplify:

- `amplify function add`
- `amplify auth add` or `amplify auth update` and configure the advanced settings to generate Cognito Triggers
- `amplify storage add` or `amplify storage update` and configure or add Storage Triggers for S3 or DynamoDB
- ... and many other

Commit the changes!

> Using the Generator does not delete anything from the Amplify Function folder, but the **first build will delete** the content of the `src` folder!

## Generate

Run this Generator `amplify:function` with the existing function name (created by Amplify CLI) as the first parameter.

Suppose the Amplify CLI created a function called `gqlResolver`, then there should be a `gql-resolver` folder under /amplify/backend/function directory in our Nx Repo.

```sh
nx generate @mgustmann/amplify:function gqlResolver
```

The existing files of that AWS Amplify Function will be copied over to the newly generated app. All .js files will be renamed to .ts and it tries to replace some of the imports and exports to account for TypeScript.

## Typings

The package [@types/aws-lambda](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda) provides a lot of types that we could use in our Lambda functions. You can find all kinds of trigger event typings, ie. for Cognito, AppSync, S3, DynamoDB ...
Check out the repository for your typings needs.

### AppSyncAmplifyResolverEvent

I extended the `AppSyncResolverEvent<T>` with `AppSyncAmplifyResolverEvent<T>` to allow to type the GraphQL `@function` directive more easily.

### SyncHandler vs AsyncHandler

The `aws-lambda` `Handler` type is sufficient for most cases. If you want to specify if the handler is returning a Promise **_or_** is using the callback function, there are two specific Handler types you can use:

1. SyncHandler - must use the callback function
2. AsyncHandler - must return a Promise

You can use these for your convenience and wrap the existing `Handler` type with it.

### Bundling of typings

As with all types, these will be stripped out during the build process.

> Currently the typing-files are generated for every @nrwl/node application. They could be extracted to a shared lib, but this would impose some more knowledge of your repo. Consider looking at them as add-ons and move, delete or use them however you like.

### AppSync Types

Say you want to create a GraphQL Resolver Function, that specifically defines the handler as async, you can use the typings to create an `AsyncHandler` that returns a Promise like this:

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

The parameters `event` and `context` are implicitly typed. If you know your return type, you can change the generic from unknown to your type.

### Cognito UserPool Trigger Types

Here is an example of a Cognito Trigger Function that handles several trigger events:

```ts
import {
  Handler,
  PostConfirmationConfirmSignUpTriggerEvent,
  PreSignUpAdminCreateUserTriggerEvent,
} from 'aws-lambda';

type CognitoTriggerEvent =
  | PreSignUpAdminCreateUserTriggerEvent
  | PostConfirmationConfirmSignUpTriggerEvent;

export const handler: Handler<CognitoTriggerEvent, CognitoTriggerEvent> = (
  event,
  context,
  callback
) => {
  console.log('main handler called', { event });
  // Do stuff here ...
  switch (event.triggerSource) {
    case 'PreSignUp_AdminCreateUser':
      // Call another sub-handler
      // postAuthenticationHandler(event, context, callback);
      callback(null, event);
      break;

    case 'PostConfirmation_ConfirmSignUp':
      // Do something with the event object
      (event.response as Record<string, string>).myData = 'my data';
      callback(null, event);
      break;

    default:
      callback(null, event);
      break;
  }

  // Use callback to pass the event object back to Cognito
  callback(null, event);
};
```

## Options

You can add most of the options of [@nrwl/node:application](https://nx.dev/latest/angular/plugins/node/generators/application) to configure it.

### --directory

By default this Generator will add a @nrwl/node app `gqlResolver` under a `functions` folder, ie. `apps/functions/gqlResolver`. If you want to generate your NodeJS-Functions in another directory, you can specify it with `--directory`.

### --tags

By default this Generator will add the tags `domain:backend, type:function` to the `nx.json` file. You can change it by including `--tags` or simply edit the `nx.json` file later on.
