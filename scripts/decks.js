import { Deck } from "./Deck.js";
import { Card } from "./Card.js";

let dataset;
let deck = new Deck();
let totalCards = 0;
const fitbPlaceholder = "___";
const loadButton = document.getElementById('loadButton');
const saveButton = document.getElementById('saveButton');
const tbody = document.querySelector('.deck table tbody');
const fileInput = document.getElementById('loadFileInput');


setUpEventListeners();

function setUpEventListeners() {
    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];

        if (file.type === 'application/json') {
            await deck.loadFromJSON(file);
        } else {
            await deck.loadFromText(file);
        }
    
        // Reset the file input value
        fileInput.value = '';
    
        totalCards = deck.getTotalCards();
        console.log("totalCards", totalCards);
    
        // Clear the tbody first
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
    
        deck.cards.forEach((card, index) => {
            const row = createRow(index + 1, card);
            tbody.appendChild(row);
        });
        
        toggleLoadSaveButton(true);
    });
    document.querySelector('#loadButton').addEventListener('click', loadData);
    document.querySelector('#saveButton').addEventListener('click', saveData);
    document.querySelector('#closeDialogButton').addEventListener('click', closeDialog);
    document.querySelector('#saveCardButton').addEventListener('click', saveCard);
    document.querySelector('#nextCardButton').addEventListener('click', nextCard);
    document.querySelector('#exportDataButton').addEventListener('click', exportData);
}

function loadData() {
    fileInput.click();
}

function closeDialog(event) {
    var elem = event.currentTarget;
    if (elem && elem.parentElement) {
        elem.parentElement.close();
    } else {
        console.error('Cannot close dialog: elem or elem.parentElement is undefined');
    }
}

function editCard(cardId, question, answers, category, notes, tags) {
    const words = notes.split(' ').map(w => w.split(/(\W+)/)).flat().filter(w => w.length > 0);

    // Get the cardQuestion element
    const cardQuestion = document.getElementById('cardQuestion');
    // Clear the cardQuestion content
    cardQuestion.innerHTML = "";

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = (!/\W/.test(word) && answers.indexOf(word) >= 0) ? fitbPlaceholder : word;
        wordSpan.dataset.originalWord = word; // Store the original word

        if (!/\W/.test(word)) {
            wordSpan.style.cursor = 'pointer';
            wordSpan.style.backgroundColor = 'transparent';

            wordSpan.addEventListener('mouseover', () => {
                wordSpan.style.backgroundColor = 'lightyellow';
            })
    
            wordSpan.addEventListener('mouseout', () => {
                wordSpan.style.backgroundColor = 'transparent';
            })
    
            wordSpan.addEventListener('click', () => {
                if (wordSpan.textContent === fitbPlaceholder) {
                    // Revert the wordSpan to the previous value
                    const wordIndex = answers.indexOf(wordSpan.dataset.originalWord);
                    if (wordIndex > -1) {
                        answers[wordIndex] = "";
                        wordSpan.textContent = wordSpan.dataset.originalWord;
                    }
                } else {
                    // Populate the answer field when a word is clicked
                    answers[wordIndex] = wordSpan.dataset.originalWord;
                    wordSpan.textContent = fitbPlaceholder;
                }
    
                // Reflect the answer input
                document.getElementById('cardAnswer').value = answers;
            });
        }

        // Append the wordSpan to the cardQuestion
        cardQuestion.appendChild(wordSpan);

        // Add a space after each wordSpan, except the last one
        if (wordIndex < words.length - 1) {
            cardQuestion.appendChild(document.createTextNode(' '));
        }
    });

    document.getElementById('cardId').innerHTML = cardId;
    document.getElementById('totalCards').innerHTML = totalCards;
    document.getElementById('cardAnswer').value = answers;
    document.getElementById('cardCategory').value = category;
    document.getElementById('cardNotes').value = notes;
    document.getElementById('cardTags').value = tags;
    document.getElementById('editCardDialog').showModal();
}

