const userData = JSON.parse(localStorage.getItem('userData'));
const photoProfileUrl = userData.photoProfileUrl;

const profileImg = document.querySelector('.profile-img');
profileImg.style.backgroundImage = `url(${photoProfileUrl})`;


// Import Firebase modules
// home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore,deleteDoc, collection, query, where, getDocs, doc, getDoc, increment, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const firestore = getFirestore();

// Select the form and search input field
const searchForm = document.querySelector('.search-form');
const searchInput = document.getElementById('search');

// Function to handle search form submission
async function handleSearch(event) {
    event.preventDefault(); // Prevent form submission

    const searchValue = searchInput.value.trim(); // Get the search input value and trim any whitespace

    if (searchValue) {
        try {
            // Construct Firestore query to find users by name or UID
            const usersCollection = collection(firestore, 'users');
            const q = query(usersCollection, where('name', '==', searchValue)); // Search by name
            const qUid = query(usersCollection, where('uid', '==', searchValue)); // Search by UID

            // Get documents matching the query
            const querySnapshot = await getDocs(q);
            const querySnapshotUid = await getDocs(qUid);

            // Check if any documents were found
            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                console.log('User found by name:', userData);
                displayUserInfo(userData);
            } else if (!querySnapshotUid.empty) {
                const userData = querySnapshotUid.docs[0].data();
                console.log('User found by UID:', userData);
                displayUserInfo(userData);
            } else {
                console.log('No user found with that name or UID.');
                hideUserInfo();
            }
        } catch (error) {
            console.error('Error searching for user:', error);
            hideUserInfo();
        }
    } else {
        console.log('Please enter a name or UID to search.');
        hideUserInfo();
    }
}

function displayUserInfo(userData) {
    const userPhoto = document.getElementById('user-photo');
    const userName = document.getElementById('user-name');
    const userInfoDiv = document.querySelector('.user-info');
    const userProfileLink = document.querySelector('.visit');

    userPhoto.src = userData.photoProfileUrl; // Make sure to use the correct field name from Firestore
    userName.textContent = userData.name;
    userInfoDiv.style.display = 'block';

    // Set the href attribute of the link to userProfile.html with the UID as a query parameter
    userProfileLink.href = `userProfile.html?uid=${userData.uid}`; // Assuming `uid` is the field name for UID in your Firestore data
}

function hideUserInfo() {
    const userInfoDiv = document.querySelector('.user-info');
    userInfoDiv.style.display = 'none';
}

// Add event listener to search form submission
searchForm.addEventListener('submit', handleSearch);







// Function to create a daily trip item card




function createDailyTripCard(trip) {
    // Determine if the trip is closed (no seats available)
    const isClosed = trip.Seats === 0;

    return `
        <div class="daily-trips-item">
            <div class="daily-trips-item-img">
                <!-- Dynamic image if available, or a placeholder if not -->
            </div>
            <div class="daily-trips-item-infos">
                <p>From: ${trip.From}</p>
                <p>To: ${trip.To}</p>
                <p>Starting: ${trip.Starting}</p>
                <p>Time: ${trip.Time}</p>
                <p>Price: ${trip.Price} DZA</p>
                <p>Seats: <span class="seats-count" style="color: ${isClosed ? 'red' : 'black'};">${trip.Seats}</span></p>
                <button class="join start-btn" ${isClosed ? 'style="display:none;"' : ''} onclick="handleJoinClick(this, 'dailyTravels', '${trip.id}');">Join</button>
                <p class="joined" style="display: none;">You have joined this travel</p>
                <p class="closed" style="display: ${isClosed ? 'block' : 'none'};">This travel is closed</p>
            </div>
        </div>
    `;
}



async function fetchAndDisplayDailyTrips() {
    const dailyTripsRef = collection(firestore, 'dailyTravels');
    const querySnapshot = await getDocs(dailyTripsRef);
    const tripsContainer = document.querySelector('.daily-trips-wrapper');
    tripsContainer.innerHTML = '';
    const joinedTrips = JSON.parse(localStorage.getItem('joinedTrips') || '[]');

    querySnapshot.forEach(async (doc) => {
        const trip = { id: doc.id, ...doc.data() };

        // Check if the current time matches the trip time
        const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const tripTime = trip.Time.split(':').slice(0, 2).join(':'); // Format trip time to match current time format

        if (currentTime === tripTime) {
            // Reset the trip to its default state
            trip.Seats = 4; // Assuming the default seat count is 4
            const joinedTripsIndex = joinedTrips.indexOf(trip.id);
            if (joinedTripsIndex !== -1) {
                joinedTrips.splice(joinedTripsIndex, 1);
                localStorage.setItem('joinedTrips', JSON.stringify(joinedTrips));
                
                // Update the Firestore document with the new seat count
                await updateDoc(doc.ref, { Seats: trip.Seats });
            }
        }

        const tripCard = createDailyTripCard(trip);
        tripsContainer.innerHTML += tripCard;

        if (joinedTrips.includes(trip.id)) {
            const joinButton = tripsContainer.querySelector(`button[onclick*='${trip.id}']`);
            const joinedMessage = joinButton.nextElementSibling;
            joinButton.style.display = 'none';
            joinedMessage.style.display = 'block';
        }
    });
}



