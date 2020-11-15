"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validation_1 = require("./Validation");
class Controller {
    constructor() {
        /**
         * HTTPMethodに対応したイベント処理方法が記述されたオブジェクトリスト
         */
        this.conditions = {};
    }
    async handler(event) {
        const condition = this.conditions[event.httpMethod];
        if (condition === undefined) {
            return Controller.badRequestResponse;
        }
        else {
            // 認証
            const [authResult, err401, err500] = await this.auth(event, condition);
            if (err401) {
                return Controller.unauthorizeErrorResponse;
            }
            if (err500) {
                return Controller.internalServerErrorResponse;
            }
            // バリデーション
            const validationResult = await Validation_1.Validation.check(condition, event.headers, event.pathParameters, event.body, event.queryStringParameters);
            if (!validationResult) {
                return Controller.badRequestResponse;
            }
            // 指定関数を呼び出す
            return condition.func(event.headers, event.pathParameters, event.body, event.queryStringParameters, authResult);
        }
    }
    /**
     * HttpMethodに対応したイベントの定義を追加
     *
     * @param method どのHttpMethodのときに実施するか
     * @param condition HTTPMethodに対応したイベント処理方法
     */
    setMethod(method, condition) {
        this.conditions[method] = condition;
    }
    /**
     * 認証を行う関数
     *
     * @param  {APIGatewayProxyEvent} event API Gatewayから渡されたEventデータ
     * @param  {Condition<E>} condition HTTPMethodに対応したイベント処理方法が記述されたオブジェクト
     * @returns Promise<[authResult: E | undefined, err401: boolean, err500: boolean]>
     */
    async auth(event, condition) {
        if (condition.auth) {
            if (Controller.authenticationFunc === undefined) {
                return [undefined, false, true];
            }
            else {
                const [flag, authResult] = await Controller.authenticationFunc(event)
                    .then(data => [true, data])
                    .catch(() => [false, undefined]);
                return [authResult, flag, false];
            }
        }
        else {
            return [undefined, true, false];
        }
    }
}
exports.Controller = Controller;
Controller.badRequestResponse = {
    statusCode: 400,
    body: 'Bad Request'
};
Controller.unauthorizeErrorResponse = {
    statusCode: 401,
    body: 'Unauthorize'
};
Controller.internalServerErrorResponse = {
    statusCode: 500,
    body: 'Internal Server Error'
};
Controller.authenticationFunc = undefined;
