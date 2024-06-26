import { QuestionFactory } from "./questions/QuestionFactory.js";

let dataset;
let lessons;
let currentCard;
let totalUnlearnedCards;
let totalIncorrectCount = 0;
let uniqueTags;

const questionFactory = new QuestionFactory();
const fileInput = document.getElementById('loadFileInput');
const loadButton = document.getElementById('loadButton');
const saveButton = document.getElementById('saveButton');
const notesButton = document.getElementById("notesButton"); 
const correctPercentageElem = document.getElementById("correctPercentage");
const remainingCountElem = document.getElementById("remainingCount");
const questionElem = document.getElementsByClassName("question")[0]; 
const tagsElem = document.getElementsByClassName("tags")[0]; 
const answerInput = document.getElementsByClassName("answerInput")[0]; 
const answerInputButton = document.getElementById("answerInputButton"); 
const notesCardElem = document.getElementsByClassName("notesCard")[0];
const landingDialog = document.querySelector("#landingDialog");
const completeDialog = document.querySelector("#completeDialog");
const settingDialog = document.querySelector("#settingDialog");
const completeDialogCloseButton = document.querySelector("#completeDialog button");
const reader = new FileReader();

window.onload = landingDialog.showModal();

setUpEventListeners();

function setUpEventListeners() {
    fileInput.addEventListener("change", async () => {
        const file = fileInput.files[0];
        reader.readAsText(file);
    });
    document.querySelector('#loadButton').addEventListener('click', loadData);
    document.querySelector('#modalLoadButton').addEventListener('click', loadData);
    document.querySelector('#saveButton').addEventListener('click', saveData);
    document.querySelector('#settingButton').addEventListener('click', openSetting);
    document.querySelector('#closeDialogButton').addEventListener('click', closeDialog);
    document.querySelector('#closeCompleteDialogButton').addEventListener('click', closeDialog);
    document.querySelector('#notesButton').addEventListener('click', toggleNotes);
    document.querySelector('#settingDialogCheckbox').addEventListener('click', toggleSettingDialogCheckbox);
    document.querySelector('#closeSettingDialogButton').addEventListener('click', closeDialog);
    document.querySelector('#saveSettingButton').addEventListener('click', saveSetting);
    answerInputButton.addEventListener('click', clickAnswerInputButton);
    answerInput.addEventListener('keyup', keyupAnswerInput);
}

function loadData() {
    fileInput.click();
}

reader.addEventListener(
    "load",
    () => {

        landingDialog.innerHTML = "<p>Loading...</p>";

        // simulate data load
        setTimeout(function() {
            dataset = JSON.parse(reader.result);
            const cards = dataset.deck.cards;
            for (let i = 0; i < cards.length; i++) {
                cards[i].id = i;
                cards[i].stage = cards[i].stage ? cards[i].stage : 0;
                cards[i].incorrectCount = 0;
            }

            // Setup UI after data load
            const {name, lastSeen, levels} = dataset;
            const currentLevel = levels[levels.length-1];

            setProfile(name, lastSeen, currentLevel.level);
            toggleLoadSaveButton(true);

            // update user data
            dataset.lastSeen = new Date();
            if (!currentLevel.updateTime) {
                currentLevel.updateTime = dataset.lastSeen;
            }

            uniqueTags = [...new Set(cards.flatMap(item => item.tags))];

            landingDialog.close();

            startLesson();
        }, 1000);

        
    },
    false,
);

function saveData() {
    saveProgress();
}

function startLesson(deck = dataset.deck.cards) {
    // filter items in the deck if it is new or pass review time 
    // default to the original deck but allow to pass in a filtered deck - see saveSetting()
    let unlearnedCards = filterDeck(deck);
    
    // store in lesson data in global variables
    totalUnlearnedCards = unlearnedCards.length;
    lessons = unlearnedCards;

    correctPercentageElem.innerHTML = "✔100%&nbsp;";
    remainingCountElem.innerHTML = `&nbsp;🎴${lessons.length}`;

    enableAnswerInput();

    // Fetch a card from top of the deck
    if (lessons.length > 0) {
        currentCard = lessons.shift();
        displayCard(currentCard);
    } else {
        endLesson();
    }
}

function filterDeck(deck) {
    let unlearnedCards = deck.filter(card => !card.nextReviewTime || new Date(card.nextReviewTime) <= new Date());
    // unlearnedCards = unlearnedCards.filter(card => !card.tags.some(tag => tag.startsWith("1.")));
    return unlearnedCards;
}

