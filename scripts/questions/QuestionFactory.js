import { UnorderedListQuestion } from "./UnorderedListQuestion.js";
import { FillInTheBlankQuestion } from "./FillInTheBlankQuestion.js";
import { CommandQuestion } from "./CommandQuestion.js";
import { BackCompQuestion } from "./BackCompQuestion.js";
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
                /* throw new Error(`Invalid category: ${category}`); */
                return new BackCompQuestion(question, answers);
        }
    }
}