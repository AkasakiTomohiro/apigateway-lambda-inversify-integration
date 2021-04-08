import { APIGatewayProxyEvent } from 'aws-lambda';

import { AuthenticationFunctionResult } from '../src/HttpMethodController';
import { Role, UserType } from './User';

export function authentication(event: APIGatewayProxyEvent, roles: Role[]): Promise<AuthenticationFunctionResult<any>> {
  return new Promise<AuthenticationFunctionResult<any>>(resolve => {
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
