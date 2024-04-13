export class UnorderedListQuestion extends Question {
    // order does not matter
    // case insensitive
    checkAnswer(userAnswer) {
        // Sort both lists and compare
        return JSON.stringify(this.answer.sort()) === JSON.stringify(userAnswer.sort());
    }
}