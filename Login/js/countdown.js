function countdown() {
    var countCheck = 60;
    while(countCheck > 0) {
        setTimeout(function(){ countCheck -= 1; document.getElementById('counter').innerHTML = countCheck;}, 1000);
    }
}