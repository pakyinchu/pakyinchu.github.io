export class CommandQuestion extends Question {
    // order matters
    // case sensitive
    checkAnswer(userAnswer) {
        return this.answer === userAnswer;
    }
}