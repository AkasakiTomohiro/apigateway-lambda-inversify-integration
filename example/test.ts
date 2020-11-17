import { handler } from './handler';

const event: any = {
  resource: '/test',
  httpMethod: 'GET'
};

handler(event)
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });
