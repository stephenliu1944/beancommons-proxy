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
     * //d.beancommons.com > //d.beancommons.com (此处有bug, 不要这样写)
     * http://localhost:3001/ > /http://localhost:3001
     * /http://192.168.1.1:3001 > /http://192.168.1.1:3001
     * http://ynreport.bbdservice.net/abc/ > /http://ynreport.bbdservice.net/abc
     * [/http://ynreport.bbdservice.net]/abc/ > [http://ynreport.bbdservice.net]/abc
     */ 
    // 去掉开头和末尾的 '/'
    var matchingPath = baseURL.replace(/^(\[)?\//, '$1').replace(/\/$/, '');

    if (isNotBlank(prefix)) {
        matchingPath = `${prefix}/${matchingPath}`;
    }
    // TODO: 头部不加 / 行不行, 加 /是因为 http.proxyHost() 头部加了 /
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
            // 获取到 value 配置
            let customOpt = options[key];
            let pathMatching = key.replace('[', '').replace(']', '');

            proxyOptions[pathMatching] = {
                logLevel: 'debug',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                pathRewrite: (requestPath) => {
                    let replacement = key;
                    // 将括号中的字符替换掉匹配的路径
                    if (/\[(.+)\]/.test(key)) {
                        replacement = RegExp.$1;
                    }
                    return requestPath.replace(replacement, '');
                },
                ...defaults
            };

            if (isString(customOpt)) {
                proxyOptions[pathMatching].target = customOpt;
            } else if (isObject(customOpt)) {
                Object.assign(proxyOptions[pathMatching], customOpt);
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