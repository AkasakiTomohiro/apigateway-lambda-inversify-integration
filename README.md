# Readme
apigateway-lambda-inversify-integration

![build](https://github.com/AkasakiTomohiro/apigateway-lambda-inversify-integration/workflows/build/badge.svg)
[![codecov](https://codecov.io/gh/AkasakiTomohiro/apigateway-lambda-inversify-integration/branch/master/graph/badge.svg?token=L5NJZDE2GC)](https://codecov.io/gh/AkasakiTomohiro/apigateway-lambda-inversify-integration)
[![downloads](https://img.shields.io/npm/dm/apigateway-lambda-inversify-integration.svg?style=flat-square)](http://npm-stat.com/charts.html?package=apigateway-lambda-inversify-integration&from=2017-09-14)
[![MIT License](https://img.shields.io/npm/l/apigateway-lambda-inversify-integration.svg?style=flat-square)](https://github.com/AkasakiTomohiro/apigateway-lambda-inversify-integration/blob/master/LICENSE)
[![Examples](https://img.shields.io/badge/%F0%9F%92%A1-examples-ff615b.svg?style=flat-square)](https://github.com/AkasakiTomohiro/apigateway-lambda-inversify-integration/tree/master/example)

## Why I wanted to create this library

When I combined the API Gateway and Lambda, I developed separate entry points for each URI and HTTP method.
But even though the entry points are different, the source code for accessing the database is the same.
So, when we bundle with Webpack, we place the same source code in each Lambda with different entry points.
Preparing this same source for as many APIs as possible is wasteful in terms of S3's fee for deploying the source (which is not a significant amount of money), and adding integration tests, like entry points, is a pain in the ass.
In addition, when performing validation of API Gateway parameters, it is difficult to verify whether YAML is set correctly in unit tests, but we verify it with joint tests.
This is also quite cumbersome, so I want to verify it with unit tests.
We created this library to solve these problems.

## Usage

See also the source of the example folder.

### Index
1. how to register the API
2. how to specify the HTTP Method
3. certification
4. validation
5. changing the error response definition
6. unit test

### 1. how to register the API

#### Assumptions
The following describes how to use it as there is an API to provide the URIs.

``` .
GET /test
```
#### Creating a class to handle the `/test`

TestController.ts
```typescript
import { APIGatewayProxyResult } from 'aws-lambda';
import { CallFunctionEventParameter, HttpMethodController } from 'apigateway-lambda-inversify-integration';
export class TestController extends HttpMethodController {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: 'get',
      isAuthentication: false,
      validation: {}
    });
  }
  private async get(
    event: CallFunctionEventParameter<UserType, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
```

Define HTTP Method for the URI by calling `setMethod` in the constructor, extending the `HttpMethodController`.
Which HTTP Method do you want to call in the first argument?
The second argument sets the following items
- Which function you want to call
- Do you want to be certified?
- Do you want it to be validated?
Now we have created the class corresponding to `GET /test`.

#### Register in the DI container

The `TestController` is managed by the DI container of `inversify` with the URI as its ID.
Container.ts

```typescript
import { Container } from 'inversify';
import { TestController } from 'apigateway-lambda-inversify-integration';
export function createContainer(): Container {
  const container = new Container();
  container.bind<TestController>(TYPES.uri.test).to(TestController);
  return container;
}
export const TYPES = {
  uri: {
    test: Symbol.for('/test')
  }
};
```
#### Creating a Lambda entry point

index.ts
```typescript
import 'reflect-metadata';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { HttpMethodController } from 'apigateway-lambda-inversify-integration';
import { createContainer } from './Container';
export async function handler(event: APIGatewayProxyEvent): Promise<any> {
  /**
   * Create an object that binds the objects corresponding to the URI and the objects needed for it
   */
  const container = createContainer();

  /**
   * Using DI as a factory pattern eliminates the need to define individual API entry points
   */
  const test = container.get<HttpMethodController(Symbol.for(event.resource));
  return test.handler(event).catch((err: any) => {
    return err;
  });
}
```
### 2. how to specify the HTTP Method

If you want to increase not only the `GET /test` but also the `POST /test`, you can increase the HTTP Method for the URI as follows.
TestController.ts

```typescript
import { APIGatewayProxyResult } from 'aws-lambda';
import { CallFunctionEventParameter, HttpMethodController } from 'apigateway-lambda-inversify-integration';
export class TestController extends HttpMethodController<never> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: 'get',
      roles: [],
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('POST', {
      func: 'add',
      roles: [],
      isAuthentication: false,
      validation: {}
    });
  }
  private async get(
    event: CallFunctionEventParameter<never, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
  private async add(
    event: CallFunctionEventParameter<never, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
```
### 3. certification

#### Create a function for authentication

Authentication.ts
```typescript
import { APIGatewayProxyEvent } from 'aws-lambda';
import { AuthenticationFunctionResult } from 'apigateway-lambda-inversify-integration';
export function authentication(event: APIGatewayProxyEvent, roles: Role[]): Promise<AuthenticationFunctionResult<UserType>> {
  return new Promise<AuthenticationFunctionResult<UserType>>(resolve => {
    const userInfo: UserType = {
      userId: '6e1dca92-70f5-4531-8dc2-cc20dbca363b',
      role: 'admin'
    };
    resolve({
      userInfo,
      error401: false,
      error403: false,
      error500: false
    });
  });
}

export type UserType = {
  userId: string;
  role: Role;
};

const roleList = ['admin', 'user'] as const;
type Role = typeof roleList[number];
```

The return value of `authentication` should be returned by specifying one of the following three.

- Successful authentication
```json
{
  userInfo: User information you want to use after authentication,
  error401: false,
  error403: false,
  error500: false
}
```

- Failure to authenticate
```json
{
  userInfo: undefined,
  error401: true,
  error403: false,
  error500: false
}
```

- Failure to forbidden
```json
{
  userInfo: undefined,
  error401: false,
  error403: true,
  error500: false
}
```

- Server Error
```json
{
  userInfo: undefined,
  error401: false,
  error403: false,
  error500: true
}
```

#### Registration of the authentication function

index.ts

```typescript
import { APIGatewayProxyEvent } from 'aws-lambda';
import 'reflect-metadata';
import { HttpMethodController } from 'apigateway-lambda-inversify-integration';
import { authentication } from './Authentication';
import { createContainer } from './Container';
export async function handler(event: APIGatewayProxyEvent): Promise<any> {
  /**
   * Create an object that binds the objects corresponding to the URI and the objects needed for it
   */
  const container = createContainer();

  /**
   * Set the authentication function in HttpMethodController.
   * Once set at an entry point, any subclass that inherits from HttpMethodController can use the authentication function.
   */
  HttpMethodController.authenticationFunc = authentication;

  /**
   * Using DI as a factory pattern eliminates the need to define individual API entry points
   */
  const test = container.get<HttpMethodController>(Symbol.for(event.resource));
  return test.handler(event).catch((err: any) => {
    return err;
  });
}
```

If you want to set the authentication to Method, set the second argument of `setMethod` `isAuthentication` to `true`.
TestController.ts

```typescript
import { APIGatewayProxyResult } from 'aws-lambda';
import { CallFunctionEventParameter, HttpMethodController } from 'apigateway-lambda-inversify-integration';
export class TestController extends HttpMethodController {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: 'get',
      roles: [],
      isAuthentication: true,
      validation: {}
    });
  }
  private async get(
    event: CallFunctionEventParameter<UserType, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
```

### 4. validation

#### Assumptions

The following describes how to use it as there is an API to provide the URIs

``` .
GET /test
```

For the `id`, a string of 1-10 characters of numeric alphabets (lowercase and uppercase) is acceptable.
TestIdController.ts

```typescript
import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from 'apigateway-lambda-inversify-integration';

export class TestIdController extends HttpMethodController<UserType, Role> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: 'get',
      roles: [],
      isAuthentication: true,
      validation: {
        paramValidator: {
          id: {
            type: 'string',
            required: true,
            regExp: /^[0-9a-zA-Z]{1,10}$/
          }
        }
      }
    });
  }

  private async get(
    event: CallFunctionEventParameter<UserType, never, PathParameter, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test/{id}' } }),
      statusCode: 200
    };
  }
}

type PathParameter = {
  id: string;
};

export type UserType = {
  userId: string;
  role: Role;
};

const roleList = ['admin', 'user'] as const;
type Role = typeof roleList[number];

```

You can specify `validation.paramValidator` as the second argument of `setMethod` by specifying PathParameter type as the third generic of the `get function`.

The `id` is defined as 1-10 characters of numeric and alphabetic characters (lowercase and uppercase).
This time, `regExp` is used to specify `/^[0-9a-zA-Z]{1,10}$/`.
By specifying `regExp`, you can evaluate the value with a regular expression.

#### Types of Validation


The value of each Validation is expressed as a logical product. 1.

1. IStringRequestValidator
   ・Evaluation items
   ・Required parameters or
   ・Minimum number of strings
   ・Maximum number of strings
   ・Regular expressions

2. INumberRequestValidator
   ・Evaluation items
   ・Required parameters or
   ・An integer value or
   ・Below / above
   ・Smaller/Larger

3. IBooleanRequestValidator
   ・Evaluation items
   ・Required parameters or

4. IEnumRequestValidator
   ・Evaluation items
   ・Required parameters or
   ・The list of values that can be specified in the enumerated type

5. IObjectRequestValidator
   ・Evaluation items
   ・Required parameters or
   ・Specifies a validation of 1 to 7 for each key specified in the object

6. IArrayRequestValidator
   ・Evaluation items
   ・Required parameters or
   ・Minimum number of elements
   ・Maximum number of elements
   ・Specify 1~3 and 7 validations as primitive types
   ・Specifies a validation of 1-7 for each key specified in the object as an object type

7. ICustomValidator
   ・Evaluation items
   ・Required parameters or
   ・Any validation function can be specified


#### custom validation

If you want to customize the validation function, change `HttpMethodController.validationFunc`.

### 5. changing the error response definition

・Validation errors

In case of this error, `HttpMethodController.badRequestResponse` is returned.
If you want to change the body data at the time of validation error, change this value.

・Authentication Error

In case of this error, `HttpMethodController.unauthorizeErrorResponse` is returned.
If you want to change the body data at the time of authentication error, change this value.

・Server error

In case of this error, `HttpMethodController.internalServerErrorResponse` is returned.
Change this value if you want to change the body data at the time of server error.


### 6. unit test

Install `apigateway-lambda-inversify-integration-jest` and run the unit test.

#### Usage

Several Matchers have been implemented for unit testing of HttpMethodController.

・ matcher that evaluates whether the specified HTTP Method is implemented.

For example, if you have a class called Test1Controller that extends HttpMethodController, and you want to evaluate whether a GET method has been defined, you can evaluate it as follows

```typescript
  it('Test', async () => {
    const controller = new Test1Controller();
    expect(controller).toBeMethodDefied('GET');
  });
```

・ Matcher that evaluates whether or not the authentication is correctly set for the specified HTTP Method.

For methods that require authentication

```typescript
  it('Test', async () => {
    const controller = new Test1Controller();
    expect(controller).toBeMethodAuthentication('GET');
  });
```

For methods that do not require authentication

```typescript
  it('Test', async () => {
    const controller = new Test1Controller();
    expect(controller).not.toBeMethodAuthentication('GET');
  });
```

・ Matcher that evaluates whether or not the specified function is defined in the specified HTTP method.

```typescript
  it('Test', async () => {
    const controller = new Test1Controller();
    expect(controller).toBeMethodFunction('GET', 'get');
  });
```

・ matcher that evaluates if the validation is set correctly for the specified HTTP Method.

When the ITest type is defined in the Body parameter of the POST method in Test1Controller, validation can be evaluated for each key of the ITest type.

```typescript
 it('Test', async () => {
    const controller = new Test1Controller();
    const validation: Validators = { type: 'string', required: true };
    expect(controller).toBeMethodValidation<ITest>('POST', 'bodyValidator', 'key', validation);
  });
```

Defined.ts

```typescript
class Test1Controller extends HttpMethodController<any, any> {
  public constructor() {
    super();
    this.setMethod('POST', {
      func: 'test',
      roles: [],
      isAuthentication: false,
      validation: {
        bodyValidator: {
          key: {
            type: 'string',
            required: true
          },
          num: {
            type: 'number',
            required: true,
            integer: true,
            lessThan: 1
          }
        }
      }
    });
  }

  private async test(event: CallFunctionEventParameter<any, ITest, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}

interface ITest {
  key: string;
  num: number;
}
```

## Acknowledgements

I had it translated to DeepL. Thank you.
