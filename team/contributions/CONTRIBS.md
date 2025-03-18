# Documented below are our team members' individual AI coding experiments.
## Kevin:
**Roles:** original code owner, deployment person, backup strum master, retro 3 leader

- As the original code owner, I came up with the idea of the study timer. My intention was to build a study tool that suggests  study durations and break durations based on tasks given to the app. This follows the pomodoro technique, with the timer stuff automated.
      
- As the deployment person, once we decided on using React, I began to explore free deployment options. I first attempted to use Vercel as it was recommended by the instructors, but I found it was paid. Then I found Netlify which is free and will work for the scope of our project. As the deployment person, I always keep track of the deployment logs especially when something fails. Due to our free tier subscription, I am the only one with access to view the logs. I also manage the backend deployment on Render. 

- As retro 3 leader, I took attendance and made sure that all members participated. I also created the .md file and added to the repo

- As the backup scrum master, whenever the scrum master was not available, I took over the role to document our standups.

**Code Contributions:**

**The contribution does not reflect my additions to the code base because my local git was not set up with my gitHub ID. This caused all my work from weeks 1-9 to not show up on the Contributors Graph. To check my contribution, please check PRs with title "KL" to see the correct contribution. Commit messages with my initial "kl" also show my contributions.

- CODEOWNERS file for auto request reviewers when a new PR is made
- frontend deployment on Netlify: debug logs whenever an automated check fails
- Google OAuth Setup (w Jennifer): set up the correct scopes on google developer console for user name, email, and calendar. 
- Firebase Setup (w Jennifer): setup in the frontend for user data storage
- Backend Setup on spring-boot (w Jennifer): used for google Auth authentication and Google Calendar API call.
- Backend Deployment on Render using Docker: had to use Docker because java is not supported
- _headers file for frontend-backend communication, cache, etc.
- _redirects file for refreshing the website: this fixed the bug where refresh led to 404 ERROR
- Firestore setup for To-do List (w Edwin)
- Google Calendar Sync: calls google calendar API in the backend, frontend verification with the backend, display fetched data
- Google Login Page to only Allow ucsb.edu emails: to avoid google verification, we only allow users within the organization, so I modified the login page to only show ucsb.edu emails
- auto logout after closing the website: This change was made due to issues with fetching calendar data with fetched log in. This update ensures that every time the user opens our app they have to log in to ensure that their calendar fetches correctly. 
- updated navbar on for mobile: previously on mobile the login button was hiding due to scaling issues. I fixed this by moving the login button into the hamburger menu designed for mobile
- Modified Calendar to themes: created variables for each component of the calendar in css to be able to set our three themes. 
- Fixed timer skip for non-logged in users: previously if the user was not logged in the skip button would lead to a blank screen. This was caused by us gathering study data from non logged in users.
- fixed delay on calendar fetch: previously switching tabs would lead to a refetch of calendar, this change keeps the calendar events in place when switching tabs by adding a Context file. 
- Added loading screen to calendar: the calendar usually takes 3-5 seconds to load so adding the loading screen was a good visual to stop users from thinking the calendar fetch does not work. The loading screen only occurs when tasks are initially fetching and when refreshing the page.
- Auto calendar fetch new tasks: so the changes from the Context file made events only fetch once during login which caused issues since our Tasks writes to google calendar so we need to refetch to update the calendar on our app. This was fixed by detecting newly added tasks and refetching such tasks on the calendar without the user having to refresh the page. 
- fixed timer bugs: the timer had issues with the auto start focus and break timers. The auto was broken at some point which I fixed. 
- fixed scaling on pending tasks (profile page): on smaller devices, scaling was not optimized and not everything shown on the screen. I tested it on all common laptop sizes to ensure that auto scaling works correctly
- Hot patch on scaling issues: during the last merge, issues occurred with the About page with a margin error causing texts to be too close to the navbar and calendar not showing … for more than 2 events on the same day.

