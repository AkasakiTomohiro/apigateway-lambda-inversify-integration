import { APIGatewayProxyEvent } from 'aws-lambda';

export function authentication(event: APIGatewayProxyEvent): Promise<[any, boolean, boolean]> {
  return new Promise<[any, boolean, boolean]>(resolve => {
    resolve([{ userId: '6e1dca92-70f5-4531-8dc2-cc20dbca363b' }, false, false]);
  });
}
