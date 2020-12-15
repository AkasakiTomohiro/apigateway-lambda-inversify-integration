import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../src/HttpMethodController';

describe('HttpMethodController', () => {
  beforeAll(() => {
    HttpMethodController.authenticationFunc = undefined;
  });
  describe('Static Param', () => {
    it('badRequestResponse', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      /* ------------------------ テスト対象関数を実行 ------------------------ */
      /* ------------------------------ 評価項目 ------------------------------ */
      expect(HttpMethodController.badRequestResponse).toEqual({
        statusCode: 400,
        body: 'Bad Request'
      });
    });

    it('unauthorizeErrorResponse', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      /* ------------------------ テスト対象関数を実行 ------------------------ */
      /* ------------------------------ 評価項目 ------------------------------ */
      expect(HttpMethodController.unauthorizeErrorResponse).toEqual({
        statusCode: 401,
        body: 'Unauthorize'
      });
    });

    it('internalServerErrorResponse', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      /* ------------------------ テスト対象関数を実行 ------------------------ */
      /* ------------------------------ 評価項目 ------------------------------ */
      expect(HttpMethodController.internalServerErrorResponse).toEqual({
        statusCode: 500,
        body: 'Internal Server Error'
      });
    });

    it('authenticationFunc', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      /* ------------------------ テスト対象関数を実行 ------------------------ */
      /* ------------------------------ 評価項目 ------------------------------ */
      expect(HttpMethodController.authenticationFunc).toBeUndefined();
    });
  });

  describe('HttpMethodController Method', () => {
    it('HTTP Methodに対応する関数がConditionで未定義の場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test1Controller();
      const event: any = { httpMethod: 'POST' };

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.badRequestResponse);
      expect(test).not.toBeMethodDefied('POST');
    });

    it('バリデーションに成功した場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test1Controller();
      const event: any = { httpMethod: 'GET' };

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual({
        body: JSON.stringify({ ...{ uri: '/test' } }),
        statusCode: 200
      });
      expect(spy).toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').not.toBeMethodAuthentication('GET');
    });

    it('バリデーションエラーの場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test1Controller();
      const event: any = { httpMethod: 'GET' };

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(false);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.badRequestResponse);
      expect(spy).toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').not.toBeMethodAuthentication('GET');
    });

    it('Conditionの指定された関数でエラーが発生した場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test2Controller();
      const event: any = { httpMethod: 'GET' };

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.internalServerErrorResponse);
      expect(spy).toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').not.toBeMethodAuthentication('GET');
    });

    it('認証関数が未定義の場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test3Controller();
      const event: any = { httpMethod: 'GET' };

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.internalServerErrorResponse);
      expect(spy).not.toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').toBeMethodAuthentication('GET');
    });

    it('認証に成功した場合', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test3Controller();
      const event: any = { httpMethod: 'GET' };
      HttpMethodController.authenticationFunc = jest.fn().mockResolvedValue({ userId: 'a' });

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual({
        body: JSON.stringify({ ...{ uri: '/test' } }),
        statusCode: 200
      });
      expect(HttpMethodController.authenticationFunc).toBeCalled();
      expect(spy).toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').toBeMethodAuthentication('GET');
    });

    it('認証に失敗した場合:500', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test3Controller();
      const event: any = { httpMethod: 'GET' };
      HttpMethodController.authenticationFunc = jest.fn().mockRejectedValue({ userId: 'a' });

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.internalServerErrorResponse);
      expect(HttpMethodController.authenticationFunc).toBeCalled();
      expect(spy).not.toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').toBeMethodAuthentication('GET');
    });

    it('認証に失敗した場合:401', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      const test = new Test3Controller();
      const event: any = { httpMethod: 'GET' };
      HttpMethodController.authenticationFunc = jest.fn().mockResolvedValue({ error401: true, error500: false });

      const spy = jest.spyOn(HttpMethodController, 'validationFunc').mockResolvedValue(true);

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await test.handler(event);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toEqual(HttpMethodController.unauthorizeErrorResponse);
      expect(HttpMethodController.authenticationFunc).toBeCalled();
      expect(spy).not.toBeCalled();
      expect(test).toBeMethodDefied('GET').toBeMethodFunction('GET', 'get').toBeMethodAuthentication('GET');
    });
  });
});

class Test1Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: false,
      validation: {}
    });
  }

  private async get(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}

class Test2Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: false,
      validation: {}
    });
  }

  private async get(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return new Promise<any>((resolve, rejects) => {
      rejects();
    });
  }
}

class Test3Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: true,
      validation: {}
    });
  }

  private async get(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
