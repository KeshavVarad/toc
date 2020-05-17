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

app.get('/graphs', async (request, response) => {
    var usDailyJSON = await axios.get('https://covidtracking.com/api/us/daily');
    var usDailyJSONData = usDailyJSON.data;
    var dates = [];
    var positives = [];
    var numDays = usDailyJSONData.length;
    for(var i=numDays-1; i>0; i--) {
        dates.push(usDailyJSONData[i].date);
        positives.push(usDailyJSONData[i].positive);
    };


    var chartData = {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    data: positives,
                    label: "US Positive Test Results"
                }
            ]
        }
    }

    response.render('graphs', {
        data: JSON.stringify(chartData),
    });
})

app.get('/about', (request, response) => {
    response.render('about');
});

app.listen(8080, () => {
    console.log("Listening on 8080")
});

