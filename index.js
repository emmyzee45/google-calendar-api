const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const { authenticate } = require("@google-cloud/local-auth");
const dayjs = require("dayjs");
const { v4 } =  require("uuid");

const app = express();
const uuid = v4();
dotenv.config();
const PORT = process.env.NODE_ENV || 3000;
const scopes = ['https://www.googleapis.com/auth/calendar'];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT
)

const calendar = google.calendar({
    version: "v3",
    auth: process.env.GOOGLE_API_KEY
})

app.get("/google", (req, res)=> {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes
    })

    res.redirect(url);
});

app.get("/google/redirect", async(req, res) => {
    try {
        const code = req.query.code;
        // console.log(code)
        const { tokens } = await oauth2Client.getToken(code);
        console.log(tokens)
        oauth2Client.setCredentials(tokens)
        res.send({
            msg: "You successfully logged in"
        })
    }catch(err) {
        console.log(err)
    }
});


app.get("/shedule_event", (req, res) => {
    calendar.events.insert({
        calendarId: "primary",
        auth: oauth2Client,
        conferenceDataVersion: 1,
        requestBody: {
            summary: "This is just a test",
            description: "some event that is every important",
            start: {
                dateTime: dayjs(new Date()).add(1, "day").toISOString(),
                timeZone: "Asia/Kolkata",
            },
            end: {
                dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
                timeZone: "Asia/Kolkata",
            },
            conferenceData: {
                createRequest: {
                    requestId: v4()
                }
            },
            sendNotifications: true,
            attendees: [{
                email: "emmyaondohemba@gmail.com"
            }],
        }
        // resource: event,
    }, (err, event) => {
        if(err) {
            console.log(err)
        } else {
            console.log("Event created", event);
            res.send({msg: "Event created"})
        }
    })
})


app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`)
})