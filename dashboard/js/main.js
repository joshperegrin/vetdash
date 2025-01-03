import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, where, Timestamp, getDocs, setDoc, collectionGroup, doc, getCountFromServer, getDoc, deleteDoc, addDoc, updateDoc, orderBy, limit} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js'
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js"
import { customAlphabet } from "https://cdnjs.cloudflare.com/ajax/libs/nanoid/5.0.9/index.browser.js"

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
let URI;
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redirect to login page if not logged in
        window.location.href = "login.html";
    } else{
        document.getElementById('app').style.visibility = "visible";
    }
});

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

function formatDate(date){
    const [month, day, year] = date.split("/");
    const reorderedDate = `${year}-${month}-${day}`
    return reorderedDate;
}


async function fetchReportDate(date){
    const q = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '==', date ),
        orderBy('dateTime', 'desc')
    );
    
    let reportList = [];
    let totalAppointments = 0;
    let totalComplete = 0;
    let totalCancelled = 0;
    let totalConsultAndCheckup = 0;
    let totalVaccAndDeworming = 0;
    let totalPetGrooming = 0;
    let totalPetBoarding = 0;
    let totalUltrasound = 0;
    let totalDigitalXRay = 0;
    let totalLaserTherapy = 0;

    let vetWorkload = {}
    
    const querySnapshot = await getDocs(q);
    for (const doc of querySnapshot.docs){
        let row = doc.data()
        
        totalAppointments++;
        totalComplete += (row.status == "Completed")? 1 : 0;
        totalCancelled += (row.status == "Cancelled")? 1 : 0;
        
        totalConsultAndCheckup += (row.visitReason == "Consultation and Checkup")? 1 : 0;
        totalVaccAndDeworming += (row.visitReason == "Vaccination and Deworming")? 1 : 0;
        totalPetGrooming += (row.visitReason == "Pet Grooming")? 1 : 0;
        totalPetBoarding += (row.visitReason == "Pet Boarding")? 1 : 0;
        totalUltrasound += (row.visitReason == "Ultrasound")? 1 : 0;
        totalDigitalXRay += (row.visitReason == "Digital X-Ray")? 1 : 0;
        totalLaserTherapy += (row.visitReason == "Laser Therapy")? 1 : 0;
        
        if (row.preferredVet in vetWorkload){
            vetWorkload[row.preferredVet] += 1;
        } else {
            vetWorkload[row.preferredVet] = 1;
        }
        
        row['appointmentID'] = doc.id
        reportList.push(row)
        
    }
    return {
        reportList,
        totalAppointments,
        totalComplete,
        totalCancelled,
        totalConsultAndCheckup,
        totalVaccAndDeworming,
        totalPetGrooming,
        totalPetBoarding,
        totalUltrasound,
        totalDigitalXRay,
        totalLaserTherapy,
        vetWorkload
    } 
}


