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
const sound = new Audio()
var canSearch = true;
var canContinue = true;
var latest;
var allJobs;
var storage;
//jobNum, latest, jobCount
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
            firebase.database().ref().once('value').then(function(snapshot){
                var data = snapshot.val();
                if(data.Users[firebase.auth().currentUser.uid].status == "dave") {
                    location.replace('../dave.html');
                } else {
                    location.replace('../dashboard.html')
                }
            });
        }
    });
}
function check() {
    setTimeout(function() {
        if(firebase.auth().currentUser == null) {
            window.close();
        } else {
            loadJob();
        }
    }, 1000);
}
function callDave() {
    document.getElementById('callDave').style.display = "block";
}
function completeDave() {
    if(document.getElementById("hrs").value == "0" && document.getElementById("mins").value == "0" || document.getElementById("job").value == "" || document.getElementById("place").value == "" || document.getElementById('time').style.display == "block" && document.getElementById('time2').value == "") {
        alert("Please fill all fields");
    } else {
        //if(document.getElementById("time2").value < ) {
            document.getElementById('callDave').style.display = "none";
            document.getElementById('waiting').style.display = "block";
            document.getElementById('cdButton').style.display = "none";
            firebase.database().ref().once('value').then(function(snapshot) {
                var data = snapshot.val();
                if(data.Users[firebase.auth().currentUser.uid].active == "none") {
                    var jobN;
                    storage = [jobN, data.Jobs.latest, data.Users[firebase.auth().currentUser.uid].jobNum];
                    sound.src = '../../assets/spanishFlea.mp3'
                    sound.play()
                    for(var i = 0; i < Object.keys(data).length + 1; i++) {
                        if(data.Jobs[i] == null) {
                            jobN = i;
                            break;
                        }
                    }
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                        active: jobN,
                        jobNum: data.Users[firebase.auth().currentUser.uid].jobNum + 1
                    });
                    firebase.database().ref('Jobs/' + jobN).update({
                        location: document.getElementById('place').value,
                        jobInfo: document.getElementById('job').value,
                        hrs: document.getElementById('hrs').value,
                        mins: document.getElementById('mins').value,
                        preference: document.getElementById('preference').value,
                        name: data.Users[firebase.auth().currentUser.uid].name,
                        dave: "none",
                        time: findToTime(),
                        accepted: false
                    });
                    onTimer();
                    firebase.database().ref('Jobs').update({
                        latest: jobN
                    });
                    for(var a = 0; a < Object.keys(data.List).length; a++) {
                        if(canContinue) {
                            //send message
                        } else {
                            break;
                        }
                    }
                    firebase.database().ref('Jobs/' + jobN).on('value', function(snapshot) {
                        var jobData = snapshot.val();
                        if(jobData.dave != "none") {
                            canContinue = false;
                            sound.pause();
                            daveAccepted(jobN);
                            firebase.database().ref('Jobs/' + jobN).off();
                        }
                    });
               } else {
                   alert("You already have an upcoming job. You may only have one job at once.")
               }
            });
        //}
    }
}
function wereDone() {
    canContinue = false;
    alert("No dave accepted your request.");
    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
        active: "none",
        jobNum: storage[2]
    });
    firebase.database().ref('Jobs/' + storage[0]).remove();
    firebase.database().ref('Jobs').update({
        latest: storage[1]
    });
}
function findToTime() {
    var times = document.getElementById('time2').value.toString();
    var next = times.substring(0, times.indexOf(':')) + times.substring(times.indexOf(":") + 1);
    var hrs = parseInt(next.substring(0,2)) + parseInt(document.getElementById('hrs').value);
    var mins = parseInt(next.substring(3)) + parseInt(document.getElementById('mins').value);
    var cHrs = hrs;
    var cMins = mins;
    if(hrs.toString().length == 1) {
        cHrs = "0" + hrs.toString();
    }
    if(mins.toString().length == 1) {
        cMins = "0" + mins.toString();
    }
    var to = cHrs.toString() + cMins.toString();
    return next + "to" + to;
}
function findTime() {
    var times = document.getElementById('time2').value.toString();
    var next = times.substring(0, times.indexOf(':')) + times.substring(times.indexOf(":") + 1);
    return next;
}
function daveAccepted(num) {
    document.getElementById('waiting').style.display = "none";
    document.getElementById('accepted').style.display = "block";
    alert("A Dave has accepted your job!");
    //ACCEPTED
}
function checkDave() {
    setTimeout(function() {
        if(firebase.auth().currentUser == null) {
            window.close();
        } else {
            firebase.database().ref().once('value').then(function(snapshot) {
                var data = snapshot.val();
                latest = data.Jobs.latest;
                triggerListen();
                if(data.Users[firebase.auth().currentUser.uid].status != "dave") {
                    window.close();
                } else {
                    if(Object.keys(data.Jobs).length > 1) {
                        addJobs(data.Jobs);
                    }
                    if(Object.keys(data.Users[firebase.auth().currentUser.uid].Accepted).length > 1) {
                        createAccepted(data);
                    }
                }
            });
        }
    }, 1000);
}
function loadJob() {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        document.getElementById('nameText').innerHTML = data.Users[firebase.auth().currentUser.uid].name;
        var num = data.Users[firebase.auth().currentUser.uid].active;
        if(num != "none") {
            document.getElementById('accepted').style.display = "block";
            var main = document.createElement("div");
            document.getElementById("accepted").appendChild(main);
            var name = document.createElement("p");
            var boldName = document.createTextNode("Name: ");
            var boldsName = document.createElement("b");
            boldsName.appendChild(boldName);
            name.appendChild(boldsName);
            var realName = document.createTextNode(data.Jobs[num].name);
            name.appendChild(realName);
            main.appendChild(name)
            var desc = document.createElement("p");
            var boldDesc = document.createTextNode("Job Description: ");
            var boldsDesc = document.createElement("b");
            boldsDesc.appendChild(boldDesc)
            desc.appendChild(boldsDesc);
            var realDesc = document.createTextNode(data.Jobs[num].jobInfo);
            desc.appendChild(realDesc);
            main.appendChild(desc);
            var time = document.createElement("p");
            var boldTime = document.createTextNode("Time: ");
            var boldsTime = document.createElement("b");
            boldsTime.appendChild(boldTime);
            time.appendChild(boldsTime);
            var overallTime = data.Jobs[num].time;
            var dataTime = data.Jobs[num].time;
            var dataFro = dataTime.substr(0,dataTime.indexOf('to'));
            if(parseInt(dataFro) > 1259) {
                var checkOne = dataFro.substr(0,2);
                checkOne = parseInt(checkOne) - 12;
                dataTime = checkOne + ":" + dataTime.substr(2,dataTime.indexOf('to') - 2) + " PM";
            } else if(parseInt(dataFro) < 1200) {
                dataTime = parseInt(dataFro) + ":" + dataTime.substr(2, dataTime.indexOf('to') - 2) + " AM";
            } else {
                dataTime = parseInt(dataFro) + ":" + dataTime.substr(2, dataTime.indexOf('to') - 2) + "PM";
            }
            var dataTime2 = data.Jobs[num].time.substr(overallTime.indexOf('to') + 2);
            var dataFro2 = dataTime2;
            if(parseInt(dataFro2) > 1259) {
                var checkOne2 = dataFro2.substr(0,2);
                checkOne2 = parseInt(checkOne2) - 12;
                dataTime2 = checkOne2 + ":" + dataTime2.substr(2) + " PM";
            } else if(parseInt(dataFro2) < 1200) {
                dataTime2 = parseInt(dataFro2) + ":" + dataTime2.substr(2) + " AM";
            } else {
                dataTime2 = parseInt(dataFro2) + ":" + dataTime.substr(2) + "PM";
            }
            var realTime = document.createTextNode(dataTime + " to " + dataTime2);
            time.appendChild(realTime);
            main.appendChild(time);
            var loc = document.createElement("p");
            var boldLoc = document.createTextNode("Location: ");
            var boldsLoc = document.createElement("b");
            boldsLoc.appendChild(boldLoc);
            loc.appendChild(boldsLoc);
            var realLoc = document.createTextNode(data.Jobs[num].location);
            loc.appendChild(realLoc);
            main.appendChild(loc);
            main.appendChild(document.createElement("br"));
        }
    });
}
function triggerListen() {
    console.log(latest)
    firebase.database().ref('Jobs').on('value', function(snapshot) {
        var jData = snapshot.val();
        if(jData.latest != latest) {
            document.getElementById('alert').style.display = "block";
        }
    });
}
function addJobs(jobList) {
    allJobs = jobList;
    for(var i = 0; i < Object.keys(jobList).length - 1; i++) {
        if(allJobs[i].accepted == false) {
            document.getElementById('job').style.display = "block";
            var newOption = document.createElement("option");
            newOption.innerHTML = allJobs[i].jobInfo;
            newOption.value = i;
            document.getElementById('selectJ').appendChild(newOption);
        } else if(i == Object.keys(jobList).length - 2) {
            document.getElementById('none').style.display = "block"
        }
    }
}
function selected() {
    document.getElementById('jobInfo').style.display = "block";
    var num = document.getElementById('selectJ').value;
    var nameNode = document.createTextNode(allJobs[num].name);
    document.getElementById('name2').appendChild(nameNode);
    var jobNode = document.createTextNode(allJobs[num].jobInfo);
    document.getElementById('jobD').appendChild(jobNode);
    var timeNode = document.createTextNode(allJobs[num].time);
    document.getElementById('time').appendChild(timeNode);
    var locNode = document.createTextNode(allJobs[num].location);
    document.getElementById('location').appendChild(locNode);
}
function acceptJob() {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val().Jobs;
        var users = snapshot.val().Users;
        var num = document.getElementById('selectJ').value;
        if(users[firebase.auth().currentUser.uid].Accepted[2] == null) {
            if(checkBusy(users[firebase.auth().currentUser.uid], data, num) == true) {
                if(data[num].accepted == false) {
                    var full = parseInt(Object.keys(users[firebase.auth().currentUser.uid].Accepted).length) - 1;
                    firebase.database().ref('Jobs/' + num).update({
                        accepted: true
                    });
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/Accepted/' + full).update({
                        jobNum: num,
                        time: data[num].time
                    });
                } else {
                    alert("This job has already been fulfilled");
                }
            } else {
                alert("This job intersects with one of your current jobs");
                document.getElementById('jobInfo').style.display = "none";
                var options = document.getElementsByTagName("option");
                if(options.length == 1) {
                    options[0].remove();
                    document.getElementById('selectJ').style.display = "none";
                } else {
                    for(var i = 0; i < options.length; i++) {
                        if(options[i].value == num) {
                            options[i].remove();
                        }
                    }
                }
            }
        } else {
            alert("You have already accepted the max amount of jobs for today.")
        }
    });
}

