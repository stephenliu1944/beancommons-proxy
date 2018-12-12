import { isBlank, isArray, isString, isObject } from '@beancommons/utils';

// 根据 prefix + baseURL 生成代理拦截的 url
function proxyBaseURL(baseURL, prefix = 'proxy') {
    if (isBlank(baseURL)) {
        return '';
    }
    /**
     * 修剪路径匹配
     * http://localhost:3001 > localhost_3001
     * http://ynreport.bbdservice.net > ynreport.bbdservice.net
     * http://ynreport.bbdservice.net/abc > ynreport.bbdservice.net/abc
     */ 
    baseURL = baseURL.replace(/(^http[s]?:\/\/)/, '')
                     .replace(/(\/)$/, '')
                     .replace(':', '_');

    return `/${prefix}/${baseURL}`;
}
// 根据 prefix + host 动态设置url路径
function proxyPath(options, prefix = 'proxy') {
    var baseURL = options?.baseURL || options;
    return proxyBaseURL(baseURL, prefix);
}
// 为代理配置默认值
export function mixinProxy(options = {}) {
    var config = {};

    for (let key in options) {
        if (options.hasOwnProperty(key)) {
            let opt = options[key];
            
            config[key] = {
                changeOrigin: true,
                cookieDomainRewrite: '',
                cookiePathRewrite: '/',
                pathRewrite: (_path) => _path.replace(key, '')
            };

            if (isString(opt)) {
                config[key].target = opt;
            } else if (isObject(opt)) {
                Object.assign(config[key], opt);
            } else {
                throw new Error('proxy options type error, only support string and object type');
            }
        }
    }

    return config;
}
// 根据 prefix + host 动态匹配代理服务
export function configProxy(services, prefix = 'proxy') {
    if (!services) {
        return;
    }

    var config = {};
    
    if (isString(services)) {
        config[proxyPath(services, prefix)] = services;
    } else if (isArray(services)) {
        services.forEach((service) => {
            let key, target;
            if (isString(service)) {
                key = service;
                target = service;
            } else if (isObject(service)) {
                let entry = Object.entries(service)[0];
                key = entry[0];
                target = entry[1];
            }
            config[proxyPath(key, prefix)] = target;
        });
    } else if (isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                config[proxyPath(key, prefix)] = services[key];
            }
        }
    } else {
        throw new Error('proxy options type error, only support string, object or array type');
    }

    return mixinProxy(config);
}
// configProxy() 方法简写
export function proxy(services, prefix) {
    return configProxy(services, prefix);
}