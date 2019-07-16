import { isBlank, isArray, isString, isObject } from 'utils/common';

// 根据 prefix + baseURL 生成匹配路径
function handlePathMatching(path) {
    if (isBlank(path)) {
        return '';
    }

    return path;
}

// 为服务设置匹配路径 
function translateConfig(services) {
    if (!services) {
        return;
    }

    var options = {};

    // set paths matching 
    if (isString(services)) {
        options[handlePathMatching(services)] = services;
    } else if (isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                options[handlePathMatching(key)] = services[key];
            }
        }
    } else if (isArray(services)) {
        services.forEach((service) => {
            Object.assign(options, translateConfig(service));
        });
    } else {
        throw new Error('proxy options type error, only support string, object or array.');
    }

    return options;
}
// 封装 pathRewrite 方法
function pathRewriteWrapper(key, target, pathRewrite) {
    return function(path, req) {    // path 是请求的全路径
        let reqPath;
        const MARK = '(';
        const MARK_PATTERN = /[\(\)]/g;
        const REPLACE_PATTERN = /(\([\w\:\&\+\%\=\.\/\?\-]*\))+?/g;

        if (key.includes(MARK)) {
            let pathMatching = key.replace(MARK_PATTERN, '');                                   // 清除括号, 拿到 http-proxy-middleware 匹配的字符串
            let replacement = key.replace(REPLACE_PATTERN, '');                                 // 拿到移除()内容后的字符串
            reqPath = path.replace(pathMatching, replacement).replace(/\/{2,}/, '/').trim();    // 找到匹配的字符串, 替换为标记, 
        } else {
            reqPath = path;
        }

        if (pathRewrite) {
            reqPath = pathRewrite(reqPath, req);
        }
        
        setTimeout(() => {
            /* eslint-disable */
            console.log('[HPM] HTTP/'+ req.httpVersion, target + reqPath);
            /* eslint-enable */
        }, 0);

        return reqPath;
    };
}

// 为匹配路径配置代理选项
function setHttpProxyOptions(options = {}, defaults = {}) {
    var proxyOptions = {};
    const MARK_PATTERN = /[\(\)]/g;

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            // 获取到 value 配置
            let value = options[key];
            let pathMatching = key.replace(MARK_PATTERN, '');

            proxyOptions[pathMatching] = {
                logLevel: 'debug',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                ...defaults
            };

            if (isString(value)) {
                proxyOptions[pathMatching].target = value.replace(MARK_PATTERN, '');
            } else if (isObject(value)) {
                Object.assign(proxyOptions[pathMatching], value);
            } else {
                throw new Error('proxy options type error, only support string and object type');
            }

            // wrap pathRewrite
            proxyOptions[pathMatching].pathRewrite = pathRewriteWrapper(key, proxyOptions[pathMatching].target, proxyOptions[pathMatching].pathRewrite);
        }
    }

    return proxyOptions;
}

export function settings(config, defaultOpts = {}) {
    var options = translateConfig(config);
    var proxyOptions = setHttpProxyOptions(options, defaultOpts);
    return proxyOptions;
}