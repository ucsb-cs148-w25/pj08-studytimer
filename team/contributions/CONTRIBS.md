# Documented below are our team members' individual AI coding experiments.
### Kevin:
**Roles:** 

original code owner, deployment person, backup strum master, retro 3 leader

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

