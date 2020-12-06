import 'reflect-metadata';

import { APIGatewayProxyEvent } from 'aws-lambda';

import { HttpMethodController } from '../src/HttpMethodController';
import { authentication } from './Authentication';
import { createContainer } from './Container';
import { UserType } from './User';

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
  const test = container.get<HttpMethodController<UserType>>(Symbol.for(event.resource));

  return test.handler(event).catch((err: any) => {
    return err;
  });
}
