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
import { proxy } from '@beancommons/proxy';
import pkg from './package.json';

const { local, proxy: proxyOpts } = pkg.devServer;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: {
            ...proxy(proxyOpts)
        }        
    }
    ...
}
```
app.js   
```js
/**
 * use @beancommons/http (optional)
 */ 
import http, { proxyBaseURL } from '@beancommons/http';
http({
    baseURL: 'http://api1.xxxx.com',
    url: 'xxx',
    proxyPath: proxyBaseURL
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
proxy(services, prefix = 'proxy')
```