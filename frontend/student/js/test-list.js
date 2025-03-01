document.addEventListener('DOMContentLoaded', () => {
    fetchTests();
});

async function fetchTests() {
    try {
        const response = await fetch('http://localhost:3000/api/tests');
        const tests = await response.json();
        displayTests(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
    }
}

function displayTests(tests) {
    const testList = document.getElementById('test-list');
    testList.innerHTML = '';

    tests.forEach(test => {
        const testCard = document.createElement('div');
        testCard.className = 'test-card';
        testCard.innerHTML = `
            <h2>${test.title}</h2>
            <p>${test.description}</p>
            <button class="start-test-btn" data-test-id="${test.id}">Start Test</button>
        `;
        testList.appendChild(testCard);
    });

    // Add event listeners to start test buttons
    const startButtons = document.querySelectorAll('.start-test-btn');
    startButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const testId = e.target.getAttribute('data-test-id');
            window.location.href = `test.html?id=${testId}`;
        });
    });
}