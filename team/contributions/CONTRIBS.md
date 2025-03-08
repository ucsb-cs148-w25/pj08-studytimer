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
- Created dynamic charts for users to view metrics on their total task completion and to display their remaining tasks for the current week
- Created app’s original navigation bar and later on made UI modifications based on user feedback in order for navigation to be more intuitive for users
- Implemented unit tests for individual app components
- Documented lab deliverables
