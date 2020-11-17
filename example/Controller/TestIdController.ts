import { APIGatewayProxyResult } from 'aws-lambda';

import { HttpMethodController } from '../../src/Controller';
import { UserType } from '../User';

export class TestIdController extends HttpMethodController<UserType> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: true,
      validation: {}
    });
  }

  private async get(
    headers: any,
    pathParameters: never,
    body: never,
    queryParameters: never,
    userInfo: UserType
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...userInfo, ...{ uri: '/test/{id}' } }),
      statusCode: 200
    };
  }
}
