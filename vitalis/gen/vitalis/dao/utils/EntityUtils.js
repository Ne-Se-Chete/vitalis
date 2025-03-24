export class EntityUtils {
    static setDate(obj, property) {
        if (obj && obj[property]) {
            obj[property] = new Date(obj[property]).getTime();
        }
    }
    static setLocalDate(obj, property) {
        if (obj && obj[property]) {
            obj[property] = new Date(new Date(obj[property]).setHours(-(new Date().getTimezoneOffset() / 60), 0, 0, 0)).toISOString();
        }
    }
    static setBoolean(obj, property) {
        if (obj && obj[property] !== undefined) {
            obj[property] = obj[property] ? true : false;
        }
    }
}
