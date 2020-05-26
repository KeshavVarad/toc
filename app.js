const express = require("express");
const axios = require("axios");
const path = require("path");
const dateTime = require("date-and-time");
const fs = require("fs");
const NodeCache = require("node-cache");
const myCache = new NodeCache({
    stdTTL: 3600,
    checkperiod: 3650
});

const app = express();

app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
    response.redirect("home");
});

app.get("/home", async (request, response) => {
    var states_query = [];
    var us_query = [];
    var statesData = [];
    var usData = [];

    var stateValue = myCache.get("stateData");
    if (stateValue === undefined) {
        states_query = await axios.get("https://covidtracking.com/api/states");
        myCache.set("stateData", states_query.data, 3600);
        statesData = states_query.data;

    }
    else {
        statesData = stateValue;
    }

    var usValue = myCache.get("usData");
    if (usValue == undefined) {
        us_query = await axios.get("http://covidtracking.com/api/us");
        myCache.set("usData", us_query.data, 3600);
        usData = us_query.data;
    }
    else {
        usData = usValue;
    }

    const stateNamesRaw = fs.readFileSync(
        path.resolve(__dirname, "./public/data/state_names.json")
    );
    const stateNames = JSON.parse(stateNamesRaw);
    var dates = [];
    statesData.map((state) => {
        var dateChecked = state.dateChecked;
        var date = new Date(dateChecked);
        const pattern = dateTime.compile("MM/DD/YY hh:mm");
        var dateString = dateTime.format(date, pattern);
        state.dateChecked = dateString;
        state.stateName = stateNames[state.state];
    });
    usData.map((country) => {
        var dateChecked = country.lastModified;
        var date = new Date(dateChecked);
        const pattern = dateTime.compile("MM/DD/YY hh:mm");
        var dateString = dateTime.format(date, pattern);
        country.lastModified = dateString;
    });
    // for(state in statesData) {
    //     var dateChecked = state.dateChecked;
    //     var date = new Date(dateChecked);
    //     const pattern = dateTime.compile("MMDDYY h:m");
    //     var dateString = dateTime.format(date, pattern);
    //     state.dateChecked = dateString;
    // };

    response.render("home", {
        us: usData,
        states: statesData,
    });
});

app.get("/news", async (request, response) => {
    var feedJSON = await axios.get(
        "https://tools.cdc.gov/podcasts/feed.asp?feedid=183&format=json"
    );
    response.render("news", {
        data: feedJSON.data.entries,
    });
});

app.get("/graphs", async (request, response) => {

    var usDailyJSON = [];
    var usDailyData = [];


    var usDailyValue = myCache.get("usDaily")
    if (usDailyValue === undefined) {
        usDailyJSON = await axios.get("https://covidtracking.com/api/us/daily");

        myCache.set("usDaily", usDailyJSON.data, 3600);
        usDailyData = usDailyJSON.data;
    }
    else {
        usDailyData = usDailyValue;
    }




    var dates = [];
    var positives = [];
    var numDays = usDailyData.length;
    for (var i = numDays - 1; i > 0; i--) {
        var date = usDailyData[i].date.toString();
        var year = date.substring(0, 4);
        var month = date.substring(4, 6);
        var day = date.substring(6, 8);
        date = new Date(year, month - 1, day);
        const pattern = dateTime.compile("MMM D YYYY");
        var dateString = dateTime.format(date, pattern);

        var numPositive = usDailyData[i].positive;
        dates.push(dateString);
        positives.push(numPositive);
    }

    var chartData = {
        type: "line",
        data: {
            labels: dates,
            datasets: [
                {
                    data: positives,
                    label: "US Positive Test Results",
                },
            ],
        },
        options: {
            responsive: true,
        },
    };

    response.render("graphs", {
        data: JSON.stringify(chartData),
    });
});

app.get("/about", (request, response) => {
    response.render("about");
});

app.get("/donations", (request, response) => {
    response.render("donations");
});

app.listen(8080, () => {
    console.log("Listening on 8080");
});
