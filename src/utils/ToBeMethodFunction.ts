import { HttpMethod } from '../HttpMethod';
import { Condition, Conditions, HttpMethodController } from '../HttpMethodController';

function toBeMethodFunction(
  controller: HttpMethodController<any>,
  method: HttpMethod,
  funcName: string
): jest.CustomMatcherResult {
  const conditions: Conditions<any> | undefined = (controller as any).conditions;
  const condition: Condition<any> | undefined = (conditions ?? {})[method];
  const pass: boolean = condition !== undefined ? condition.func === (controller as any)[funcName] : false;
  const message: () => string = pass
    ? () => `expected HTTP Method[${method}] not to be Function[${funcName}]`
    : () => `expected HTTP Method[${method}] to be Function[${funcName}]`;
  return {
    pass,
    message
  };
}

export default { toBeMethodFunction };
