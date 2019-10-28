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
const sound = document.getElementById('audioID');
var canSearch = true;
var canContinue = true;
var latest;
var allJobs;
var storage;
var status = "d";
var canCountdown = true;
var canDo2 = true;
var waitingJob = false;
var currentJobData;
var textNodes = {
    name: "",
    time: "",
    desc: "",
    loc: "",
    pref: ""
};
if(document.getElementById('myModal') != null) {
    var modal = document.getElementById("myModal");
    var btn = document.getElementById("myBtn");
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
      modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
    }
}
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
    status = "u";
    setTimeout(function() {
        if(firebase.auth().currentUser == null) {
            window.close();
        } else {
            if(firebase.auth().currentUser.emailVerified == true) {
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
    document.getElementById('info').style.display = "none";
}
function completeDave() {
    if(document.getElementById("hrs").value == "0" && document.getElementById("mins").value == "0" || document.getElementById("job").value == "" || document.getElementById("place").value == "" || document.getElementById('time').style.display == "block" && document.getElementById('time2').value == "") {
        alert("Please fill all fields");
    } else {
        if(checkTime() == true) {
            if(findToTime() != "nope") {
                document.getElementById('callDave').style.display = "none";
                document.getElementById('waiting').style.display = "block";
                document.getElementById('cdButton').style.display = "none";
                firebase.database().ref().once('value').then(function(snapshot) {
                    var data = snapshot.val();
                    if(data.Users[firebase.auth().currentUser.uid].active == "none") {
                        var jobN;
                        sound.play();
                        for(var i = 0; i < Object.keys(data).length + 1; i++) {
                            if(data.Jobs[i] == null) {
                                jobN = i;
                                break;
                            }
                        }
                        firebase.database().ref('Rank/' + (Object.keys(data.Rank).length - 1)).update({
                            j: jobN
                        });
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
                            dAccepted: false,
                            user: firebase.auth().currentUser.uid
                        });
                        onTimer();
                        firebase.database().ref('Jobs').update({
                            latest: jobN
                        });
                        console.log("ree")
                        waitingJob = true;
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
                                    waitingJob = false;
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
                alert("You cannot create a job that ends past or at 11:45. Please either make a shorter job or wait to create your job at midnight.")
            }
        } else {
            alert("Please order a dave for the future");
        }
    }
}
function checkTime() {
    var dateNow = new Date();
    var hours = parseInt(dateNow.getHours());
    var mins = parseInt(dateNow.getMinutes());
    var times = document.getElementById('time2').value;
    var nHours = parseInt(times.substring(0, times.indexOf(':')));
    var nMins = parseInt(times.substring(times.indexOf(":") + 1));
    if(nHours > hours) {
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
    waitingJob = false;
    sound.pause();
    canContinue = false;
    alert("No dave accepted your request.");
    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
        active: "none",
        jobNum: storage[2]
    });
    firebase.database().ref('Jobs').update({
        latest: "none"
    });
    firebase.database().ref('Jobs/' + storage[0]).remove();
    removeRank(storage[0]);
    setTimeout(function() {
        location.reload();
    }, 500);
}
function findToTime() {
    var times = document.getElementById('time2').value.toString();
    var next = times.substring(0, times.indexOf(':')) + times.substring(times.indexOf(":") + 1);
    console.log("time total: " + next + " & hrs of that:" + next.substring(0,2) + "new hours: " + document.getElementById('hrs').value.toString() + " & old mins: " + next.substring(2) + " & new mins: " + document.getElementById('mins').value.toString())
    var hrs = parseInt(next.substring(0,2)) + parseInt(document.getElementById('hrs').value);
    var mins = parseInt(next.substring(2)) + parseInt(document.getElementById('mins').value);
    if(mins >= 60) {
        var remainder = mins % 60;
        hrs += (mins - remainder)/60
        mins = remainder;
    }
    var cHrs = hrs;
    var cMins = mins;
    if(hrs.toString().length == 1) {
        cHrs = "0" + hrs.toString();
    }
    if(mins.toString().length == 1) {
        cMins = "0" + mins.toString();
    }
    var to = cHrs.toString() + cMins.toString();
    if(parseInt(cHrs) == 23 && parseInt(cMins) > 44) {
        return "nope";
    } else if(parseInt(cHrs) > 23) {
        return "nope";
    } else {
        return next + "to" + to;
    }
}
function findTime() {
    var times = document.getElementById('time2').value.toString();
    var next = times.substring(0, times.indexOf(':')) + times.substring(times.indexOf(":") + 1);
    return next;
}
function daveAccepted(num) {
    document.getElementById('waiting').style.display = "none";
    document.getElementById('accepted2').style.display = "block";
    alert("A Dave has accepted your job!");
    loadJob();
    canCountdown = false;
}
function checkDave() {
    setTimeout(function() {
        if(firebase.auth().currentUser == null) {
            window.close();
        } else {
            if(firebase.auth().currentUser.emailVerified == false) {
                alert("You need to verify your email to use our service. A new verification email has been sent to you.");
                firebase.auth().currentUser.sendEmailVerification();
                document.getElementById('none').remove();
                document.getElementById('job').remove();
                document.getElementById('info').remove();
                document.getElementById('allAccepted').remove();
            } else {
                firebase.database().ref().once('value').then(function(snapshot) {
                    var data = snapshot.val();
                    latest = data.Jobs.latest;
                    triggerListen();
                    if(data.Users[firebase.auth().currentUser.uid].status != "dave") {
                        window.close();
                    } else {
                        document.getElementById('nameText').innerHTML = data.Users[firebase.auth().currentUser.uid].name;
                        document.getElementById('jobCount').innerHTML += data.Users[firebase.auth().currentUser.uid].jobNum;
                        var mins = data.Users[firebase.auth().currentUser.uid].mins;
                        var hrs = Math.round((mins / 60) * 10) / 10;
                        document.getElementById('mins').innerHTML += hrs.toString();
                        if(parseInt(data.Users[firebase.auth().currentUser.uid].Average.num) != 0) {
                            var total = parseInt(data.Users[firebase.auth().currentUser.uid].Average.sum);
                            var amount = parseInt(data.Users[firebase.auth().currentUser.uid].Average.num);
                            var average = Math.round((total/amount) * 10) / 10;
                            document.getElementById('rating').innerHTML += average.toString() + "/5";
                        } else {
                            document.getElementById('rating').innerHTML += "No ratings yet";
                        }
                        if(Object.keys(data.Jobs).length > 1) {
                            addJobs(data.Jobs);
                        }
                        if(Object.keys(data.Users[firebase.auth().currentUser.uid].Accepted).length > 1) {
                            document.getElementById('info').style.display = "none";
                            createAccepted(data);
                        } else {
                            document.getElementById('acceptedHeading').style.display = "none";
                        }
                    }
                });
            }
        }
    }, 1000);
}
function loadJob() {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        document.getElementById('nameText').innerHTML = data.Users[firebase.auth().currentUser.uid].name;
        var num = data.Users[firebase.auth().currentUser.uid].active;
        document.getElementById('jobCount').innerHTML += data.Users[firebase.auth().currentUser.uid].jobNum;
        if(parseInt(data.Users[firebase.auth().currentUser.uid].Average.num) != 0) {
            var total = parseInt(data.Users[firebase.auth().currentUser.uid].Average.sum);
            var amount = parseInt(data.Users[firebase.auth().currentUser.uid].Average.num);
            var average = Math.round((total/amount) * 10) / 10;
            document.getElementById('rating').innerHTML += average.toString() + "/5";
        } else {
            document.getElementById('rating').innerHTML += "No ratings yet";
        }
        if(num != "none" && data.Jobs[num].accepted == true) {
            document.getElementById('info').style.display = "none";
            document.getElementById('accepted2').style.display = "block";
            var main = document.createElement("div");
            main.id = "accepted";
            document.getElementById("accepted2").appendChild(main);
            var total;
            var amount;
            var average;
            var canAverage = false;
            var name = document.createElement("p");
            if(parseInt(data.Users[data.Jobs[num].dave].Average.sum) != 0) {
                total = parseInt(data.Users[data.Jobs[num].dave].Average.sum);
                amount = parseInt(data.Users[data.Jobs[num].dave].Average.num);
                average = Math.round((total/amount) * 10) / 10;
            }
            var boldName = document.createTextNode("Name of Dave: ");
            var boldsName = document.createElement("b");
            boldsName.appendChild(boldName);
            name.appendChild(boldsName);
            var realName;
            if(canAverage == false) {
                realName = document.createTextNode(data.Jobs[num].preference);
            } else {
                realName = document.createTextNode(data.Jobs[num].preference + " (" + average.toString() + "/5)");
            }
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
            var dataFro = dataTime.substr(0, dataTime.indexOf('to'));
            if(parseInt(dataFro) > 1259) {
                var checkOne = dataFro.substr(0,2);
                checkOne = parseInt(checkOne) - 12;
                dataTime = checkOne + ":" + dataFro.substr(2) + " PM";
            } else if(parseInt(dataFro) < 1200) {
                if(parseInt(dataFro.substr(0,2)) == 0) {
                    dataTime = "12:" + dataFro.substr(2) + " AM";
                } else {
                    dataTime = parseInt(dataFro.substr(0,2)) + ":" + dataFro.substr(2) + " AM";
                }
            } else {
                dataTime = "12:" + dataFro.substr(2) + " PM";
            }
            var dataTime2 = data.Jobs[num].time;
            var dataFro2 = dataTime2.substr(dataTime2.indexOf('to') + 2);
            console.log(dataFro2)
            if(parseInt(dataFro2) > 1259) {
                var checkOne2 = dataFro2.substr(0,2);
                checkOne2 = parseInt(checkOne2) - 12;
                dataTime2 = checkOne2 + ":" + dataFro2.substr(2) + " PM";
            } else if(parseInt(dataFro2) < 1200) {
                if(parseInt(dataFro2.substr(0,2)) == 0) {
                    dataTime2 = "12:" + dataFro2.substr(2) + " AM";
                } else {
                    dataTime2 = parseInt(dataFro2.substr(0,2)) + ":" + dataFro2.substr(2) + " AM";
                }
            } else {
                dataTime2 = "12:" + dataFro2.substr(2) + " PM";
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
                startCountdown("countdown", data.Jobs[num].timeDone, num);
                if(data.Jobs[num].dComplete == true) {
                    releaseDave(num, true);
                } else {
                    document.getElementById('countdown').style.display = "block";
                    document.getElementById('uHere').innerHTML = "Release Dave Early";
                    document.getElementById('uHere').onclick = function() { releaseDave(num, false); };
                    document.getElementById('uHere').style.display = "block";
                }
                
            }
            if(data.Jobs[num].dAccepted == false && data.Jobs[num].uAccepted == true) {
                document.getElementById('countdown').style.display = "block";
                document.getElementById('countdown').innerHTML = "Awaiting for your Dave to say he's arrived.";
                document.getElementById('uHere').style.display = "none";
                listenForOther(num, "d");
            }
            main.appendChild(document.createElement("br"));
        } else if(num == "none") {
            console.log("no job");
        } else if(data.Jobs[num].accepted == false) {
            firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                active: "none",
                jobNum: parseInt(data.Users[firebase.auth().currentUser.uid].jobNum) - 1
            });
            firebase.database().ref('Jobs').update({
                latest: "none"
            });
            firebase.database().ref('Jobs/' + num).remove();
            removeRank(num);
        }
    });
}
function triggerListen() {
    firebase.database().ref('Jobs').on('value', function(snapshot) {
        var jData = snapshot.val();
        if(jData.latest != latest && jData.latest != "none") {
            document.getElementById('alert').style.display = "block";
        }
    });
}
function addJobs(jobList) {
    allJobs = jobList;
    for(var i = 0; i < Object.keys(jobList).length - 1; i++) {
        if(allJobs[i].accepted == false) {
            document.getElementById('info').style.display = "none";
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
    var name = document.getElementById('name2').childNodes;
    if(name[1] != null) {
        var nNode = name[1].remove();
        var jobD = document.getElementById('jobD').childNodes;
        var jNode = jobD[1].remove();
        var time = document.getElementById('time').childNodes;
        var tNode = time[1].remove();
        var loc = document.getElementById('location').childNodes;
        var lNode = loc[1].remove();
        var pref = document.getElementById('preference').childNodes;
        var pNode = pref[1].remove();
    }
    document.getElementById('jobInfo').style.display = "block";
    var num = document.getElementById('selectJ').value;
    var nameNode = document.createTextNode(allJobs[num].name);
    nameNode.id = "nN";
    textNodes.name = allJobs[num].name;
    document.getElementById('name2').appendChild(nameNode);
    var jobNode = document.createTextNode(allJobs[num].jobInfo);
    jobNode.id = "jN";
    textNodes.desc = allJobs[num].jobInfo;
    document.getElementById('jobD').appendChild(jobNode);
    var overallTime = allJobs[num].time;
    var dataTime = allJobs[num].time;
    var dataFro = dataTime.substr(0, dataTime.indexOf('to'));
    if(parseInt(dataFro) > 1259) {
        var checkOne = dataFro.substr(0,2);
        checkOne = parseInt(checkOne) - 12;
        dataTime = checkOne + ":" + dataFro.substr(2) + " PM";
    } else if(parseInt(dataFro) < 1200) {
        if(parseInt(dataFro.substr(0,2)) == 0) {
            dataTime = "12:" + dataFro.substr(2) + " AM";
        } else {
            dataTime = parseInt(dataFro.substr(0,2)) + ":" + dataFro.substr(2) + " AM";
        }
    } else {
        dataTime = "12:" + dataFro.substr(2) + " PM";
    }
    var dataTime2 = allJobs[num].time;
    var dataFro2 = dataTime2.substr(dataTime2.indexOf('to') + 2);
    console.log(dataFro2)
    if(parseInt(dataFro2) > 1259) {
        var checkOne2 = dataFro2.substr(0,2);
        checkOne2 = parseInt(checkOne2) - 12;
        dataTime2 = checkOne2 + ":" + dataFro2.substr(2) + " PM";
    } else if(parseInt(dataFro2) < 1200) {
        if(parseInt(dataFro2.substr(0,2)) == 0) {
            dataTime2 = "12:" + dataFro2.substr(2) + " AM";
        } else {
            dataTime2 = parseInt(dataFro2.substr(0,2)) + ":" + dataFro2.substr(2) + " AM";
        }
    } else {
        dataTime2 = "12:" + dataFro2.substr(2) + " PM";
    }
    var timeNode = document.createTextNode(dataTime + " to " + dataTime2);
    timeNode.id = "tN";
    textNodes.time = dataTime + " to " + dataTime2;
    document.getElementById('time').appendChild(timeNode);
    var locNode = document.createTextNode(allJobs[num].location);
    locNode.id = "lN";
    textNodes.loc = allJobs[num].location;
    document.getElementById('location').appendChild(locNode);
    var prefNode = document.createTextNode(allJobs[num].preference);
    prefNode.id = "pN";
    textNodes.pref = allJobs[num].preference;
    document.getElementById('preference').appendChild(prefNode);
}
function acceptJob() {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val().Jobs;
        var users = snapshot.val().Users;
        var num = document.getElementById('selectJ').value;
        if(users[firebase.auth().currentUser.uid].Accepted[2] == null) {
            if(checkBusy(users[firebase.auth().currentUser.uid], data, num) == true) {
                if(data[num] == null || data[num].accepted == false) {
                    firebase.database().ref('Jobs/' + num).update({
                        accepted: true,
                        dave: firebase.auth().currentUser.uid
                    });
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                        jobNum: users[firebase.auth().currentUser.uid].jobNum + 1
                    });
                    var full;
                    for(var a = 0; a < Object.keys(users[firebase.auth().currentUser.uid].Accepted).length; a++) {
                        if(users[firebase.auth().currentUser.uid].Accepted[a] == null) {
                            full = a;
                        }
                    }
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/Accepted/' + full).update({
                        jobNum: num,
                        time: data[num].time
                    });
                    setTimeout(function(){
                        location.reload();
                    }, 500);
                } else {
                    alert("This job is now unavailable.");
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
        console.log(i)
        console.log(allData.Jobs[simplified[i].jobNum])
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
        var dataFro = dataTime.substr(0, dataTime.indexOf('to'));
        if(parseInt(dataFro) > 1259) {
            var checkOne = dataFro.substr(0,2);
            checkOne = parseInt(checkOne) - 12;
            dataTime = checkOne + ":" + dataFro.substr(2) + " PM";
        } else if(parseInt(dataFro) < 1200) {
            if(parseInt(dataFro.substr(0,2)) == 0) {
                dataTime = "12:" + dataFro.substr(2) + " AM";
            } else {
                dataTime = parseInt(dataFro.substr(0,2)) + ":" + dataFro.substr(2) + " AM";
            }
        } else {
            dataTime = "12:" + dataFro.substr(2) + " PM";
        }
        var dataTime2 = allData.Jobs[simplified[i].jobNum].time;
        var dataFro2 = dataTime2.substr(dataTime2.indexOf('to') + 2);
        console.log(dataFro2)
        if(parseInt(dataFro2) > 1259) {
            var checkOne2 = dataFro2.substr(0,2);
            checkOne2 = parseInt(checkOne2) - 12;
            dataTime2 = checkOne2 + ":" + dataFro2.substr(2) + " PM";
        } else if(parseInt(dataFro2) < 1200) {
            if(parseInt(dataFro2.substr(0,2)) == 0) {
                dataTime2 = "12:" + dataFro2.substr(2) + " AM";
            } else {
                dataTime2 = parseInt(dataFro2.substr(0,2)) + ":" + dataFro2.substr(2) + " AM";
            }
        } else {
            dataTime2 = "12:" + dataFro2.substr(2) + " PM";
        }
        var realTime = document.createTextNode(dataTime + " to " + dataTime2);
        time.appendChild(realTime);
        main.appendChild(time);
        var pref = document.createElement("p");
        var boldPref = document.createTextNode("Your Name: ");
        var boldsPref = document.createElement("b");
        boldsPref.appendChild(boldPref);
        pref.appendChild(boldsPref);
        var realPref = document.createTextNode(allData.Jobs[simplified[i].jobNum].preference);
        pref.appendChild(realPref);
        main.appendChild(pref);
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
            if(allData.Jobs[simplified[i].jobNum].uComplete == true) {
                finalizeDave(num, true);
            } else {
                startCountdown("countdown" + simplified[i].jobNum, allData.Jobs[simplified[i].jobNum].timeDone, simplified[i].jobNum);
                listenForComplete(true, simplified[i].jobNum);
                document.getElementById('countdown' + simplified[i].jobNum).style.display = "block";
                document.getElementById('dHere' + simplified[i].jobNum).remove();
            }
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
        document.getElementById('changeEmail').value = "";
        firebase.auth().currentUser.sendEmailVerification();
        setTimeout(function(){
            alert("Check your email for a verification email.");
            location.replace('index.html');
        }, 500);
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
            document.getElementById('countdown' + jNum).style.display = "block";
            document.getElementById('countdown' + jNum).innerHTML = "Awaiting for your employer to say you've arrived.";
            document.getElementById('dHere' + jNum).remove();
            listenForOther(jNum, "u");
        }
    });
}
function userHere(jNum) {
    firebase.database().ref().once('value').then(function(snapshot) {
        document.getElementById('uHere').style.display = "none";
        var data = snapshot.val();
        if(data.Jobs[jNum].dAccepted == true) {
            document.getElementById('uHere').style.display = "block";
            document.getElementById('uHere').innerHTML = "Release Dave Early";
            document.getElementById('uHere').onclick = function() { releaseDave(jNum, false); };
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
        startCountdown('countdown' + jNum, dateTogether, jNum);
        listenForComplete(true, jNum);
    } else {
        document.getElementById('countdown').style.display = "block";
        startCountdown('countdown', dateTogether, jNum);
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
function startCountdown(id, date, jobNum) {
    var deadline = new Date(date).getTime();
    var x = setInterval(function() {
    var now = new Date().getTime();
    var t = deadline - now;
    var hours = Math.floor((t%(1000 * 60 * 60 * 24))/(1000 * 60 * 60)); 
    var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60)); 
    var seconds = Math.floor((t % (1000 * 60)) / 1000);
    document.getElementById(id).innerHTML = hours + " hours " + minutes + " minutes " + seconds + " seconds remaining in your job." + "<br>Or until your employer releases you early."; 
        if (t < 0 || canDo2 == false) { 
            clearInterval(x); 
            if(document.getElementById('selectJ') == null) {
                setTimeout(function() { releaseDave(jobNum, false); }, 250);
            } else {
                finalizeDave(jobNum, false);
            }
        }
    }, 1000);
}
function listenForOther(jobN, char) {
    firebase.database().ref().on('value', function(snapshot) {
        var data = snapshot.val();
        if(data.Jobs[jobN][char + "Accepted"] == true) {
            if(char == "u") {
                startCountdown("countdown" + jobN, data.Jobs[jobN].timeDone, jobN);
                listenForComplete(true, jobN);
                firebase.database().ref().off();
            } else {
                document.getElementById('uHere').style.display = "block";
                document.getElementById('uHere').innerHTML = "Release Dave Early";
                document.getElementById('uHere').onclick = function() { releaseDave(jobN, false); };
                startCountdown("countdown", data.Jobs[jobN].timeDone, jobN);
                firebase.database().ref().off();
            }
        }
    });
}
function listenForComplete(bool, num) {
    var ref = firebase.database().ref('Jobs/');
    if(bool == true) {
        ref.on('value', function(snapshot) {
            var data = snapshot.val()[num];
            if(data != null && data.uComplete == true) {
                ref.off();
                canDo2 = false;
                finalizeDave(num, false);
            }
        });       
    } else {
        ref.off();
    }
}
function releaseDave(num, newTab) {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(data.Jobs[num].dComplete == null) {
            var daveName = data.Jobs[num].dave;
            firebase.database().ref('Jobs/' + num).update({
                uComplete: true
            });
            var daveRating = prompt("What do you rate your dave on a scale of 1-5?");
            if(parseInt(daveRating) >= 1 && parseInt(daveRating) <= 5) {
                firebase.database().ref('Users/' + daveName + '/Average').update({
                    num: data.Users[daveName].Average.num + 1,
                    sum: data.Users[daveName].Average.sum + parseInt(daveRating)
                });
            } else {
                alert("You didn't respond correctly, and your rating will not be recorded.");
            }
            document.getElementById('accepted').remove();
            firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                active: "none"
            });
            alert("You can check the panel to see your rating by clicking your name in the red footer at the bottom of the page.");
            setTimeout(function(){
                location.reload();
            }, 500);
        } else {
            var daveRating;
            if(newTab == true) {
                daveRating = prompt("What do you rate your previous dave on a scale of 1-5?");
            } else {
                daveRating = prompt("What do you rate your dave on a scale of 1-5?");
            }
            if(parseInt(daveRating) >= 1 && parseInt(daveRating) <= 5) {
                firebase.database().ref('Users/' + data.Users[firebase.auth().currentUser.uid].rating + '/Average').update({
                    num: data.Users[data.Jobs[num].dave].Average.num + 1,
                    sum: data.Users[data.Jobs[num].dave].Average.sum + parseInt(daveRating)
                });
            } else {
                alert("You didn't respond correctly, and your rating will not be recorded.");
            }
            firebase.database().ref('Jobs/' + num).remove();
            document.getElementById('accepted').remove();
            removeRank(num);
            firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                active: "none"
            });
            firebase.database().ref('Jobs').update({
                latest: "none"
            });
            alert("You can check the panel to see your rating by clicking your name in the red footer at the bottom of the page.");
            setTimeout(function(){
                location.reload();
            }, 500);
        }
    });
}
function finalizeDave(num, newTab) {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        var userName;
        if(data.Jobs[num].uComplete == null) {
            userName = data.Jobs[num].user;
            console.log(userName, num)
            var time = [data.Jobs[num].hrs, data.Jobs[num].mins];
            firebase.database().ref('Jobs/' + num).update({
                dComplete: true
            });
            var daveRating = prompt("What do you rate your employer on a scale of 1-5?");
            if(parseInt(daveRating) >= 1 && parseInt(daveRating) <= 5) {
                firebase.database().ref('Users/' + userName + '/Average').update({
                    num: data.Users[userName].Average.num + 1,
                    sum: data.Users[userName].Average.sum + parseInt(daveRating)
                });
            } else {
                alert("You didn't respond correctly, and your rating will not be recorded.");
            }
            var fMins = parseInt(time[0]) * 60 + parseInt(time[1]);
            firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                mins: data.Users[firebase.auth().currentUser.uid].mins + fMins
            });
            document.getElementById('accepted' + num).remove();
            var short = data.Users[firebase.auth().currentUser.uid].Accepted;
            for(var i = 0; i < Object.keys(short).length - 1; i++) {
                if(parseInt(num) == parseInt(short[i].jobNum)) {
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/Accepted/' + i).remove();
                    break;
                }
            }
            alert("You can check the panel to see your rating by clicking your name in the red footer at the bottom of the page.");
            setTimeout(function(){
                location.reload();
            }, 500);
        } else {
            var daveRating;
            userName = data.Jobs[num].user;
            var time = [data.Jobs[num].hrs, data.Jobs[num].mins];
            if(newTab == true) {
                daveRating = prompt("What do you rate your previous employer on a scale of 1-5?");
            } else {
                daveRating = prompt("What do you rate your employer on a scale of 1-5?");
            }
            if(parseInt(daveRating) >= 1 && parseInt(daveRating) <= 5) {
                firebase.database().ref('Users/' + userName + '/Average').update({
                    num: data.Users[userName].Average.num + 1,
                    sum: data.Users[userName].Average.sum + parseInt(daveRating)
                });
            } else {
                alert("You didn't respond correctly, and your rating will not be recorded.");
            }
            var fMins = parseInt(time[0]) * 60 + parseInt(time[1]);
            firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                mins: data.Users[firebase.auth().currentUser.uid].mins + fMins
            });
            document.getElementById('accepted' + num).remove();
            firebase.database().ref('Jobs/' + num).remove();
            removeRank(num);
            firebase.database().ref('Jobs').update({
                latest: "none"
            });
            var short = data.Users[firebase.auth().currentUser.uid].Accepted;
            for(var i = 0; i < Object.keys(short).length - 1; i++) {
                if(parseInt(num) == parseInt(short[i].jobNum)) {
                    firebase.database().ref('Users/' + firebase.auth().currentUser.uid + '/Accepted/' + i).remove();
                    break;
                }
            }
            alert("You can check the panel to see your rating by clicking your name in the red footer at the bottom of the page.");
            setTimeout(function(){
                location.reload();
            }, 500);
        }
    });
}
function cashHours() {
    firebase.database().ref('Users/' + firebase.auth().currentUser.uid).once('value').then(function(snapshot) {
        var data = snapshot.val();
        if(data.mins >= 60) {
            var templateParams = {
                email: firebase.auth().currentUser.email,
                count: data.mins
            };
            emailjs.send('sendgrid', 'dave_hours', templateParams).then(function(response) {
                alert("You will receive an email in the next 24 hours.");
                firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
                    mins: 0
                });
            }, function(error) {
                alert('FAILED...' + error + ". Please contact the number below with any questions.");
            });
        } else {
            alert("You have to reach 1 hour to get official hours sent to you.")
        }
    });
}
function removeRank(num) {
    firebase.database().ref().once('value').then(function(snapshot) {
        var data = snapshot.val();
        var kNum;
        for(var i = 0; i < Object.keys(data.Rank).length - 1; i++) {
            if(data.Rank[i].j == num) {
                kNum = i;
            }
        }
        console.log(kNum);
        for(var a = kNum; a < Object.keys(data.Rank).length - 1; a++) {
            if(a != Object.keys(data.Rank).length - 2) {
                var f = a + 1;
                f = f.toString();
                var boxData = data.Rank;
                var dataNew = boxData[f].j;
                firebase.database().ref('Rank/' + a).update({
                    j: dataNew
                });
            } else {
                firebase.database().ref('Rank/' + a).remove();
            }
        }
    });
}
function leaveTab() {
    if(status == "u" && waitingJob == true) {
        console.log("ye")
        canContinue = false;
        firebase.database().ref('Users/' + firebase.auth().currentUser.uid).update({
            active: "none",
            jobNum: storage[2]
        });
        firebase.database().ref('Jobs/' + storage[0]).remove();
        removeRank(storage[0]);
        firebase.database().ref('Jobs').update({
            latest: "none"
        });
    }
}