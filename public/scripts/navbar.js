function setActive(id) {
    var navArray = ['home', 'news', 'graphs', 'about', 'donations']
    navArray.forEach((nav) => {
        if (nav === id) {
            document.getElementById(id).className = 'nav-link active'
        }  
        else {
            document.getElementById(nav).className = 'nav-link'
        }
    })
}
