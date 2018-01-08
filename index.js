/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.f1b08f7a-6261-48b6-aab8-f860662963aa';

const SKILL_NAME = 'Contest Tracker';
const GET_CONTEST_MESSAGE = "Here are some contests: ";
const HELP_MESSAGE = 'You can say tell me about some upcoming contests, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye! and happy coding';

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewContestIntent');
    },
    'GetNewContestIntent': function () {
        console.log('GetNewContestIntent');

        var errorMessage = "Unable to process the request, ", invalidRequest = false ;
        var speechOutput = GET_CONTEST_MESSAGE;
        //slots
        var userPlatform = this.event.request.intent.slots.Platform.value;
        var userDate = this.event.request.intent.slots.Date.value;
        var userTime = this.event.request.intent.slots.Time.value;
        var whenDate = this.event.request.intent.slots.whenDate.value;
        var whenTime = this.event.request.intent.slots.whenTime.value;

        console.log("Data given by the user : ", userPlatform, whenDate, userDate, whenTime, userTime);

        
        function whenValue(when){
            switch(when){
                case 'on': return 1;
                case 'after': return 2;
                case 'before': return 3;
                default: return -1;
            }
        }
        
        function updateAns(entry){
            var ans = entry.Name + " on " + entry.Platform + " starts at " + entry.StartTime + " and ends at " + entry.EndTime + "\n";
            console.log("ANS:", ans);
            this.response.speak(ans);
            this.emit(':responseReady');
        }

        function forTimedoThis(entry, time){
            var dateTime = new Date(Date.parse(entry.StartTime));
            if(time){
                switch(whenValue(whenTime)){
                    case 1: 
                        if(dateTime.getTime() == userTime){
                            updateAns(entry);
                        }
                        break;
                    case 2: 
                        if(dateTime.getTime() > userTime){
                            updateAns(entry);
                        }
                        break;
                    case 3:
                        if(dateTime.getTime() < userTime){
                            updateAns(entry);
                        }
                        break;
                    default: 
                        invalidRequest = true;
                        errorMessage += " , time not recognised, please repeat it for me."
                        console.log("Error: whenTime not recognised");
                        return -1;//whenTime not recognised
                }
            }else{
                updateAns(entry);
            }
            return 0;
        }

        function forDatedoThis(entry, date, time){
            var dateTime = new Date(Date.parse(entry.StartTime));
            if(date){
                switch(whenValue(whenDate)){
                    case 1: // on
                        {
                            if(dateTime.getDate() == Date(userDate))
                            {
                                forTimedoThis(entry, time);
                            }
                        }
                        break;
                    case 2: // after
                        {
                            if(dateTime.getDate() > Date(userDate))
                            {
                                forTimedoThis(entry, time);
                            }
                        }
                        break;
                    case 3: // before
                        {
                            if(dateTime.getDate() < Date(userDate))
                            {
                                forTimedoThis(entry, time);
                            }
                        }
                        break;
                    default: 
                        invalidRequest = true;
                        errorMessage += ", date not recognised, please repeat it for me.";
                        console.log("Error: whenDate not recognised");
                        return -1; //whenDate not recognised
                }
            }else{
                forTimedoThis(entry, time);
            }
            return 0;
        }

        function isPlatform(platform){
            switch(platform){
                case "CODEFORCES" : 
                case "CODECHEF" : 
                case "GOOGLE CODE JAM" : 
                case "HACKEREARTH": 
                case "HACKERRANK" : 
                case "TOP CODER" : return true; 
                default : return false;
            }
        }

        function forPlatformdoThis(entry, platform, date, time){
            if(platform){
                if(isPlatform(userPlatform)){
                    if (entry.Platform == userPlatform) {
                        forDatedoThis(entry, date, time);
                    }
                }else{
                    invalidRequest = true;
                    errorMessage = "Sorry, We don't have access to this platform yet."
                }
            } else{
                forDatedoThis(entry, date, time);
            }
        }

        var options = {
            host: 'http://contesttrackerapi.herokuapp.com/',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const http = require('http');
        http.get('http://contesttrackerapi.herokuapp.com/', (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                // consume response data to free up memory
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    parsedData.result.upcoming.forEach(function(entry){
                        forPlatformdoThis(entry, userPlatform != null, userDate != null, userTime != null);
                    })
                } catch (e) {
                    console.error(e.message);
                }
            });
            }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        });

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};