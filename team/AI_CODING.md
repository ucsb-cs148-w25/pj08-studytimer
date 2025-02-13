# Coding With AI Experiments
Documented below are our team members' individual AI coding experiments.

## Kevin
I used ChatGPT to help with scalability suggestions. Our project’s to-do list only stores user-inputted information on local storage with cookies. So over time or when cookies are cleared, all the tasks the user added to the to-do list would be removed. I had already set up Firebase for Google oAuth login but I needed help to scale Firebase to store user data from the web app. So Edwin and I gave the LLM the file containing the to-do list page, and it was able to figure out that we were using local storage. We did not know this because the page was developed by another teammate and there was no documentation on the storage. So the LLM suggested that we use Firebase’s Firestore as our database. Then I enabled Firestore on my Firebase Console and made the necessary changes to store user data from the to-do list. I only took the suggestion of a tool to use by the LLM and by reading documentation and seeing on the Firebase Console the user ID, I can tell that it worked correctly. Also when the user is logged out, all their data is no longer shown on the page. When they log back in, the data is seen again, therefore confirming that the database is working correctly. So ChatGPT’s recommendation of Firestore allowed us to scale our project with a working database.


## Andrew
My main task was implementing the UI and features of the HomePage. With the help of ChatGPT I was able to take my timer logic and effectively input it into our webapp. ChatGPT has also helped me figure out how to implement a variety of features like how to add sounds to our app, specifically for when the break timer starts and stops. I have also used ChatGPT to help me summarize the feedback we have received from other groups into notes that I can use to better our web app. With the help of AI, I am effectively able to take my ideas and learn how to merge my code with our app without the need to search the web endlessly to find tutorials that may not conform to my needs. Going forward I plan to implement a reward system for our app and will use the help of AI to devise the best way to set up such a system.


## Thienan
My task was to allow users to have multiple breaks within one study session. I used ChatGPT to help with the implementation of this. It suggested that when the user enters n breaks there will be n + 1 segments of study time. It suggested dividing the study session accordingly. I found ChatGPT to be very helpful in doing so. It ran into a few issues with ESlint and having missing dependencies but I was able to figure it out and fix it. ChatGPT was overall very helpful and smart in figuring out how to break up the study timer into multiple breaks even if there were a few hiccups.


## Lawrence
My main task was implementing the table UI of our “To-Do” List page, and I used ChatGPT to help with the CSS formatting of the page to match with the home and other pages of our website. For this implementation since we had not set up the backend with Firestore yet, I wanted to find a way to save the information locally per session i.e. local host. ChatGPT helped set up the logic for preserving the data throughout the user’s session. It was also very helpful in setting up the logic of moving tasks back and forth from “In Progress” to “Done”, which later helped create a foundation for setting the backend code with Firestore. There were some problems when implementing the libraries I wanted i.e. drag&drop, so for that portion I mainly used the documentation one of our team members provided to help implement the feature to drag tasks to their respective order within a table. Overall, ChatGPT’s suggestions allowed the frontend design of the page to be user friendly, as noted in our MVP feedback  

## Jennifer
I used ChatGPT to help me write unit tests for one of our files in frontend components, Login.js. I chose to write unit tests for this file since ensuring that our users can log in properly through Google OAuth is considered a top priority for our team. I had implemented unit tests in the past but I was not entirely sure how to approach writing the tests for this file. ChatGPT helped guide me through the process and suggested how to mock and render the components in our Login.js file. I did go down a rabbit hole because some of its suggestions for fixing the tests, which were not working, were a bit misleading. Regardless, ChatGPT it was pretty helpful overall and I was able to implement the unit tests. Moving forward, I think that using ChatGPT for guidance on writing more unit tests will be beneficial for our team's progress. 


## Cindy


## Edwin
