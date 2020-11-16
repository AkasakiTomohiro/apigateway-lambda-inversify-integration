import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { HttpMethod } from './HttpMethod';
import { Validator } from './Validator';
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
     * Authentication
     *
     * @param  {APIGatewayProxyEvent} event Event data passed from the API Gateway
     * @param  {Condition<E>} condition Defining a process for each HTTP method
     * @returns Promise<[E | undefined, boolean, boolean]>
     * Tuple 1 {E | undefined} User Information
     * Tuple 2 {boolean} 401 Unauthorize
     * Tuple 3 {boolean} 500 Internal Server Error
     */
    private auth;
}
/**
 * Defining a process for each HTTP method
 * @typeParam E - User Information
 */
export declare type Conditions<E> = {
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
export declare type Condition<E, T = any, U = any, K = any, P = any> = {
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
export declare type CallFunction<E, T, U, K, P> = (
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
userInfo?: E) => Promise<APIGatewayProxyResult>;
/**
 * Validation list
 */
export interface IValidation<T, U, K, P> {
    /**
     * Validator for Body
     */
    bodyValidator: Validator<T>;
    /**
     * Validator for URLParameter
     */
    paramValidator: Validator<U>;
    /**
     * Validator for Query
     */
    queryValidator: Validator<K>;
    /**
     * Validator for Header
     */
    headerValidator: Validator<P>;
}
/**
 * Authenticate function Type
 * @returns Parameters you wish to return in the authentication results
 * e.g. user ID
 */
export declare type AuthenticationFunction<T = any> = (event: APIGatewayProxyEvent) => Promise<T>;
