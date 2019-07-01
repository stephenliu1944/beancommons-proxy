export function onProxyRes(proxyRes, req, res) {
    var cookies = proxyRes.headers['set-cookie'];  
    if (cookies && cookies.length > 0) {
        var cookiesStr = JSON.stringify(cookies);
        var localSetCookie = cookiesStr.replace(/(;\s*Domain=[\w|-|\.]+)|(Domain=[\w|-|\.]+;\s*)/g, '')
            .replace(/(;\s*HttpOnly)|(HttpOnly;\s*)/, '')
            .replace(/(;\s*Secure)|(Secure;\s*)/, '');
        proxyRes.headers['set-cookie'] = JSON.parse(localSetCookie);
    }
}