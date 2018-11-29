# @beanutils/proxy
For dev environment http proxy config.

## Install
```
npm install --save @beanutils/proxy
```

## Usage
package.json
```
...
"devServer": {
    "local": 8080,
    // proxy suport three data types, string, array or object.
    "proxy": "http://api1.xxxx.com"
     or
    "proxy": [
        "http://api1.xxxx.com"      // api1
        "http://api2.xxxx.com"      // api2
        "http://api3.xxxx.com"      // api3
    ]
     or
    "proxy": {
        "http://api1.xxx.com": "http://localhost:3001",     // mock
        or
        "http://api2.xxx.com": {
            target: "http://localhost:3002"
            (http-proxy-middleware options)...
        }
    }
}
...
```
webpack.config.dev.js  
```
import { configProxy } from '@beanutils/proxy';
import pkg from './package.json';
const { local, proxy } = pkg.devServer;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: configProxy(proxy)
        ....
    }
    ...
}
```
app.js   
```
import { proxyPath } from '@beanutils/proxy';

/**
 * use @beanutils/http-request (optional)
 */ 
import HttpRequest from '@beanutils/http-request';
HttpRequest({
    baseURL: 'http://api1.xxxx.com',
    url: 'xxx',
    proxyPath: proxyPath
    ...
}).then((data) => {

}, (error) => {

});

/**
 * use axios (optional)
 */
import axios from 'axios';
var baseURL = 'http://api1.xxxx.com';
axios({
    baseURL: baseURL,
    url: `${proxyPath(baseURL)}/api/xxxx`,
    ...
}).then((data) => {

}, (error) => {

});
```

## API
```
/**
 * @desc create options of http-proxy-middleware
 * @param {string | array | object} services proxy config.
 * @param {string} prefix match path prefix, default is 'proxy'.
 * @return {object}
 */
configProxy(services, prefix = 'proxy')

/**
 * @desc get a matching proxy path with prefix.
 * @param {string} baseURL url with host.
 * @param {string} prefix match path prefix, default is 'proxy'.
 * @return {string}
 */
proxyPath(baseURL, prefix = 'proxy')
```