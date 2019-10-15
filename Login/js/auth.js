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
const sound = new Audio();
var canSearch = true;
var canContinue = true;
var latest;
var allJobs;
var storage;
var canMake = false;
//var modal = document.getElementById("myModal");
//var btn = document.getElementById("myBtn");
//var span = document.getElementsByClassName("close")[0];
//span.onclick = function() {
//  modal.style.display = "none";
//}
//window.onclick = function(event) {
//  if (event.target == modal) {
//    modal.style.display = "none";
//  }
//}
/*


MAKE FOR ONLY DASH


*/
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
            if(firebase.auth().currentUser.emailVerified == true) {
                canMake = true;
                loadJob();
            } else {
                alert("You need to verify your email to use our service. A new verification email has been sent to you.");
                firebase.auth().currentUser.sendEmailVerification();
                document.getElementById('cdButton').remove();
                document.getElementById('callDave').remove();
            }
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
        if(checkTime() == true) {
            document.getElementById('callDave').style.display = "none";
            document.getElementById('waiting').style.display = "block";
            document.getElementById('cdButton').style.display = "none";
            firebase.database().ref().once('value').then(function(snapshot) {
                var data = snapshot.val();
                if(data.Users[firebase.auth().currentUser.uid].active == "none") {
                    var jobN;
                    sound.src = '../../assets/spanishFlea.mp3'
                    sound.play()
                    for(var i = 0; i < Object.keys(data).length + 1; i++) {
                        if(data.Jobs[i] == null) {
                            jobN = i;
                            break;
                        }
                    }
                    storage = [jobN, data.Jobs.latest, data.Users[firebase.auth().currentUser.uid].jobNum];
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
                        accepted: false,
                        uAccepted: false,
                        dAccepted: false
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
                    firebase.database().ref('Jobs').on('value', function(snapshot) {
                        if(snapshot.val()[jobN] != null) {
                            var jobData = snapshot.val()[jobN];
                            if(jobData.dave != "none") {
                                canContinue = false;
                                sound.pause();
                                daveAccepted(jobN);
                                firebase.database().ref('Jobs').off();
                            }
                        } else {
                            firebase.database().ref('Jobs').off();
                        }
                    });
               } else {
                   alert("You already have an upcoming job. You may only have one job at once.")
               }
            });
        } else {
            alert("Please order a dave for the future");
        }
    }
}
function checkTime() {
    var dateNow = new Date();
    var hours = parseInt(dateNow.getHours);
    var mins = parseInt(dateNow.getMinutes);
    var times = document.getElementById('time2').value;
    var nHours = parseInt(times.substring(0, times.indexOf(':')));
    var nMins = parseInt(times.substring(times.indexOf(":") + 1));
    if(nhours > hours) {
        return true;
    } else if (nHours < hours) {
        return false;
    } else {
        if(nMins > mins) {
            return true;
        } else if(nMins < mins) {
            return false;
        } else {
            return false;
        }
    }
}
function wereDone() {
    sound.pause();
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
        document.getElementById('jobCount').innerHTML += data.Users[firebase.auth().currentUser.uid].jobNum;
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
            //
            var hereBtn = document.createElement("button");
            var btnText = document.createTextNode("My Dave is Here");
            hereBtn.appendChild(btnText);
            hereBtn.id = "uHere";
            hereBtn.onclick = function() { userHere(num); };
            main.appendChild(hereBtn);
            var countdown = document.createElement("p");
            countdown.id = "countdown";
            main.appendChild(countdown);
            countdown.style.display = "none";
            if(data.Jobs[num].timeDone != null) {
                startCountdown("countdown", data.Jobs[num].timeDone);
                document.getElementById('countdown').style.display = "block";
                document.getElementById('uHere').remove();
            }
            if(data.Jobs[num].dAccepted == false && data.Jobs[num].uAccepted == true) {
                document.getElementById('countdown').style.display = "block";
                document.getElementById('countdown').innerHTML = "Awaiting for your employer to say you've arrived.";
                document.getElementById('uHere').remove();
                listenForOther(num, "d");
            }
            //
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
                    var full;
                    for(var a = 0; a < Object.keys(users[firebase.auth().currentUser.uid].Accepted).length; a++) {
                        if(users[firebase.auth().currentUser.uid].Accepted[a] == null) {
                            full = a;
                        }
                    }
                    firebase.database().ref('Jobs/' + num).update({
                        accepted: true,
                        dave: firebase.auth().currentUser.uid
                    });
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/Accepted/' + full).update({
                        jobNum: num,
                        time: data[num].time
                    });
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                        jobNum: users[firebase.auth().currentUser.uid].jobNum + 1
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

