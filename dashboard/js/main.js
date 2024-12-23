import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, Timestamp, getDocs, collectionGroup, doc, getCountFromServer, getDoc, addDoc, updateDoc, orderBy, limit} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"

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
const auth = getAuth(firebaseApp);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redirect to login page if not logged in
        window.location.href = "login.html";
    } else{
        document.getElementById('app').style.visibility = "visible";
    }
});

function formatDate(date){
    const [month, day, year] = date.split("/");
    const reorderedDate = `${year}-${month}-${day}`
    return reorderedDate;
}

const app = Vue.createApp({
    data() {
        return {
            currentPage: 'appointments', // {overview, appointments, vetSched,:
            appointmentPage_view: true,
            appointmentlist: [],
            appointmentList_Calendar: [...Array(42)].map(e => []),
            appointmentSearchTerm: '',
            appointmentSearchTerm2: '',
            appointmentSearchFilter: 'appointmentID',
            petID_VALUE: '',
            monthArray: ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            appointmentPage_month: 0,
            appointmentPage_year: 2024,
            appointmentPage_HeaderDates: [],
            isSixRows: false,
            calendarRowStyle: {
                height: '20%'
            },
            vetList: [],
            isLoggedIn: {
                visibility: false
            },
        }
    },

    mounted(){
        this.addAppointmentModalReset();
        this.fetchQuery();
        this.fetchCalendar(true);
        this.fetchVets()
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
                                where('createdAt', '>=', new Date(this.appointmentSearchTerm)),
                            );
                        } else if(!this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('createdAt', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('createdAt', '>=', new Date(this.appointmentSearchTerm)),
                                where('createdAt', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
                            );
                        }
                        break;
                    case "dateTime":
                        if(this.appointmentSearchTerm && !this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '>=', new Date(this.appointmentSearchTerm)),
                            );
                        } else if(!this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('dateTime', '>=', new Date(this.appointmentSearchTerm)),
                                where('dateTime', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
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
                                where('pet.dateOfBirth', '>=', new Date(this.appointmentSearchTerm)),
                            );
                        } else if(!this.appointmentSearchTerm && new Date(this.appointmentSearchTerm2)){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('pet.dateOfBirth', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
                            );
                        } else if(this.appointmentSearchTerm && this.appointmentSearchTerm2){
                            q = query(
                                collectionGroup(db, "appointments"),
                                where('pet.dateOfBirth', '>=', new Date(this.appointmentSearchTerm)),
                                where('pet.dateOfBirth', '<=', new Date(this.appointmentSearchTerm2)),
                                orderBy('dateTime', 'desc')
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
                console.log(querySnapshot.docs)
                for (const doc of querySnapshot.docs){
                    let row = doc.data()
                    row['appointmentID'] = doc.id
                    this.appointmentlist.push(row)
                }
                
            } catch (e) {
                console.error(e)
            }

        },

        async fetchCalendar(onMount = false){
            let q;
            // monthArray: ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            // appointmentPage_month: 0, i
            if (onMount){
                const currentDate = new Date();
                this.appointmentPage_month = currentDate.getMonth()
                this.appointmentPage_year = currentDate.getFullYear()
            }            
            // Sunday = 0, Monday = 1, . . ., Saturday = 6

            const startOfMonth = new Date(this.appointmentPage_year, this.appointmentPage_month, 1);
            const endOfMonth = new Date(this.appointmentPage_year, this.appointmentPage_month + 1, 0, 23, 59, 59);
            
            let nOfDays = endOfMonth.getDate()
            let topOffset = startOfMonth.getDay()

            let bottomOffset = (42 -(nOfDays+topOffset))
            
            const queryStart = new Date(startOfMonth.getTime()-(topOffset*24*60*60*1000));
            const queryEnd = new Date(endOfMonth.getTime()+(bottomOffset*24*60*60*1000));
            q = query(
                collectionGroup(db, "appointments"),
                where("dateTime", ">=", queryStart),
                where("dateTime", "<=", queryEnd),
                orderBy("dateTime","asc")
            )

            const querySnapshot = await getDocs(q)
            let calendarQuery = [];
            for (const doc of querySnapshot.docs){
                let row = doc.data()
                row['appointmentID'] = doc.id
                calendarQuery.push(row)
            }
            this.appointmentList_Calendar = [...Array(42)].map(e => [])
            for(let day of calendarQuery) {
                console.log(day.dateTime)
                let i = Math.floor((day.dateTime.toDate().getTime() - queryStart.getTime()) / (24*60*60*1000))
                this.appointmentList_Calendar[i].push(day)
            }
            
            this.appointmentPage_HeaderDates = []
            for (let i = topOffset; i > 0; i--){
                this.appointmentPage_HeaderDates.push(new Date(startOfMonth.getTime()-(86400000*i)).getDate())
            }
            for(let i = 1; i <= nOfDays; i++){
                this.appointmentPage_HeaderDates.push(i)
            }
            for(let i = 1; i <= bottomOffset; i++){
                this.appointmentPage_HeaderDates.push(new Date(endOfMonth.getTime()+(86400000*i)).getDate())
            }

            this.isSixRows = ((nOfDays+topOffset) > 35)
            this.calendarRowStyle = (this.isSixRows)? {height: "calc(1/6*100%)"} : {height: "20%"}
            // getQuery
            // resetCalendarRows using v-if
            // 
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

        async fetchVets(){
            const querySnapshot = await getDocs(collection(db, "vets"));
            querySnapshot.docs.forEach(doc => {
                this.vetList.push(doc.data());
            });
        },

        addAppointmentOnClick(){
            const appointmentMap1 = {
                createdAt: new Date(),
                dateTime: new Date(this.$refs.dateTime_Forms.value.concat("T00:00:00")),
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
                dateOfBirth: new Date(this.$refs.dateOfBirth_Forms.value.concat("T00:00:00")),
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
        },

        async openAppointmentDetailsModal(value){
            console.log(value)
            this.$refs.appointmentID_Forms_Update.innerHTML = value.appointmentID;
            this.$refs.dateTime_Forms_Update.value = formatDate(value.dateTime.toDate().toLocaleDateString("en-ph", { year: "numeric", month: "2-digit", day: "2-digit", }))
            this.$refs.preferredVet_Forms_Update.value = value.preferredVet;
            this.$refs.visitReason_Forms_Update.value = value.visitReason;
            this.$refs.status_Forms_Update.value = value.status;
            this.$refs.otherConcerns_Forms_Update.value = value.otherConcerns;
            this.$refs.ownerAddress_Forms_Update.innerHTML = value.ownerAddress;
            this.$refs.ownerContact_Forms_Update.innerHTML = value.ownerContact;
            this.$refs.ownerEmail_Forms_Update.innerHTML = value.ownerEmail;
            this.$refs.ownerName_Forms_Update.innerHTML = value.ownerName;
            this.$refs.breed_Forms_Update.innerHTML = value.pet.breed;
            this.$refs.dateOfBirth_Forms_Update.innerHTML = value.pet.dateOfBirth.toDate().toLocaleDateString("en-ph")
            this.$refs.gender_Forms_Update.innerHTML = (value.pet.gender)? "Male":"Female";
            this.$refs.petName_Forms_Update.innerHTML = value.pet.petName;
            this.$refs.species_Forms_Update.innerHTML = value.pet.species;
            this.$refs.petID_Forms_Update.innerHTML = value.pet.petID;
        },

        async updateAppointment(){
            const updateValues = {
                dateTime: new Date(this.$refs.dateTime_Forms_Update.value.concat("T00:00:00")),
                visitReason: this.$refs.visitReason_Forms_Update.value,
                status: this.$refs.status_Forms_Update.value,
                otherConcerns: this.$refs.otherConcerns_Forms_Update.value,
                preferredVet: this.$refs.preferredVet_Forms_Update.value
            }
            const appointmentsRef = await getDocs(query(collectionGroup(db, "appointments"), where('appointmentID', '>=', this.$refs.appointmentID_Forms_Update.innerHTML), where('appointmentID', '<=', this.$refs.appointmentID_Forms_Update.innerHTML + '\uf8ff')))
                        
            await updateDoc(appointmentsRef.docs[0].ref, updateValues);
        },
        
        changeMonth(isChangeUp){
            if(isChangeUp){
                this.appointmentPage_year = (this.appointmentPage_month == 0)? this.appointmentPage_year - 1 : this.appointmentPage_year;
                this.appointmentPage_month  = ((this.appointmentPage_month - 1 + 12) % 12);
            } else {
                this.appointmentPage_year = (this.appointmentPage_month == 11)? this.appointmentPage_year + 1 : this.appointmentPage_year;
                this.appointmentPage_month =  (this.appointmentPage_month + 1) % 12
            }
            this.fetchCalendar(false);
        },
        logout() {
            signOut(auth).then(() => {
                window.location.href = "login.html"; // Redirect to login page
            }).catch((error) => {
                console.error("Error signing out: ", error);
        });
    }
    }
})

const mountedApp = app.mount('#app')
