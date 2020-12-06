import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectable } from 'inversify';

import { HttpMethod } from './HttpMethod';
import { Validation } from './Validation';
import { Validator } from './Validator';

/**
 * A class that can define a process corresponding to the Method
 * @typeParam E - Authentication results, user information, etc.
 */
@injectable()
export abstract class HttpMethodController<E> {
  /**
   * Objects returned in case of a validation error
   */
  public static badRequestResponse: APIGatewayProxyResult = {
    statusCode: 400,
    body: 'Bad Request'
  };

  /**
   * The object to be returned when the authentication authorization function returns Unauthorize
   */
  public static unauthorizeErrorResponse: APIGatewayProxyResult = {
    statusCode: 401,
    body: 'Unauthorize'
  };

  /**
   * Object to be returned in case of an error in an authentication function, etc.
   */
  public static internalServerErrorResponse: APIGatewayProxyResult = {
    statusCode: 500,
    body: 'Internal Server Error'
  };

  /**
   * Authorization function
   */
  public static authenticationFunc?: AuthenticationFunction = undefined;

  /**
   * pre-processing definition for HttpMethod
   */
  private conditions: Conditions<E> = {};

  /**
   * Execute a function corresponding to the Method.
   * @param event Event data passed from the API Gateway
   * @returns Objects to be returned to APi Gateway
   *          Success Response
   *          - CallFunction success response
   *          Error Response
   *          - Bad Request
   *          - Unauthorize
   *          - Internal Server Error
   */
  public async handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const condition = this.conditions[event.httpMethod as HttpMethod];

    if (condition === undefined) {
      return HttpMethodController.badRequestResponse;
    } else {
      const authResult = await this.auth(event, condition);
      if (authResult.error401) {
        return HttpMethodController.unauthorizeErrorResponse;
      }
      if (authResult.error500) {
        return HttpMethodController.internalServerErrorResponse;
      }

      const validationResult = await Validation.check(
        condition.validation,
        event.headers,
        event.pathParameters,
        event.body,
        event.queryStringParameters
      );
      if (!validationResult) {
        return HttpMethodController.badRequestResponse;
      }

      return condition
        .func({
          headers: event.headers,
          pathParameters: event.pathParameters,
          body: event.body,
          queryParameters: event.queryStringParameters,
          userInfo: authResult.userInfo ?? ({} as E)
        })
        .catch(() => HttpMethodController.internalServerErrorResponse);
    }
  }

  /**
   * Added pre-processing definition for HttpMethod.
   *
   * @param method Which HttpMethod is used for pre-processing
   * @param condition Specifies function preprocessing for HttpMethod
   */
  protected setMethod<T, U, K, P>(method: HttpMethod, condition: Condition<E, T, U, K, P>): void {
    this.conditions[method] = condition;
  }

  /**
   * Authentication
   *
   * @param  {APIGatewayProxyEvent} event Event data passed from the API Gateway
   * @param  {Condition<E>} condition Defining a process for each HTTP method
   * @returns Promise<AuthenticationFunctionResult<E>>
   */
  private async auth(event: APIGatewayProxyEvent, condition: Condition<E>): Promise<AuthenticationFunctionResult<E>> {
    if (condition.isAuthentication) {
      if (HttpMethodController.authenticationFunc === undefined) {
        return {
          error401: false,
          error500: true
        };
      } else {
        const result = await HttpMethodController.authenticationFunc(event).catch(() => {
          return {
            error401: false,
            error500: true
          };
        });
        return result;
      }
    } else {
      return {
        error401: false,
        error500: false
      };
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
 * Specifies function preprocessing for HttpMethod
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
   * Validation of function parameters
   */
  validation: IValidation<T, U, K, P>;

  /**
   * Functions to be executed by the API
   */
  func: CallFunction<E, T, U, K, P>;
};

/**
 * Function arguments to be performed in the API
 * @typeParam E - User Information
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type CallFunctionEventParameter<E, T, U, K, P> = {
  /**
   * Headers
   */
  headers: P;

  /**
   * Path parameter
   */
  pathParameters: U;

  /**
   * Body
   */
  body: T;

  /**
   * URL Query Parameters
   */
  queryParameters: K;

  /**
   * Authentication results, user information, etc.
   */
  userInfo: E;
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
  event: CallFunctionEventParameter<E, T, U, K, P>
) => Promise<APIGatewayProxyResult>;

/**
 * Validation list
 */
export interface IValidation<T, U, K, P> {
  /**
   * Validator for Body
   */
  bodyValidator?: Validator<T>;

  /**
   * Validator for URLParameter
   */
  paramValidator?: Validator<U>;

  /**
   * Validator for Query
   */
  queryValidator?: Validator<K>;

  /**
   * Validator for Header
   */
  headerValidator?: Validator<P>;
}

/**
 * Authenticate function Type
 * @returns Parameters you wish to return in the authentication results
 * e.g. user ID
 */
export type AuthenticationFunction<E = any> = (event: APIGatewayProxyEvent) => Promise<AuthenticationFunctionResult<E>>;

export type AuthenticationFunctionResult<E> = {
  userInfo?: E;
  error401: boolean;
  error500: boolean;
};
