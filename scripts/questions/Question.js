export class Question {
    constructor(question, correctAnswer) {
        this.question = question;
        this.correctAnswer = correctAnswer;
    }
    
    checkAnswer(userAnswer) {
        // to be implemented by subclasses
    }
}