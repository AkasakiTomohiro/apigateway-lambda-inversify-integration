import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import toBeMethodAuthentication from '../../src/utils/ToBeMethodAuthentication';

describe('ToBeMethodAuthorization', () => {
  beforeEach(() => {
    expect.extend(toBeMethodAuthentication);
  });

  it('Method Defined', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test1Controller();

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller)
      .toBeMethodAuthentication('GET')
      .toBeMethodAuthentication('POST')
      .toBeMethodAuthentication('PUT')
      .toBeMethodAuthentication('PATCH')
      .toBeMethodAuthentication('DELETE')
      .toBeMethodAuthentication('OPTIONS')
      .toBeMethodAuthentication('HEAD');
  });

  it('Method Not Defined', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test2Controller();

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller)
      .not.toBeMethodAuthentication('GET')
      .not.toBeMethodAuthentication('POST')
      .not.toBeMethodAuthentication('PUT')
      .not.toBeMethodAuthentication('PATCH')
      .not.toBeMethodAuthentication('DELETE')
      .not.toBeMethodAuthentication('OPTIONS')
      .not.toBeMethodAuthentication('HEAD');
  });
});

class Test1Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('POST', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('PUT', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('PATCH', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('DELETE', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('OPTIONS', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('HEAD', {
      func: this.test,
      isAuthentication: true,
      validation: {}
    });
  }

  private async test(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
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
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('POST', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('PUT', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('PATCH', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('DELETE', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('OPTIONS', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
    this.setMethod('HEAD', {
      func: this.test,
      isAuthentication: false,
      validation: {}
    });
  }

  private async test(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
