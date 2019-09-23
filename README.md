# @middlend/proxy-config
Easy to set proxy options for http-proxy-middleware.

## Install
```
npm install -D @middlend/proxy-config
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
// key will transform to path matching, value will transform to target options
// First match will be used. The order of the configuration matters.
"devEnvironments": {
    // String
    "proxies": "http://api.xxx.com",                        // matching 'http://api.xxx.com' proxy to 'http://api.xxx.com'
    // Object
    "proxies": {
        "/api/users": "http://api3.xxx.com",                // matching '/api/users' proxy to 'http://api3.xxx.com'
        "/api/user/1": "http://api2.xxx.com",               // matching '/api/user/1' proxy to 'http://api2.xxx.com'
        "/api": "http://api1.xxx.com",                      // matching '/api' proxy to 'http://api1.xxx.com'
        "/api/books": {                                     // matching '/api/books' to target 'http://localhost:3000
            target: "http://localhost:3000"
            (http-proxy-middleware options)...
        }
    },
    // Array
    "proxies": [
        "http://api1.xxxx.com",                             // matching 'http://api.xxx.com' proxy to 'http://api.xxx.com'
        {
            "/api/users": "http://api3.xxx.com",            // matching '/api/users' proxy to 'http://api3.xxx.com'
            "/api/user/1": "http://api2.xxx.com",           // matching '/api/user/1' proxy to 'http://api2.xxx.com'
            "/api": "http://api1.xxx.com"                   // matching '/api' proxy to 'http://api1.xxx.com'
        },
        {
            "/api/books": {                                 // matching '/api/books' proxy to 'http://localhost:3000
                target: "http://localhost:3000"
                (http-proxy-middleware options)...
            }
        }
    ],
    // use () to rewrite path(content which is in () will be rewritten to '')
    "proxies": {
        "(http://api.xxx.com)/api/user/1": "http://api5.xxx.com"    // request '/http://api.xxx.com/api/user/1', matching 'http://api.xxx.com/api/user/1', proxy to http://api5.xxx.com/api/user/1
        "(http://api.xxx.com)/api/user/2": "http://api4.xxx.com"    // request '/http://api.xxx.com/api/user/2', matching 'http://api.xxx.com/api/user2', proxy to http://api4.xxx.com/api/user/2'
        "(http://api.xxx.com)/api/users": "http://api3.xxx.com",     // request '/http://api.xxx.com/api/users', matching 'http://api.xxx.com/api/users', proxy to http://api3.xxx.com/api/users'
        "(/proxy)/api": "http://api2.xxx.com",               // request '/proxy/api/210.75.225.254', matching '/proxy/api', proxy to 'http://api2.xxx.com/api/210.75.225.254'
        "(/proxy)": "http://api1.xxx.com"                    // request '/proxy/json/210.75.225.254', matching '/proxy', proxy to 'http://api1.xxx.com/json/210.75.225.254'
    }
}
...
```

### webpack.config.dev.js  
setting options
```js
import { settings } from '@middlend/proxy-config';
import pkg from './package.json';

const { local, proxies } = pkg.devEnvironments;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: {
            ...settings(proxies),
            ...other
        }
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
        proxy: {
            ...settings(proxies, {
                logLevel: 'info',
                secure: true,
                ws: true
                ...(http-proxy-middleware options)
            }),
            ...other
        }
    }
    ...
}
```

default options
```js
{
    logLevel: 'debug',
    changeOrigin: true,
    secure: false,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    pathRewrite: pathRewriteWrapper  // pathRewriteWrapper will replace [xxx] to '' which is in path matching, like '[/proxy]' or '[/proxy]/api'
}
```

## API
```js
/**
 * @desc create options for http-proxy-middleware
 * @param {string | array | object} options proxy config.
 * @param {object} default default options.
 * @return {object}
 */
settings(options, default)
```