function setActive(id) {
    var navArray = ['home', 'news', 'spread_map']
    navArray.forEach((nav) => {
        if (nav === id) {
            document.getElementById(id).className = 'active'
        }  
        else {
            document.getElementById(nav).className = 'inactive'
        }
    })
}
