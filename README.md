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
import Proxy from '@beanutils/proxy';
import pkg from './package.json';
const { local, proxy } = pkg.devServer;

{
    devServer: {
        host: '0.0.0.0',
        port: local,
        proxy: Proxy.createProxy(proxy)
        ....
    }
    ...
}
```
app.js(optional)   
```
// use @beanutils/http-request http lib
import HttpRequest from '@beanutils/http-request';
import Proxy from '@beanutils/proxy';
HttpRequest({
    baseURL: 'http://api1.xxxx.com',
    url: 'xxx',
    proxyPath: Proxy.hostPath
    ...
}).then((data) => {

}, (error) => {

});
```