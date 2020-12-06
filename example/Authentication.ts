import { APIGatewayProxyEvent } from 'aws-lambda';

import { AuthenticationFunctionResult } from '../src/HttpMethodController';

export function authentication(event: APIGatewayProxyEvent): Promise<AuthenticationFunctionResult<any>> {
  return new Promise<AuthenticationFunctionResult<any>>(resolve => {
    resolve({
      userInfo: { userId: '6e1dca92-70f5-4531-8dc2-cc20dbca363b' },
      error401: false,
      error500: false
    });
  });
}
