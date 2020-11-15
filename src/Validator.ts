export interface IStringRequestValidator {
  readonly type: 'string';
  readonly required: boolean;
  readonly regExp?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
}

export interface INumberRequestValidator {
  readonly type: 'number';
  readonly required: boolean;
  readonly integer: boolean;
  readonly min?: number;
  readonly max?: number;
}

export interface IBooleanRequestValidator {
  readonly type: 'boolean';
  readonly required: boolean;
}

export interface IObjectRequestValidator<T> {
  readonly type: 'object';
  readonly required: boolean;
  readonly validator?: T;
}

export interface IArrayRequestValidator<T> {
  readonly type: 'array';
  readonly required: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly validator?: T;
}

export interface IEnumRequestValidator {
  readonly type: 'enum';
  readonly required: boolean;
  readonly list: readonly (string | number)[];
}

export type RequestValidator<T = any> =
  | IStringRequestValidator
  | INumberRequestValidator
  | IBooleanRequestValidator
  | IEnumRequestValidator
  | IObjectRequestValidator<T>
  | IArrayRequestValidator<T>;

export type ApiRequestValidator<T> = {
  readonly [U in keyof T]-?: T[U] extends (infer R)[]
    ? R extends object
      ? RequestValidator<ApiRequestValidator<R>>
      : RequestValidator
    : T[U] extends object
    ? RequestValidator<ApiRequestValidator<T[U]>>
    : RequestValidator;
};
