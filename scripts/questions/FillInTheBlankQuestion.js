import { Question } from './Question.js';

export class FillInTheBlankQuestion extends Question {
    // order matters
    // case insensitive
    checkAnswer(userAnswer) {
        return userAnswer.toLowerCase() === this.correctAnswer.filter(item => item !== '').map(a=>a.toLowerCase()).join(' ');
    }
}