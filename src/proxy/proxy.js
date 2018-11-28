import { isBlank, isArray, isString, isObject } from '@beanutils/common';

/**
 * 修剪路径匹配
 * http://localhost:3001 > localhost_3001
 * http://ynreport.bbdservice.net > ynreport.bbdservice.net
 */ 
function clipPath(path = '') {
    return path.replace(/(^http[s]?:\/\/)/, '')
        .replace(/(\/.*)$/, '')
        .replace(':', '_');
}
// 根据 prefix + host 动态设置url路径
export function hostPath(options) {
    var { baseURL } = options;

    if (isBlank(baseURL)) {
        return '';
    }

    let domain = clipPath(baseURL);

    return `/proxy/${domain}`;
}
// 根据 prefix + host 动态匹配代理服务
export function createProxy(servers, prefix = 'proxy') {
    if (!servers) {
        return;
    }

    var config = {};

    function setConfig(match, target) {
        var path = `/${prefix}/${clipPath(match)}`;
        config[path] = target;
    }

    if (isString(servers)) {
        setConfig(servers, servers);
    } else if (isArray(servers) || isObject(servers)) {
        for (let key in servers) {
            if (servers.hasOwnProperty(key)) {
                let target = servers[key];
                // key is NaN means object otherwise array
                let match = isNaN(key) ? key : target;
                setConfig(match, target);
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