async function fetchReportMonth(date){
    debugger;    
    let appointmentPage_month = date.getMonth()
    let appointmentPage_year = date.getFullYear()
    // Sunday = 0, Monday = 1, . . ., Saturday = 6

    const startOfMonth = new Date(appointmentPage_year, appointmentPage_month, 1);
    const endOfMonth = new Date(appointmentPage_year, appointmentPage_month + 1, 0, 23, 59, 59);
    
    
    const canvas = document.createElement('canvas');
    canvas.width = 400; // Set canvas dimensions
    canvas.height = 200;
    
    // Get the 2D context for Chart.js
    const ctx = canvas.getContext('2d');

    const functionn = async (input) => {
        const q = query(
            collectionGroup(db, "appointments"),
            where('dateTime', '==', new Date(input) ),
            orderBy('dateTime', 'desc')
        );
        const a = await getCountFromServer(q)
        return a.data().count;
    }
    
    let xaxis = [];
    let datapoints = [];
    const datecursor = new Date(startOfMonth);
    for (let i=1; i<= endOfMonth.getDate(); i++){
        xaxis.push(String(i));
        let count = await functionn(datecursor.setDate(i))
        datapoints.push(count || 0)
    }
    
    console.log(xaxis)
    console.log(datapoints)
    const chart = new Chart(ctx, {
        type: 'line',
        data:{
            labels: xaxis,
            datasets: [{
                label: 'Monthly Appointments',
                data: datapoints,
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: true },
            },
            scales: {
                x: { title: { display: true, text: 'Days' } },
                y: { min: 0, max: 25, title: { display: true, text: 'Appointments' }, ticks: { stepSize: 1} }
            },
            animation: {
                duration: 0,
                onComplete: () => {
                    URI = canvas.toDataURL('image/png'),
                    console.log(URI+ "+"+ " d"); // Verify the generated image URL
                }
            }
        }
    });
    
    
    const qtotalAppointments = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        orderBy('dateTime', 'desc')
    );
    const qtotalComplete = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('status', '==', "Completed"),
        orderBy('dateTime', 'desc')
    );
    const qtotalCancelled = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('status', '==', "Cancelled"),
        orderBy('dateTime', 'desc')
    );
    const qtotalConsultAndCheckup = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Consultation and Checkup'),
        orderBy('dateTime', 'desc')
    );
    const qtotalVaccAndDeworming = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Vaccination and Deworming'),
        orderBy('dateTime', 'desc')
    );
    const qtotalPetGrooming = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Pet Grooming'),
        orderBy('dateTime', 'desc')
    );
    const qtotalPetBoarding = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Pet Boarding'),
        orderBy('dateTime', 'desc')
    );
    const qtotalUltrasound = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Ultrasound'),
        orderBy('dateTime', 'desc')
    );
    const qtotalDigitalXRay = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Digital X-Ray'),
        orderBy('dateTime', 'desc')
    );
    const qtotalLaserTherapy = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('visitReason', '==', 'Laser Therapy'),
        orderBy('dateTime', 'desc')
    );

    
    
    const qDrAraDiaz = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Ara Diaz'),
        orderBy('dateTime', 'desc')
    );
    const qDrJoshuaGarcia = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Joshua Garcia'),
        orderBy('dateTime', 'desc')
    );
    const qDrLeoDelaCruz = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Leo Dela Cruz'),
        orderBy('dateTime', 'desc')
    );
    const qDrSherylReyes = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Sheryl Reyes'),
        orderBy('dateTime', 'desc')
    );
    const qDrTashaLim = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Tasha Lim'),
        orderBy('dateTime', 'desc')
    );
    const qDrThriCruz = query(
        collectionGroup(db, "appointments"),
        where('dateTime', '>=', startOfMonth ),
        where('dateTime', '<=', endOfMonth ),
        where('preferredVet', '==', 'Dr. Thri Cruz'),
        orderBy('dateTime', 'desc')
    );
    
    
    const stotalAppointments = await getCountFromServer(qtotalAppointments);
    const stotalComplete = await getCountFromServer(qtotalComplete);
    const stotalCancelled = await getCountFromServer(qtotalCancelled);
    const stotalConsultAndCheckup = await getCountFromServer(qtotalConsultAndCheckup);
    const stotalVaccAndDeworming = await getCountFromServer(qtotalVaccAndDeworming);
    const stotalPetGrooming = await getCountFromServer(qtotalPetGrooming);
    const stotalPetBoarding = await getCountFromServer(qtotalPetBoarding);
    const stotalUltrasound = await getCountFromServer(qtotalUltrasound);
    const stotalDigitalXRay = await getCountFromServer(qtotalDigitalXRay);
    const stotalLaserTherapy = await getCountFromServer(qtotalLaserTherapy);
    
    const sDrAraDiaz = await getCountFromServer(qDrAraDiaz); 
    const sDrJoshuaGarcia = await getCountFromServer(qDrJoshuaGarcia); 
    const sDrLeoDelaCruz = await getCountFromServer(qDrLeoDelaCruz); 
    const sDrSherylReyes = await getCountFromServer(qDrSherylReyes); 
    const sDrTashaLim = await getCountFromServer(qDrTashaLim); 
    const sDrThriCruz = await getCountFromServer(qDrThriCruz); 
    
    let totalAppointments = stotalAppointments.data().count;
    let totalComplete = stotalComplete.data().count;
    let totalCancelled = stotalCancelled.data().count;
    let totalConsultAndCheckup = stotalConsultAndCheckup.data().count;
    let totalVaccAndDeworming = stotalVaccAndDeworming.data().count;
    let totalPetGrooming = stotalPetGrooming.data().count;
    let totalPetBoarding = stotalPetBoarding.data().count;
    let totalUltrasound = stotalUltrasound.data().count;
    let totalDigitalXRay = stotalDigitalXRay.data().count;
    let totalLaserTherapy = stotalLaserTherapy.data().count;

    let vetWorkload = {}
    vetWorkload["Dr. Ara Diaz"] = sDrAraDiaz.data().count; 
    vetWorkload["Dr. Joshua Garcia"] = sDrJoshuaGarcia.data().count; 
    vetWorkload["Dr. Leo Dela Cruz"] = sDrLeoDelaCruz.data().count; 
    vetWorkload["Dr. Sheryl Reyes"] = sDrSherylReyes.data().count; 
    vetWorkload["Dr. Tasha Lim"] = sDrTashaLim.data().count; 
    vetWorkload["Dr. Thri Cruz"] = sDrThriCruz.data().count; 
    
    return {
        datapoints,
        totalAppointments,
        totalComplete,
        totalCancelled,
        totalConsultAndCheckup,
        totalVaccAndDeworming,
        totalPetGrooming,
        totalPetBoarding,
        totalUltrasound,
        totalDigitalXRay,
        totalLaserTherapy,
        vetWorkload
    } 
}

