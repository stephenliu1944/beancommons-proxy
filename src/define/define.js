export function createGlobal(object) {
    if (!object) {
        return;
    }

    var global = {};

    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            global[`__${key}__`] = JSON.stringify(object[key]);
        }
    }

    return global;
}