- documentations from lab tasks 
- backup scrum master standup notes

## Jennifer:

Roles: 
Retro 1 leader
- As the team’s first retrospective leader, I decided to use the Stop/Continue/Start method, which we continued to use for the rest of the other team retros. 

Testing/QA Coordinator
- I was responsible for making sure that pull requests for Kanban Board issues properly met the acceptance criteria for their respective user stories

Code Contributions:

** My local git was not configured properly with my github ID/ucsb email up until week 9 so the Contributions graph is missing most of my local commits. Pull Requests/commit messages titled “JL” and commits made under the name “Jennifer Lopez” were done by me.
- Google OAuth Setup (w/ Kevin): Set up the correct scopes on Google Developer Console for our app to be able to access user’s name, email, and calendar once they logged in through Google OAuth 
- Firebase Setup (w/ Kevin): Setup Firebase in our project’s frontend to store user data storage
- Backend Setup on Spring-Boot (w/ Kevin): Set up our project’s backend which is used for Google OAuth authentication and Google Calendar API calls
- Created dynamic charts for users to view metrics on their total task completion and to display their remaining tasks for the current week. These charts were originally displayed on the Task Page and the Home Page but over the course of development iterations, I moved them to the user’s Profile Page to integrate it with their overall progress
- Fixed bug that I found on the weekly chart after it was moved to the Profile Page. The chart’s y-axis would inconsistently increase as more tasks were added; fixed the start of the week to begin with Sunday as it was previously set to Monday which affected which tasks were showing up for the current week; added option for users to view which exact tasks were due each day by hovering over the chart
- Fixed bug on the About Page in which there was a gap in between the navigation bar and the about container with certain theme colors 
- Created app’s original navigation bar and later on made UI modifications based on user feedback in order for navigation to be more intuitive for users in which they could access their profile, settings (removed), and community pages
- Implemented unit tests for individual app components, specifically for the login button to ensure that users could access their account
- Documented lab deliverables  
- Updated team’s final README version


## Andrew:

Roles:
- Scrum Master: As scrum master I facilitated our groups daily standups. I would ensure everyone shared what they had completed, any blockers they were running into, and what features they were working on next. I made sure the team was making continuous improvements on their given issues and if anyone was struggling on their assigned tasks, we would have other team members to back them up.

Code Contributions:
- Home page/timer: I implemented the original home page and timer system. It was a basic setup that I integrated into our web app that would go on to be used all the way through our MVP and to our second code freeze.
- Settings Popup: I implemented updates to our main timer by adding a timer settings modal. This would open up a new popup on the homepage and allow users to adjust their time in a more user-friendly manner and even add breaks to their sessions.
- Icy Effect when the timer is on break: I implemented the icy effect that lays over the screen when the timer goes on break. It is meant to mimic a time “freeze” that lets the user visually know that a break has begun. I also implemented a sound effect that would play when the break would begin and when it was over to alert the user.
- Bug Fixes: I implemented many bug fixes to our web app like a negative time input which would break the timer logic. I also ensured that the user's background color of choice would stay the same when the app was refreshed as originally it would just resort to the default.
- Profile Page: I implemented the user’s profile page, where they are greeted by their Google account’s profile icon and username. Here I worked with FireStore to initialize both user stats and user achievements. The user stats are tracked in the app's main page when the timer is running and record their study time, total study sessions, how many breaks they’ve taken, their last study session, and their longest study session. All of these stats are important for the user to view and they play a big role in the user achievements that I implemented. From the feedback we received, our group thought it was important to integrate a system for users to be motivated to continue using the app. As users complete study sessions, they will work towards achievement goals that have unique badges and tasks they have to complete to achieve them.
- Community Page: The user is able to add friends who are registered in our Firebase and view their stats and achievements. There is a friend's requests menu where users can send requests and accept or deny pending requests from other users. They can also view a leaderboard that helps users view who is studying the most and helps them compete against one another.

