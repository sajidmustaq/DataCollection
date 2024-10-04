import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

let branches = {};  // Initialize an empty object for branches

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

// Load branch data from branchData.json
async function loadBranchData() {
    try {
        const response = await fetch('branchData.json'); // Ensure the correct path to branchData.json
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

// Function to fetch and display data in the table
async function loadTableData() {
    const tableBody = document.querySelector('#branchTable tbody');
    const totalEntriesDiv = document.getElementById('totalEntries');
    let totalEntries = 0; // Initialize total entries

    try {
        await loadBranchData();

        const querySnapshot = await getDocs(collection(db, "submissions"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const branch = branches[data.branchCode] || {};

            const row = `
                <tr>
                    <td>${data.branchCode}</td>
                    <td>${branch["شاخ"] || 'نہیں معلوم'}</td>
                    <td>${branch["مجلس"] || 'نہیں معلوم'}</td>
                    <td>${branch["سرکاری ڈویژن"] || 'نہیں معلوم'}</td>
                    <td>${branch["ڈسٹرکٹ"] || 'نہیں معلوم'}</td>
                    <td>${branch["ٹاؤن"] || 'نہیں معلوم'}</td>
                    <td>${data.yusi}</td>
                    <td>${data.ward}</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
            totalEntries++; // Increment total entries for each row added
        });

        // Update the total entries display
        totalEntriesDiv.textContent = `مجموعی اندراجات: ${totalEntries}`;
    } catch (error) {
        console.error('Error fetching data from Firebase:', error);
    }
}

// Load table data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadTableData);

// Filter function
function filterTable() {
    const input = document.getElementById('filterInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('branchTable');
    const tr = table.getElementsByTagName('tr');
    let visibleRowCount = 0; // To count visible rows

    // Loop through all table rows (excluding the header)
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let rowVisible = false;

        // Check each cell in the row
        for (let j = 0; j < td.length; j++) {
            const cell = td[j];
            if (cell) {
                const txtValue = cell.textContent || cell.innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    rowVisible = true;
                    break; // No need to check further cells
                }
            }
        }

        // Toggle row visibility
        tr[i].style.display = rowVisible ? "" : "none";

        // Count visible rows
        if (rowVisible) visibleRowCount++;
    }

    // Update total entries display to show only visible entries
    document.getElementById('totalEntries').innerText = `مجموعی اندراجات: ${visibleRowCount}`;
}

// Export function
function exportTableToExcel(tableID, filename = '') {
    let downloadLink;
    const dataType = 'application/vnd.ms-excel';
    const tableSelect = document.getElementById(tableID);
    const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    // Create a download link element
    downloadLink = document.createElement("a");

    // Specify link's href
    document.body.appendChild(downloadLink);

    if (filename === '') filename = 'excel_data.xls'; // Default file name

    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

    downloadLink.download = filename;

    // Trigger the function
    downloadLink.click();
    document.body.removeChild(downloadLink); // Remove the link after download
}

// Make functions available globally
window.exportTableToExcel = exportTableToExcel;
window.filterTable = filterTable;

// Attach event listeners
document.getElementById('filterInput').addEventListener('keyup', filterTable);
document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('adminAuthenticated');
    window.location.href = 'index.html'; // Redirect to login page
});
