import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, Timestamp, getDocs, collectionGroup, doc, getCountFromServer, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

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

const app = Vue.createApp({
    data() {
        return {
            currentPage: 'appointments', // {overview, appointments, vetSched, settings}
            appointmentlist: [],
            appointmentSearchTerm: "",
            appointmentSearchFilter: "appointmentID",
        }
    },

    async mounted() {
        try {

        } catch (e) {
            console.log(e)
        }
    },

    methods: {
        async fetchQuery() {

            if (this.appointmentSearchTerm == "") {
                return
            }
            try {
                /**
                 * (Date) createdAt - date of booking of the appointment
                 * (Date) dateTime - schedule of the appointment
                 * (String) otherConcerns
                 * (String) ownerAddress
                 * (String) ownerContact
                 * (String) ownerEmail
                 * (String) ownerName
                 * (String) preferredVet
                 * (String) status
                 * (Date) updatedAt
                 * (String) visitReason
                 * 
                 * (String) breed
                 * (Date) dateOfBirth
                 * (Boolean) gender [true = male, false = female]
                 * (String) petName
                 * (String) species
                 */

                let q;

                switch (this.appointmentSearchFilter) {
                    case "appointmentID":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('appointmentID', '>=', this.appointmentSearchTerm),
                            where('appointmentID', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "createdAt":
                        throw "Error: Not Implemented Yet."
                        return;
                        break;
                    case "dateTime":
                        throw "Error: Not Implemented Yet."
                        return;
                        break;
                    // case "otherConcerns":
                    //     break;
                    // case "ownerAddress":
                    //     break;
                    case "ownerContact":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('ownerContact', '>=', this.appointmentSearchTerm),
                            where('ownerContact', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "ownerEmail":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('ownerEmail', '>=', this.appointmentSearchTerm),
                            where('ownerEmail', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "ownerName":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('ownerName', '>=', this.appointmentSearchTerm),
                            where('ownerName', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "petID":
                        const collectionSnapshot = await getDocs(collection(db, "pets", this.appointmentSearchTerm, "appointments"));
                        this.appointmentlist = collectionSnapshot.docs.map(doc => doc.data());
                        return;
                        break;
                    case "preferredVet":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('preferredVet', '>=', this.appointmentSearchTerm),
                            where('preferredVet', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "status": // options pills
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('status', '==', this.appointmentSearchTerm)
                        );
                        break;
                    // case "updatedAt":
                    //     break;T
                    // case "visitReason":
                    //     break;
                    case "breed":
                        q = query(
                            collection(db, "pets"),
                            where('breed', '>=', this.appointmentSearchTerm),
                            where('breed', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );

                        break;
                    case "dateOfBirth":
                        throw "Error: Not Implemented Yet."
                        return;
                        break;
                    // case "gender":
                    //     break;
                    case "petName":
                        q = query(
                            collection(db, "pets"),
                            where('petName', '>=', this.appointmentSearchTerm),
                            where('petName', '<=', this.appointmentSearchTerm + '\uf8ff')

                        );
                        break;
                    case "species":
                        q = query(
                            collection(db, "pets"),
                            where('species', '>=', this.appointmentSearchTerm),
                            where('species', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;

                    default:
                        throw "Skill Issue: No filter Selected"
                }



                if (this.appointmentSearchFilter == "breed"
                    || this.appointmentSearchFilter == "dateOfBirth"
                    || this.appointmentSearchFilter == "petName"
                    || this.appointmentSearchFilter == "species") {

                    const querySnapshot = await getDocs(q);

                    let rowsCount = 0;
                    const pageLimit = 12;
                    this.appointmentlist = []

                    for (const doc of querySnapshot.docs) {
                        const appointmentsCollection = collection(db, "pets", doc.id, "appointments");
                        const countSnapshot = await getCountFromServer(appointmentsCollection);
                        let querySnapshot2;

                        if (countSnapshot.data().count + rowsCount <= pageLimit) {
                            querySnapshot2 = await getDocs(appointmentsCollection);
                        } else if (rowsCount < pageLimit) {
                            q = query(appointmentsCollection, orderBy("dateTime"), limit(pageLimit - rowsCount));
                            querySnapshot2 = await getDocs(q);
                        }

                        for (const doc2 of querySnapshot2.docs) {
                            let parent = await getDoc(doc2.ref.parent.parent);
                            const parent_object = parent.data();
                            let value = doc2.data();
                            value['breed'] = parent_object.breed;
                            value['dateOfBirth'] = parent_object.dateOfBirth;
                            value['petName'] = parent_object.petName;
                            value['species'] = parent_object.species;
                            this.appointmentlist.push(value);
                        }
                    }

                    rowsCount += countSnapshot.data().count;
                } else {
                    this.appointmentlist = [];
                    const querySnapshot = await getDocs(q);
                    for (const doc of querySnapshot.docs) {
                        let parent = await getDoc(doc.ref.parent.parent);
                        const parent_object = parent.data();
                        let value = doc.data();
                        value['breed'] = parent_object.breed;
                        value['dateOfBirth'] = parent_object.dateOfBirth;
                        value['petName'] = parent_object.petName;
                        value['species'] = parent_object.species;
                        this.appointmentlist.push(value);
                    }
                }

            } catch (e) {
                console.error(e)
            }

        }


    }
})

const mountedApp = app.mount('#app')