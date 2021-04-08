import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { injectable } from 'inversify';

import { HttpMethod } from './HttpMethod';
import { Validation } from './Validation';
import { Validator } from './Validator';

/**
 * A class that can define a process corresponding to the Method
 * @typeParam E - Authentication results, user information, etc.
 * @typeParam M - Authorizable user rights
 */
@injectable()
export abstract class HttpMethodController<E extends UserInfoType = never, M extends UserRoleType = never> {
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
   * The object to be returned when the authentication authorization function returns Forbidden
   */
  public static forbiddenErrorResponse: APIGatewayProxyResult = {
    statusCode: 403,
    body: 'Forbidden'
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
  private conditions: Conditions<E, HttpMethodController<E>> = {};

  /**
   * Authentication
   *
   * @param  {APIGatewayProxyEvent} event Event data passed from the API Gateway
   * @param  {Condition<E>} condition Defining a process for each HTTP method
   * @returns Promise<AuthenticationFunctionResult<E>>
   */
  private static async auth<E extends UserInfoType>(
    event: APIGatewayProxyEvent,
    condition: Condition<E, HttpMethodController<E>>
  ): Promise<AuthenticationFunctionResult<E>> {
    if (condition.isAuthentication) {
      if (HttpMethodController.authenticationFunc === undefined) {
        return {
          error401: false,
          error403: false,
          error500: true
        };
      } else {
        const result = await HttpMethodController.authenticationFunc(event, condition.roles).catch(() => {
          return {
            error401: false,
            error403: false,
            error500: true
          };
        });
        return result;
      }
    } else {
      return {
        error401: false,
        error403: false,
        error500: false
      };
    }
  }

  /**
   * Execute a function corresponding to the Method.
   * @param controller HttpMethodController
   * @param event Event data passed from the API Gateway
   * @returns Objects to be returned to APi Gateway
   *          Success Response
   *          - CallFunction success response
   *          Error Response
   *          - Bad Request
   *          - Unauthorize
   *          - Internal Server Error
   */
  private static async handler<E extends UserInfoType>(
    controller: HttpMethodController<E>,
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    const condition = controller.conditions[event.httpMethod as HttpMethod];

    if (condition === undefined) {
      return HttpMethodController.badRequestResponse;
    } else {
      const authResult = await HttpMethodController.auth<E>(event, condition);
      if (authResult.error401) {
        return HttpMethodController.unauthorizeErrorResponse;
      }
      if (authResult.error403) {
        return HttpMethodController.forbiddenErrorResponse;
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

      if (condition.customValidationFunc !== undefined) {
        const customValidationResult = await condition.customValidationFunc({
          body: event.body,
          headers: event.headers,
          pathParameters: event.pathParameters,
          queryParameters: event.queryStringParameters
        });
        if (customValidationResult.errorResponse !== undefined) {
          return customValidationResult.errorResponse;
        }
        if (!customValidationResult.validationResult) {
          return HttpMethodController.badRequestResponse;
        }
      }

      return ((controller[condition.func] as unknown) as CallFunction<E, any, any, any, any>)({
        headers: event.headers,
        pathParameters: event.pathParameters,
        body: event.body,
        queryParameters: event.queryStringParameters,
        userInfo: authResult.userInfo as E
      }).catch(() => HttpMethodController.internalServerErrorResponse);
    }
  }

  /**
   * Execute a function corresponding to the Method.
   * @param event Event data passed from the API Gateway
   * @returns Objects to be returned to APi Gateway
   *          Success Response
   *          - CallFunction success response
   *          Error Response
   *          - Bad Request
   *          - Unauthorize
   *          - Forbidden
   *          - Internal Server Error
   */
  public async handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    return HttpMethodController.handler<E>(this, event);
  }

  /**
   * Added pre-processing definition for HttpMethod.
   *
   * @param method Which HttpMethod is used for pre-processing
   * @param condition Specifies function preprocessing for HttpMethod
   * @typeParam L - Subclass from HttpMethodController
   * @typeParam T - HTTP Body
   * @typeParam U - HTTP URL Path Parameter
   * @typeParam K - HTTP URL Path Query Parameter
   * @typeParam P - HTTP Header
   */
  protected setMethod<
    L extends HttpMethodController<E>,
    T extends BodyType,
    U extends PathParameterType,
    K extends QueryParameterType,
    P extends HeaderType
  >(method: HttpMethod, condition: Condition<E, L, T, U, K, P, M>): void {
    (this.conditions[method] as any) = condition;
  }
}

/**
 * Defining a process for each HTTP method
 * @typeParam E - User Information
 */
export type Conditions<E extends UserInfoType, L extends HttpMethodController<E>> = {
  [key in HttpMethod]?: Condition<E, L>;
};

/**
 * Specifies function preprocessing for HttpMethod
 * @typeParam E - User Information
 * @typeParam L - Subclass from HttpMethodController
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type Condition<
  E extends UserInfoType,
  L extends HttpMethodController<E>,
  T extends BodyType = any,
  U extends PathParameterType = any,
  K extends QueryParameterType = any,
  P extends HeaderType = any,
  M extends UserRoleType = any
> = {
  /**
   * Do you perform the authentication before calling the function?
   */
  isAuthentication: boolean;

