
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


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

const userData = JSON.parse(localStorage.getItem('userData')) || {}; // Initialize as an empty object if userData is null
let photoProfileUrl = userData.photoProfileUrl || '';

const profileImage = document.querySelector('.profile-img-desc img');
profileImage.src = photoProfileUrl;

let inputFile = document.querySelector('#input-file');
inputFile.onchange = function() {
    uploadImage();
};

// upload image function
function uploadImage() {
    let file = inputFile.files[0]; // Use inputFile to access the selected file
    let types = ["image/jpeg", "image/png", "image/svg+xml"]; // Corrected MIME type for SVG

    if (!file) {
        alert("No file selected!");
        return;
    }

    if (types.indexOf(file.type) === -1) {
        alert("Type not supported !!");
        inputFile.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("The file size is very large !!");
        return;
    }

    getImageBase64(file);
}

async function getImageBase64(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async function () {
        profileImage.src = reader.result; // Update profileImage source
        photoProfileUrl = reader.result; // Update photoProfileUrl

        // Update photoProfileUrl in userData
        userData.photoProfileUrl = photoProfileUrl;

        // Update userData in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        let useruid = JSON.parse(localStorage.getItem('userData'));
        let uid = useruid.uid; // Define uid here

        // Update Firestore document with the new photoProfileUrl
        try {
            const documentId = await getDocumentIdByUid(uid);
            if (documentId) {
                const usersCollection = collection(firestore, 'users');

                // Update the document with the new photoProfileUrl
                const docRef = doc(usersCollection, documentId);
                await updateDoc(docRef, {
                    photoProfileUrl: photoProfileUrl
                });
                alert("Image uploaded successfully !!");
                location.reload();
            } else {
                console.log('Document with UID not found.');
            }
        } catch (error) {
            console.error("Error updating Firestore document:", error);
        }
    };

    reader.onerror = function () {
        alert("Error !!");
    };
}


window.addEventListener('load', drawUserInfo);

function drawUserInfo() {
    const infos = document.querySelectorAll('.infos');
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    infos.forEach(info => {
        info.innerHTML = `
            <p class="profile-info-infos"><b>Your ID:</b> ${userData.uid}</p>
            <p class="profile-info-infos"><b>Name:</b> ${userData.name} </p>
            <p class="profile-info-infos"><b>Email:</b> ${userData.email} </p>
            <p class="profile-info-infos"><b>Type:</b> ${userData.userType} </p>
        `;
    });

    
}


// Others Functions
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


const crypto = require('crypto');

function uidToUniqueNumber(uid) {
    // Create SHA-256 hash
    const hash = crypto.createHash('sha256').update(uid).digest('hex');
    
    // Take the first 8 characters of the hash
    const truncatedHash = hash.substring(0, 8);
    
    // Convert hexadecimal to a number
    const decimalNumber = parseInt(truncatedHash, 16);
    
    return decimalNumber;
}
