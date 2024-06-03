const userLoggedIn = localStorage.getItem('userIsLoggedIn');
console.log(userLoggedIn);

if (!userLoggedIn) {
}

else {
    window.location.href = '../home/home.html';
}


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js"; 


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
const db = getDatabase();
const auth = getAuth(app);

// Select the form, email, password, and repeat password input fields
const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const passwordInput = document.getElementById('password');
const userTypeInput = document.getElementById('user-type');
const repeatPasswordInput = document.getElementById('repeat-password');
const errorDiv = document.querySelector('.err');

    // Function to check the validity of the email, password, and repeat password
    function checkValidity(event) {
        event.preventDefault(); // Prevent form submission

        const email = emailInput.value.trim(); // Trimmed the email
        const password = passwordInput.value;
        const repeatPassword = repeatPasswordInput.value;
        const name = nameInput.value.trim(); // Trimmed the name
        const userType = userTypeInput.value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous messages
        errorDiv.innerHTML = '';

        // Check email validity
        if (!emailRegex.test(email)) {
            appendMessage('Invalid email address', 'red');
            return; // Stop execution if there's an error
        }

        // Check password length
        if (password.length < 8) {
            appendMessage('Password should be at least 8 characters long', 'red');
            return; // Stop execution if there's an error
        }

        // Check if repeat password is empty
        if (repeatPassword === '') {
            appendMessage('Please confirm your password', 'red');
            return; // Stop execution if there's an error
        }

        // Check if password and repeat password match
        if (password !== repeatPassword) {
            appendMessage('Passwords do not match', 'red');
            return; // Stop execution if there's an error
        }

        // If there are no errors, register the user with Firebase
        registerUser(email, password, name, userType);
    }

// Function to register a user with Firebase
function registerUser(email, password, name, userType) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;
            const email = user.email;
            console.log("login successful!");

            addUserToFirestore(email, uid, name, userType)
            .then((docRef) => {
                // Redirect the user after successful registration
            setTimeout(()=>{
                window.location = 'login.html';
            },1500);
            })
            .catch((error) => {
                console.error('Error adding document: ', error);
                appendMessage('Error adding user data', 'red');
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            let errorMessage = '';

            switch (errorCode) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already in use. Please use a different email or sign in with this email.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. Please choose a stronger password.';
                    break;
                default:
                    errorMessage = 'An error occurred. Please try again later.';
                    break;
            }

            appendMessage(errorMessage, 'red');
            console.error(errorCode, errorMessage);
        });
}

async function addUserToFirestore(email, uid, name, userType) {
    const firestore = getFirestore(app); // Renamed db to firestore

    try {
        const docRef = await addDoc(collection(firestore, "users"), {
          uid: uid,
          email: email,
          name: name,
          userType: userType,
          photoProfileUrl: 'data:image/jpeg;base64,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',
          like: 0,
          dislike: 0
        });
        return docRef;
      } catch (e) {
        console.error("Error adding document: ", e);
        throw e; // Rethrow the error for the calling function to handle
      }
}

// Function to append messages to error div
function appendMessage(message, color) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = color;
    errorDiv.appendChild(messageElement);
    errorDiv.style.display = 'block'; // Show the error div
}

// Add event listener to form submission
form.addEventListener('submit', checkValidity);