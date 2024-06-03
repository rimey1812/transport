// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Select the form and email input field
const form = document.querySelector('.login-form');
const emailInput = document.getElementById('email');
const errorDiv = document.querySelector('.err');

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVHdjo1yvhOIitnBcZRo9iCXiNOCTL9YY",
    authDomain: "transport-300ce.firebaseapp.com",
    projectId: "transport-300ce",
    storageBucket: "transport-300ce.appspot.com",
    messagingSenderId: "556727701878",
    appId: "1:556727701878:web:1caa1025d5a4d2c478aa57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Function to handle form submission
form.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form submission

    const email = emailInput.value;

    // Clear previous error messages
    errorDiv.innerHTML = '';

    try {
        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent successfully');
        displaySuccessMessage('Password reset email sent successfully. Please check your email inbox.');
    } catch (error) {   
        // Handle errors
        handleResetPasswordError(error);
    }
});

// Function to handle reset password errors
function handleResetPasswordError(error) {
    let errorMessage = '';

    switch (error.code) {
        case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
        case 'auth/user-not-found':
            errorMessage = 'No user found with this email address';
            break;
        default:
            errorMessage = 'An error occurred. Please try again later.';
            console.error('Reset Password Error:', error.code, error.message);
            break;
    }

    displayErrorMessage(errorMessage);
}

// Function to display success messages
function displaySuccessMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'green';
    errorDiv.appendChild(messageElement);
}

// Function to display error messages
function displayErrorMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'red';
    errorDiv.appendChild(messageElement);
}
