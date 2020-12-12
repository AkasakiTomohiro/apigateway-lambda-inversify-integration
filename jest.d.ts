declare module 'jest-snapshot';
declare namespace jest {
  interface Matchers<R> {
    toBeMethodDefied(method: import("./src/HttpMethod").HttpMethod): R;
    toBeMethodAuthentication(method: import("./src/HttpMethod").HttpMethod): R;
    toBeMethodFunction(method: import("./src/HttpMethod").HttpMethod, funcName: string): R;
    toBeMethodValidation<T = any>(
      method: import("./src/HttpMethod").HttpMethod,
      validationType: keyof import("./src/HttpMethodController").IValidation<any, any, any, any>,
      key: keyof T,
      validation: import("./src/HttpMethodController").Validator<T[keyof T]>
    ): R;
  }
}
