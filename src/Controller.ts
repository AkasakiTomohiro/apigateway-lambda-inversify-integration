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
   * 認証を行う関数
   *
   * @param  {APIGatewayProxyEvent} event API Gatewayから渡されたEventデータ
   * @param  {Condition<E>} condition HTTPMethodに対応したイベント処理方法が記述されたオブジェクト
   * @returns Promise<[authResult: E | undefined, err401: boolean, err500: boolean]>
   */
  private async auth<E>(
    event: APIGatewayProxyEvent,
    condition: Condition<E>
  ): Promise<[E | undefined, boolean, boolean]> {
    if (condition.auth) {
      if (Controller.authenticationFunc === undefined) {
        return [undefined, false, true];
      } else {
        const [flag, authResult] = await Controller.authenticationFunc(event)
          .then(data => [true, data])
          .catch(() => [false, undefined]);
        return [authResult, flag, false];
      }
    } else {
      return [undefined, true, false];
    }
  }
}

export type Conditions<E> = {
  [key in HttpMethod]?: Condition<E>;
};

/**
 * HttpMethodに対応して実施する処理
 */
export type Condition<E, T = any, U = any, K = any, P = any> = {
  /**
   * 認証を行うか
   */
  auth: boolean;

  /**
   * funcに渡す引数のバリデーション
   */
  validation: IValidation<T, U, K, P>;

  /**
   * 認証とバリデーションを抜けた、最終的な処理を実施する関数
   */
  func: CallFunction<E, T, U, K, P>;
};

/**
 * APIで呼び出される関数
 */
export type CallFunction<E, T, U, K, P> = (
  /**
   * Headers
   */
  headers: P,

  /**
   * パスパラメータ
   */
  pathParameters?: U,

  /**
   * Body
   */
  body?: T,

  /**
   * Queryパラメータ
   */
  queryParameters?: K,

  /**
   * 認証結果のオブジェクトが格納されている。
   * @example ユーザーIDなど
   */
  authResult?: E
) => Promise<APIGatewayProxyResult>;

/**
 * バリデーションリスト
 */
export interface IValidation<T, U, K, P> {
  /**
   * Body用のバリデーター
   */
  bodyValidator: ApiRequestValidator<T>;

  /**
   * URLParameter用のバリデーター
   */
  paramValidator: ApiRequestValidator<U>;

  /**
   * Query用のバリデーター
   */
  queryValidator: ApiRequestValidator<K>;

  /**
   * Header用のバリデーター
   */
  headerValidator: ApiRequestValidator<P>;
}

/**
 * 認証を行う関数
 * @returns 認証結果で返却したいパラメータ(ユーザーIDなど)
 */
export type AuthenticationFunction<T = any> = (event: APIGatewayProxyEvent) => Promise<T>;
