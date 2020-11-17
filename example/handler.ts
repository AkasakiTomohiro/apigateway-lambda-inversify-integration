import 'reflect-metadata';

import { APIGatewayProxyEvent } from 'aws-lambda';

import { HttpMethodController } from '../src/Controller';
import { authentication } from './Authentication';
import { createContainer } from './Container';
import { UserType } from './User';

export async function handler(event: APIGatewayProxyEvent): Promise<any> {
  const container = createContainer();

  HttpMethodController.authenticationFunc = authentication;

  const test = container.get<HttpMethodController<UserType>>(Symbol.for(event.resource));

  return test.handler(event).catch(err => {
    return err;
  });
}
