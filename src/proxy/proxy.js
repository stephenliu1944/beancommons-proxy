import { isBlank, isNotBlank, isArray, isString, isObject } from '@beancommons/utils';

// 根据 prefix + baseURL 生成匹配路径
function proxyPath(baseURL, prefix) {
    if (isBlank(baseURL)) {
        return '';
    }
    /**
     * 修剪路径匹配
     * /api/ > /api
     * ynreport.bbdservice.net/ > /ynreport.bbdservice.net
     * http://localhost:3001/ > /http://localhost:3001
     * /http://192.168.1.1:3001 > /http://192.168.1.1:3001
     * http://ynreport.bbdservice.net/abc/ > /http://ynreport.bbdservice.net/abc
     */ 
    // 去掉开头和末尾的 '/'
    var matchingPath = baseURL.replace(/^\//, '').replace(/\/$/, '');

    if (isNotBlank(prefix)) {
        matchingPath = `${prefix}/${matchingPath}`;
    }

    return `/${matchingPath}`;
}
// 为服务设置匹配路径
function setPathsMatching(services, prefix) {
    if (!services) {
        return;
    }

    var options = {};

    // set matching paths
    if (isString(services)) {
        options[proxyPath(services, prefix)] = services;
    } else if (isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                options[proxyPath(key, prefix)] = services[key];
            }
        }
    } else if (isArray(services)) {
        services.forEach((service) => {
            Object.assign(options, setPathsMatching(service, prefix));
        });
    } else {
        throw new Error('proxy options type error, only support string, object or array type');
    }

    return options;
}
// 为匹配路径配置代理选项
function setProxyOptions(options = {}, defaults = {}) {
    var proxyOptions = {};

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            let opt = options[key];

            proxyOptions[key] = {
                logLevel: 'debug',
                changeOrigin: true,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                pathRewrite: (_path) => _path.replace(key, ''),
                ...defaults
            };

            if (isString(opt)) {
                proxyOptions[key].target = opt;
            } else if (isObject(opt)) {
                Object.assign(proxyOptions[key], opt);
            } else {
                throw new Error('proxy options type error, only support string and object type');
            }
        }
    }

    return proxyOptions;
}

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

export function settings(services, defaultOpts = {}) {
    var { prefix, ...other } = defaultOpts;
    var matchings = setPathsMatching(services, prefix);
    var options = setProxyOptions(matchings, other);
    return options;
}