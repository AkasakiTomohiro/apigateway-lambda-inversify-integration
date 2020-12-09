import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import toBeMethodFunction from '../../src/utils/ToBeMethodFunction';

describe('ToMethodDefied', () => {
  beforeEach(() => {
    expect.extend(toBeMethodFunction);
  });

  it('Method Defined', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test1Controller();

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller)
      .toBeMethodFunction('GET', 'get')
      .toBeMethodFunction('POST', 'post')
      .toBeMethodFunction('PUT', 'put')
      .toBeMethodFunction('PATCH', 'patch')
      .toBeMethodFunction('DELETE', 'delete')
      .toBeMethodFunction('OPTIONS', 'options')
      .toBeMethodFunction('HEAD', 'head');
  });
});

class Test1Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.get,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('POST', {
      func: this.post,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('PUT', {
      func: this.put,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('PATCH', {
      func: this.patch,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('DELETE', {
      func: this.delete,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('OPTIONS', {
      func: this.options,
      isAuthentication: true,
      validation: {}
    });
    this.setMethod('HEAD', {
      func: this.head,
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

  private async post(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }

  private async put(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }

  private async patch(
    event: CallFunctionEventParameter<any, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }

  private async delete(
    event: CallFunctionEventParameter<any, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }

  private async options(
    event: CallFunctionEventParameter<any, never, never, never, any>
  ): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }

  private async head(event: CallFunctionEventParameter<any, never, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}
