# @beancommons/proxy
Easy to config webpack devServer proxy or http-proxy-middleware options.

## Install
```
npm install -D @beancommons/proxy
```

## Usage
Proxy support three data types: String, Array or Object.  
### package.json
```js
"dependencies": {
...
},
"devDependencies": {
...
},
// custom field, whatever you want
"devEnvironments": {
    // String
    "proxies": "http://api.xxx.com"     // url matching /api.xxxx.com to target http://api.xxx.com
    // Object
    "proxies": {
        "/api": "http://api.xxx.com",                       // url matching /api to target http://api.xxx.com
        "http://api.xxx.com": "http://api.xxx.com",         // url matching /api.xxxx.com to target http://api.xxx.com
        "http://api.xxx.com/api": "http://api.xxx.com",     // url matching /api.xxxx.com/api to target http://api.xxx.com
        "http://192.168.1.1": "http://api.xxx.com",         // url matching /192.168.1.1 to target http://api.xxx.com
        "http://192.168.1.1:8080": "http://api.xxx.com",    // url matching /192.168.1.1:8080 to target http://api.xxx.com
        "http://api2.xxx.com": {                            // url matching /api2.xxx.com to target http://localhost:3002 and more custom options
            target: "http://localhost:3002"
            (http-proxy-middleware options)...
        }
    }
    // Array
    "proxies": [
        "http://api1.xxxx.com", 
        {   
            "http://api2.xxxx.com": "http://192.168.1.1:3001",   
            "http://api3.xxxx.com": "http://192.168.1.1:3002"   
        }, {   
            "http://api4.xxx.com": {                          
                target: "http://192.168.1.1:3003"
                (http-proxy-middleware options)...
            }
        }
    ]

}
...
```

### webpack.config.dev.js  
```js
import { proxy } from '@beancommons/proxy';
import pkg from './package.json';

const { local, proxies } = pkg.devEnvironments;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: proxy(proxies, {
            prefix: 'api',     // prefix of proxy url, like matching /api/www.xxxx.com
            secure: false      // http-proxy-middleware options
            ...                // other http-proxy-middleware options
        })
    }
    ...
}
```

### app.js
use @beancommons/http or other
```js
import http, { helpers } from '@beancommons/http';
http({
    baseURL: 'http://api1.xxxx.com',
    url: 'xxx',
    proxyPath: helpers.proxyHost
    ...
});
```

## API
```js
/**
 * @desc create options of http-proxy-middleware
 * @param {string | array | object} services proxy config.
 * @param {object} defaults prefix(default is '') and http-proxy-middleware options
 * @return {object}
 */
proxy(services, defaults)
```