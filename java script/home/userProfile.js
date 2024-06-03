import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc,getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


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

// Function to extract UID from URL query parameter
function getUidFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('uid');
}

// Function to fetch and display user details
async function fetchAndDisplayUserDetails(uid) {
    try {
        const userDoc = await getDocs(query(collection(firestore, 'users'), where('uid', '==', uid)));
        if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            document.querySelector('.profile-info-title').textContent = `${userData.name} informations`;
            document.querySelector('.profile-img-desc img').src = userData.photoProfileUrl;
            document.querySelector('.profile-info-infos:nth-child(1)').textContent = `Your ID: ${userData.uid}`;
            document.querySelector('.profile-info-infos:nth-child(2)').textContent = `Name: ${userData.name}`;
            document.querySelector('.profile-info-infos:nth-child(3)').textContent = `Email: ${userData.email}`;
            document.querySelector('.profile-info-infos:nth-child(4)').textContent = `Type: ${userData.userType}`;
            document.querySelector('.like-or-dislike:nth-child(5) label').textContent = `${userData.like} Likes`;
            document.querySelector('.like-or-dislike:nth-child(6) label').textContent = `${userData.dislike} Dislikes`;
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// Function to update the like count in Firestore
// Function to update the like count in Firestore
async function updateLikeCount() {
    const uid = getUidFromUrl();
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userData.hasDisliked) {
            await updateDoc(userDocRef, {
                dislike: increment(-1),
                hasDisliked: false,
                hasLiked: true,
                like: increment(1)
            });
        } else if (!userData.hasLiked) {
            await updateDoc(userDocRef, {
                hasLiked: true,
                like: increment(1)
            });
        }
        console.log('Like count updated successfully.');
        fetchAndDisplayUserDetails(uid);
        document.querySelector('#like').style.color = 'green';
        document.querySelector('#dislike').style.color = 'black';
    } else {
        console.log('No matching document found to update.');
    }
}

// Function to update the dislike count in Firestore
async function updateDislikeCount() {
    const uid = getUidFromUrl();
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const userDocRef = querySnapshot.docs[0].ref;
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();

        if (userData.hasLiked) {
            await updateDoc(userDocRef, {
                like: increment(-1),
                hasLiked: false,
                hasDisliked: true,
                dislike: increment(1)
            });
        } else if (!userData.hasDisliked) {
            await updateDoc(userDocRef, {
                hasDisliked: true,
                dislike: increment(1)
            });
        }
        console.log('Dislike count updated successfully.');
        fetchAndDisplayUserDetails(uid);
        document.querySelector('#dislike').style.color = 'red';
        document.querySelector('#like').style.color = 'black';
    } else {
        console.log('No matching document found to update.');
    }
}


// Add event listeners to like and dislike buttons
document.getElementById('like').addEventListener('click', updateLikeCount);
document.getElementById('dislike').addEventListener('click', updateDislikeCount);

// Fetch and display user details based on the UID from the URL
const uid = getUidFromUrl();
if (uid) {
    fetchAndDisplayUserDetails(uid);
}