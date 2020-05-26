$(document).ready( function () { 
    $('#navbarColor01').on('show.bs.collapse', function () {
        var donateButton = document.getElementById('donateButton');
        donateButton.style.display = 'none';
    });
    
    $('#navbarColor01').on('hidden.bs.collapse', function () {
        var donateButton = document.getElementById('donateButton');
        donateButton.style.display = 'block';
    });

});


