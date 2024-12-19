
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
    import { getDoc, getFirestore, doc, collection, getDocs} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

    async function fetchPetDetails() {
        const petID = document.getElementById("petID_Input").value;

    if (!petID) {
        alert("Please enter a valid Pet ID.");
        return;
    }

    try {
        console.log("Fetching data for Pet ID:", petID);

        // Fetch the appointments subcollection for the petID
        const appointmentsSubcollectionRef = collection(db, "pets", petID, "appointments");
        console.log("Appointments subcollection reference:", appointmentsSubcollectionRef);

        // Get all appointment documents for the petID
        const appointmentSnapshot = await getDocs(appointmentsSubcollectionRef);
        console.log("Fetched appointment snapshot:", appointmentSnapshot);

        if (appointmentSnapshot.empty) {
            console.warn(`No appointments found for Pet ID: ${petID}`);
            alert("No appointment ID associated with this pet.");
            return;
        }

        // Assume we take the first appointment from the subcollection
        const appointmentDoc = appointmentSnapshot.docs[0];
        const appointmentID = appointmentDoc.id;
        console.log(`Fetched Appointment ID: ${appointmentID}`);

        // Fetch the appointment document using appointmentID
        const appointmentDocRef = doc(db, "pets", petID, "appointments", appointmentID);
        const appointmentDataDoc = await getDoc(appointmentDocRef);

        if (!appointmentDataDoc.exists()) {
            console.error(`No appointment document found for Appointment ID: ${appointmentID}`);
            alert("No appointment found with the given Appointment ID. Please check and try again.");
            return;
        }

        const appointmentData = appointmentDataDoc.data();
        console.log("Appointment details fetched successfully:", appointmentData);

        // Fetch the pet document for additional pet details
        const petDocRef = doc(db, "pets", petID);
        const petDoc = await getDoc(petDocRef);

        if (!petDoc.exists()) {
            console.error(`No pet document found for Pet ID: ${petID}`);
            alert("No pet found with the given Pet ID. Please check and try again.");
            return;
        }

        const petData = petDoc.data();
        console.log("Pet details fetched successfully:", petData);

        // Format date of birth and schedule
        const dateOfBirth = petData.dateOfBirth?.seconds
            ? new Date(petData.dateOfBirth.seconds * 1000).toLocaleDateString("en-GB") // dd/mm/yyyy format
            : "N/A";


            //schedule 
        const schedule = appointmentData.dateTime?.seconds
            ? new Date(appointmentData.dateTime.seconds * 1000).toLocaleDateString("en-US",{ // dd/mm/yyyy format
            month: "long", 
            day: "numeric",
            year: "numeric", 
    })
            :"N/A";

        // Format gender
        console.log("Full petData object:", petData);

        //FIX THIS 
        
        let genderElement = document.getElementById("petgender_Forms"); // Correct the ID here
        if (genderElement) {
            genderElement.innerText = petData.gender ? "Male" : "Female";
        } else {
            console.error("Element with ID 'genderElement' not found in the DOM.");
        }
        
        // Update UI elements
        document.getElementById("ownerName_Forms").innerText = appointmentData.ownerName || "N/A";
        document.getElementById("petName_Forms").innerText = petData.petName || "N/A";
        document.getElementById("dateOfBirth_Forms").innerText = dateOfBirth || "N/A";
        document.getElementById("petGender_Forms").innerText = petData.gender || "N/A";
        document.getElementById("petSpecies_Forms").innerText = petData.species || "N/A";
        document.getElementById("petBreed_Forms").innerText = petData.breed || "N/A";
        document.getElementById("preferredVet_Forms").innerText = appointmentData.preferredVet || "N/A";
        document.getElementById("visitReason_Forms").innerText = appointmentData.visitReason || "N/A";
        document.getElementById("dateTime_Forms").innerText = schedule || "N/A";

        document.getElementById("status").innerText = appointmentData.status || "N/A";


        console.log("All details updated successfully.");
    } catch (error) {
        console.error("Error occurred during fetchPetDetails execution:", error.message, error.stack);
        alert("An error occurred while fetching the pet details. Please check the console for details.");
    }
}

document.getElementById("fetchButton").addEventListener("click", fetchPetDetails);