function saveCard() {
    // Get the data from the dialog
    const cardId = document.getElementById('cardId').textContent;
    const question = document.getElementById('cardQuestion').textContent;
    const answers = document.getElementById('cardAnswer').value.split(",");
    const category = document.getElementById('cardCategory').value;
    const notes = document.getElementById('cardNotes').value;
    const tags = document.getElementById('cardTags').value.split(",").map(tag => tag.trim());

    // Append the new row to the table
    const row = document.querySelector(`.deck table tbody tr:nth-child(${cardId})`);

    [cardId, question, answers, category, notes, tags].forEach((field, index) => {
        const cell = row.children[index + 1];
        cell.textContent = field;
    });

    // Update the dataset and deck
    deck.updateCard(cardId - 1, new Card(question, answers, category, notes, tags));
    // dataset.deck = deck;

    // if next card is available, move to next card, otherwise close the dialog
    if (cardId < totalCards) {
        nextCard();
    } else {
        document.getElementById('editCardDialog').close();
        // Reset the inputs
        resetDialogInput();
    }
}

function nextCard() {
    const nextCardIndex = document.getElementById('cardId').textContent; 
    const {question, answers, category, notes, tags } = deck.getCard(nextCardIndex);
    editCard(Number(nextCardIndex) + 1, question, answers, category, notes, tags);
}

function resetDialogInput() {
    document.getElementById('cardId').textContent = "";
    document.getElementById('cardQuestion').textContent = "";
    document.getElementById('cardAnswer').value = [];
    document.getElementById('cardCategory').value = "";
    document.getElementById('cardNotes').value = "";
    document.getElementById('cardTags').value = [];
}

function createDataset() {
    dataset = {
        "username": "chup3",
        "name": "Wilson Chu",
        "levels": [{"level": 0, "updateTime": null}],
        "lastSeen": null,
        "deck": deck
    }
}

function saveData() {
    document.getElementById('saveDataDialog').showModal();
}

function exportData() {

    // const bulkAdd = document.getElementById('bulkAddCheckbox').checked;
    // if (bulkAdd && dataset.deck) {
    //     dataset.deck.concat(deck);
    // } else {
        createDataset();
    // }

    const deckName = document.getElementById('deckName').value;
    // Update last seen as current datetime
    // replace symbols in timestamp with hypen for attaching to a filename
    let currentTimestamp = new Date();
    dataset.lastSeen = currentTimestamp;
    currentTimestamp = currentTimestamp.toISOString().replace(/:/g,"-")
    currentTimestamp = currentTimestamp.replace(/\./,"-")
    
    // convert data to blob and create url for download
    const datasetString = JSON.stringify(dataset);
    const link = document.getElementById("save");
    const blob = new Blob([datasetString], {type : 'application/json'});
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${deckName}-${currentTimestamp}.json`;
    link.click();

}

function toggleLoadSaveButton(start) {
    if (start) {
        // loadButton.setAttribute("disabled", "");
        saveButton.removeAttribute("disabled");
    } else {
        // loadButton.removeAttribute("disabled");
        saveButton.setAttribute("disabled", "");
    }
}

function createRow(cardId, card) {

    const question = card.question;
    const answers = card.answers;
    const category = card.category;
    const notes = card.notes;
    const tags = card.tags;
    const row = document.createElement('tr');
        
    // Create the edit and delete buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    
    editButton.addEventListener('click', () => {
        const row = editButton.parentElement.parentElement;
        const cardId = row.rowIndex;
        const question = row.cells[2].textContent;
        const answers = row.cells[3].textContent.split(",").map(a => a.trim()) || [];
        const category = row.cells[4].textContent;
        const notes = row.cells[5].textContent;
        const tags = row.cells[6].textContent || [];

        editCard(cardId, question, answers, category, notes, tags);
    });

    deleteButton.addEventListener('click', () => {
        // Remove the record from the table
        tbody.removeChild(row);
        // TODO: Update the dataset
        // TODO: Update deck
        // TODO: Update table
    });

    const buttonsCell = document.createElement('td');
    buttonsCell.appendChild(editButton);
    buttonsCell.appendChild(deleteButton);
    row.appendChild(buttonsCell);

    // Create the cells for the table
    [cardId, question, answers, category, notes, tags].forEach((field) => {
        const cell = document.createElement('td');
        cell.textContent = field;
        row.appendChild(cell);
    });

    return row;
}