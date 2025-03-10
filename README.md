# Project Name: timewise
_Wisely manage your time!_

## Project Description:
Our project, _timewise_, is a web app that hopes to help users manage their time wisely and effectively, with a timer! Our app allows users to input their tasks, focus, and schedule(s) to generate an personalized work plan that maximizes work efficiency. Additionally, based on the user's current motivation and difficulty of tasks, adaptive break suggestions will pop up to minimize burnout within our users. 

Feel free to try out our app here! --> https://pj-timewise.netlify.app/

## Tech Stack
- Frontend: React and Tailwind CSS
- Backend: Firebase 
- APIs: Google Calendar API thru. Google OAuth

## Team Members [Name, GitHub-IDs]:
- Kevin Lee (kjlee2504)
- Jennifer Lopez (jenniferlopez17)
- Cindy Zhao (cinstar)
- Edwin Medrano Villela (EduinoMEH)
- Andrew Vosgueritchian (TheRealAndrxw)
- Thienan Vu (thienanvuu)
- Lawrence Wang (lawrencewang30)

## Project Focus and Goals
_timewise_ is designed to improve productivity by optimizing work and study sessions. With a simple and distraction-free interface, _timewise_ incorporates techniques like the Pomodoro method to help users maintain focus while preventing fatigue. Features include:

- Adjustable timer durations tailored to user preferences
- Calendar-synced task tracking for streamlined scheduling
- Adaptive work plans based on task difficulty and energy levels
- Smart break suggestions to enhance focus and prevent burnout
- Motivational notifications to keep users on track

We hope that _timewise_ is ideal for students, professionals, and anyone else aiming to improve their time management!

## User Roles
1. Guest Users (No Account)
   - Limited accessibility to basic timer functionality, preset configurations, and sample insights (not saved)
   - Allow first-time users to explore the app without commitment
2. Registered Users (via Google Sign-In)
   - Full access to all prevalent features upon account creation
   - Provide personalized, persistent experiences for regular users

# Installation
## Prerequisites
- Git version 2.39.5 or above (can check with `git --version`)
- npm version 11.0.0 or above (can check with `npm --version`)

## Dependencies
Core Frontend Technologies:
- React (version 19.0.0 or above) - the main JavaScript library for building the user interface.
- CSS & HTML - used for styling and structuring elements within the React components.

Other Frontend Utilities: 
- @dnd-kit/utilities (v3.2.2) - a  part of dnd-kit, a lightweight drag-and-drop library for React. Helps manage drag-and-drop interactions for reordering planner entries or moving tasks.

- chart.js (v4.4.7) - a flexible and powerful charting library for JavaScript. Used for rendering visual data representations, such as time tracking or productivity statistics.

- react-chartjs-2 (v5.3.0) - a React wrapper for chart.js to integrate with React components.

- hamburger-react (v2.5.2) - a customizable hamburger menu component for React, which is used for a mobile-friendly navigation menu.

## Installation Steps
Ensure you have git and npm installed to the versions from earlier!

1. Clone the repository and navigate to the project directory:

```
git clone <repository-url>
cd <repository-name> 
```

2. Then, install all the frontend utilities using the following command:
``` 
npm install @dnd-kit/utilities chart.js react-chartjs-2 hamburger-react
```

3. If wanting to run the app locally, which will pop up on `localhost:3000`, run the following first:
```
cd frontend/timewise/
npm install
npm start
```

## Functionality
For the current existing codebase (of the MVP), you should be able to navigate to all the pages off the app using the navbar! At the moment, you can start a time and set pre-defined breaks (as well as add additional time if you desire more time to study), and fill out a simple to-do list to keep track of your tasks and assignments. Additionally, you can read upon the mission of _timewise_ and what user's will be able to do once the final product is delivered. 

## Known Bugs/Problems
The biggest bug is that upon refreshing on any page outside of the homepage, will result in a `Page not found` (was just discovered deadline of MVP). Outside of that, many bugs are more due to no existing backend to support many of the features we hope to have by the project's delivery. 

## Contributing
If you'd like to contribute to _timewise_ you can do the following:
1. Fork this repository!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D, it might be merged into the official repo!
