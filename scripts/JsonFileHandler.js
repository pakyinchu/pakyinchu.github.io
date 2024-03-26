import { IFileHander } from "./IFileHandler.js";

export class JsonFileHandler extends IFileHander {
    static loadFile(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsText(file);
            reader.onload = () => resolve(JSON.parse(reader.result));
            reader.onerror = reject;
        });
    }
}