# Project Name: timewise
_Wisely manage your time!_

## Description:
Our project, _timewise_, is a web app that hopes to help users manage their time wisely and effectively, with a timer! Our app allows users to input their tasks, focus, and schedule(s) to generate an personalized work plan that maximizes work efficiency. Additionally, based on the user's current motivation and difficulty of tasks, adaptive break suggestions will pop up to minimize burnout within our users. 

## Tech Stack
### Frontend: 
- React
- CSS
- HTML
### Backend:
- Spring Boot 
### APIs: 
- Google Calendar API through Google OAuth
### Database:
- Firestore

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

## Installation
### Prerequisites
- Git version 2.39.5 or above (can check with `git --version`)
- npm version 11.0.0 or above (can check with `npm --version`)
- mvn version 3.9.3 or above (can check with `mvn --version`)

### Dependencies
Core Frontend/Backend Technologies:
- React (version 19.0.0 or above) - the main JavaScript library for building the user interface.
- CSS & HTML - used for styling and structuring elements within the React components.
- Spring Boot (version 3.2.2) - simplifies Java application development. It provides dependency management with Maven, built-in support with RESTful APIs and easy integration with databases i.e. Firebase
- Maven (version 3.9.3 or above) - used to manage Java dependencies and build the project

Other Frontend Utilities: 
- @dnd-kit/utilities (v3.2.2) - a part of dnd-kit, a lightweight drag-and-drop library for React. Helps manage drag-and-drop interactions for reordering planner entries or moving tasks.

- @fullcalendar (v6.1.15) - Used to display task deadlines in the calendar via monthly/weekly/day view

- chart.js (v4.4.7) - a flexible and powerful charting library for JavaScript. Used for rendering visual data representations, such as time tracking or productivity statistics.

- react-chartjs-2 (v5.3.0) - a React wrapper for chart.js to integrate with React components.

- hamburger-react (v2.5.2) - a customizable hamburger menu component for React, which is used for a mobile-friendly navigation menu.

- axios (v.1.7.9) - used on the frontend to send HTTP requests to the backend API
  
### Installation Steps
Ensure you have git and npm installed to the versions from earlier!

1. Clone the repository and navigate to the project directory:

```
git clone <repository-url>
cd <repository-name>
```

2. Fill out this form to gain access to the API/private keys (required to gain full accessibility of frontend and backend): https://shorturl.at/E5GMu

3. Fill out the `.env.example` file with the correct API keys and rename it to `.env`:

```

mv .env.example frontend/.env

```

4. Fill out the `serviceAccountKey.example.json` file with the correct private keys and rename it to `.serviceAccountKey.json`:

```

mv serviceAccountKey.example.json backend/src/main/resources/serviceAccountKey.json

```

### Backend

5. To access backend features, run the following first:

```

cd backend
mvn install
mvn spring-boot:run

```

### Frontend

6. To access frontend functionality, which will pop up on `localhost:3000`, run the following first:

```

cd frontend
npm install
npm start

```

## Functionality
In the current codebase, users can navigate to all app pages using the navigation bar. On the Home page, they can use a Pomodoro timer to start a focus session and set predefined short or long breaks based on their desired study session length. The Tasks page allows users to create lists to track their tasks and assignments, with items automatically syncing to their Google Calendar, which can be viewed on the Calendar page. Users can access their Profile page to view statistics and achievements from their study sessions, along with task metrics. Additionally, on the Community page, users can connect with friends by adding each other to compare statistics and achievements and view a leaderboard.

## Known Bugs/Problems
On Safari, clicking the Sign In button initially triggers a "Pop-Up Window Blocked" message. However, clicking the button again allows the sign-in window to open successfully.

## Contributing
If you'd like to contribute to _timewise_ you can do the following:
1. Fork this repository!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D, it might be merged into the official repo!

## Deployment 
Feel free to try out our app here! --> https://pj-timewise.netlify.app/

For full deployment instructions please see [link](docs/DEPLOY.md)
