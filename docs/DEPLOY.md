## Timewise Deployed Link

https://pj-timewise.netlify.app/

# Installation (For local testing/contributions)

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

## Installation Steps

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

### Frontend

5. To access frontend functionality, which will pop up on `localhost:3000`, run the following first:

```

cd frontend
npm install
npm start

```

### Backend

6. To access backend features, run the following first:

```

cd backend
mvn install
mvn spring-boot:run

```
