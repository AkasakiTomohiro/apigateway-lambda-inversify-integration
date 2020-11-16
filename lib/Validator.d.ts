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
export declare type Validators<T = any> = IStringRequestValidator | INumberRequestValidator | IBooleanRequestValidator | IEnumRequestValidator | IObjectRequestValidator<T> | IArrayRequestValidator<T>;
export declare type Validator<T> = {
    readonly [U in keyof T]-?: T[U] extends (infer R)[] ? R extends object ? Validators<Validator<R>> : Validators : T[U] extends object ? Validators<Validator<T[U]>> : Validators;
};