window.handleJoinClick = async function(button, collection, tripId) {
    const tripRef = doc(firestore, collection, tripId);
    const tripSnapshot = await getDoc(tripRef);

    if (tripSnapshot.exists()) {
        const tripData = tripSnapshot.data();
        if (tripData.Seats > 0) {
            await updateDoc(tripRef, { Seats: increment(-1) });
            const updatedTripSnapshot = await getDoc(tripRef);
            const updatedTripData = updatedTripSnapshot.data();

            button.style.display = 'none';
            button.nextElementSibling.style.display = 'block';
            button.parentElement.querySelector('.seats-count').textContent = updatedTripData.Seats;

            const joinedTrips = JSON.parse(localStorage.getItem('joinedTrips') || '[]');
            if (!joinedTrips.includes(tripId)) {
                joinedTrips.push(tripId);
                localStorage.setItem('joinedTrips', JSON.stringify(joinedTrips));
            }
        } else {
            button.style.display = 'none';
            button.parentElement.querySelector('.closed').style.display = 'block';
        }
    } else {
        console.log('No such trip found!');
    }
};

fetchAndDisplayDailyTrips();














function createUsersTripCard(trip) {
    // Determine if the trip is closed (no seats available)
    const isClosed = trip.Seats === 0;

    return `
        <div class="daily-trips-item">
            <div class="daily-trips-item-img">
                <!-- Dynamic image if available, or a placeholder if not -->
            </div>
            <div class="daily-trips-item-infos">
                <p>From: ${trip.From}</p>
                <p>To: ${trip.To}</p>
                <p>Starting: ${trip.Starting}</p>
                <p>Time: ${trip.Time}</p>
                <p>Price: ${trip.Price} DZA</p>
                <p>Name: ${trip.userName}</p>
                <p>Type: ${trip.userType}</p>
                <p>Seats: <span class="seats-count" style="color: ${isClosed ? 'red' : 'black'};">${trip.Seats}</span></p>
                <button class="join start-btn" ${isClosed ? 'style="display:none;"' : ''} onclick="handleJoinClick(this, 'userTrips', '${trip.id}');">Join</button>
                <p class="joined" style="display: none;">You have joined this travel</p>
                <p class="closed" style="display: ${isClosed ? 'block' : 'none'};">This travel is closed</p>
            </div>
        </div>
    `;
}



async function fetchAndDisplayUserTrips() {
    try {
        const userTripsRef = collection(firestore, 'userTrips');
        const querySnapshot = await getDocs(userTripsRef);
        const tripsContainer = document.querySelector('.users-trips .daily-trips-wrapper');
        tripsContainer.innerHTML = '';
        const joinedTrips = JSON.parse(localStorage.getItem('joinedTrips') || '[]');
        const tripsToRemove = [];

        querySnapshot.forEach(async (doc) => {
            const trip = { id: doc.id, ...doc.data() };

            const isClosed = trip.Seats === 0;
            const currentTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const tripTime = trip.Time.split(':').slice(0, 2).join(':');
            
            if (currentTime === tripTime) {
                tripsToRemove.push(doc.ref); // Add the trip reference to the list of trips to remove
                return; // Skip adding this trip to the UI
            }

            const tripCard = createUsersTripCard(trip);
            tripsContainer.innerHTML += tripCard;

            const joinButton = tripsContainer.querySelector(`button[onclick*='${trip.id}']`);
            const joinedMessage = joinButton.nextElementSibling;
            if (joinedTrips.includes(trip.id)) {
                joinButton.style.display = 'none';
                joinedMessage.style.display = 'block';
            } else {
                joinButton.style.display = isClosed ? 'none' : 'block';
                joinedMessage.style.display = 'none';
            }
        });

        // Delete the trips that match the current time
        await Promise.all(tripsToRemove.map(ref => deleteDoc(ref)));
    } catch (error) {
        console.error('Error fetching and displaying user trips:', error);
    }
}



fetchAndDisplayUserTrips(); 