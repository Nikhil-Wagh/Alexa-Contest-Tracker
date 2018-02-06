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
//const parser = require('amazon-date-parser');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.fe810233-189e-4721-a3bf-ad40ca9c9aa7';

const SKILL_NAME = 'Contest Tracker';
const GET_CONTEST_MESSAGE = 'Here are some contests: ';
const HELP_REPROMPT = 'You can say Are there any upcoming contests? or, you can say exit.';
const HELP_MESSAGE = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye! and happy coding';
const ERROR = "Some error occurred";


//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================
var welcomeArr = [
  'Welcome, ',
  "Hello, ",
  "Hello coder, ",
  "Nice to see you, ",
  "A lot of contests to rule today. "
];
var userPlatform = null;
var userDate = null;
var userTime = null;
var whenDate = null;
var whenTime = null;
var found = 0;
var ans = "", k = 0;
var eMessage = "Not updated", invalidRequest = false;
var platformSet = new Set();

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
const handlers = {
    'LaunchRequest': function () {
        const Index = Math.floor(Math.random() * welcomeArr.length);
        const randomWel = welcomeArr[Index];

        this.emit(':ask',randomWel + HELP_MESSAGE);
    },
    'GetNewContestIntent': function () {
        console.log('GetNewContestIntent');
        ans = ""; k = 0; eMessage = "Not updated"; invalidRequest = false; platformSet.clear();
        platformSet.add('OTHER');

        var appId = this.event.session.application.applicationId;
        if (appId != APP_ID){
          var speechOutput = "Application ID didnot match.";
          this.emit(':tell', speechOutput);
          return http.console.error(400);
        }


        //slots
        if (this.event.request.intent != null) {
          userPlatform = this.event.request.intent.slots.Platform.value;
          userDate = this.event.request.intent.slots.Date.value;
          userTime = this.event.request.intent.slots.Time.value;
          whenDate = this.event.request.intent.slots.whenDate.value;
          whenTime = this.event.request.intent.slots.whenTime.value;
        }

        console.log("User Data:", userPlatform, whenDate, userDate, whenTime, userTime);

        //check for valid user name
        if (userPlatform != null) {
          userPlatform = userPlatform.toString().trim().toUpperCase().replace(/ /g,'');
          if (!isValidPlatform(userPlatform)) {
            var prompt = "Sorry " + userPlatform + " is not supported yet. Please try again with our supported platforms, " +
            "which are <break time=\"200ms\"/> codeforces, <break time=\"200ms\"/> codechef, <break time=\"200ms\"/> topcoder, " +
            "<break time=\"200ms\"/> google code jam, <break time=\"200ms\"/> hackerrank and <break time=\"200ms\"/> hackerearth.";
            var reprompt = "Do you wish to continue?";

            this.emit(':ask', reprompt, prompt);
          }
        }

        //check for correct syntax of date and when
        if ((userDate != null) != (whenDate != null)) {
          whenDate = "on";
        }
        //check for correct syntax of time and when
        if ((userTime != null) != (whenTime != null)) {
          whenTime = "on";
        }


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
                    console.log("Acquired results from remote site.");
                    //console.log(parsedData);
                    parsedData.result.upcoming.forEach(function(entry){
                        forPlatformdoThis(entry, userPlatform != null, userDate != null, userTime != null);
                    });

                    if(invalidRequest == true){
                        console.log("Error:", eMessage);
                        this.emit(':ask', eMessage);
                        this.emit(':responseReady');
                    }else{//Final Result of Skill
                        var speechOutput;
                        if (k == 0) {
                            console.log("Ans:", ans);
                            speechOutput = "Sorry no results found for your search.\nTry generalising your request or may be ask for some other platform";
                            this.emit(':tellWithCard', speechOutput, SKILL_NAME, removeSSML(speechOutput));
                            this.emit(':responseReady');
                        }else{
                            console.log("Set", platformSet);
                            speechOutput = ans;
                            this.emit(':tellWithCard', GET_CONTEST_MESSAGE + speechOutput, SKILL_NAME, removeSSML(speechOutput));
                            this.emit(':responseReady');
                        }
                    }
                } catch (e) {
                    console.error(e.message);
                    this.emit(':tellWithCard', "Sorry, something went wrong.\nPlease try again", SKILL_NAME, removeSSML(ERROR + `\nGot error: ${e.message}`));
                    this.emit(':responseReady');
                }
            });
            }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
            this.emit(':tellWithCard', "Sorry, something went wrong.\nPlease try again", SKILL_NAME, removeSSML(ERROR + `\nGot error: ${e.message}`));
            this.emit(':responseReady');
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;
        this.response.speak(reprompt).listen(speechOutput);
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
    'SessionEndedRequest': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};
