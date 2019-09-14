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
function completeDave() {
    if(document.getElementById("hrs").value == "0" && document.getElementById("mins").value == "0" || document.getElementById("job").value == "" || document.getElementById("place").value == "" || document.getElementById('time').style.display == "block" && document.getElementById('time2').value == "") {
        alert("Please fill all fields");
    } else {
        document.getElementById('callDave').style.display = "none";
        var timeCheck = 60;
        setTimeout(function(){ alert("Hello"); }, 3000);
    }
}
function findTime() {
    var times = document.getElementById('time2').value.toString();
    var next = times.substring(0, times.indexOf(':')) + times.substring(times.indexOf(":") + 1);
    var hrs = parseInt(next.substring(0,2)) + parseInt(document.getElementById('hrs').value);
    var mins = parseInt(next.substring(3)) + parseInt(document.getElementById('mins').value);
    var cHrs = hrs;
    var cMins = mins;
    if(hrs.toString().length == 1) {
        cHrs = "0" + hrs.toString();
        console.log(cHrs);
    }
    if(mins.toString().length == 1) {
        cMins = "0" + mins.toString();
        console.log(cMins)
    }
    var to = cHrs.toString() + cMins.toString();
    return next + "to" + to;
}