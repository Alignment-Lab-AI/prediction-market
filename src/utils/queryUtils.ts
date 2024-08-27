// src/utils/queryUtils.ts

export const encodeQuery = (query: object): string => {
    return Buffer.from(JSON.stringify(query)).toString('base64');
  };