//yyyy-mm-dd
function getDate(s){
    var date = s.substr(5,2);
    var month = s.substr(8,3);
    var year = s.substr(12, 4);
    var mAll = ["Jan","Feb","Mar","April","May","June","July","Aug","Sep","Oct","Nov","Dec"];
    var i;
    for (i = 0; i < mAll.length; i++) {
        if (mAll[i] == month)
        break;
    }
    var result = year + "-" + (i<9?"0":"") + (i+1).toString() + "-" + date;
    return result.toString();
}
function getTime(s){
    return s.substr(17, 5);
}

function removeSSML (s) {
    return s.replace(/<\/?[^>]+(>|$)/g, "");
}

function isValidPlatform(platform){
    switch(platform){
        case "CODEFORCES" :
        case "CODECHEF" :
        case "GOOGLECODEJAM" :
        case "HACKEREARTH":
        case "HACKERRANK" :
        case "TOPCODER" : return true;
        default : return false;
    }
}


function whenValue(when){
    switch(when){
        case 'on': return 1;
        case 'after': return 2;
        case 'before': return 3;
        default: return -1;
    }
}

function updateAns(entry){
    if (userPlatform != null && k >= 2) {
      return;
    }
    var value = entry.Name + " on " + entry.Platform + " starts at " + entry.StartTime
     + " for the duration of " + entry.Duration + " . \n <break time=\"500ms\"/>";
    ans += value;
    k++;
}

function forTimedoThis(entry, time){
    if(time){
        var fechedTime = getTime(entry.StartTime);
        switch(whenValue(whenTime)){
            case 1:
                if(fechedTime == userTime){
                    updateAns(entry);
                }
                break;
            case 2:
                if(fechedTime > userTime){
                    updateAns(entry);
                }
                break;
            case 3:
                if(fechedTime < userTime){
                    updateAns(entry);
                }
                break;
            default:
                //whenTime not recognised
                console.log("Error: whenTime not recognised");
                eMessage = "You need to specify before, on or after of the time, " + userTime;
                invalidRequest = true;
        }
    }else{
        updateAns(entry);
    }
    return 0;
}


function forDatedoThis(entry, date, time){
    console.log("forDatedoThis:", date, time);
    if(date){
        var fechedDate = getDate(entry.StartTime);
        switch(whenValue(whenDate)){
            case 1: // on
                {
                    if(fechedDate == userDate)
                    {
                        forTimedoThis(entry, time);
                    }
                }
                break;
            case 2: // after
                {
                    if(fechedDate > userDate)
                    {
                        forTimedoThis(entry, time);
                    }
                }
                break;
            case 3: // before
                {
                    if(fechedDate < userDate)
                    {
                        forTimedoThis(entry, time);
                    }
                }
                break;
            default:
                console.log("Error: whenDate not recognised");
                eMessage = "You need to specify before, on or after of the date," + userDate;
                invalidRequest = true;
        }
    }else{
        forTimedoThis(entry, time);
    }
    return 0;
}

function forPlatformdoThis(entry, platform, date, time){
    if(platform){
        if (entry.Platform.toString().trim() == userPlatform) {
            forDatedoThis(entry, date, time);
        }
    } else{
        if (!platformSet.has(entry.Platform)) {
          forDatedoThis(entry, date, time);
          platformSet.add(entry.Platform);
        }
    }
}
