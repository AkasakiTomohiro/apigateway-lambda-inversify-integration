import { IValidation } from './HttpMethodController';
import {
  IArrayRequestValidator,
  ICustomValidator,
  IEnumRequestValidator,
  INumberRequestValidator,
  IObjectRequestValidator,
  IStringRequestValidator,
  Validator,
  Validators
} from './Validator';

export class Validation {
  public static async check<T, U, K, P>(
    validation: IValidation<T, U, K, P>,
    headers: P,
    pathParameters?: U,
    body?: T,
    queryParameters?: K
  ): Promise<boolean> {
    let flag = true;

    // Bodyのバリデーションチェック
    if (validation.bodyValidator !== undefined) {
      flag = flag && Validation.validation(body, validation.bodyValidator);
    }

    // Paramのバリデーションチェック
    if (validation.paramValidator !== undefined) {
      flag = flag && Validation.validation(pathParameters, validation.paramValidator);
    }

    // Queryのバリデーションチェック
    if (validation.queryValidator !== undefined) {
      flag = flag && Validation.validation(queryParameters, validation.queryValidator);
    }

    // Headerのバリデーションチェック
    if (validation.headerValidator !== undefined) {
      flag = flag && Validation.validation(headers, validation.headerValidator);
    }

    return flag;
  }

  private static validation<T>(param: T, validationList: Validator<T>): boolean {
    let result = true;

    if (Array.isArray(param) || typeof param !== 'object') {
      return false;
    }

    const keyList: (keyof T)[] = Object.keys(validationList) as (keyof T)[];
    keyList.forEach(key => {
      let flag = true;
      const validator: Validators = validationList[key];

      const paramExists = key in param;

      // パラメータが必須項目の場合、存在確認
      if (validator.required) {
        flag = flag && paramExists;
      }

      // パラメータが存在している時はバリデーションチェック
      if (validator.type === 'string' && paramExists) {
        flag = flag && Validation.stringValidation(param[key], validator);
      }

      if (validator.type === 'boolean' && paramExists) {
        flag = flag && Validation.booleanValidation(param[key]);
      }

      if (validator.type === 'number' && paramExists) {
        flag = flag && Validation.numberValidation(param[key], validator);
      }

      if (validator.type === 'object' && paramExists) {
        flag = flag && Validation.objectValidation(param[key], validator);
      }

      if (validator.type === 'array' && paramExists) {
        flag = flag && Validation.arrayValidation(param[key], validator);
      }

      if (validator.type === 'enum' && paramExists) {
        flag = flag && Validation.enumValidation(param[key], validator);
      }

      if (validator.type === 'custom' && paramExists) {
        flag = flag && Validation.customValidation(param[key], validator);
      }

      result = result && flag;
    });

    return result;
  }

  private static customValidation(param: any, validator: ICustomValidator<any>): boolean {
    return validator.validationFunc(param);
  }

  private static enumValidation(param: any, validator: IEnumRequestValidator): boolean {
    return validator.list.includes(param);
  }

  private static arrayValidation(param: any, validator: IArrayRequestValidator<any>): boolean {
    if (!Array.isArray(param)) {
      return false;
    }

    let flag = true;

    if (validator.minLength !== undefined) {
      flag = flag && param.length >= validator.minLength;
    }

    if (validator.maxLength !== undefined) {
      flag = flag && param.length <= validator.maxLength;
    }

    if (validator.objectValidator !== undefined) {
      param.forEach(p => {
        flag = flag && this.validation(p, validator.objectValidator);
      });
    }

    const primitive = validator.primitiveValidator;
    if (primitive !== undefined) {
      if (primitive.type === 'string') {
        param.forEach(p => {
          flag = flag && Validation.stringValidation(p, primitive);
        });
      }

      if (primitive.type === 'boolean') {
        param.forEach(p => {
          flag = flag && Validation.booleanValidation(p);
        });
      }

      if (primitive.type === 'number') {
        param.forEach(p => {
          flag = flag && Validation.numberValidation(p, primitive);
        });
      }

      if (primitive.type === 'custom') {
        param.forEach(p => {
          flag = flag && Validation.customValidation(p, primitive);
        });
      }
    }

    return flag;
  }

  private static objectValidation(param: any, validator: IObjectRequestValidator<any>): boolean {
    if (Array.isArray(param) || typeof param !== 'object') {
      return false;
    }

    let flag = true;

    if (validator.validator !== undefined) {
      flag = flag && this.validation(param, validator.validator);
    }

    return flag;
  }

  private static booleanValidation(param: any): boolean {
    return typeof param === 'boolean';
  }

  private static numberValidation(param: any, validator: INumberRequestValidator): boolean {
    if (typeof param !== 'number') {
      return false;
    }

    let flag = true;

    if (validator.integer) {
      flag = flag && Number.isInteger(param);
    }

    if (validator.orLower !== undefined) {
      flag = flag && param <= validator.orLower;
    }

    if (validator.orMore !== undefined) {
      flag = flag && param >= validator.orMore;
    }

    if (validator.lessThan !== undefined) {
      flag = flag && param < validator.lessThan;
    }

    if (validator.moreThan !== undefined) {
      flag = flag && param > validator.moreThan;
    }

    return flag;
  }

  private static stringValidation(param: any, validator: IStringRequestValidator): boolean {
    if (typeof param !== 'string') {
      return false;
    }

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
