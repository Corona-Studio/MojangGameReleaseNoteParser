import * as superagent from "superagent"

export default class HttpHelper {
    static postRequest(url: string, data?: any, header?: object, toJson?: boolean, returnResponse?: boolean): Promise<string | object> {
        return new Promise((resolve, reject) => {
            superagent.post(url).timeout(1000 * 100).set(header || {}).send(data || {}).end((err, res) => {
                if (err) return reject(err);
                if (returnResponse === true) resolve(res);

                toJson === false ? resolve(res.text) : resolve(JSON.parse(res.text));
            });
        });
    };

    static getRequest(url: string, header?: object, toJson?: boolean, returnResponse?: boolean): Promise<string | object> {
        return new Promise((resolve, reject) => {
            superagent.get(url).timeout(1000 * 100).set(header || {}).end((err, res) => {
                if (err) return reject(err);
                if (returnResponse === true) resolve(res);

                toJson === false ? resolve(res.text) : resolve(JSON.parse(res.text));
            });
        });
    };
}
