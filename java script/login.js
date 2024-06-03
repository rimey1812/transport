const userLoggedIn = localStorage.getItem('userIsLoggedIn');
console.log(userLoggedIn);

if (!userLoggedIn) {
}

else {
    window.location.href = '../home/home.html';
}
    

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Select the form, email, password, and repeat password input fields
const form = document.querySelector('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
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
const firestore = getFirestore(app);

let userIsLoggedIn = false;

// Function to handle form submission
async function handleFormSubmission(event) {
    event.preventDefault(); // Prevent form submission

    const email = emailInput.value;
    const password = passwordInput.value;

    // Clear previous error messages
    errorDiv.innerHTML = '';

    try {
        // Sign in user with email and password
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully');
        
        const uid = auth.currentUser.uid;

        getDocumentIdByUid(uid)
        .then(async documentId => {
            if (documentId) {
                const usersCollection = collection(firestore, 'users');

                // Query Firestore for the document with the given UID
                const docRef = doc(usersCollection, documentId); // Reference document by UID
                const docSnap = await getDoc(docRef); // Get document snapshot

                if (docSnap.exists()) {
                    // Document found, extract data
                    const userData = docSnap.data();
                    console.log(userData);
                    localStorage.setItem('userData', JSON.stringify(userData));

                    userIsLoggedIn = true;
                    localStorage.setItem('userIsLoggedIn', userIsLoggedIn);

                    setTimeout(()=>{
                        window.location = '../home/home.html';
                    },1000);
                } else {
                    console.log('No such document!');
                }
            } else {
                console.log('Document with UID not found.');
            }
        })
        .catch(error => {
            console.error('Error getting document ID:', error);
        });
    } catch (error) {
        // Handle authentication errors
        handleAuthenticationError(error);
    }

}

async function getDocumentIdByUid(uid) {
    // Construct Firestore query to find document with UID
    const q = query(collection(firestore, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    // Check if document exists
    if (!querySnapshot.empty) {
        // Get document data
        const documentData = querySnapshot.docs[0].data();
        // Get document ID
        const documentId = querySnapshot.docs[0].id;
        return documentId;
    } else {
        return null; // Document with given UID not found
    }
}

// Function to handle authentication errors
function handleAuthenticationError(error) {
    let errorMessage = '';

    switch (error.code) {
        case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
        case 'auth/user-disabled':
            errorMessage = 'User account has been disabled';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            errorMessage = 'Invalid email or password';
            break;
        default:
            errorMessage = 'An error occurred. Please try again later.';
            console.error('Firebase Authentication Error:', error.code, error.message);
            break;
    }

    displayErrorMessage(errorMessage);
}

// Function to display error messages
function displayErrorMessage(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.color = 'red';
    errorDiv.appendChild(messageElement);
}

// Add event listener to form submission
form.addEventListener('submit', handleFormSubmission);
