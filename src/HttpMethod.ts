export const httpMethodList = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'] as const;
export type HttpMethod = typeof httpMethodList[number];
