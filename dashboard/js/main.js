import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, Timestamp, getDocs, collectionGroup, doc, getCountFromServer, getDoc, addDoc, updateDoc, orderBy, limit} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'

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
            appointmentSearchTerm: '',
            appointmentSearchTerm2: '',
            appointmentSearchFilter: 'appointmentID',
            petID_VALUE: '',
        }
    },

    mounted(){
        this.addAppointmentModalReset();
        this.fetchQuery();
    },

    methods: {
        async fetchQuery() {

            
            try {
                /**
                 * (String) appointmentID
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
                 * (String) petID
                 * (String) breed
                 * (Date) dateOfBirth
                 * (Boolean) gender [true = male, false = female]
                 * (String) petName
                 * (String) species
                 */

                let q;
                const isSearchBoxClear = (!this.appointmentSearchTerm && !this.appointmentSearchTerm2 && (['dateTime', 'createdAt', 'dateOfBirth'].includes(this.appointmentSearchFilter))) || (!this.appointmentSearchTerm && !(['dateTime', 'createdAt', 'dateOfBirth'].includes(this.appointmentSearchFilter)))
                
                switch (this.appointmentSearchFilter) {
                    case "appointmentID":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('appointmentID', '>=', this.appointmentSearchTerm),
                            where('appointmentID', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;
                    case "createdAt":
                        if(this.appointmentSearchTerm && !this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('createdAt', '>=', this.appointmentSearchTerm),
                            );
                        } else if(!this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('createdAt', '<=', this.appointmentSearchTerm2)
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('createdAt', '>=', this.appointmentSearchTerm),
                                where('createdAt', '<=', this.appointmentSearchTerm2)
                            );
                        }
                        break;
                    case "dateTime":
                        if(this.appointmentSearchTerm && !this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '>=', this.appointmentSearchTerm),
                            );
                        } else if(!this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '<=', this.appointmentSearchTerm2)
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '>=', this.appointmentSearchTerm),
                                where('dateTime', '<=', this.appointmentSearchTerm2)
                            );
                        }
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
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('pet.petID', '>=', this.appointmentSearchTerm),
                            where('pet.petID', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
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
                            collectionGroup(db, "appointmets"),
                            where('pet.breed', '>=', this.appointmentSearchTerm),
                            where('pet.breed', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );

                        break;
                    case "dateOfBirth":
                        if(this.appointmentSearchTerm && !this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('pet.dateOfBirth', '>=', this.appointmentSearchTerm),
                            );
                        } else if(!this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('pet.dateOfBirth', '<=', this.appointmentSearchTerm2)
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('pet.dateOfBirth', '>=', this.appointmentSearchTerm),
                                where('pet.dateOfBirth', '<=', this.appointmentSearchTerm2)
                            );
                        }
                        break;
                    // case "gender":
                    //     break;
                    case "petName":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('pet.petName', '>=', this.appointmentSearchTerm),
                            where('pet.petName', '<=', this.appointmentSearchTerm + '\uf8ff')

                        );
                        break;
                    case "species":
                        q = query(
                            collectionGroup(db, "appointments"),
                            where('pet.species', '>=', this.appointmentSearchTerm),
                            where('pet.species', '<=', this.appointmentSearchTerm + '\uf8ff')
                        );
                        break;

                    default:
                        throw "Skill Issue: No filter Selected"
                }

                
                if (isSearchBoxClear) {
                    q = query(collectionGroup(db, 'appointments'), orderBy('dateTime', 'desc'), limit(12));
                }                
                this.appointmentlist = [];
                const querySnapshot = await getDocs(q);
                this.appointmentlist = querySnapshot.docs.map(doc => doc.data())

            } catch (e) {
                console.error(e)
            }

        },
        
        async addAppointment(appointmentMap){
            let petsRef;

            if(appointmentMap.petID == "" || !appointmentMap.petID){
                petsRef = await addDoc(collection(db, "pets"), {
                    breed: appointmentMap.breed,
                    dateOfBirth: appointmentMap.dateOfBirth,
                    gender: appointmentMap.gender,
                    petName: appointmentMap.petName,
                    species: appointmentMap.species,
                });
                await updateDoc(petsRef, {
                    petID: petsRef.id
                });
            } else {
                petsRef = await getDoc(doc(db, "pets", appointmentMap.petID));

                if(!petsRef.exists()){
                    throw "petID does not exist";
                    return;
                }
            }

            const appointmentRef = await addDoc(collection(db, "pets", petsRef.id, "appointments"), {
                createdAt: appointmentMap.createdAt,
                dateTime: appointmentMap.dateTime,
                otherConcerns: appointmentMap.otherConcerns,
                ownerAddress: appointmentMap.ownerAddress,
                ownerContact: appointmentMap.ownerContact,
                ownerEmail: appointmentMap.ownerEmail,
                ownerName: appointmentMap.ownerName,
                preferredVet: appointmentMap.preferredVet,
                status: appointmentMap.status,
                updatedAt: appointmentMap.updatedAt,
                visitReason: appointmentMap.visitReason,
                pet: {
                  petID: petsRef.id,
                  breed: appointmentMap.breed,
                  dateOfBirth: appointmentMap.dateOfBirth,
                  gender: appointmentMap.gender,
                  petName: appointmentMap.petName,
                  species: appointmentMap.species,
                }
            });

            await updateDoc(appointmentRef, {
                appointmentID: appointmentRef.id
            });
            
        },

        addAppointmentOnClick(){
            const appointmentMap1 = {
                createdAt: new Date(),
                dateTime: this.$refs.dateTime_Forms.value,
                otherConcerns: this.$refs.otherConcerns_Forms.value,
                ownerAddress: this.$refs.ownerAddress_Forms.value,
                ownerContact: this.$refs.ownerContact_Forms.value,
                ownerEmail: this.$refs.ownerEmail_Forms.value,
                ownerName: this.$refs.ownerName_Forms.value,
                preferredVet: this.$refs.preferredVet_Forms.value,
                status: this.$refs.status_Forms.value,
                updatedAt: new Date(),
                visitReason: this.$refs.visitReason_Forms.value,
                breed: this.$refs.breed_Forms.value,
                dateOfBirth: this.$refs.dateOfBirth_Forms.value,
                gender: this.$refs.gender_Forms.value,
                petName: this.$refs.petName_Forms.value,
                species: this.$refs.species_Forms.value,
                petID: this.$refs.petID_Forms.value,
            };

            this.addAppointmentModalReset();

            this.addAppointment(appointmentMap1);

        },

        addAppointmentModalReset(){
            this.$refs.dateTime_Forms.value = '';
            this.$refs.otherConcerns_Forms.value = '';
            this.$refs.ownerAddress_Forms.value = '';
            this.$refs.ownerContact_Forms.value = '';
            this.$refs.ownerEmail_Forms.value = '';
            this.$refs.ownerName_Forms.value = '';
            this.$refs.preferredVet_Forms.value = '';
            this.$refs.status_Forms.value = '';
            this.$refs.visitReason_Forms.value = '';
            this.$refs.breed_Forms.value = '';
            this.$refs.dateOfBirth_Forms.value = '';
            this.$refs.gender_Forms.value = '';
            this.$refs.petName_Forms.value = '';
            this.$refs.species_Forms.value = '';
            this.$refs.petID_Forms.value = '';
        }
    }
})

const mountedApp = app.mount('#app')
