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
    const appElement = document.getElementById('app');
    appElement.innerHTML = `
        <div class="container">
            <h1>شاخ کی تفصیلات</h1>
            <input type="text" id="branchCode" placeholder="شاخ کوڈ" oninput="fetchBranchDetails()">
            <div id="branchDetails"></div>
            <div id="submissionFields" style="display:none;">
                <input type="text" id="yusi" placeholder="یوسی">
                <input type="text" id="ward" placeholder="وارڈ نمبر">
                <button onclick="submitData()">سبمٹ کریں</button>
            </div>
        </div>
    `;
}

window.fetchBranchDetails = function () {
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
        submissionDiv.style.display = 'block';
    } else {
        detailsDiv.innerHTML = '<p>کوئی شاخ نہیں ملی۔ براہ کرم درست شاخ کوڈ درج کریں۔</p>';
        submissionDiv.style.display = 'none';
    }
}

window.submitData = async function () {
    const yusi = document.getElementById('yusi').value;
    const ward = document.getElementById('ward').value;
    const code = document.getElementById('branchCode').value;

    if (yusi && ward && code) {
        try {
            console.log('Attempting to save data:', { branchCode: code, yusi, ward });
            const docRef = await addDoc(collection(db, "submissions"), {
                branchCode: code,
                yusi: yusi,
                ward: ward,
                timestamp: serverTimestamp()
            });
            console.log('Document written with ID: ', docRef.id);
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
            document.getElementById('branchDetails').innerHTML = '';

        } catch (error) {
            console.error('Error saving data:', error);
            console.error('Error details:', error.code, error.message);

            Swal.fire({
                icon: "error",
                title: "ڈیٹا محفوظ کرنے میں مسئلہ!",
                text: `Error: ${error.message}`
            });
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "براہ کرم تمام فیلڈز کو پُر کریں (شاخ کوڈ، یوسی، اور وارڈ نمبر)!"
        });
    }
}

async function loadBranchData() {
    try {
        const response = await fetch('branchData.json');
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

const adminCredentials = {
    admin1: "123456",
    admin2: "123456"
};

document.addEventListener('DOMContentLoaded', () => {
    renderMainPage();
    loadBranchData();
});

window.showAdminLoginModal = function() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'flex';
}

window.validateAdmin = function () {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (adminCredentials[username] && adminCredentials[username] === password) {
        Swal.fire({
            title: "Login successful!",
            icon: "success",
            timer: 1500
        }).then(() => {
            document.getElementById('adminLoginModal').style.display = 'none';
            window.location.href = "admin.html";
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Admin ID or Password',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "index.html";
        });
    }
}

document.getElementById('adminPanelLink').addEventListener('click', function (event) {
    event.preventDefault();
    showAdminLoginModal();
});