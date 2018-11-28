/**
 * 修剪路径匹配
 * http://localhost:3001 > localhost_3001
 * http://ynreport.bbdservice.net > ynreport.bbdservice.net
 */ 
function clipPath(path = '') {
    return path.replace(/(^http[s]?:\/\/)/, '')
        .replace(/(\/)?$/, '')
        .replace(':', '_');
}
// 根据 prefix + domain 动态设置url路径
export function dynamicPath(options) {
    var { baseURL } = options;

    if (isBlank(baseURL)) {
        return '';
    }

    let domain = clipPath(baseURL);

    return `/proxy/${domain}`;
}
// 根据 prefix + domain 动态匹配代理服务
export function createDynamicProxy(servers = [], prefix = 'proxy') {
    var config = {};

    servers.forEach((server) => {
        let match;
        if (isString(server)) {
            match = server;
        } else if (isObject(server)) {
            match = Object.keys(server)[0];
        } else {
            throw new Error('proxy options type error, only support string and object type');
        }
        let key = `/${prefix}/${clipPath(match)}`;
        config[key] = server[match] || server;
    });

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