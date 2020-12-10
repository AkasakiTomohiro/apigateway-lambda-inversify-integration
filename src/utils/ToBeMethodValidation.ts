import { HttpMethod } from '../HttpMethod';
import { Condition, Conditions, HttpMethodController, IValidation } from '../HttpMethodController';
import { Validator } from '../Validator';

const deepEqual = require('deep-equal');

function toBeMethodValidation<T = any>(
  controller: HttpMethodController<any>,
  method: HttpMethod,
  validationType: keyof IValidation<any, any, any, any>,
  key: keyof T,
  validation: Validator<T[keyof T]>
): jest.CustomMatcherResult {
  const conditions: Conditions<any> | undefined = (controller as any).conditions;
  const condition: Condition<any> | undefined = (conditions ?? {})[method];
  let pass = false;
  if (condition !== undefined) {
    const validator: any = condition.validation[validationType];
    pass = deepEqual(validator[key], validation);
  }
  const message: () => string = pass
    ? () => `expected HTTP Method[${method}] Validation[${validationType}] not to be Validation Value[${key}]`
    : () => `expected HTTP Method[${method}] Validation[${validationType}] to be Validation Value[${key}]`;
  return {
    pass,
    message
  };
}

export default { toBeMethodValidation };