  /**
   * List of users allowed to execute 'func' after authentication
   */
  roles: M[];

  /**
   * Validation of function parameters
   */
  validation: IValidation<T, U, K, P>;

  /**
   * Functions to be executed by the API
   */
  func: keyof FuncFilterType<E, L, T, U, K, P>;

  /**
   * Custom validation of HTTP Body, Path Parameter, Path Query Parameter, and Header
   */
  customValidationFunc?: CustomValidationFunction<T, U, K, P>;
};

/**
 * A type that retrieves only parameters in the form of a CallFunction from an object.
 * @typeParam E - User Information
 * @typeParam L - Class derived from HttpMethodController
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
type FuncFilterType<
  E extends UserInfoType,
  L extends HttpMethodController<E>,
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> = Omit<
  Pick<
    L,
    {
      [Key in keyof L]: L[Key] extends CallFunction<E, T, U, K, P> ? Key : never;
    }[keyof L]
  >,
  'handler'
>;

/**
 * Function arguments to be performed in the API
 * @typeParam E - User Information
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type CallFunctionEventParameter<
  E extends UserInfoType,
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> = {
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
export type CallFunction<
  E extends UserInfoType,
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> = (
  /**
   * Function arguments to be performed in the API
   */
  event: CallFunctionEventParameter<E, T, U, K, P>
) => Promise<APIGatewayProxyResult>;

/**
 * Custom validation of HTTP Body, Path Parameter, Path Query Parameter, and Header
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type CustomValidationFunctionEventParameter<
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> = {
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
};

/**
 * Custom Validation Functions
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export type CustomValidationFunction<
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> = (
  /**
   * HTTP Body, Path Parameter, Path Query Parameter, and Header
   */
  event: CustomValidationFunctionEventParameter<T, U, K, P>
) => Promise<CustomValidationFunctionResult>;

/**
 * Return type of custom validation function
 */
export type CustomValidationFunctionResult = {
  /**
   * Authentication Success Response
   */
  validationResult: boolean;

  /**
   * Internal Server Error Response
   */
  errorResponse?: APIGatewayProxyResult;
};

/**
 * Validation list
 * @typeParam T - HTTP Body
 * @typeParam U - HTTP URL Path Parameter
 * @typeParam K - HTTP URL Path Query Parameter
 * @typeParam P - HTTP Header
 */
export interface IValidation<
  T extends BodyType,
  U extends PathParameterType,
  K extends QueryParameterType,
  P extends HeaderType
> {
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
 * @description
 * Performs user authentication based on event information.
 * It also allows the permissions specified in roles.
 * @returns Parameters you wish to return in the authentication results
 * e.g. user ID
 * @typeParam E - User Information
 * @typeParam M - Authorizable user rights
 */
export type AuthenticationFunction<E extends UserInfoType = any, M extends UserRoleType = any> = (
  event: APIGatewayProxyEvent,
  roles: M
) => Promise<AuthenticationFunctionResult<E>>;

/**
 * Return type of authentication function
 */
export type AuthenticationFunctionResult<E extends UserInfoType> = {
  /**
   * Authentication Success Response
   */
  userInfo?: E;

  /**
   * Unauthorized Response
   */
  error401: boolean;

  /**
   * Forbidden Response
   */
  error403: boolean;

  /**
   * Internal Server Error Response
   */
  error500: boolean;
};

/**
 * Validation Check Function
 * @description
 * ex. `{a: ”XXX” | "YYY", b: number}`
 * For example, when a is ""XXX"", b can be specified from 1 to 10, when a is "YYY", b can be specified from 11 to 20, and so on.
 * @returns Result of the argument validation check
 */
export type ValidationFunction<
  T extends BodyType = any,
  U extends PathParameterType = any,
  K extends QueryParameterType = any,
  P extends HeaderType = any
> = (
  validation: IValidation<T, U, K, P>,
  headers: P,
  pathParameters?: U,
  body?: T,
  queryParameters?: K
) => Promise<boolean>;

/**
 * Body Type
 */
export type BodyType = Record<string, any>;

/**
 * Header Type
 */
export type HeaderType = Record<string, any>;

/**
 * PathParameter Type
 */
export type PathParameterType = Record<string, any>;

/**
 * QueryParameter Type
 */
export type QueryParameterType = Record<string, any>;

/**
 * UserInfo Type
 */
export type UserInfoType = Record<string, any>;

/**
 * UserRole Type
 */
export type UserRoleType = string | number;
