import { isArray, isString, isObject } from 'utils/common';

// 为服务设置匹配路径 
function translateConfig(services) {
    if (!services) {
        return;
    }

    const MARK_PATTERN = /[\(\)]/g;
    var options = {};

    // set paths matching 
    if (isString(services)) {
        options[services] = services.replace(MARK_PATTERN, '');
    } else if (isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                options[key] = services[key];
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
        const MARK = '(';        
        // 修复路径包含 http:// 会被 http-proxy-middleware 替换为 http:/ 的情况.
        let reqPath = path.replace(/:\/{1,}/, '://');   

        if (key.includes(MARK)) {
            const MARK_PATTERN = /[\(\)]/g;
            const REPLACE_PATTERN = /(\([\w\:\&\+\%\=\.\/\?\-]*\))+?/g;
            // 清除括号, 拿到 http-proxy-middleware 匹配的字符串
            let pathMatching = key.replace(MARK_PATTERN, '');                                   
            // 拿到移除()内容后的字符串
            let replacement = key.replace(REPLACE_PATTERN, '');                                 
            // 找到匹配的字符串, 替换为标记, 注意: reqPath 以 "/" 开头
            reqPath = reqPath.replace(pathMatching, replacement)
            // 将多个//替换为单个/, 并排除://情况
                .replace(/(:?)(\/{2,})/, (match, p1, p2) => p1 ? p1 + p2 : '/').trim();    
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
            let pathMatching = key.replace(MARK_PATTERN, '').replace(/(^\/*)/, (match, p1) => {
                // 处理 // 开头的情况, 由于2个//开头有特殊含义, 不能省略, 因此返回 "///"
                if (p1 && p1.length > 1) {
                    return '/' + p1;
                }
                // 其他情况返回一个 / 开头
                return '/';
            });

            let option = proxyOptions[pathMatching] = {
                logLevel: 'debug',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                ...defaults
            };

            if (isString(value)) {
                option.target = value;
            } else if (isObject(value)) {
                Object.assign(option, value);
            } else {
                throw new Error('proxy options type error, only support string and object type');
            }

            // wrap pathRewrite
            option.pathRewrite = pathRewriteWrapper(key, option.target, option.pathRewrite);
        }
    }

    return proxyOptions;
}

export function settings(config, defaultOpts = {}) {
    var options = translateConfig(config);
    var proxyOptions = setHttpProxyOptions(options, defaultOpts);
    return proxyOptions;
}