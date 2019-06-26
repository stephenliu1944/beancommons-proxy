# http-proxy-settings
Easy to set proxy options for http-proxy-middleware.

## Install
```
npm install -D http-proxy-settings
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
    "proxies": "http://api.xxx.com"                         // matching /http://api.xxx.com to target http://api.xxx.com
    // Object
    "proxies": {
        "/api": "http://api.xxx.com",                       // matching /api to target http://api.xxx.com
        "http://api.xxx.com": "http://api.xxx.com",         // matching /http://api.xxx.com to target http://api.xxx.com
        "http://api.xxx.com/api": "http://api.xxx.com",     // matching /http://api.xxx.com/api to target http://api.xxx.com
        "http://192.168.1.1": "http://api.xxx.com",         // matching /http://192.168.1.1 to target http://api.xxx.com
        "http://192.168.1.1:8080": "http://api.xxx.com",    // matching /http://192.168.1.1:8080 to target http://api.xxx.com
        "http://api2.xxx.com": {                            // matching /http://api2.xxx.com to target http://localhost:3002 with more custom options
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
import { settings } from 'http-proxy-settings';
import pkg from './package.json';

const { local, proxies } = pkg.devEnvironments;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: settings(proxies)
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
        proxy: settings(proxies, {
            prefix: 'api'       // all proxies matching paths starting with /api
            (http-proxy-middleware options)...
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
        proxy: settings(proxies, {
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
    secure: false,
    cookieDomainRewrite: '',
    cookiePathRewrite: '/',
    pathRewrite: (_path) => _path.replace(key, '')
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