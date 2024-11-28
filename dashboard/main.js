
const app = Vue.createApp({
    data() {
        return {
            currentPage: 'overview', // {overview, appointments, vetSched, settings}
        }
    }
})

const mountedApp = app.mount('#app')