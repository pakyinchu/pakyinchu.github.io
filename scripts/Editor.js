class Editor {
    constructor(deck) {
        this.deck = deck;
        this.currentCardIndex = 0;
    }

    loadCard(cardIndex) {
        this.currentCardIndex = cardIndex;
        const card = this.deck.getCard(cardIndex);
        // Update UI with card details
    }

    saveCard(question, answers, category, notes, tags) {
        const card = new Card(question, answers, category, notes, tags);
        this.deck.cards[this.currentCardIndex] = card;
    }

    nextCard() {
        // Check if next card exists
        if (this.currentCardIndex + 1 < this.deck.cards.length) {
            this.loadCard(this.currentCardIndex + 1);
        } else {
            // Close dialog or handle end of deck
        }
    }
}