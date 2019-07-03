import { isBlank, isArray, isString, isObject } from '@beancommons/utils';

// 根据 prefix + baseURL 生成匹配路径
function handlePathMatching(path) {
    if (isBlank(path)) {
        return '';
    }

    return path;
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
/*
    // 去掉开头和末尾的 '/'
    var matchingPath = baseURL.replace(/^(\[)?\//, '$1').replace(/\/$/, '');

    if (isNotBlank(prefix)) {
        matchingPath = `${prefix}/${matchingPath}`;
    }
    // TODO: 头部不加 / 行不行, 加 /是因为 http.proxyHost() 头部加了 /
    return `/${matchingPath}`; */
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
        if (key.includes('[')) {
            let pathMatching = key.replace(/[\[\]]/g, '');      // 清除括号, 拿到 http-proxy-middleware 匹配的字符串
            let replacement = key.replace(/(\[[\w\:\&\+\%\=\.\/\?\-]*\])+?/g, '');              // 拿到移除[]内容后的字符串
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

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            // 获取到 value 配置
            let value = options[key];
            let pathMatching = key.replace(/[\[\]]/g, '');

            proxyOptions[pathMatching] = {
                logLevel: 'debug',
                changeOrigin: true,
                secure: false,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                ...defaults
                // pathRewrite: pathRewrite(key, value.target || value || defaults.target),
            };

            if (isString(value)) {
                proxyOptions[pathMatching].target = value.replace(/[\[\]]/g, '');
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