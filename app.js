const express = require('express');
const axios = require('axios');
const path = require('path');
const dateTime = require('date-and-time');
const fs = require('fs');

const app = express();

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.redirect('home');
})

app.get('/home', async (request, response) => {
    const states_query = await axios.get('https://covidtracking.com/api/states');
    const us_query = await axios.get('http://covidtracking.com/api/us');
    const stateNamesRaw = fs.readFileSync(path.resolve(__dirname, "./public/data/state_names.json"));
    const stateNames = JSON.parse(stateNamesRaw);    
    var statesData = states_query.data;
    var usData = us_query.data;
    var dates = [];
    statesData.map(state => {
        var dateChecked = state.dateChecked;
        var date = new Date(dateChecked);
        const pattern = dateTime.compile("MM/DD/YY hh:mm");
        var dateString = dateTime.format(date, pattern);
        state.dateChecked = dateString;
        state.stateName = stateNames[state.state];        
    })
    usData.map(country => {
        var dateChecked = country.lastModified;
        var date = new Date(dateChecked);
        const pattern = dateTime.compile("MM/DD/YY hh:mm");
        var dateString = dateTime.format(date, pattern);
        country.lastModified = dateString;        
    })
    // for(state in statesData) {
    //     var dateChecked = state.dateChecked;
    //     var date = new Date(dateChecked);
    //     const pattern = dateTime.compile("MMDDYY h:m");
    //     var dateString = dateTime.format(date, pattern);
    //     state.dateChecked = dateString;
    // };

    response.render('home', {
        us: us_query.data,
        states: statesData
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
        var date = usDailyJSONData[i].date.toString();
        var year = date.substring(0,4);
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        date = new Date(year, month, day);
        const pattern = dateTime.compile("MMM D YYYY");
        var dateString = dateTime.format(date, pattern);

        var numPositive = usDailyJSONData[i].positive;
        dates.push(dateString);
        positives.push(numPositive);
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
        },
        options: {
            responsive: false
        }
    }

    response.render('graphs', {
        data: JSON.stringify(chartData),
    });
})

app.get('/about', (request, response) => {
    response.render('about');
});

app.get('/donations', (request, response) => {
    response.render('donations');
});

app.listen(8080, () => {
    console.log("Listening on 8080")
});

