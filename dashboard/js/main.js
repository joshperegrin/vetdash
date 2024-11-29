import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, Timestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

const firebaseConfig = {
    apiKey: "AIzaSyCn5TPno8hTc1cM-Sm9vsrzkJn6VjKTyYM",
    authDomain: "vet-appointment-3a67a.firebaseapp.com",
    projectId: "vet-appointment-3a67a",
    storageBucket: "vet-appointment-3a67a.firebasestorage.app",
    messagingSenderId: "136329434663",
    appId: "1:136329434663:web:ad3507ceff4fc664072002",
    measurementId: "G-8LEBWB9T8G"
};

const app = Vue.createApp({
    data() {
        return {
            currentPage: 'appointments', // {overview, appointments, vetSched, settings}
            appointmentlist: []
        }
    },

    async mounted() {
        try {
            const firebaseApp = initializeApp(firebaseConfig);
            const db = getFirestore(firebaseApp);

            const q = query(
                collection(db, "appointments"),
                where('dateTime', '>=', Timestamp.fromDate(new Date(2024, 10, 17))),
                where('dateTime', '<', Timestamp.fromDate(new Date(2024, 10, 18)))
            )

            let snap = onSnapshot(q, (snapshot) => { // map collections array to this.appointmentss
                this.appointmentlist = snapshot.docs.map((doc) => doc.data())
            })

        } catch (e) {
            console.log(e)
        }
    }
})

const mountedApp = app.mount('#app')