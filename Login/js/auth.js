var firebaseConfig = {
    apiKey: "AIzaSyB0Om-pggrXGPrdTDmb-TLF8oefyWHVth4",
    authDomain: "the-dave-initiative.firebaseapp.com",
    databaseURL: "https://the-dave-initiative.firebaseio.com",
    projectId: "the-dave-initiative",
    storageBucket: "",
    messagingSenderId: "637804637403",
    appId: "1:637804637403:web:dec14656b88e73798fb0fe"
};
firebase.initializeApp(firebaseConfig);
initApp();
function login() {
    firebase.auth().signInWithEmailAndPassword(document.getElementById('email').value, document.getElementById('password').value).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
    });
}
function initApp() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && document.getElementById('unique') != null) {
            location.replace("../dashboard.html");
        }
    });
}
function check() {
    setTimeout(function() {
        if(firebase.auth().currentUser == null) {
            window.close();
        }
    }, 1000);
}
function callDave() {
    document.getElementById('callDave').style.display = "block";
}
function checkbox() {
    if(document.getElementById('checkbx').checked == false) {
        document.getElementById('time').style.display = "block";
    } else {
        document.getElementById('time').style.display = "none";
    }
}