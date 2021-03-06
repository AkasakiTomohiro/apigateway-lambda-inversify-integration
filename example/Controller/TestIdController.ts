import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import { UserType } from '../User';

export class TestIdController extends HttpMethodController<UserType> {
  public constructor() {
    super();
    this.setMethod<TestIdController, never, PathParameter, never, any>('GET', {
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

  public async get(
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
