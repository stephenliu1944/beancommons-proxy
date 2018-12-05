# @beancommons/proxy
Easy to config webpack devServer proxy or http-proxy-middleware options.

## Install
```
npm install --save @beancommons/proxy
```

## Usage
Proxy support three data types: string, array or object.
package.json
```js
"dependencies": {
...
},
"devDependencies": {
...
},
// custom field, whatever you want
"devServer": {          
    "local": 8080,
    // proxy http://api1.xxxx.com to http://api1.xxxx.com
    "proxy": "http://api1.xxxx.com"                           
     or
    "proxy": [
        // proxy http://api1.xxxx.com to http://api1.xxxx.com
        "http://api1.xxxx.com",                               
        // proxy http://api2.xxxx.com to http://localhost:3002
        { 
            "http://api2.xxxx.com": "http://localhost:3002"   
        },
        // proxy http://api3.xxxx.com to http://localhost:3003 and more custom options
        { 
            "http://api3.xxx.com": {                          
                target: "http://localhost:3003"
                (http-proxy-middleware options)...
            }
        }
    ]
     or
    "proxy": {
        "http://api1.xxx.com": "http://localhost:3001",       
        "http://api2.xxx.com": {                              
            target: "http://localhost:3002"
            (http-proxy-middleware options)...
        }
    }
}
...
```
webpack.config.dev.js  
```js
import { configProxy } from '@beancommons/proxy';
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
```js
import { proxyPath } from '@beancommons/proxy';

/**
 * use @beancommons/http (optional)
 */ 
import HttpRequest from '@beancommons/http';
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
```js
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