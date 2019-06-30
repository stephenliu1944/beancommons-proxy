/** 
 * 该类用于开发调试, 打包时会忽略此文件.
 */
import proxy, { settings } from './index';
import pkg from '../package.json';

console.log(proxy.settings(pkg.devServer.proxy, {
    // prefix: 'api',
    secure: true
}));

