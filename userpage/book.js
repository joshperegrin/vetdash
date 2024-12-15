import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDocs } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCn5TPno8hTc1cM-Sm9vsrzkJn6VjKTyYM",
    authDomain: "vet-appointment-3a67a.firebaseapp.com",
    projectId: "vet-appointment-3a67a",
    storageBucket: "vet-appointment-3a67a.firebasestorage.app",
    messagingSenderId: "136329434663",
    appId: "1:136329434663:web:ad3507ceff4fc664072002",
    measurementId: "G-8LEBWB9T8G"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

document.addEventListener('DOMContentLoaded', function () {
    const addButton = document.getElementById('addAppointmentBtn');
    if (addButton) {
        addButton.addEventListener('click', addAppointmentOnClick);
    } else {
        console.error("Button with ID 'addAppointmentBtn' not found");
    }

    fetchVets();

    const petIDField = document.getElementById("petID_Forms");

    // Listen for changes to petID input field
    if (petIDField) {
        petIDField.addEventListener('input', () => {
            const petIDValue = petIDField.value.trim();
            if (petIDValue) {
                fetchPetDetails(petIDValue);
            } else {
                document.getElementById("petName_Forms").value = "";
                document.getElementById("petBreed_Forms").value = "";
                document.getElementById("petSpecies_Forms").value = "";
                document.getElementById("petGender_Forms").value = "";

                document.getElementById("petName_Forms").disabled = false;
                document.getElementById("petBreed_Forms").disabled = false;
                document.getElementById("petSpecies_Forms").disabled = false;
                document.getElementById("petGender_Forms").disabled = false;
                document.getElementById("dateOfBirth_Forms").disabled = false;

            }
        });
    }
});


// Pangkuha nung pet details
async function fetchPetDetails(petID) {
    try {
        const petRef = doc(db, "pets", petID);
        const petDoc = await getDoc(petRef);
        if (petDoc.exists()) {
            const petData = petDoc.data();

            // Set pet details
            document.getElementById("petName_Forms").value = petData.petName;
            document.getElementById("petBreed_Forms").value = petData.breed;
            document.getElementById("petSpecies_Forms").value = petData.species;
            document.getElementById("petGender_Forms").value = petData.gender;

            // Format the dateOfBirth and adjust for time zone offset
            if (petData.dateOfBirth) {
                const dateOfBirth = petData.dateOfBirth.toDate();
                const adjustedDate = new Date(dateOfBirth.getTime() - dateOfBirth.getTimezoneOffset() * 60000); // Adjust time
                const formattedDate = adjustedDate.toISOString().split('T')[0]; //yyyy-MM-dd
                document.getElementById("dateOfBirth_Forms").value = formattedDate;
            }

            // Disable the fields so they can't be edited
            document.getElementById("petName_Forms").disabled = true;
            document.getElementById("petBreed_Forms").disabled = true;
            document.getElementById("petSpecies_Forms").disabled = true;
            document.getElementById("petGender_Forms").disabled = true;
            document.getElementById("dateOfBirth_Forms").disabled = true;
        } else {
            console.error("Pet ID does not exist in the database.");
        }
    } catch (e) {
        console.error("Error fetching pet details:", e);
    }
}


async function addAppointmentOnClick(event) {
    event.preventDefault();  // Prevent form submission if inside a form

    const appointmentData = {
        createdAt: new Date(),
        dateTime: new Date(document.getElementById("dateTime_Forms")?.value.concat("T00:00:00")),
        ownerName: document.getElementById("ownerName_Forms")?.value,
        ownerEmail: document.getElementById("ownerEmail_Forms")?.value,
        ownerContact: document.getElementById("ownerContact_Forms")?.value,
        ownerAddress: document.getElementById("ownerAddress_Forms")?.value,
        petName: document.getElementById("petName_Forms")?.value,
        dateOfBirth: new Date(document.getElementById("dateOfBirth_Forms")?.value.concat("T00:00:00")),
        gender: document.getElementById("petGender_Forms")?.value,
        species: document.getElementById("petSpecies_Forms")?.value,
        petBreed: document.getElementById("petBreed_Forms")?.value,
        petID: document.getElementById("petID_Forms")?.value,
        preferredVet: document.getElementById("preferredVet_Forms")?.value,
        visitReason: document.getElementById("visitReason_Forms")?.value,
        otherConcerns: document.getElementById("otherConcerns_Forms")?.value,
        status: "Scheduled",
        updatedAt: new Date(),
    };

    // Validate that all fields are filled
    for (const key in appointmentData) {
        if ((appointmentData[key] === undefined || appointmentData[key] === null || appointmentData[key] === "") && key !== "petID") {
            console.error(`Warning: ${key} is empty or not defined`);
            alert("Please fill out all fields before submitting the form.");
            return;
        }
    }

    await addAppointment(appointmentData);
}