const app = Vue.createApp({
    data() {
        return {
            totalAptToday: -1,
            currentPage: 'today', // {today, appointments, reports,:
            appointmentPage_view: true,
            appointmentlist: [],
            appointmentlistToday: [],
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
        this.fetchToday()
        
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

        async fetchToday(){
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const q = query(
                collectionGroup(db, "appointments"),
                where('pet.dateOfBirth', '==', today ),
                orderBy('dateTime', 'desc')
            );
            
            this.appointmentlistToday = [];
            const querySnapshot = await getDocs(q);
            console.log(querySnapshot.docs)
            this.totalAptToday = 0;
            for (const doc of querySnapshot.docs){
                let row = doc.data()
                row['appointmentID'] = doc.id
                this.appointmentlistToday.push(row)
                this.totalAptToday++;
            }
            console.log(appointmentlistToday)
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
            
            const generatedPetID = "PET-"+nanoid();
            const generatedAptID = "APT-"+nanoid();

            if(appointmentMap.petID == "" || !appointmentMap.petID){
                petsRef = await setDoc(doc(db, "pets", generatedPetID), {
                    petID: generatedPetID,
                    breed: appointmentMap.breed,
                    dateOfBirth: appointmentMap.dateOfBirth,
                    gender: appointmentMap.gender,
                    petName: appointmentMap.petName,
                    species: appointmentMap.species,
                });
            } else {
                petsRef = await getDoc(doc(db, "pets", appointmentMap.petID));

                if(!petsRef.exists()){
                    throw "petID does not exist";
                    return;
                }
            }

            const appointmentRef = await setDoc(doc(db, "pets", generatedPetID, "appointments", generatedAptID), {
                appointmentID: generatedAptID,
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
                  petID: generatedPetID,
                  breed: appointmentMap.breed,
                  dateOfBirth: appointmentMap.dateOfBirth,
                  gender: appointmentMap.gender,
                  petName: appointmentMap.petName,
                  species: appointmentMap.species,
                }
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

        async deleteAppointment(){
            const appointmentsRef = await getDocs(query(collectionGroup(db, "appointments"), where('appointmentID', '>=', this.$refs.appointmentID_Forms_Update.innerHTML), where('appointmentID', '<=', this.$refs.appointmentID_Forms_Update.innerHTML + '\uf8ff')))
            await deleteDoc(appointmentsRef.docs[0].ref)
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
        },

        updateReportsPage(){
            const dateToday = new Date();
            dateToday.setHours(0, 0, 0, 0);
            this.$refs.dailyReport_select.value = formatDate(dateToday.toLocaleDateString("en-ph", { year: "numeric", month: "2-digit", day: "2-digit", }))
            const year = dateToday.getFullYear(); // Get the full year (e.g., 2025)
            const month = (dateToday.getMonth() + 1).toString().padStart(2, '0'); // Get the month and pad it to 2 digits (e.g., 01, 12)

            this.$refs.monthlyReport_select.value = `${year}-${month}`; // Set value in YYYY-MM format
        },
        
        async generateDailyReport(){
            
            const date = new Date(this.$refs.dailyReport_select.value)
            date.setHours(0, 0, 0, 0);
            const data = await fetchReportDate(date);
            
            let vetTable = [];
            for(const [key, value] of Object.entries(data.vetWorkload)){
                vetTable.push([String(key), String(value)]);
            }
            
            let appointmentList = [];
            for (const appointment of data.reportList){
                appointmentList.push([
                    String(appointment.status),
                    String(appointment.ownerName),
                    String(appointment.pet.petName),
                    String(appointment.pet.species),
                    String(appointment.pet.breed),
                    String(appointment.preferredVet),
                    String(appointment.visitReason)
                ])
                
            }
            appointmentList.unshift([
                "Status",
                "Owner Name",
                "Pet Name",
                "Species",
                "Breed",
                "Preferred Vet",
                "Reason of Visit"
             ])
            
            var dd = {
                content: [
                    {
                        columns: [
                            {
                                width: "*",
                                text: "VetDash Clinic - Manila"
                            },
                            {
                                width: "*",
                                text: `Date of Report: ${date.toLocaleDateString('en-ph', { year: 'numeric', month: 'long', day: '2-digit' })}`,
                                alignment: "right"
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    "Daily Overview",
                    {
                        table:{
                            widths: [ "*", "auto"],
                            body: [
                                ["Total Number of Appointments", String(data.totalAppointments)],
                                ["Total Completed", String(data.totalComplete)],
                                ["Total Cancelled", String(data.totalCancelled)]
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },
                    {
                        columns: [
                            {
                                stack:[
                                    "Breakdown by Appointment Type",
                                    {
                                        table:{
                                            widths: [ "*", "auto"],
                                            body: [
                                                ["Consultation and Checkup", String(data.totalConsultAndCheckup)],
                                                ["Vaccination and Deworming", String(data.totalVaccAndDeworming)],
                                                ["Pet Grooming", String(data.totalPetGrooming)],
                                                ["Pet Boarding", String(data.totalPetBoarding)],
                                                ["Ultrasound", String(data.totalUltrasound)],
                                                ["Digital X-Ray", String(data.totalDigitalXRay)],
                                                ["Laser Therapy", String(data.totalLaserTherapy)]
                                            ]
                                        }
                                    },
                                ],
                                margin: [0, 0, 10, 0]
                            },
                            {
                                stack:[
                                    "Staff Workload",
                                    {
                                        table:{
                                            widths: [ "*", "auto"],
                                            body: vetTable
                                        }
                                    }                                    
                                ]
                            },
                        ],//lmao
                        margin: [0, 0, 0, 20]
                    },
                    "Appointment List",
                    {
                        table:{
                            headerRows: 1,
                            widths: [ "*", "*", "*", "*", "*", "*", "*" ],
                            body: appointmentList
                        }
                    }
                ]
            }

            pdfMake.createPdf(dd).open()
    
        },
        
        async generateMonthlyReport(){
            
            const date = new Date(this.$refs.monthlyReport_select.value)
            date.setHours(0, 0, 0, 0);
            const data = await fetchReportMonth(date);
            
            let vetTable = [];
            for(const [key, value] of Object.entries(data.vetWorkload)){
                vetTable.push([String(key), String(value)]);
            }
            
            let aptTrendTable = []
            for(let i = 0; i < data.datapoints.length; i++){
                aptTrendTable.push([String(`${this.monthArray[date.getMonth()]} ${i+1}`), String(data.datapoints[i])]);
            }
            
            const aptTrendTable1 = aptTrendTable.slice(0, 12)
            const aptTrendTable2 = aptTrendTable.slice(12, 24)
            const aptTrendTable3 = aptTrendTable.slice(24)
            
            var dd = {
                content: [
                    {
                        columns: [
                            {
                                width: "*",
                                text: "VetDash Clinic - Manila"
                            },
                            {
                                width: "*",
                                text: `Month of Report: ${date.toLocaleDateString('en-ph', { year: 'numeric', month: 'long' })}`,
                                alignment: "right"
                            }
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    "Daily Overview",
                    {
                        table:{
                            widths: [ "*", "auto"],
                            body: [
                                ["Total Number of Appointments", String(data.totalAppointments)],
                                ["Total Completed", String(data.totalComplete)],
                                ["Total Cancelled", String(data.totalCancelled)]
                            ]
                        },
                        margin: [0, 0, 0, 20]
                    },
                    {
                        columns: [
                            {
                                stack:[
                                    "Breakdown by Appointment Type",
                                    {
                                        table:{
                                            widths: [ "*", "auto"],
                                            body: [
                                                ["Consultation and Checkup", String(data.totalConsultAndCheckup)],
                                                ["Vaccination and Deworming", String(data.totalVaccAndDeworming)],
                                                ["Pet Grooming", String(data.totalPetGrooming)],
                                                ["Pet Boarding", String(data.totalPetBoarding)],
                                                ["Ultrasound", String(data.totalUltrasound)],
                                                ["Digital X-Ray", String(data.totalDigitalXRay)],
                                                ["Laser Therapy", String(data.totalLaserTherapy)]
                                            ]
                                        }
                                    },
                                ],
                                margin: [0, 0, 10, 0]
                            },
                            {
                                stack:[
                                    "Staff Workload",
                                    {
                                        table:{
                                            widths: [ "*", "auto"],
                                            body: vetTable
                                        }
                                    }                                    
                                ]
                            },
                        ],//lmao
                        margin: [0, 0, 0, 20]
                    },
                    {
                        image:URI + "",
                        width: 400,
                        alignment: 'center'
                    },
                    {
                        text: "Appointment Trend Graph",
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    },
                    {text:"Appointment Trend Table",margin: [0, 0, 0, 3]},
                    {
                        columns: [
                            {
                                table:{
                                    widths: [ "*", "auto"],
                                    body: aptTrendTable1
                                },
                                margin: [0, 0, 10, 0]
                            },
                            {
                                table:{
                                    widths: [ "*", "auto"],
                                    body: aptTrendTable2
                                },
                                margin: [0, 0, 10, 0]
                            },
                            {
                                table:{
                                    widths: [ "*", "auto"],
                                    body: aptTrendTable3
                                },
                            },
                        ]
                    },
                ]
            }
            pdfMake.createPdf(dd).open()
    
        }
    }
})

const mountedApp = app.mount('#app')
