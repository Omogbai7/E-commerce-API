const API_BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';

const responseOutput = document.getElementById('responseOutput');
const tokenDisplay = document.getElementById('tokenDisplay');

// Function to display JSON response
function displayResponse(data) {
    responseOutput.textContent = JSON.stringify(data, null, 2);
}

// 1. Handle User Registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        displayResponse(data);
    } catch (error) {
        displayResponse({ error: 'Failed to connect to API' });
    }
});

// 2. Handle User Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        displayResponse(data);
        if (data.token) {
            authToken = data.token;
            tokenDisplay.textContent = authToken;
            alert('Login successful! Token saved.');
        }
    } catch (error) {
        displayResponse({ error: 'Failed to connect to API' });
    }
});

// 3. Handle Product Creation
document.getElementById('createProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authToken) {
        alert('Please log in first to get a token.');
        return;
    }
    const name = document.getElementById('prodName').value;
    const description = document.getElementById('prodDesc').value;
    const price = document.getElementById('prodPrice').value;
    const stock_quantity = document.getElementById('prodStock').value;

    try {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` // Use the saved token
            },
            body: JSON.stringify({ name, description, price, stock_quantity }),
        });
        const data = await res.json();
        displayResponse(data);
    } catch (error) {
        displayResponse({ error: 'Failed to connect to API' });
    }
});