function updateAnswerInput(correct) {
    if (correct) {
        answerInput.classList.add('correctAnswer');
        answerInput.classList.remove('incorrectAnswer');
        answerInputButton.classList.add('correctAnswer');
        answerInputButton.classList.remove('incorrectAnswer');
    } else {
        answerInput.classList.add('incorrectAnswer');  
        answerInput.classList.remove('correctAnswer');
        answerInputButton.classList.add('incorrectAnswer');  
        answerInputButton.classList.remove('correctAnswer');
    }
}

function clickAnswerInputButton() {
    // Click to check the answer
    // If user has already answered a question, move to the next question when the button is clicked again 
    if (answerInput.classList.contains('incorrectAnswer') || answerInput.classList.contains('correctAnswer')) {
        handleNextCard();
    } else {
        submitAnswer();
    }
}

function keyupAnswerInput(event) {
    // Press enter to check the answer when the input is on focus
    // If user has already answered a question, move to the next question when enter is pressed again 
    if ((answerInput.classList.contains('incorrectAnswer') || answerInput.classList.contains('correctAnswer')) && event.key === 'Enter') {
        handleNextCard();
    } else if(event.key === 'Enter') {
        submitAnswer();
    }
}

function handleNextCard() {
    // update the stats
    remainingCountElem.innerHTML = `&nbsp;🎴${lessons.length}`;
            
    // reset input and continue to next card
    resetInput();
    if (lessons.length > 0) {
        currentCard = lessons.shift();
        displayCard(currentCard);
    } else {
        endLesson();
    }
}

function submitAnswer() {
    // Allow user to check the notes after a question is attempt
    notesButton.removeAttribute("disabled");
    
    let isCorrect = false;
    
    let question = questionFactory.createQuestion(currentCard.category, currentCard.question, currentCard.answers);
    isCorrect = question.checkAnswer(answerInput.value);
    updateAnswerInput(isCorrect);

    // update data for a card
    if (isCorrect) {
        currentCard.incorrectCount = 0;
        currentCard.stage += 1;
        currentCard.stage = getStage(currentCard);
        currentCard.nextReviewTime = getNextReviewTime(currentCard.stage);
    } else {
        currentCard.incorrectCount++;
        currentCard.stage = getStage(currentCard);
        currentCard.nextReviewTime = getNextReviewTime(currentCard.stage);
        lessons.push(currentCard);
        totalIncorrectCount += 1;

        notesButton.focus();
    }

    // The lowest correct percentage is 0
    let correctPercentage = totalUnlearnedCards - totalIncorrectCount > 0 ? Math.round(( (totalUnlearnedCards - totalIncorrectCount) / totalUnlearnedCards) * 100) : 0;
    
    // update the stats
    correctPercentageElem.innerHTML = `✔${correctPercentage}%&nbsp;`;
    
    // save the updated card back to the deck
    dataset.deck.cards[currentCard.id] = currentCard;
}

function displayCard(card) {
    // populate the UI with card data
    const answers = card.answers;

    questionElem.innerHTML = card.question;
    tagsElem.innerHTML = card.tags;

    // allow user to see notes if the item has never been attempt or stage is 0
    if (card.stage === 0) {
        notesButton.removeAttribute("disabled");
    }

    answerInput.focus();
}

function resetInput() {
    // restore UI to initial state
    answerInput.value = "";
    answerInput.classList.remove('correctAnswer');
    answerInput.classList.remove('incorrectAnswer');   
    answerInputButton.classList.remove('correctAnswer');
    answerInputButton.classList.remove('incorrectAnswer');
    questionElem.innerHTML = "";
    tagsElem.innerHTML = "";
    notesButton.setAttribute("disabled", "");
    hideNotes();
}

function getStage(card) {
    // Calculate the stage of an item in the deck
    // Incorrect count is the number of tries before getting an item right in a session
    // Penalty factor is doubled when item reaches stage 5
    // The lowest stage for an item is 0

    let incorrectAdjustmentCount = Math.ceil(card.incorrectCount / 2);
    let penaltyFactor = card.stage >= 5 ? 2 : 1;
    let newStage = card.stage - (incorrectAdjustmentCount * penaltyFactor);
    return newStage < 0 ? 0 : newStage;
}

function getNextReviewTime(stage) {
    // Calculate the next review time for an item in the deck
    // Default review time for an item is the current time
    // Next review time is lengthened based on the stage 
    // The higher the stage, the longer user can skip reviewing an item
    // Item with stage greater than 9 is considered burned
    // Burned items should be removed from deck but just keeping it for now as the item review feature has not been built 

    let result;
    let now = new Date();

    switch(stage) {
        case 0:
            result = now;
            break;
        case 1:
            result = now.setHours(now.getHours() + 4);
            break;
        case 2:
            result = now.setHours(now.getHours() + 8);
            break;
        case 3:
            result = now.setHours(now.getHours() + 24);
            break;
        case 4:
            result = now.setHours(now.getHours() + 48);
            break;
        case 5:
            result = now.setDate(now.getDate() + 7);
            break;
        case 6:
            result = now.setDate(now.getDate() + 14);
            break;
        case 7:
            result = now.setMonth(now.getMonth() + 1);
            break;
        case 8:
            result = now.setMonth(now.getMonth() + 4);
            break;
        default:
            result = now.setFullYear(now.getFullYear() + 1);
            break;
    }
    return new Date(result);
}

