# @beancommons/proxy
Easy to config webpack devServer proxy or http-proxy-middleware options.

## Install
```
npm install -D @beancommons/proxy
```

## Usage
Proxy support three data types: String, Array or Object.
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
    // String
    "proxy": "http://api1.xxxx.com"     // matching /proxy/api1.xxxx.com target http://api1.xxxx.com
    // Array
    "proxy": [
        // matching /proxy/api1.xxxx.com target http://api1.xxxx.com
        "http://api1.xxxx.com", 
        or                                       
        {   // matching /proxy/api2.xxxx.com target http://localhost:3002
            "http://api2.xxxx.com": "http://localhost:3002"   
        },
        or        
        {   // matching /proxy/api3.xxxx.com target http://localhost:3003 and more custom options
            "http://api3.xxx.com": {                          
                target: "http://localhost:3003"
                (http-proxy-middleware options)...
            }
        }
    ]
    // Object
    "proxy": {
        // idem
        "http://api1.xxx.com": "http://localhost:3001",  
        or     
        // idem
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
app.js(optional)
```js
/**
 * use @beancommons/http
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
 * @param {object} defaults default http-proxy-middleware options
 * @return {object}
 */
proxy(services, prefix = 'proxy', defaults)
```