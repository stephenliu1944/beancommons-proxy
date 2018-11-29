import { isBlank, isArray, isString, isObject } from '@beanutils/common';

/**
 * 修剪路径匹配
 * http://localhost:3001 > localhost_3001
 * http://ynreport.bbdservice.net > ynreport.bbdservice.net
 */ 
function clipPath(path = '') {
    return path.replace(/(^http[s]?:\/\/)/, '')
        .replace(/(\/)$/, '')
        .replace(':', '_');
}
// 根据 prefix + host 动态设置url路径
export function proxyPath(options, prefix = 'proxy') {
    var baseURL = options?.baseURL || options;

    if (isBlank(baseURL)) {
        return '';
    }

    let host = clipPath(baseURL);

    return `/${prefix}/${host}`;
}
// 根据 prefix + host 动态匹配代理服务
export function configProxy(services, prefix = 'proxy') {
    if (!services) {
        return;
    }

    var config = {};

    if (isString(services)) {
        config[proxyPath(services, prefix)] = services;
    } else if (isArray(services) || isObject(services)) {
        for (let key in services) {
            if (services.hasOwnProperty(key)) {
                let target = services[key];
                // key is NaN means object otherwise array
                let match = isNaN(key) ? key : target;
                config[proxyPath(match, prefix)] = target;
            }
        }
    } else {
        throw new Error('proxy options type error, only support string, object or array type');
    }

    return mixinProxy(config);
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
