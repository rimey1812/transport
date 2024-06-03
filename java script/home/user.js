const userLoggedIn = localStorage.getItem('userIsLoggedIn');

if (!userLoggedIn) {
    document.addEventListener('click', function() {
        window.location.href = '../login & signup/login.html';
    });
}



let lougout = document.querySelector(".logout");
lougout.addEventListener('click',function(){
    localStorage.clear();
    setTimeout(()=>{
        window.location = "../login & signup/login.html"
    } , 1500)
})