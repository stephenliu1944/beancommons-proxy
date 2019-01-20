/** 
 * 该类用于开发调试, 打包时会忽略此文件.
 */
import { proxy } from './index';
import pkg from '../package.json';

console.log(proxy(pkg.devServer.proxy, {
    prefix: 'api',
    secure: false
}));

