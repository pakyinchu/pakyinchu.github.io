import { IFileHander } from "./IFileHandler.js";

export class TextFileHandler extends IFileHander {
    static loadFile(file) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsText(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }
} 