import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { HttpMethod } from './HttpMethod';
import { Validation } from './Validation';
import { ApiRequestValidator } from './Validator';

export abstract class Controller<E> {
  public static badRequestResponse: APIGatewayProxyResult = {
    statusCode: 400,
    body: 'Bad Request'
  };

  public static unauthorizeErrorResponse: APIGatewayProxyResult = {
    statusCode: 401,
    body: 'Unauthorize'
  };

  public static internalServerErrorResponse: APIGatewayProxyResult = {
    statusCode: 500,
    body: 'Internal Server Error'
  };

  public static authenticationFunc?: AuthenticationFunction = undefined;

  /**
   * HTTPMethodに対応したイベント処理方法が記述されたオブジェクトリスト
   */
  private conditions: Conditions<E> = {};

  public async handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const condition = this.conditions[event.httpMethod as HttpMethod];

    if (condition === undefined) {
      return Controller.badRequestResponse;
    } else {
      // 認証
      const [authResult, err401, err500] = await this.auth(event, condition);
      if (err401) {
        return Controller.unauthorizeErrorResponse;
      }
      if (err500) {
        return Controller.internalServerErrorResponse;
      }

      // バリデーション
      const validationResult = await Validation.check(
        condition,
        event.headers,
        event.pathParameters,
        event.body,
        event.queryStringParameters
      );
      if (!validationResult) {
        return Controller.badRequestResponse;
      }

      // 指定関数を呼び出す
      return condition.func(event.headers, event.pathParameters, event.body, event.queryStringParameters, authResult);
    }
  }

  /**
   * HttpMethodに対応したイベントの定義を追加
   *
   * @param method どのHttpMethodのときに実施するか
   * @param condition HTTPMethodに対応したイベント処理方法
   */
  protected setMethod(method: HttpMethod, condition: Condition<E>): void {
    this.conditions[method] = condition;
  }

  /**
   * Authentication
   *
   * @param  {APIGatewayProxyEvent} event Event data passed from the API Gateway
   * @param  {Condition<E>} condition Defining a process for each HTTP method
   * @returns Promise<[E | undefined, boolean, boolean]>
   * Tuple 1 {E | undefined} User Information
   * Tuple 2 {boolean} 401 Unauthorize
   * Tuple 3 {boolean} 500 Internal Server Error
   */
  private async auth(event: APIGatewayProxyEvent, condition: Condition<E>): Promise<[E | undefined, boolean, boolean]> {
    if (condition.isAuthentication) {
      if (Controller.authenticationFunc === undefined) {
        return [undefined, false, true];
      } else {
        const [flag, authResult] = await Controller.authenticationFunc(event)
          .then(data => [true, data])
          .catch(() => [false, undefined]);
        return [authResult, !flag, false];
      }
    } else {
      return [undefined, false, false];
    }
  }
}

/**
 * Defining a process for each HTTP method
 * @typeParam E - User Information
 */
export type Conditions<E> = {
  [key in HttpMethod]?: Condition<E>;
};

/**
 * HttpMethodに対応して実施する処理
 * @typeParam E - User Information
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type Condition<E, T = any, U = any, K = any, P = any> = {
  /**
   * Do you perform the authentication before calling the function?
   */
  isAuthentication: boolean;

  /**
   * Function parameter validation
   */
  validation: IValidation<T, U, K, P>;

  /**
   * Functions to be executed by the API
   */
  func: CallFunction<E, T, U, K, P>;
};

/**
 * Functions to be executed by the API
 * @typeParam E - User Information
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type CallFunction<E, T, U, K, P> = (
  /**
   * Headers
   */
  headers: P,

  /**
   * Path parameter
   */
  pathParameters?: U,

  /**
   * Body
   */
  body?: T,

  /**
   * URL Query Parameters
   */
  queryParameters?: K,

  /**
   * Authentication results, user information, etc.
   */
  userInfo?: E
) => Promise<APIGatewayProxyResult>;

/**
 * Validation list
 */
export interface IValidation<T, U, K, P> {
  /**
   * Validator for Body
   */
  bodyValidator: ApiRequestValidator<T>;

  /**
   * Validator for URLParameter
   */
  paramValidator: ApiRequestValidator<U>;

  /**
   * Validator for Query
   */
  queryValidator: ApiRequestValidator<K>;

  /**
   * Validator for Header
   */
  headerValidator: ApiRequestValidator<P>;
}

/**
 * Authenticate function Type
 * @returns Parameters you wish to return in the authentication results
 * e.g. user ID
 */
export type AuthenticationFunction<T = any> = (event: APIGatewayProxyEvent) => Promise<T>;
