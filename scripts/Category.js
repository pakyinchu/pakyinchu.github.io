export class Category {
    static fitb = new Category("fitb", "Fill in the blank");
    static uol = new Category("uol", "unordered list");
    static ol = new Category("ol", "ordered list");
    static qna = new Category("qna", "question and answer");
    static cmd = new Category("cmd", "command");

    constructor(name, description) {
        this.name = name;
        this.description = description;
    }

    toString() {
        return `Category.${this.description}`;
    }
}