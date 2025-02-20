# Testing
We decided to use the React Testing Library for testing the React components in our project. We focused on implementing unit tests for our Login.js file.

## Libraries Installed

To set up our testing environment, we installed the following dependencies:
```
npm install --save-dev @testing-library/react @testing-library/dom
```
## 1.
## Unit Test From Previous Lab
We focused on setting up the following test cases for the Login.js component:

Button Click: 
- Ensure clicking the button calls loginWithGoogle with the setUser function.
  
localStorage Handling:
- If a user is stored in localStorage, setUser should be called on mount.
- If localStorage is empty, setUser should not be called.

## Implemented Unit Tests
We added a test folder in pj08-studytimer/frontend/src to add current and future test files. It currently holds Login.test.js, where we wrote unit tests for the Login component of our web app.

To execute the test in the frontend directory, run:
```
npm start --src/test/Login.test.js
```
![image](https://github.com/user-attachments/assets/2644e0d5-5673-4916-b7af-316adaa13b16)

## 2.
## Unit Tests Going Forward
We will contintue writing unit tests for key components beyond simple UI rendering
These include:
- Task manager: ensuring tasks are added and removed properly
- Timer: Verifying countdown behavior
## 3.
## Component/Integration Testing
For this lab, we expanded our testing to include component and integration testing by testing the settings page. 
Libraries Used:
- React testling library for rendering and testing component behavior
- Jest-DOM for checking element attributes and localStorage interactions.
We tested to make sure that the theme the user selects is changed accordingly in the app.
To execute the test in the frontend directory, run:
```
npm start --src/test/Settings.test.js
```
<img width="549" alt="Screenshot 2025-02-19 at 3 02 57 PM" src="https://github.com/user-attachments/assets/1fc9c30b-8c20-4ae7-853c-0a57fc1fa202" />


## 4.
## Testing Going Forward
We are unsure if we can do full end-to-end testing due to the time constraints. However, we plan to include basic integration tests for our timer behavior, taskbar, and calendar.
 
