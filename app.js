const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.redirect('home');
})

app.get('/home', async (request, response) => {
    const states_query = await axios.get('https://covidtracking.com/api/states');
    const us_query = await axios.get('http://covidtracking.com/api/us');

    response.render('home', {
        us: us_query.data,
        states: states_query.data
    });
})

app.get('/news', async (request, response) => {
        var feedJSON = await axios.get('https://tools.cdc.gov/podcasts/feed.asp?feedid=183&format=json');
        response.render('news', {
            data: feedJSON.data.entries
        })

})

app.get('/spread_map', (request, response) => {
    response.render('spread_map');
})

app.listen(8080, () => {
    console.log("Listening on 8080")
});

