# Installation

## Prerequisites

- Git version 2.39.5 or above (can check with `git --version`)
- npm version 11.0.0 or above (can check with `npm --version`)

## Dependencies

Core Frontend Technologies:

- React (version 19.0.0 or above) - the main JavaScript library for building the user interface.
- CSS & HTML - used for styling and structuring elements within the React components.

Other Frontend Utilities:

- @dnd-kit/utilities (v3.2.2) - a part of dnd-kit, a lightweight drag-and-drop library for React. Helps manage drag-and-drop interactions for reordering planner entries or moving tasks.

- chart.js (v4.4.7) - a flexible and powerful charting library for JavaScript. Used for rendering visual data representations, such as time tracking or productivity statistics.

- react-chartjs-2 (v5.3.0) - a React wrapper for chart.js to integrate with React components.

- hamburger-react (v2.5.2) - a customizable hamburger menu component for React, which is used for a mobile-friendly navigation menu.

## Web Application Link

https://pj-timewise.netlify.app/

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

### Frontend

3. To access frontend functionality, which will pop up on `localhost:3000`, run the following first:

```
cd frontend
npm install
npm start
```

### Backend

4. To access backend features, run the following first:

```
cd backend
mvn install
mvn spring-boot:run
```
