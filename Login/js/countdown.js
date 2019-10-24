var i = 60
function onTimer() {
    document.getElementById('counter').innerHTML = i;
    i--;
    if(i < 0) {
        wereDone();
    } else if(canCountdown == false) {
        return true;
    } else {
        setTimeout(onTimer, 1000);
    }
}