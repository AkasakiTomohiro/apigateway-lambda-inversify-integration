import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import { UserType } from '../User';

export class TestController extends HttpMethodController<UserType> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: true,
      validation: {}
    });
  }

  private async get(
    event: CallFunctionEventParameter<UserType, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
