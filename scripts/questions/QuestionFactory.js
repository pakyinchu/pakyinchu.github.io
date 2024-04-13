import { UnorderedListQuestion } from "./UnorderedListQuestion";
import { FillInTheBlankQuestion } from "./FillInTheBlankQuestion";
import { CommandQuestion } from "./CommandQuestion";

export class QuestionFactory {
    createQuestion(category, question, answers) {
        switch (category) {
            case "fitb":
                return new FillInTheBlankQuestion(question, answers);
            case "uol":
                return new UnorderedListQuestion(question, answers);
            case "cmd":
                return new CommandQuestion(question, answers);
            default:
                throw new Error(`Invalid category: ${category}`);
        }
    }
}