//MAKE JOBNUM FOR DAVES & MODAL

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
    for(var i = 0; i < Object.keys(simplified).length - 1; i++) (function(i) {
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
        var hereBtn = document.createElement("button");
        var btnText = document.createTextNode("I'm Here");
        hereBtn.appendChild(btnText);
        hereBtn.id = "dHere" + simplified[i].jobNum;
        hereBtn.onclick = function() { daveHere(simplified[i].jobNum); };
        main.appendChild(hereBtn);
        var countdown = document.createElement("p");
        countdown.id = "countdown" + simplified[i].jobNum;
        main.appendChild(countdown);
        countdown.style.display = "none";
        main.appendChild(document.createElement("br"));
        if(allData.Jobs[simplified[i].jobNum].timeDone != null) {
            startCountdown("countdown" + simplified[i].jobNum, allData.Jobs[simplified[i].jobNum].timeDone);
            document.getElementById('countdown' + simplified[i].jobNum).style.display = "block";
            document.getElementById('dHere' + simplified[i].jobNum).remove();
        }
        if(allData.Jobs[simplified[i].jobNum].uAccepted == false && allData.Jobs[simplified[i].jobNum].dAccepted == true) {
            document.getElementById('countdown' + simplified[i].jobNum).style.display = "block";
            document.getElementById('countdown' + simplified[i].jobNum).innerHTML = "Awaiting for your employer to say you've arrived.";
            document.getElementById('dHere' + simplified[i].jobNum).remove();
            listenForOther(simplified[i].jobNum, "u");
        }
    })(i);
}
function forgotPassword() {
    var email = prompt("What is your email?");
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        alert("Email sent");
    }).catch(function(error) {
        alert("Error");
    });
}
function openModal() {
    modal.style.display = "block";
}
function changePassword() {
    firebase.auth().currentUser.updatePassword(document.getElementById('changePass').value).then(function() {
        alert("Password updated!");
        document.getElementById('changePass').value = "";
    }).catch(function(error) {
        alert(error);
    });
}
function changeEmail() {
    firebase.auth().currentUser.updateEmail(document.getElementById('changeEmail').value).then(function() {
        alert("Email updated!");
        document.getElementById('changeEmail').value = "";
    }).catch(function(error) {
        alert(error);
    });
}
function signOut() {
    firebase.auth().signOut().then(function() {
        location.replace('index.html');
    }).catch(function(error) {
        alert(error);
    });
}
function daveHere(jNum) {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(data.Jobs[jNum].uAccepted == true) {
            document.getElementById('dHere' + jNum).remove();
            beginJob(data, jNum);
            firebase.database().ref('Jobs/' + jNum).update({
                dAccepted: true
            });
        } else {
            firebase.database().ref('Jobs/' + jNum).update({
                dAccepted: true
            });
            document.getElementById('countdown' + data.Jobs[jNum].jobNum).style.display = "block";
            document.getElementById('countdown' + data.Jobs[jNum].jobNum).innerHTML = "Awaiting for your employer to say you've arrived.";
            document.getElementById('dHere' + data.Jobs[jNum].jobNum).remove();
            listenForOther(jNum, "u");
        }
    });
}
function userHere(jNum) {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(data.Jobs[jNum].dAccepted == true) {
            document.getElementById('uHere').remove();
            beginJob(data, jNum);
            firebase.database().ref('Jobs/' + jNum).update({
                uAccepted: true
            });
        } else {
            firebase.database().ref('Jobs/' + jNum).update({
                uAccepted: true
            });
            document.getElementById('countdown').style.display = "block";
            document.getElementById('countdown').innerHTML = "Awaiting for your Dave to say he's arrived.";
            listenForOther(jNum, "d");
        }
    });
}
function beginJob(fullData, jNum) {
    var firstDate = new Date();
    //2015-03-25T12:00:00-04:00
    var hrs = fullData.Jobs[jNum].hrs;
    var mins = fullData.Jobs[jNum].mins;
    var dateTogether = firstDate.getFullYear() + "-" + returnMonth(parseInt(firstDate.getMonth()) + 1) + "-" + returnMonth(firstDate.getDate()) + "T" + findTime(hrs, mins) + "-04:00";
    firebase.database().ref('Jobs/' + jNum).update({
        timeDone: dateTogether
    });
    if(fullData.Users[firebase.auth().currentUser.uid].status == "dave") {
        document.getElementById('countdown' + jNum).style.display = "block";
        startCountdown('countdown' + jNum, dateTogether);
    }
}
function returnMonth(month) {
    if(month.toString().length == 1) {
        return "0" + month.toString();
    } else {
        return month;
    }
}
function findTime(hrs, mins) {
    var now = new Date();
    var fHours = parseInt(now.getHours()) + parseInt(hrs);
    if(fHours > 23) {
        fHours -= 24;
    }
    if(fHours.toString().length == 1) {
        fHours = "0" + fHours;
    }
    var fMins = parseInt(now.getMinutes()) + parseInt(mins);
    if(fMins > 59) {
        fMins -= 60;
    }
    if(fMins.toString().length == 1) {
        fMins = "0" + fMins;
    }
    var fSecs = parseInt(now.getSeconds());
    if(fSecs.toString().length == 1) {
        fSecs = "0" + fSecs;
    }
    return fHours.toString() + ":" + fMins.toString() + ":" + fSecs;
}
function startCountdown(id, date) {
    var deadline = new Date(date).getTime();
    var x = setInterval(function() {
    var now = new Date().getTime();
    var t = deadline - now;
    var hours = Math.floor((t%(1000 * 60 * 60 * 24))/(1000 * 60 * 60)); 
    var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)); 
    var seconds = Math.floor((t % (1000 * 60)) / 1000);
    document.getElementById(id).innerHTML = hours + " hours " + minutes + " minutes " + seconds + " seconds remaining in your job." + "<br>Or until your employer releases you early."; 
        if (t < 0) { 
            clearInterval(x); 
            document.getElementById(id).innerHTML = "EXPIRED"; 
        } 
    }, 1000);
}
function listenForOther(jobN, char) {
    firebase.database().ref().on('value', function(snapshot) {
        var data = snapshot.val();
        if(data.Jobs[jobN][char + "Accepted"] == true) {
            if(char == "u") {
                startCountdown("countdown" + jobN, data.Jobs[jobN].timeDone);
                firebase.database().ref().off();
            } else {
                document.getElementById('uHere').innerHTML = "Release Dave Early";
                //HERE
                startCountdown("countdown", data.Jobs[jobN].timeDone);
                firebase.database().ref().off();
            }
        }
    });
}
/*

YET TO DO: Other comment, release dave early, countdown ends, rating system, signup

*/