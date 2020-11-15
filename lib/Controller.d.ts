import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HttpMethod } from './HttpMethod';
import { ApiRequestValidator } from './Validator';
export declare abstract class Controller<E> {
    static badRequestResponse: APIGatewayProxyResult;
    static unauthorizeErrorResponse: APIGatewayProxyResult;
    static internalServerErrorResponse: APIGatewayProxyResult;
    static authenticationFunc?: AuthenticationFunction;
    /**
     * HTTPMethodに対応したイベント処理方法が記述されたオブジェクトリスト
     */
    private conditions;
    handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
    /**
     * HttpMethodに対応したイベントの定義を追加
     *
     * @param method どのHttpMethodのときに実施するか
     * @param condition HTTPMethodに対応したイベント処理方法
     */
    protected setMethod(method: HttpMethod, condition: Condition<E>): void;
    /**
     * 認証を行う関数
     *
     * @param  {APIGatewayProxyEvent} event API Gatewayから渡されたEventデータ
     * @param  {Condition<E>} condition HTTPMethodに対応したイベント処理方法が記述されたオブジェクト
     * @returns Promise<[authResult: E | undefined, err401: boolean, err500: boolean]>
     */
    private auth;
}
export declare type Conditions<E> = {
    [key in HttpMethod]?: Condition<E>;
};
/**
 * HttpMethodに対応して実施する処理
 */
export declare type Condition<E, T = any, U = any, K = any, P = any> = {
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
export declare type CallFunction<E, T, U, K, P> = (
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
authResult?: E) => Promise<APIGatewayProxyResult>;
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
export declare type AuthenticationFunction<T = any> = (event: APIGatewayProxyEvent) => Promise<T>;
