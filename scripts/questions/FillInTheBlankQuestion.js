export class FillInTheBlankQuestion extends Question {
    // order matters
    // case insensitive
    checkAnswer(userAnswer) {
        return userAnswer.toLowerCase() === this.answer.filter(item => item !== '').map(a=>a.toLowerCase()).join(' ');
    }
}