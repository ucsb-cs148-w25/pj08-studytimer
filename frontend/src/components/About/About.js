import React from 'react';
import '../About/About.css'; 

function About() {
  return (
    <div className="about-container">
      <h1>Our Mission</h1>
      <p className="about-paragraph">
        Our project, <strong>timewise</strong>, is a web app that hopes to help users manage their time wisely and effectively, with a timer! 
        Our app allows users to input their tasks, focus, and schedule(s) to generate a personalized work plan that maximizes work efficiency. 
        Additionally, based on the user's current motivation and difficulty of tasks, adaptive break suggestions will pop up to minimize burnout within our users.
      </p>

      <h2 className="about-header">Ways to use our App, timewise:</h2>
      <p className="about-paragraph">
        <strong>1.</strong> As a casual study timer. Set your own study time and breaks! <br />
        <strong>2.</strong> Add in your own Google Calendar and see what tasks and assignments you have coming up. <br />
        <strong>3.</strong> Our app can suggest study time and breaks based on the assignments you have! <br />
        <strong>4.</strong> Add in your own tasks with our to-do list.
      </p>
    </div>
  );
}

export default About;
