import { APIGatewayProxyResult } from 'aws-lambda';

import { CallFunctionEventParameter, HttpMethodController } from '../../src/HttpMethodController';
import toBeMethodValidation from '../../src/utils/ToBeMethodValidation';
import { Validators } from '../../src/Validator';

describe('ToBeMethodValidation', () => {
  beforeEach(() => {
    expect.extend(toBeMethodValidation);
  });

  it('Validation 1', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test1Controller();

    const validation: Validators = { type: 'string', required: true };

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller).toBeMethodValidation<ITest>('GET', 'bodyValidator', 'key', validation);
  });

  it('Validation 2', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    const controller = new Test1Controller();

    const validation: Validators = {
      type: 'number',
      required: true,
      integer: true,
      lessThan: 1
    };

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    /* ------------------------------ 評価項目 ------------------------------ */
    expect(controller).toBeMethodValidation<ITest>('GET', 'bodyValidator', 'num', validation);
  });
});

class Test1Controller extends HttpMethodController<any> {
  public constructor() {
    super();
    this.setMethod('GET', {
      func: this.test,
      isAuthentication: false,
      validation: {
        bodyValidator: {
          key: {
            type: 'string',
            required: true
          },
          num: {
            type: 'number',
            required: true,
            integer: true,
            lessThan: 1
          }
        }
      }
    });
  }

  private async test(event: CallFunctionEventParameter<any, ITest, never, never, any>): Promise<APIGatewayProxyResult> {
    return {
      body: JSON.stringify({ ...event.userInfo, ...{ uri: '/test' } }),
      statusCode: 200
    };
  }
}

interface ITest {
  key: string;
  num: number;
}