//

//IT SHOWS THAT THERE ARE JOBS WHEN THERE ARE'nt -- Check accepted

//MAKE JOBNUM FOR DAVES

//
function checkBusy(userInfo, pendingInfo, jobNum) {
    var canDo = false;
    if(Object.keys(userInfo.Accepted).length == 1) {
        return true;
    } else {
        for(var i = 0; i < Object.keys(userInfo.Accepted).length - 1; i++) {
            var userFrom = parseInt(userInfo.Accepted[i].time.substr(0, userInfo.Accepted[i].time.indexOf('to')));
            var userTo = parseInt(userInfo.Accepted[i].time.substr(userInfo.Accepted[i].time.indexOf('to') + 2));
            var timeFrom = parseInt(pendingInfo[jobNum].time.substr(0, pendingInfo[jobNum].time.indexOf('to')));
            var timeTo = parseInt(pendingInfo[jobNum].time.substr(pendingInfo[jobNum].time.indexOf('to') + 2));
            if(userFrom < timeFrom) {
                if(userTo <= timeFrom) {
                    canDo = true;
                } else {
                    canDo = false;
                    break;
                }
            } else if(userFrom > timeFrom) {
                if(userFrom < timeTo) {
                    canDo = false;
                    break;
                } else {
                    canDo = true;
                }
            } else {
                canDo = false;
            }
        }
        if(canDo) {
            return true;
        } else {
            return false;
        }
    }
}
function createAccepted(allData) {
    var simplified = allData.Users[firebase.auth().currentUser.uid].Accepted;
    for(var i = 0; i < Object.keys(simplified).length - 1; i++) {
        var main = document.createElement("div");
        main.id = "accepted" + i;
        document.getElementById("allAccepted").appendChild(main);
        var name = document.createElement("p");
        var boldName = document.createTextNode("Name: ");
        var boldsName = document.createElement("b");
        boldsName.appendChild(boldName);
        name.appendChild(boldsName);
        var realName = document.createTextNode(allData.Jobs[simplified[i].jobNum].name);
        name.appendChild(realName);
        main.appendChild(name)
        var desc = document.createElement("p");
        var boldDesc = document.createTextNode("Job Description: ");
        var boldsDesc = document.createElement("b");
        boldsDesc.appendChild(boldDesc)
        desc.appendChild(boldsDesc);
        var realDesc = document.createTextNode(allData.Jobs[simplified[i].jobNum].jobInfo);
        desc.appendChild(realDesc);
        main.appendChild(desc);
        var time = document.createElement("p");
        var boldTime = document.createTextNode("Time: ");
        var boldsTime = document.createElement("b");
        boldsTime.appendChild(boldTime);
        time.appendChild(boldsTime);
        var overallTime = allData.Jobs[simplified[i].jobNum].time;
        var dataTime = allData.Jobs[simplified[i].jobNum].time;
        var dataFro = dataTime.substr(0,dataTime.indexOf('to'));
        if(parseInt(dataFro) > 1259) {
            var checkOne = dataFro.substr(0,2);
            checkOne = parseInt(checkOne) - 12;
            dataTime = checkOne + ":" + dataTime.substr(2,dataTime.indexOf('to') - 2) + " PM";
        } else if(parseInt(dataFro) < 1200) {
            dataTime = parseInt(dataFro) + ":" + dataTime.substr(2, dataTime.indexOf('to') - 2) + " AM";
        } else {
            dataTime = parseInt(dataFro) + ":" + dataTime.substr(2, dataTime.indexOf('to') - 2) + "PM";
        }
        var dataTime2 = allData.Jobs[simplified[i].jobNum].time.substr(overallTime.indexOf('to') + 2);
        var dataFro2 = dataTime2;
        if(parseInt(dataFro2) > 1259) {
            var checkOne2 = dataFro2.substr(0,2);
            checkOne2 = parseInt(checkOne2) - 12;
            dataTime2 = checkOne2 + ":" + dataTime2.substr(2) + " PM";
        } else if(parseInt(dataFro2) < 1200) {
            dataTime2 = parseInt(dataFro2) + ":" + dataTime2.substr(2) + " AM";
        } else {
            dataTime2 = parseInt(dataFro2) + ":" + dataTime.substr(2) + "PM";
        }
        var realTime = document.createTextNode(dataTime + " to " + dataTime2);
        time.appendChild(realTime);
        main.appendChild(time);
        var loc = document.createElement("p");
        var boldLoc = document.createTextNode("Location: ");
        var boldsLoc = document.createElement("b");
        boldsLoc.appendChild(boldLoc);
        loc.appendChild(boldsLoc);
        var realLoc = document.createTextNode(allData.Jobs[simplified[i].jobNum].location);
        loc.appendChild(realLoc);
        main.appendChild(loc);
        main.appendChild(document.createElement("br"));
    }
}