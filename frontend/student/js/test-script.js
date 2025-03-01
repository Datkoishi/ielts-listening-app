let currentTest = null;
let userAnswers = {};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('id');
    if (testId) {
        fetchTest(testId);
    } else {
        alert('No test ID provided');
    }

    document.getElementById('submit-test').addEventListener('click', submitTest);
});

async function fetchTest(testId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tests/${testId}`);
        currentTest = await response.json();
        displayTest(currentTest);
    } catch (error) {
        console.error('Error fetching test:', error);
    }
}

function displayTest(test) {
    document.getElementById('test-title').textContent = test.title;
    
    // Set up audio player
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.innerHTML = `
        <audio controls>
            <source src="${test.audio_file}" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    `;

    // Display questions
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '';

    test.questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p>${question.content}</p>
            ${createAnswerInputs(question, index)}
        `;
        questionContainer.appendChild(questionElement);
    });
}

function createAnswerInputs(question, questionIndex) {
    switch (question.question_type) {
        case 'One answer':
            return createRadioInputs(question, questionIndex);
        case 'More than one answer':
            return createCheckboxInputs(question, questionIndex);
        case 'Matching':
            return createMatchingInputs(question, questionIndex);
        case 'Plan/Map/Diagram labelling':
        case 'Note Completion':
        case 'Form/Table Completion':
        case 'Flow chart Completion':
            return createTextInputs(question, questionIndex);
        default:
            return '<p>Unsupported question type</p>';
    }
}

function createRadioInputs(question, questionIndex) {
    return question.options.map((option, index) => `
        <div>
            <input type="radio" id="q${questionIndex}_o${index}" name="q${questionIndex}" value="${option}">
            <label for="q${questionIndex}_o${index}">${option}</label>
        </div>
    `).join('');
}

function createCheckboxInputs(question, questionIndex) {
    return question.options.map((option, index) => `
        <div>
            <input type="checkbox" id="q${questionIndex}_o${index}" name="q${questionIndex}" value="${option}">
            <label for="q${questionIndex}_o${index}">${option}</label>
        </div>
    `).join('');
}

function createMatchingInputs(question, questionIndex) {
    const options = question.options.map((option, index) => `
        <option value="${option}">${option}</option>
    `).join('');

    return question.items.map((item, index) => `
        <div>
            <label for="q${questionIndex}_i${index}">${item}</label>
            <select id="q${questionIndex}_i${index}" name="q${questionIndex}_i${index}">
                <option value="">Select an option</option>
                ${options}
            </select>
        </div>
    `).join('');
}

function createTextInputs(question, questionIndex) {
    return question.blanks.map((blank, index) => `
        <div>
            <label for="q${questionIndex}_b${index}">${blank}</label>
            <input type="text" id="q${questionIndex}_b${index}" name="q${questionIndex}_b${index}">
        </div>
    `).join('');
}

async function submitTest() {
    userAnswers = {};
    const questions = currentTest.questions;

    questions.forEach((question, index) => {
        switch (question.question_type) {
            case 'One answer':
                userAnswers[`q${index}`] = document.querySelector(`input[name="q${index}"]:checked`)?.value;
                break;
            case 'More than one answer':
                userAnswers[`q${index}`] = Array.from(document.querySelectorAll(`input[name="q${index}"]:checked`)).map(input => input.value);
                break;
            case 'Matching':
            case 'Plan/Map/Diagram labelling':
            case 'Note Completion':
            case 'Form/Table Completion':
            case 'Flow chart Completion':
                userAnswers[`q${index}`] = Array.from(document.querySelectorAll(`[name^="q${index}_"]`)).map(input => input.value);
                break;
        }
    });

    try {
        const response = await fetch(`http://localhost:3000/api/tests/${currentTest.id}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: 1, // Replace with actual user ID
                answers: userAnswers
            }),
        });
        const result = await response.json();
        alert(`Test submitted successfully! Your score: ${result.score}/${result.totalQuestions} (${result.percentage.toFixed(2)}%)`);
    } catch (error) {
        console.error('Error submitting test:', error);
        alert('Error submitting test. Please try again.');
    }
}