## Thienan:
Roles:
- Design Document Coordinator - Responsible for creating the Design Document and continually updating it throughout the quarter. Contributed to the Design.md Document which laid out the overall design of our app
- MVP Evaluation Leader- Contributed to leading the discussion for the MVP Evaluation

Code Contributions:
- Contributed to Norms.md: Created markdown file to discuss the norms that our team should follow throughout the quarter
- Contributed to problem_scenario.md: Created markdown file to discuss the scenario in which a user would use our app and how they could use our app
- Contributed to user_journey.md: Created markdown file which shows multiple different user classes and how they can use our app
- Created the About page: Created page that shows our mission statement and how users can use our app
- Allowed users to set multiple breaks- Allows users to enter multiple breaks when starting their study session
- Users can enter timer and break time - Allows users to entire study time and break time in HH:MM:SS format
- Contributed to testing by setting up Integration tests for the Settings Page
- Created tests to make sure that when user selects a theme the theme the user selects will match the theme shown

## Edwin:
DISCLAIMER! None of my commits/contributions to the code base reflect on Github because my local Git was not set up with my GitHub ID… in sincerity, I didn’t know it was a thing at all sksks, so my apologies! 

Roles:
- UX Coordinator - Responsible for designing and revamping many of the app’s core features, ensuring that the flow of these features was intuitive. All revamped features were initially inspired by existing app concepts (such as those found on Dribble, etc.) and then designed within the team’s Figma board, allowing modifications to be made from team/staff feedback. Once confirmed, revamped features were integrated and tested to ensure they aligned with prototyped flows of the features. 

Code Contributions:
- MISC: Documents, like MVP instructions for installation, and reorganization of the Frontend file structure as the JS and CSS files were starting to pile up in the components file sksks, uhh, also introduced Firestore and removed the usage of localStorage. Also uh performance improvements for tasks, with changing the order of when things are shown to the user, and saved to Firestore!
- PR #88: Contributed to 1st Revamp of the app’s NavBar, which reformatted the headers that were present previously (with proper padding so it was more aesthetically pleasing!) and introduced the Sign In! button. Additionally, while not planned to be supported anymore, the weird scaling issues that were present at the time, for mobile users, were resolved with a hamburger dropdown!
- PR #96: Contributed to 1.5 Revamp of the app’s NavBar, with changes to the Sign In! button, which was now just “Sign In” but had a fade in/out effect to kind of invite users to log in with their credentials!
- PR #96: The bigger contribution, from this PR, was the introduction of theme changes! The user now had the option to now change between Dark, Light, and Pistachio themes. This starts with one file that contains all the theme variables for the web app, such as the primary-background or the accent-background, and can be used across the whole frontend directory with var(). More importantly, styling for the web app had to be completely redone, as most components either had HTML styling, which made the interface feel very poor, or had in-line styling. So, any in-line styling that was present then, was removed and moved into their own CSS files… which was then followed by a UI clean up, such as proper padding and margins, to make the UI neater!
- PR #155 and #162: The revamp of tasks! Per MVP feedback, the task page needed more TASK stuff! So, this was done by completely removing the old task manager system that was present… for what’s currently existing (and being worked on) at the moment! A NavBar is present to store all the lists that the user has saved, which are loaded from Firestore (additionally, modifications are saved as well), and any recent deletions. If a user clicks on a specific list, we then retrieve all ‘categories’ and tasks that pertain to that list from Firestore, and visualize the tasks to essentially take up most of the page space! A flow can also be achieved where you can automatically add tasks to a recently added category, as long as it’s selected! All of this allows the users to essentially have multiple ways to organize their tasks, with multiple Lists, which can then store multiple categories of tasks! Anddd, all of this can be reorganized as they please, with title, deadline and ETA changes, and category reordering. 
- PR #239: Last biggest contribution on my part was bridging tasks to the timer, with is done through Focus Sessions. From the task, thru the newly introduced selection button, you have the option to Unselect Selected, Delete Selected, and Start Focus Session. Upon the user selects Start Focus Session, they’re redirected to the main page (with the timer) where two new components appear - SessionQueue and CurrentlyFocusedOn. SessionQueue essentially shows the order of how tasks will be tackled, with a specific ordering that is described in the PR. CurrentlyFocusedOn shows all the relevant info of the task that’s most prioritized, and also shows how much time has been spent on the task (and how that reflects upon the inputted estimated time the user gave to finish the task). From the current, they can either Remove it (if they see to not continue working on that specific task), or Complete it (which will mark the task as complete too and ETA to 0). Lastly, if the user accidentally refreshes the whole web app, or leaves, upon signing back on, they will be prompted to “Continue Previous Focus Session” if they didn’t mean to stop! Other UI and loading improvements were made too in this PR. 
- Lastly, PR #245: With an exemption to push this quick bug fixes after the final version was delivered, fixed the About Us page with Kevin, and fixed the Category Options dropdown whose background had completely disappeared, as well as the hover.  

