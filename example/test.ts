import { handler } from './handler';

const event: any = {
  resource: '/test/{id}',
  httpMethod: 'GET',
  pathParameters: {
    id: 'aaa+'
  }
};

handler(event)
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });
