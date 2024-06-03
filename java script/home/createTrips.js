import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, increment, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVHdjo1yvhOIitnBcZRo9iCXiNOCTL9YY",
    authDomain: "transport-300ce.firebaseapp.com",
    projectId: "transport-300ce",
    storageBucket: "transport-300ce.appspot.com",
    messagingSenderId: "556727701878",
    appId: "1:556727701878:web:1caa1025d5a4d2c478aa57"
};

initializeApp(firebaseConfig);
const db = getFirestore();

// Select the form and search input field  
const userData = JSON.parse(localStorage.getItem('userData'));

// Function to save trip to Firestore
const saveTripToFirestore = async (tripData) => {
    try {
      const docRef = await addDoc(collection(db, 'userTrips'), tripData);
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1500);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

// Event listener for form submission
document.querySelector('.signup-form').addEventListener('submit', (e) => {
  // Prevent the default form submission behavior
  e.preventDefault();

  // Construct trip data from form inputs
  const tripData = {
    From: document.getElementById('starting-State').value,
    To: document.getElementById('arrival-state').value,
    Starting: document.getElementById('starting-location').value,
    Time: document.getElementById('time').value,
    Price: document.getElementById('price').value,
    Seats: document.getElementById('user-type').value,
    userName: userData.name,
    uid: userData.uid,
    userType: userData.userType
    // Add any other relevant fields here
  };

  // Save the trip data to Firestore
  saveTripToFirestore(tripData);
});