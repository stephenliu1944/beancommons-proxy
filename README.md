# @beancommons/proxy
Easy to config webpack devServer proxy or http-proxy-middleware options.

## Install
```
npm install -D @beancommons/proxy
```

## Usage
Proxy support format: String, Array or Object.  
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
    "proxies": "http://api.xxx.com"                         // url matching /api.xxxx.com to target http://api.xxx.com
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
        proxy: proxy(proxies)
    }
    ...
}
```

matches paths starting with prefix
```js
{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: proxy(proxies, {
            prefix: 'api'       // all proxies matching paths starting with /api
        })
    }
    ...
}
```

rewrite default options of http-proxy-middleware
```js
{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: proxy(proxies, {
            logLevel: 'info',
            secure: true,
            ws: true
            ...
        })
    }
    ...
}
```

default options
```js
{
    logLevel: 'debug',
    changeOrigin: true,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    pathRewrite: (_path) => _path.replace(key, '')
}
```

## API
```js
/**
 * @desc create options of http-proxy-middleware
 * @param {string | array | object} config proxy config.
 * @param {object} options default options of http-proxy-middleware with prefix(default is '')
 * @return {object}
 */
proxy(config, options)
```