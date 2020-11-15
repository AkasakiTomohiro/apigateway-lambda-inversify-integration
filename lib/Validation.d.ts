import { Condition } from './Controller';
export declare class Validation {
    static check<E, T, U, K, P>(condition: Condition<E, T, U, K, P>, headers: P, pathParameters?: U, body?: T, queryParameters?: K): Promise<boolean>;
    private static validation;
    private static enumValidation;
    private static arrayValidation;
    private static objectValidation;
    private static booleanValidation;
    private static numberValidation;
    private static stringValidation;
}
