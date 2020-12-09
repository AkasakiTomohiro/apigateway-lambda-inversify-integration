import { HttpMethod } from '../HttpMethod';
import { Condition, Conditions, HttpMethodController } from '../HttpMethodController';

function toBeMethodDefied<E>(controller: HttpMethodController<E>, method: HttpMethod): jest.CustomMatcherResult {
  const conditions: Conditions<E> | undefined = (controller as any).conditions;
  const condition: Condition<E> | undefined = (conditions ?? {})[method];
  const pass: boolean = condition !== undefined;
  const message: () => string = pass
    ? () => `expected HTTP Method[${method}] not to be Defined`
    : () => `expected HTTP Method[${method}] to be Defined`;
  return {
    pass,
    message
  };
}

export default { toBeMethodDefied };
