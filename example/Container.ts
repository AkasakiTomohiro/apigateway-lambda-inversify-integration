import { Container } from 'inversify';

import { TestController } from './Controller/TestController';
import { TestIdController } from './Controller/TestIdController';

export function createContainer(): Container {
  const container = new Container();

  container.bind<TestController>(TYPES.uri.test).to(TestController);
  container.bind<TestIdController>(TYPES.uri.testId).to(TestIdController);

  return container;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TYPES = {
  uri: {
    test: Symbol.for('/test'),
    testId: Symbol.for('/test/{id}')
  }
};