// Check if the pet ID already exists in the database
async function petIDExists(petID) {
    const petRef = doc(db, "pets", petID);
    const petDoc = await getDoc(petRef);
    return petDoc.exists();
}

// For firebase
async function addAppointment(appointmentData) {
    try {
        let petsRef;

        // If petID is new, add a new pet document
        if (!await petIDExists(appointmentData.petID)) {
            petsRef = await addDoc(collection(db, "pets"), {
                breed: appointmentData.petBreed,
                dateOfBirth: appointmentData.dateOfBirth,
                gender: appointmentData.gender,
                petName: appointmentData.petName,
                species: appointmentData.species,
            });
            console.log("New pet added:", petsRef.id);
            await updateDoc(petsRef, { petID: petsRef.id });
        } else {
            petsRef = await doc(db, "pets", appointmentData.petID);
            const petDoc = await getDoc(petsRef);
            if (!petDoc.exists()) {
                throw new Error("Pet ID does not exist");
            }
        }

        // Add appointment for the pet
        const appointmentRef = await addDoc(collection(db, "pets", petsRef.id, "appointments"), {
            createdAt: appointmentData.createdAt,
            dateTime: appointmentData.dateTime,
            otherConcerns: appointmentData.otherConcerns,
            ownerAddress: appointmentData.ownerAddress,
            ownerContact: appointmentData.ownerContact,
            ownerEmail: appointmentData.ownerEmail,
            ownerName: appointmentData.ownerName,
            preferredVet: appointmentData.preferredVet,
            status: appointmentData.status,
            updatedAt: appointmentData.updatedAt,
            visitReason: appointmentData.visitReason,
            pet: {
                petID: petsRef.id,
                breed: appointmentData.petBreed,
                dateOfBirth: appointmentData.dateOfBirth,
                gender: appointmentData.gender,
                petName: appointmentData.petName,
                species: appointmentData.species
            }
        });

        alert("Appointment added successfully!");

        clearFormFields();

    } catch (e) {
        console.error("Error adding appointment:", e);
        alert("Error adding appointment. Please try again.");
    }
}

async function fetchVets() {
    try {
        const selectElement = document.getElementById("preferredVet_Forms");
        const querySnapshot = await getDocs(collection(db, "vets"));
        
        if (querySnapshot.empty) {
            console.error("No vets found in the database.");
            return;
        }

        querySnapshot.docs.forEach(doc => {
            const vetData = doc.data();
            const option = document.createElement("option");
            option.value = vetData.vetName; // Use vetName as the value
            option.textContent = `${vetData.vetName} - ${vetData.expertise}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading vets:", error);
        alert("Error loading vets. Please check the console for details.");
    }
}

function clearFormFields() {
    document.getElementById("dateTime_Forms").value = '';
    document.getElementById("ownerName_Forms").value = '';
    document.getElementById("ownerEmail_Forms").value = '';
    document.getElementById("ownerContact_Forms").value = '';
    document.getElementById("ownerAddress_Forms").value = '';
    document.getElementById("petName_Forms").value = '';
    document.getElementById("petBreed_Forms").value = '';
    document.getElementById("petID_Forms").value = '';
    document.getElementById("dateOfBirth_Forms").value = '';
    document.getElementById("petGender_Forms").value = '';
    document.getElementById("petSpecies_Forms").value = '';
    document.getElementById("preferredVet_Forms").value = '';
    document.getElementById("visitReason_Forms").value = '';
    document.getElementById("otherConcerns_Forms").value = '';

    document.getElementById("petName_Forms").disabled = false;
    document.getElementById("petBreed_Forms").disabled = false;
    document.getElementById("petSpecies_Forms").disabled = false;
    document.getElementById("petGender_Forms").disabled = false;
    document.getElementById("dateOfBirth_Forms").disabled = false;
}
