import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import toBeMethodDefied from '../../src/utils/ToBeMethodDefied';

describe('ToMethodDefied', () => {
  beforeEach(() => {
    expect.extend(toBeMethodDefied);
  });

  it('Method Defined', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test1Controller();

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller)
      .toBeMethodDefied('GET')
      .toBeMethodDefied('POST')
      .toBeMethodDefied('PUT')
      .toBeMethodDefied('PATCH')
      .toBeMethodDefied('DELETE')
      .toBeMethodDefied('OPTIONS')
      .toBeMethodDefied('HEAD');
  });

  it('Method Not Defined', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test2Controller();

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller)
      .not.toBeMethodDefied('GET')
      .not.toBeMethodDefied('POST')
      .not.toBeMethodDefied('PUT')
      .not.toBeMethodDefied('PATCH')
      .not.toBeMethodDefied('DELETE')
      .not.toBeMethodDefied('OPTIONS')
      .not.toBeMethodDefied('HEAD');
  });
});

class Test1Controller extends HttpMethodController<any> {
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

class Test2Controller extends HttpMethodController<any> {
  public constructor() {
    super();
  }
}
