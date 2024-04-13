import { Question } from './Question.js';
export class UnorderedListQuestion extends Question {
    // order does not matter
    // case insensitive
    checkAnswer(userAnswer) {
        const correctAnswers = this.correctAnswer.filter(a => a !== "").map(a => a.toLowerCase());
        const userAnswers = userAnswer.split(" ").map(a => a.toLowerCase());
        return correctAnswers.every(a => userAnswers.includes(a));
    }
}