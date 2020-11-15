import { Condition } from './Controller';
import {
  ApiRequestValidator,
  IArrayRequestValidator,
  IEnumRequestValidator,
  INumberRequestValidator,
  IObjectRequestValidator,
  IStringRequestValidator,
  RequestValidator
} from './Validator';

export class Validation {
  public static async check<E, T, U, K, P>(
    condition: Condition<E, T, U, K, P>,
    headers: P,
    pathParameters?: U,
    body?: T,
    queryParameters?: K
  ): Promise<boolean> {
    let flag = true;

    // Bodyのバリデーションチェック
    if (condition.validation.bodyValidator !== undefined) {
      flag = flag && Validation.validation(body, condition.validation.bodyValidator);
    }

    // Paramのバリデーションチェック
    if (condition.validation.paramValidator !== undefined) {
      flag = flag && Validation.validation(pathParameters, condition.validation.paramValidator);
    }

    // Queryのバリデーションチェック
    if (condition.validation.queryValidator !== undefined) {
      flag = flag && Validation.validation(queryParameters, condition.validation.queryValidator);
    }

    // Headerのバリデーションチェック
    if (condition.validation.headerValidator !== undefined) {
      flag = flag && Validation.validation(headers, condition.validation.headerValidator);
    }

    return flag;
  }

  private static validation<T>(param: T, validationList: ApiRequestValidator<T>): boolean {
    let result = true;

    const keyList: (keyof T)[] = Object.keys(validationList) as (keyof T)[];
    keyList.forEach(key => {
      let flag = true;
      const validator: RequestValidator = validationList[key];

      const paramExists = key in param;

      // パラメータが必須項目の場合、存在確認
      if (validator.required) {
        flag = flag && paramExists;
      }

      const value: any = param[key];

      // パラメータが存在している時はバリデーションチェック
      if (validator.type === 'string' && paramExists) {
        flag = flag && Validation.stringValidation(value, validator);
      }

      if (validator.type === 'boolean' && paramExists) {
        flag = flag && Validation.booleanValidation(value);
      }

      if (validator.type === 'number' && paramExists) {
        flag = flag && Validation.numberValidation(value, validator);
      }

      if (validator.type === 'object' && paramExists) {
        flag = flag && Validation.objectValidation(value, validator);
      }

      if (validator.type === 'array' && paramExists) {
        flag = flag && Validation.arrayValidation(value, validator);
      }

      if (validator.type === 'enum' && paramExists) {
        flag = flag && Validation.enumValidation(value, validator);
      }

      result = result && flag;
    });

    return result;
  }

  private static enumValidation(param: string, validator: IEnumRequestValidator): boolean {
    return validator.list.includes(param);
  }

  private static arrayValidation(param: any[], validator: IArrayRequestValidator<any>): boolean {
    let flag = true;

    if (validator.minLength !== undefined) {
      flag = flag && param.length >= validator.minLength;
    }

    if (validator.maxLength !== undefined) {
      flag = flag && param.length <= validator.maxLength;
    }

    if (validator.validator !== undefined) {
      param.forEach(p => {
        flag = flag && this.validation(p, validator.validator);
      });
    }

    return flag;
  }

  private static objectValidation(param: object, validator: IObjectRequestValidator<any>): boolean {
    let flag = true;

    if (validator.validator !== undefined) {
      flag = flag && this.validation(param, validator.validator);
    }

    return flag;
  }

  private static booleanValidation(param: boolean): boolean {
    return typeof param === 'boolean';
  }

  private static numberValidation(param: number, validator: INumberRequestValidator): boolean {
    let flag = true;

    if (validator.integer) {
      flag = flag && Number.isInteger(param);
    }

    if (validator.min !== undefined) {
      flag = flag && param >= validator.min;
    }

    if (validator.max !== undefined) {
      flag = flag && param <= validator.max;
    }

    return flag;
  }

  private static stringValidation(param: string, validator: IStringRequestValidator): boolean {
    let flag = true;

    if (validator.regExp !== undefined) {
      flag = flag && validator.regExp.test(param);
    }

    if (validator.minLength !== undefined) {
      flag = flag && param.length >= validator.minLength;
    }

    if (validator.maxLength !== undefined) {
      flag = flag && param.length <= validator.maxLength;
    }

    return flag;
  }
}
