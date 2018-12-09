/** 
 * 该类用于开发调试, 打包时会忽略此文件.
 */
import { proxyPath, configProxy } from './index';
import pkg from '../package.json';

console.log(configProxy(pkg.devServer.proxy));



