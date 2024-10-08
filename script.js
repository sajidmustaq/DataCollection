
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

let branches = {};  // Start with an empty object for branches

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQFI1-btaatgf22CIjjwNFE23Kg-528pc",
    authDomain: "datacollection-7fe93.firebaseapp.com",
    projectId: "datacollection-7fe93",
    storageBucket: "datacollection-7fe93.appspot.com",
    messagingSenderId: "891438830971",
    appId: "1:891438830971:web:8fa97d2921757d6d83d9de",
    measurementId: "G-WG427C9P47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function renderMainPage() {
    const appElement = document.getElementById('app'); // Ensure this is the right element
    appElement.innerHTML = `
        <div class="container">
            <h1>شاخ کی تفصیلات</h1>
            <input type="text" id="branchCode" placeholder="شاخ کوڈ درج فرمائیں" oninput="fetchBranchDetails()">
            <div id="branchDetails"></div>
            <div id="submissionFields" style="display:none;">
                <input type="text" id="yusi" placeholder="یوسی">
                <input type="text" id="ward" placeholder="وارڈ نمبر">
                <button onclick="submitData()">SUBMIT</button>
            </div>
           
        </div>
    `;
}

// Fetch branch details based on the code
window.fetchBranchDetails = function () { // Declare as a global function
    const code = document.getElementById('branchCode').value;
    const detailsDiv = document.getElementById('branchDetails');
    const submissionDiv = document.getElementById('submissionFields');

    const branch = branches[code];

    if (branch) {
        detailsDiv.innerHTML = `
            <h2>تفصیلات</h2>
            <p>شاخ کوڈ: ${branch["شاخ کوڈ"]}</p>
            <p>شاخ: ${branch["شاخ"]}</p>
            <p>مجلس: ${branch["مجلس"]}</p>
            <p>ٹاؤن: ${branch["ٹاؤن"]}</p>
            <p>ڈسٹرکٹ: ${branch["ڈسٹرکٹ"]}</p>
            <p>سرکاری ڈویژن: ${branch["سرکاری ڈویژن"]}</p>
        `;
        submissionDiv.style.display = 'block'; // Show submission input
    } else {
        detailsDiv.innerHTML = '<p>کوئی شاخ نہیں ملی۔ براہ کرم درست شاخ کوڈ درج کریں۔</p>';
        submissionDiv.style.display = 'none'; // Hide submission input
    }
}


// Submit data to Firebase
window.submitData = async function () { // Declare as a global function
    const yusi = document.getElementById('yusi').value;
    const ward = document.getElementById('ward').value;
    const code = document.getElementById('branchCode').value;

    if (yusi && ward) {
        try {
            await addDoc(collection(db, "submissions"), {
                branchCode: code,
                yusi: yusi,
                ward: ward,
                timestamp: serverTimestamp()
            });
            Swal.fire({
                title: `ڈیٹا محفوظ کر دیا گیا!\nشاخ کوڈ: ${code}\nیوسی: ${yusi}\nوارڈ: ${ward}`,
                icon: "success"
            });

            // Clear the form fields after successful submission
            document.getElementById('branchCode').value = '';
            document.getElementById('yusi').value = '';
            document.getElementById('ward').value = '';

            // Hide the submission fields again after form reset
            document.getElementById('submissionFields').style.display = 'none';
            document.getElementById('branchDetails').innerHTML = ''; // Clear branch details

        } catch (error) {
            console.error('Error saving data:', error);

            alert("ڈیٹا محفوظ کرنے میں مسئلہ!");
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "یوسی اور وارڈ نمبر دونوں درج کریں!"
        });
    }
}

// Load branch data from branchData.json
async function loadBranchData() {
    try {
        const response = await fetch('branchData.json'); // Ensure this path is correct
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        branches = data.reduce((acc, branch) => {
            acc[branch["شاخ کوڈ"]] = branch;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error loading branch data:', error);
    }
}

// Predefined Admin Credentials
const adminCredentials = {
    admin1: "123456",
    admin2: "123456"
};
document.addEventListener('DOMContentLoaded', () => {
    renderMainPage(); // Render the main form
    loadBranchData(); // Load branch data from branchData.json
});
// Show the login modal when "Go to Admin Panel" link is clicked
function showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'flex';  // Ensure the modal shows up by using 'flex'
}

// Validate admin credentials
window.validateAdmin = function () {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (adminCredentials[username] && adminCredentials[username] === password) {
        localStorage.setItem('adminAuthenticated', 'true'); // Set authentication flag
        Swal.fire({
            title: "Login successful!",
            icon: "success",
            timer: 1500
        }).then(() => {
            window.location.href = "admin.html"; // Redirect to admin page
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Admin ID or Password',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "index.html"; // Redirect to the main page on failure
        });
    }
}

window.showAdminLoginModal = function() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'flex';  // Show modal
}

// Attach event to "Go to Admin Panel" button
document.getElementById('adminPanelLink').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default link behavior
    
    // Check if the user is authenticated
    if (localStorage.getItem('adminAuthenticated')) {
        window.location.href = "admin.html"; // Redirect to admin page
    } else {
        showAdminLoginModal(); // Show the login modal
    }
});

