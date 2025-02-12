# Coding With AI Experiments
Documented below are our team members' individual AI coding experiments.

## Jennifer
AI tool used:
- ChatGPT

Outcomes:
- TODO

Reflection:
- TODO

## Cindy

## Kevin
I used ChatGPT to help with scalability suggestions. Our project’s to-do list only stores user-inputted information on local storage with cookies. So over time or when cookies are cleared, all the tasks the user added to the to-do list would be removed. I had already set up Firebase for Google oAuth login but I needed help to scale Firebase to store user data from the web app. So Edwin and I gave the LLM the file containing the to-do list page, and it was able to figure out that we were using local storage. We did not know this because the page was developed by another teammate and there was no documentation on the storage. So the LLM suggested that we use Firebase’s Firestore as our database. Then I enabled Firestore on my Firebase Console and made the necessary changes to store user data from the to-do list. I only took the suggestion of a tool to use by the LLM and by reading documentation and seeing on the Firebase Console the user ID, I can tell that it worked correctly. Also when the user is logged out, all their data is no longer shown on the page. When they log back in, the data is seen again, therefore confirming that the database is working correctly. So ChatGPT’s recommendation of Firestore allowed us to scale our project with a working database.

## Edwin

## Andrew

## Thienan

## Lawrence
My main task was implementing the table UI of our “To-Do” List page, and I used ChatGPT to help with the CSS formatting of the page to match with the home and other pages of our website. For this implementation since we had not set up the backend with Firestore yet, I wanted to find a way to save the information locally per session i.e. local host. ChatGPT helped set up the logic for preserving the data throughout the user’s session. It was also very helpful in setting up the logic of moving tasks back and forth from “In Progress” to “Done”, which later helped create a foundation for setting the backend code with Firestore. There were some problems when implementing the libraries I wanted i.e. drag&drop, so for that portion I mainly used the documentation one of our team members provided to help implement the feature to drag tasks to their respective order within a table. Overall, ChatGPT’s suggestions allowed the frontend design of the page to be user friendly, as noted in our MVP feedback  