## Cindy:

Roles:
- Scrum Master: Facilitated and documented daily scrum meetings. 
- Scribe: Aside from Retrospectives, I documented the majority of our planning meetings.
- Product Owner: Starting Week 9, I took on the role of Product Owner for our product, which involves planning the project holistically and ideating for the final product. I led the sprint planning meeting for Sprint 04 and finalized the user stories for our last iteration. Previous to Week 9, I also led the Sprint 02 and Sprint 03 planning meetings. During the meetings, I facilitated discussion around feedback from MVP/Peer Evaluations and possible new features. I also supported story time meetings.
User Manual Coordinator: Created end-user manual explaining how to use our product.
- User Manual Coordinator: Created end-user manual explaining how to use our product.
- Final Presentation Coordinator: Planned and coordinated the final demonstration video. Created a slide presentation, coordinated the Zoom meeting recording, and produced the final presentation video.

Code Contributions:
- Calendar Page: Created Calendar page with Google Calendar embed, then iterated on a FullCalendar React component integration written by Kevin to make the calendar more intuitive and easy to navigate. I removed the sidebar on the page and unified the scrollbars.
- Bug Fixes: Restored heading colors from a merge overwrite, fixed scrolling bug for Calendar component
- Miscellaneous Contributions:
    - Contributed to problem_scenario.md
    - Contributed to user_journey.md
    - Contributed to LEARNING.md
    - Created and implemented the Timewise logo
    - Documented lab deliverables

## Lawrence:
Roles:
- Deployment Document Coordinator - Contribute to the DEPLOY.md Document which describes the process in testing out the repository’s code locally and seeing the results of main in the deployed link
- Retro 2 Leader - similar to Retro 1, I led the group in using the Stop/Start/Continue method to reflect on the team’s performance

Code Contributions:
- Initial Setup of the To-Do List. This included options for users to add tasks with a title/deadline/priority level and move them from in-progress to complete. I also implemented a way to locally store user’s information during a localhost session, which helped set the baseline for storing the information in Firestore database once Firebase was set up
- User Roles: Split authorization to guests and signed in users, where guests only have access to the timer, while signed in users have full access to all features
- Break suggestions: Added a floating notification reminding user’s of an incoming break. I also fixed the logic where users actually get the correct amount of breaks (previously when set to n breaks would only get n - 1 breaks). I further added a circle bar with the break timer in the middle whenever the icy-layer was one to allow users to see how much time they had left, as well as the option to skip the break if the user chooses to. An encouraging message will also be shown to give help motivate users
- Timer persistence: added the condition where both the focus and break timers will continue decrementing when user navigates to different tabs, and when they are paused they will stay paused
- Created the LICENSE.md and .gitignore files which helped remove unnecessary files from being pushed to main

