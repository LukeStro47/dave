var i = 60
function onTimer() {
    document.getElementById('counter').innerHTML = i;
    i--;
    if (i < 0) {
        wereDone();
    }
    else {
        setTimeout(onTimer, 1000);
    }
}