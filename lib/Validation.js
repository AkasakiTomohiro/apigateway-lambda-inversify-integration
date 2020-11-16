"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Validation {
    static async check(condition, headers, pathParameters, body, queryParameters) {
        let flag = true;
        // Bodyのバリデーションチェック
        if (condition.validation.bodyValidator !== undefined) {
            flag = flag && Validation.validation(body, condition.validation.bodyValidator);
        }
        // Paramのバリデーションチェック
        if (condition.validation.paramValidator !== undefined) {
            flag = flag && Validation.validation(pathParameters, condition.validation.paramValidator);
        }
        // Queryのバリデーションチェック
        if (condition.validation.queryValidator !== undefined) {
            flag = flag && Validation.validation(queryParameters, condition.validation.queryValidator);
        }
        // Headerのバリデーションチェック
        if (condition.validation.headerValidator !== undefined) {
            flag = flag && Validation.validation(headers, condition.validation.headerValidator);
        }
        return flag;
    }
    static validation(param, validationList) {
        let result = true;
        const keyList = Object.keys(validationList);
        keyList.forEach(key => {
            let flag = true;
            const validator = validationList[key];
            const paramExists = key in param;
            // パラメータが必須項目の場合、存在確認
            if (validator.required) {
                flag = flag && paramExists;
            }
            // パラメータが存在している時はバリデーションチェック
            if (validator.type === 'string' && paramExists) {
                flag = flag && Validation.stringValidation(param[key], validator);
            }
            if (validator.type === 'boolean' && paramExists) {
                flag = flag && Validation.booleanValidation(param[key]);
            }
            if (validator.type === 'number' && paramExists) {
                flag = flag && Validation.numberValidation(param[key], validator);
            }
            if (validator.type === 'object' && paramExists) {
                flag = flag && Validation.objectValidation(param[key], validator);
            }
            if (validator.type === 'array' && paramExists) {
                flag = flag && Validation.arrayValidation(param[key], validator);
            }
            if (validator.type === 'enum' && paramExists) {
                flag = flag && Validation.enumValidation(param[key], validator);
            }
            result = result && flag;
        });
        return result;
    }
    static enumValidation(param, validator) {
        return validator.list.includes(param);
    }
    static arrayValidation(param, validator) {
        if (!Array.isArray(param)) {
            return false;
        }
        let flag = true;
        if (validator.minLength !== undefined) {
            flag = flag && param.length >= validator.minLength;
        }
        if (validator.maxLength !== undefined) {
            flag = flag && param.length <= validator.maxLength;
        }
        if (validator.validator !== undefined) {
            param.forEach(p => {
                flag = flag && this.validation(p, validator.validator);
            });
        }
        return flag;
    }
    static objectValidation(param, validator) {
        if (Array.isArray(param) || typeof param !== 'object') {
            return false;
        }
        let flag = true;
        if (validator.validator !== undefined) {
            flag = flag && this.validation(param, validator.validator);
        }
        return flag;
    }
    static booleanValidation(param) {
        return typeof param === 'boolean';
    }
    static numberValidation(param, validator) {
        if (typeof param !== 'number') {
            return false;
        }
        let flag = true;
        if (validator.integer) {
            flag = flag && Number.isInteger(param);
        }
        if (validator.min !== undefined) {
            flag = flag && param >= validator.min;
        }
        if (validator.max !== undefined) {
            flag = flag && param <= validator.max;
        }
        return flag;
    }
    static stringValidation(param, validator) {
        if (typeof param !== 'string') {
            return false;
        }
        let flag = true;
        if (validator.regExp !== undefined) {
            flag = flag && validator.regExp.test(param);
        }
        if (validator.minLength !== undefined) {
            flag = flag && param.length >= validator.minLength;
        }
        if (validator.maxLength !== undefined) {
            flag = flag && param.length <= validator.maxLength;
        }
        return flag;
    }
}
exports.Validation = Validation;
