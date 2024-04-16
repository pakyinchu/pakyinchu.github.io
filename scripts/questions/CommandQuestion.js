import { Question } from './Question.js';
export class CommandQuestion extends Question {
    // order matters
    // case sensitive
    checkAnswer(userAnswer) {
        return this.correctAnswer.includes(userAnswer);
    }
}