import { Question } from './Question.js';

export class BackCompQuestion extends Question {
    // use for questions with old categories i.e. vocab etc. 
    checkAnswer(userAnswer) {
        return this.correctAnswer.map(x=>x.toLowerCase()).includes(userAnswer.toLowerCase());
    }
}