import React from 'react';
import '../About/About.css'; 

function About() {
  return (
    <div className="about-container">
      <h1>Our Mission</h1>
      <p className="about-paragraph">
        Our project, <strong>timewise</strong>, is a web app that hopes to help users manage their time wisely and effectively, with a timer! 
        Our app allows users to input their tasks and schedule(s) to determine their only study plan. 
        
      </p>

      <h2 className="about-header">Ways to use our App, timewise:</h2>
      <p className="about-paragraph">
        <strong>1.</strong> As a casual study timer modeled after the Pomodoro technique.. Set your own study time and breaks! <br />
        <strong>2.</strong> Add in your own Google Calendar and see what tasks and assignments you have coming up. <br />
        <strong>3.</strong> Add your friends!<br />
        <strong>4.</strong> Add in your own tasks with our to-do list. <br />
        <strong>5.</strong> View your own studying statistics and achievements.
      </p>
    </div>
  );
}

export default About;
