import * as foo from 'foo';

export const externalsHaveEsModule = () => Object.hasOwnProperty.call(foo, '__esModule');