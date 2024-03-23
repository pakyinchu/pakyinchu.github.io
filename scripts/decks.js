let dataset;
let deck = [];
let totalCards = 0;
const fitbPlaceholder = "___";
const loadButton = document.getElementById('loadButton');
const saveButton = document.getElementById('saveButton');
const tbody = document.querySelector('.deck table tbody');
const reader = new FileReader();
let fileType;

reader.addEventListener(
    "load",
    () => {
        if (fileType === 'application/json') {
            jsonFileHandler();
        } else {
            textFileHandler();
        }
        toggleLoadSaveButton(true);
    },
    false,
);

function loadData() {
    const fileInput = document.getElementById('loadFileInput');
    
    fileInput.click();
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        fileType = file.type;
        reader.readAsText(file);
    });
}

function closeDialog(elem) {
    // Method for close buttons inside a dialog element
    elem.parentElement.close();
}

function editCard(cardId, question, answers, category, notes, tags) {
    const words = notes.split(' ');

    
    // Get the cardQuestion element
    const cardQuestion = document.getElementById('cardQuestion');
    // Clear the cardQuestion content
    cardQuestion.innerHTML = "";

    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.textContent = answers.indexOf(word) >= 0 ? fitbPlaceholder : word;
        wordSpan.dataset.originalWord = word; // Store the original word
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

    [question, answers, category, notes, tags].forEach((field, index) => {
        const cell = row.children[index + 1];
        cell.textContent = field;
    });

    // Update the dataset and deck
    deck[cardId - 1] = { question, answers, category, notes, tags };
    dataset.deck = deck;

    // Close the dialog
    document.getElementById('editCardDialog').close();

    // Reset the inputs
    resetDialogInput();
}

function resetDialogInput() {
    document.getElementById('cardId').textContent = "";
    document.getElementById('cardQuestion').textContent = "";
    document.getElementById('cardAnswer').value = [];
    document.getElementById('cardCategory').value = "";
    document.getElementById('cardNotes').value = "";
    document.getElementById('cardTags').value = [];
}

function addToDeck(question, answers, category, notes, tags) {
    deck.push({
        question: question,
        answers: answers,
        category: category,
        notes: notes,
        tags: tags
    });
    totalCards++;
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

function textFileHandler() {
    const lines = reader.result.split('\n').map(line => line.replace('\r', ''));

    // For each line create a table row and add rows to table
    lines.forEach((line, index) => {
        const question = line; // default to be same as notes
        const answers = [];
        const category = "fitb"; // default to be fill-in-the-blank type
        const notes = line;
        const tags = [];

        addToDeck(question, answers, category, notes, tags);

        const row = createRow(question, answers, category, notes, tags);
        
        tbody.appendChild(row);
    });

    createDataset();
}

function jsonFileHandler() {
    dataset = JSON.parse(reader.result);
    deck = dataset.deck;
    deck.forEach((card, index) => {
        const { question, answers, category, notes, tags } = card;
        const row = createRow(question, answers, category, notes, tags);
        tbody.appendChild(row);
    })
}

function createRow(question, answers, category, notes, tags) {
    const row = document.createElement('tr');
        
    // Create the edit and delete buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    
    editButton.addEventListener('click', () => {
        const row = editButton.parentElement.parentElement;
        const cardId = row.rowIndex;
        const question = row.cells[1].textContent;
        const answers = row.cells[2].textContent.split(",").map(a => a.trim()) || [];
        const category = row.cells[3].textContent;
        const notes = row.cells[4].textContent;
        const tags = row.cells[5].textContent || [];

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
    [question, answers, category, notes, tags].forEach((field) => {
        const cell = document.createElement('td');
        cell.textContent = field;
        row.appendChild(cell);
    });

    return row;
}