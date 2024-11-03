import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc, // Required for editing
  updateDoc, // Required for editing
  getDoc, // Required to fetch a single incident by ID
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAYORtT_yPLCmeN38hLh7ZhjOjc3N23yU",
  authDomain: "citizen-report-app-45f6c.firebaseapp.com",
  projectId: "citizen-report-app-45f6c",
  storageBucket: "citizen-report-app-45f6c.appspot.com",
  messagingSenderId: "382465207068",
  appId: "1:382465207068:web:2b647e65ba8807858c68d9",
  measurementId: "G-9JFKSH4G0L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Reference to the incidents collection
const incidentsCollection = collection(db, "incidents");

// Handle user sign out
async function handleSignOut() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error("Sign Out Error", error);
  }
}
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("sign-out-button")
    .addEventListener("click", handleSignOut);
});

// Retrieve incidentId from URL (if editing)
const params = new URLSearchParams(window.location.search);
const incidentId = params.get("incidentId"); // Will be null if not editing

// If editing, load the incident data into the form
if (incidentId) {
  loadIncidentData(incidentId);
}

// Load data for editing
async function loadIncidentData(id) {
  const incidentDoc = await getDoc(doc(db, "incidents", id));
  if (incidentDoc.exists()) {
    const incident = incidentDoc.data();
    document.getElementById("title").value = incident.title;
    document.getElementById("incident-type").value = incident.type;
    document.getElementById("description").value = incident.description;
    document.getElementById("location").value = incident.location;
    // Handle image display if needed
  }
}

// Handle form submission
document
  .getElementById("incident-form")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const incidentType = document.getElementById("incident-type").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value;
    const imageUpload = document.getElementById("image-upload").files[0];
    const submitButton = event.target.querySelector("button[type='submit']");

    const user = auth.currentUser;

    // Set loading state
    submitButton.innerText = "Uploading, please wait...";
    submitButton.disabled = true;

    let imageUrl = null;
    if (imageUpload) {
      const imageRef = ref(storage, `incident-images/${imageUpload.name}`);
      const snapshot = await uploadBytes(imageRef, imageUpload);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    try {
      if (user) {
        if (incidentId) {
          // Update existing incident
          const incidentRef = doc(db, "incidents", incidentId);
          await updateDoc(incidentRef, {
            type: incidentType,
            title: title,
            description: description,
            location: location,
            image: imageUrl || null,
            timestamp: new Date(),
            userId: user.uid,
          });
          alert("Incident updated successfully!");
        } else {
          // Add a new incident
          await addDoc(incidentsCollection, {
            type: incidentType,
            title: title,
            description: description,
            location: location,
            image: imageUrl || null,
            timestamp: new Date(),
            userId: user.uid,
          });
          alert("Incident reported successfully!");
        }

        document.getElementById("incident-form").reset();
        displayIncidents();
      } else {
        alert("You must be logged in to report an incident.");
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    } finally {
      // Reset loading state
      submitButton.innerText = "Submit Incident";
      submitButton.disabled = false;
    }
  });

// Display incidents function remains unchanged
async function displayIncidents(selectedCategory = "all") {
  const incidentListElement = document.getElementById("incident-list");
  incidentListElement.innerHTML = ""; // Clear existing list

  let q;
  if (selectedCategory === "all") {
    q = query(incidentsCollection);
  } else {
    q = query(incidentsCollection, where("type", "==", selectedCategory));
  }

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const incident = doc.data();
    const incidentId = doc.id;

    const incidentItem = document.createElement("li");
    incidentItem.innerHTML = `
      <strong>Type:</strong> ${incident.type}<br>
      <strong>Description:</strong> ${incident.description}<br>
      <strong>Location:</strong> ${incident.location}<br>
      <strong>Image:</strong> ${
        incident.image
          ? `<img src="${incident.image}" alt="Incident Image" width="100">`
          : "No image uploaded"
      }<br>
      <button onclick="editIncident('${incidentId}')">Edit</button>
    `;
    incidentListElement.appendChild(incidentItem);
  });
}

// Edit incident function to redirect to report.html with the incidentId in the URL
function editIncident(incidentId) {
  window.location.href = `report.html?incidentId=${incidentId}`;
}

// Call displayIncidents on page load if needed
if (document.getElementById("incident-list")) {
  displayIncidents();
}
