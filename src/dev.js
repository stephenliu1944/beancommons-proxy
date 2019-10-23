/** 
 * 该类用于开发调试, 打包时会忽略此文件.
 */
import { settings } from './index';
import pkg from '../package.json';

console.log(settings(pkg.devServer.proxy, {
    secure: true
}));

