# Testing
We decided to use the React Testing Library for testing the React components in our project. We focused on implementing unit tests for our Login.js file.

## Libraries Installed

To set up our testing environment, we installed the following dependencies:
```
npm install --save-dev @testing-library/react @testing-library/dom
```

## Approach
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

