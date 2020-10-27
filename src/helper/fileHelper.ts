import * as fs from "fs"
import * as path from "path"

export default class FileHelper {
    static writeFile(filePath: string, content: string, flag?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, content, {flag: flag || "w"}, (err) => {
                if(err)
                    reject(err);

                resolve();
            });
        });
    }

    static readFile(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, filePath), function (err, content) {
                if (err) return reject(err);
                resolve(content.toString());
            });
        });
    };

    static isFileExists(filePath: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.access(path.resolve(__dirname, filePath), (err) => {
                if(err)
                    reject(err);
                resolve(true);
            });
        });
    };
}
