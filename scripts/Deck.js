import { JsonFileHandler } from "./JsonFileHandler.js";
import { TextFileHandler } from "./TextFileHandler.js";
import { Card } from "./Card.js";

export class Deck {
    constructor() {
        this.cards = [];
    }
  
    addCard(card) {
        this.cards.push(card);
    }

    updateCard(index, card) {
        this.cards[index] = card;
    }

    getCard(index) {
        return this.cards[index];
    }

    getTotalCards() {
        return this.cards.length;
    }
  
    async loadFromText(file) {
        const text = await TextFileHandler.loadFile(file);
        const lines = text.split('\n').map(line => line.trim().replace('\r', ''));

        lines.forEach((line) => {
            const question = line;
            const answers = [];
            const category = "fitb";
            const notes = line;
            const tags = [];

            this.addCard(new Card(question, answers, category, notes, tags));
        });
    }
  
    async loadFromJSON(file) {
        const dataset = await JsonFileHandler.loadFile(file);
        dataset.deck.cards.forEach((card, index) => {
            const { question, answers, category, notes, tags } = card;
            this.addCard(new Card(question, answers, category, notes, tags));
        });
    }
}