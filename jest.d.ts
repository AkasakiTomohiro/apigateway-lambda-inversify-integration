declare module 'jest-snapshot';
declare namespace jest {
  interface Matchers<R> {
    toBeMethodDefied(method: import("./src/HttpMethod").HttpMethod): R;
  }
}