function closeDialog(event) {
    var elem = event.currentTarget;
    if (elem && elem.parentElement) {
        elem.parentElement.close();
    } else {
        console.error('Cannot close dialog: elem or elem.parentElement is undefined');
    }
}

function endLesson() {
    // Display complete message and save progress automatically
    // Restore UI to initial state
    completeDialog.showModal();
    saveProgress();
    disableAnswerInput();
    resetStats();
    toggleLoadSaveButton(false);
}

function saveProgress() {
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
    link.download = `dataset-${currentTimestamp}.json`;
    link.click();
}

function hideNotes() {
    // hide the notes if it is shown
    const notesTextElem = notesCardElem.getElementsByTagName("p")[0];
    const notesImgDivElem = notesCardElem.getElementsByTagName("div")[0];
    if (notesTextElem) {
        notesCardElem.removeChild(notesTextElem);
    }
    if (notesImgDivElem) {
        notesCardElem.removeChild(notesImgDivElem);
    }
    notesCardElem.setAttribute("hidden", "");
}

function toggleNotes() {
    if (window.getComputedStyle(notesCardElem).display === "none") {
        // display the notes if it is not shown
        const notesTextElem = document.createElement("p");
        notesTextElem.innerHTML = currentCard.notes || '';
        notesCardElem.appendChild(notesTextElem);
        notesCardElem.removeAttribute("hidden");

        if (currentCard.image) {
            let imgDiv = document.createElement('div');
            let img = document.createElement('img');
            imgDiv.style = "display: flex; justify-content: center; align-items: center;";
            img.src = currentCard.image;
            img.alt = currentCard.image;
            imgDiv.appendChild(img);
            notesCardElem.appendChild(imgDiv);
        }
    } else {
        hideNotes();
        answerInput.focus();
    }
}

function enableAnswerInput() {
    answerInput.setAttribute("placeholder", "➭ Answer");
    answerInput.removeAttribute("disabled");
    answerInputButton.removeAttribute("disabled");
}

function disableAnswerInput() {
    answerInput.setAttribute("placeholder", "");
    answerInput.setAttribute("disabled", "");
    answerInputButton.setAttribute("disabled", "");
}

function resetStats() {
    correctPercentageElem.innerHTML = "";
    remainingCountElem.innerHTML = "";
}

function setProfile(name, lastSeen, level) {
    const usernameCell = document.getElementById("username");
    const lastSeenCell = document.getElementById("lastSeen");
    const levelCell = document.getElementById("level");

    // Format date to MMM DD, YYYY, HH:MM:SS
    let date = lastSeen ? new Date(lastSeen) : new Date();
    let formattedDate = date.toLocaleDateString('en-us', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    }); 

    usernameCell.innerHTML = name;
    lastSeenCell.innerHTML = formattedDate;
    levelCell.innerHTML = `LEVEL ${level}`;
}

function toggleLoadSaveButton(start) {
    // start is true when a study session starts
    // start is false when a study session ends 
    if (start) {
        loadButton.setAttribute("disabled", "");
        saveButton.removeAttribute("disabled");
    } else {
        loadButton.removeAttribute("disabled");
        saveButton.setAttribute("disabled", "");
    }
}

function openSetting() {
    let tagList = document.getElementById('settingDialogTagList');
    tagList.innerHTML = '';

    uniqueTags.forEach(tag => {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = tag;
        checkbox.className = "settingDialogCheckbox";
        checkbox.value = tag;
        checkbox.checked = true;

        let label = document.createElement('label');
        label.htmlFor = tag;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag));

        tagList.appendChild(label);
        tagList.appendChild(document.createElement('br'));
    });

    document.getElementById('settingDialog').showModal();
}

function saveSetting() {
    // From the set of uniqeTags, find the ones that are checked
    let selectedTags = uniqueTags.filter(tag => document.getElementById(tag).checked);
    // Show card from deck if it has a tag in the list of select tags
    let filteredDeck = dataset.deck.cards.filter(item => item.tags.some(tag => selectedTags.includes(tag)));
    // restart the lesson with the new deck
    startLesson(filteredDeck);
    settingDialog.close();
}

function toggleSettingDialogCheckbox() {
    let checkboxes = document.getElementsByClassName('settingDialogCheckbox');
    for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = !checkboxes[i].checked;
    }
}