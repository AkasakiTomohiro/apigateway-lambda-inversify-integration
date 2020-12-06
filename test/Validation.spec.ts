import { HttpMethod, httpMethodList } from '../src/HttpMethod';
import { IValidation } from '../src/HttpMethodController';
import { Validation } from '../src/Validation';

describe('ValidatorMiddleware', () => {
  beforeAll(() => {});

  afterAll(() => {});

  beforeEach(() => {});

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  it('すべてのValidatorがUndefinedのとき', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    type StringType = {
      char: string;
    };
    const validation: IValidation<StringType, any, any, any> = {
      bodyValidator: undefined,
      headerValidator: undefined,
      paramValidator: undefined,
      queryValidator: undefined
    };
    const body: any = {};
    const params: any = {};
    const query: any = {};
    const headers: any = {};

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    const result = await Validation.check(validation, headers, params, body, query);

    /* ------------------------------ 評価項目 ------------------------------ */
    expect(result).toBeTruthy();
  });

  it('キーが未定義のとき true', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    type StringType = {
      char: string;
    };
    const validation: IValidation<StringType, any, any, any> = {
      bodyValidator: {
        char: {
          type: 'string',
          required: false
        }
      },
      headerValidator: undefined,
      paramValidator: undefined,
      queryValidator: undefined
    };
    const body: any = {};
    const params: any = {};
    const query: any = {};
    const headers: any = {};

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    const result = await Validation.check(validation, headers, params, body, query);

    /* ------------------------------ 評価項目 ------------------------------ */
    expect(result).toBeTruthy();
  });

  it('キーが未定義のとき false', async () => {
    /* --------------------------- テストの前処理 --------------------------- */
    type StringType = {
      char: string;
    };
    const validation: IValidation<StringType, any, any, any> = {
      bodyValidator: {
        char: {
          type: 'string',
          required: true
        }
      },
      headerValidator: undefined,
      paramValidator: undefined,
      queryValidator: undefined
    };
    const body: any = {};
    const params: any = {};
    const query: any = {};
    const headers: any = {};

    /* ------------------------ テスト対象関数を実行 ------------------------ */
    const result = await Validation.check(validation, headers, params, body, query);

    /* ------------------------------ 評価項目 ------------------------------ */
    expect(result).not.toBeTruthy();
  });

  describe('String Validation', () => {
    it('Typeが異なるとき', async () => {
      type StringType = {
        char: string;
      };
      const validation: IValidation<any, any, any, StringType> = {
        bodyValidator: undefined,
        headerValidator: {
          char: {
            type: 'string',
            required: true
          }
        },
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {};
      const params: any = {};
      const query: any = {};
      const headers: any = {
        char: 11
      };

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('regExp true', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<any, any, StringType, any> = {
        bodyValidator: undefined,
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: {
          a: {
            type: 'string',
            required: true,
            regExp: /[0-9]{3}/
          }
        }
      };
      const body: any = {};
      const params: any = {};
      const query: StringType = {
        a: '012'
      };
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('regExp false', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<any, StringType, any, any> = {
        bodyValidator: undefined,
        headerValidator: undefined,
        paramValidator: {
          a: {
            type: 'string',
            required: true,
            regExp: /^[0-9]{3}$/
          }
        },
        queryValidator: undefined
      };
      const body: any = {};
      const params: StringType = {
        a: '0123456789'
      };
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('maxLength true', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<StringType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'string',
            required: true,
            maxLength: 4
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: StringType = {
        a: '0123'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('maxLength false', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<StringType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'string',
            required: true,
            maxLength: 4
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: StringType = {
        a: '01234'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('minLength true', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<StringType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'string',
            required: true,
            minLength: 4
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: StringType = {
        a: '0123'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('minLength false', async () => {
      /* --------------------------- テストの前処理 --------------------------- */
      type StringType = {
        a: string;
      };
      const validation: IValidation<StringType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'string',
            required: true,
            minLength: 4
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: StringType = {
        a: '012'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });
  });

  describe('Number Validator', () => {
    it('Typeが異なるとき', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: '11'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('整数 true', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 1
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('整数 false', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 1.1
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('orLower true', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: true,
            orLower: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 1
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('orLower false', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: true,
            orLower: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 2
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('orMore true', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            orMore: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 1
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('orMore false', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            orMore: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 0
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('lessThan true', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            lessThan: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 0
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('lessThan false', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            lessThan: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 2
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('moreThan true', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            moreThan: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 2
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('moreThan false', async () => {
      type NumberType = {
        a: number;
      };
      const validation: IValidation<NumberType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'number',
            required: true,
            integer: false,
            moreThan: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 0
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });
  });

  describe('Boolean Validator', () => {
    it('Typeが異なるとき', async () => {
      type BooleanType = {
        a: boolean;
      };
      const validation: IValidation<BooleanType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'boolean',
            required: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: '11'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('Typeが正しいとき', async () => {
      type BooleanType = {
        a: boolean;
        b: boolean;
      };
      const validation: IValidation<BooleanType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'boolean',
            required: true
          },
          b: {
            type: 'boolean',
            required: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: true,
        b: false
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });
  });

  describe('Object Validation', () => {
    it('Typeが異なるとき 1', async () => {
      type ObjectType = {
        a: {
          b: string;
        };
      };
      const validation: IValidation<ObjectType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'object',
            required: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: '11'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('Typeが異なるとき 2', async () => {
      type ObjectType = {
        a: {
          b: string;
        };
      };
      const validation: IValidation<ObjectType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'object',
            required: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: []
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('オブジェクトのバリデーション定義', async () => {
      type ObjectType = {
        a: {
          b: string;
        };
      };
      const validation: IValidation<ObjectType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'object',
            required: true,
            validator: {
              b: {
                type: 'string',
                required: true
              }
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: {
          b: ''
        }
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('オブジェクトのバリデーション未定義', async () => {
      type ObjectType = {
        a: {
          b: string;
        };
      };
      const validation: IValidation<ObjectType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'object',
            required: true
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: {
          b: ''
        }
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });
  });

  describe('Array Validator', () => {
    it('Typeが正しい', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: [1]
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('Typeが異なるとき 1', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: '11'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('Typeが異なるとき 2', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'string',
              required: true
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: [11]
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('Typeが異なるとき 3', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'boolean',
              required: true
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: ['true']
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('Typeが異なるとき 4', async () => {
      type ArrayType = {
        a: { b: string }[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            objectValidator: {
              b: {
                type: 'string',
                required: true
              }
            }
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: ['true']
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('minLength true', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            },
            minLength: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: [1]
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('minLength false', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            },
            minLength: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: []
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });

    it('maxLength true', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            },
            maxLength: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: [1]
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('maxLength false', async () => {
      type ArrayType = {
        a: number[];
      };
      const validation: IValidation<ArrayType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'array',
            required: true,
            primitiveValidator: {
              type: 'number',
              required: true,
              integer: true
            },
            maxLength: 1
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: [1, 2]
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });
  });

  describe('Enum Validator', () => {
    it('Enumに含んでいる場合', async () => {
      type EnumType = {
        a: HttpMethod;
      };
      const validation: IValidation<EnumType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'enum',
            required: true,
            list: httpMethodList
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: EnumType = {
        a: 'GET'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).toBeTruthy();
    });

    it('Enumに含んでいない場合', async () => {
      const httpMethodList = ['a', 'b'] as const;
      type EnumType = {
        a: HttpMethod;
      };
      const validation: IValidation<EnumType, any, any, any> = {
        bodyValidator: {
          a: {
            type: 'enum',
            required: true,
            list: httpMethodList
          }
        },
        headerValidator: undefined,
        paramValidator: undefined,
        queryValidator: undefined
      };
      const body: any = {
        a: 'c'
      };
      const params: any = {};
      const query: any = {};
      const headers: any = {};

      /* ------------------------ テスト対象関数を実行 ------------------------ */
      const result = await Validation.check(validation, headers, params, body, query);

      /* ------------------------------ 評価項目 ------------------------------ */
      expect(result).not.toBeTruthy();
    });
  });
});
