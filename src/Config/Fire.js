import firebase from 'firebase';

const config = {
      apiKey: "AIzaSyD6kJDDnPPCoj6AKpIXwRnGDJ0pfWsnxiU",
      authDomain: "attendancemanagement-13fb7.firebaseapp.com",
      databaseURL: "https://attendancemanagement-13fb7.firebaseio.com",
      projectId: "attendancemanagement-13fb7",
      storageBucket: "attendancemanagement-13fb7.appspot.com",
      messagingSenderId: "680452651401"
    };
const fire = firebase.initializeApp(config);
export default fire;