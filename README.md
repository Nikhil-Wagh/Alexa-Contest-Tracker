# Alexa-Contest-Tracker
- The skill is live now, and you can enable it from [here](https://www.amazon.com/dp/B079DXD9H4/ref=syps?s=digital-skills&ie=UTF8&qid=1517997921&sr=1-1&keywords=contest+tracker)

## Sample Invokations
- "Alexa, open contest tracker", "Are there any upcoming contests?"
- "Alexa, ask contest tracker are there any upcoming contests?"
- "Alexa, ask contest tracker are there any upcoming contests on Codeforces?"
- "Alexa, ask contest tracker are there any upcoming contests on Codeforces on 30th of March?"
- "Alexa, ask contest tracker are there any upcoming contests on Codeforces before 30th of March?"
- "Alexa, ask contest tracker are there any upcoming contests on Codeforces after 30th of March?"
- "Alexa, ask contest tracker are there any upcoming contests on Codeforces before/on/after 10 PM?"


### Usage
#### Launch Request
- To launch this skill user may use the invoke name i.e. "Contest tracker". For eg: 

> **User**: "Alexa, open contest tracker"

This will launch the skill.

#### Intent Request

- To ask for the contests user may invoke the `LaunchRequest` first and then the `IntentRequest`, or he/she may directly invoke the `IntentRequest`. For eg:

###### Method 1

 > **User**: "Alexa, open contest tracker" `// LaunchRequest`
 
 > **Alexa**: "How may I help you?"
 
 > **User**: "Are there any upcoming contests on Hackerrank" `//IntentRequest`
 
###### Method 2

> **User**: "Alexa, ask contest tracker are there any upcoming contests on Hackerrank". `//IntentRequest with invokation name`
 
 #### Help Intent
 To help user to use the skill, a help prompt is also provided.
 > **User**: "Alexa, open contest tracker" `// LaunchRequest`
 
 > **Alexa**: "How may I help you?"
 
 > **User**: "Help"
 
 #### SessionEndedRequest
 
 To exit from the skill user may say *"Exit"* or *"Stop"*. 
 
 
 ### Responses by Alexa
 
 - User can filter his request to get the details of any particular **Platform** or to get the details of contests to be held on any particular day.
 
 - User can specify the following platforms
 1. Codeforces
 2. Codechef
 3. Top Coder
 4. Hackerrank
 5. Hackerearth
 6. Google Code Jam
 
 -If user specifies a platform, the skill will tell about the latest two contests to held on that platform. And if no platform is specified, then it will tell about one contest to be held on each of the supported platforms.
 
 - User may get the details of the contests held before, on or after a particular date/time. The skill will get him/her the details as requested (provided there are any results).
 
