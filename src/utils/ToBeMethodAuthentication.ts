import { HttpMethod } from '../HttpMethod';
import { Condition, Conditions, HttpMethodController } from '../HttpMethodController';

function toBeMethodAuthentication<E>(
  controller: HttpMethodController<E>,
  method: HttpMethod
): jest.CustomMatcherResult {
  const conditions: Conditions<E> | undefined = (controller as any).conditions;
  const condition: Condition<E> | undefined = (conditions ?? {})[method];
  const pass: boolean = condition !== undefined ? condition.isAuthentication : false;
  const message: () => string = pass
    ? () => `expected HTTP Method[${method}] not to be Authentication`
    : () => `expected HTTP Method[${method}] to be Authentication`;
  return {
    pass,
    message
  };
}

export default { toBeMethodAuthentication };
