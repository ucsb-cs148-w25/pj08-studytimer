import React from 'react';

function Profile() {
  const profileStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'left',
    minHeight: '100vh',
    backgroundColor: '#282c34',
    color: 'white',
    fontSize: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px', // Added padding
  };

  const paragraphStyle = {
    fontSize: '1.2rem', // Decreased font size
    maxWidth: '900px', // Added max-width to prevent it from stretching too much
    lineHeight: '1.5', // Improved readability
    marginTop: '10px', // Reduced space between h1 and p
    padding: '10px 20px', // Added padding for better spacing
  };

  const headerStyle = {
    marginTop: '40px', // Adds spacing before the second header
    fontSize: '1.8rem', // Slightly smaller than main title
  };

  return (
    <div style={profileStyle}>
      <h1>Our Mission</h1>
      <p style={paragraphStyle}>
        Our project, timewise, is a web app that hopes to help users manage their time wisely and effectively, with a timer! Our app allows users to input their tasks, focus, and schedule(s) to generate a personalized work plan that maximizes work efficiency. Additionally, based on the user's current motivation and difficulty of tasks, adaptive break suggestions will pop up to minimize burnout within our users.
      </p>
      {/* Second Header and Placeholder Text */}
      <h2 style={headerStyle}>Ways to Use Our App!</h2>
      <p style={paragraphStyle}>
        1. As a casual study timer. Set your own study time and breaks! <br />
        2. Add in your own Google Calendar and see what tasks and assignments you have coming up. <br />
        3. Our app can suggest study time and breaks based on the assignments you have! <br />
        4. Add in your own tasks with our to-do list.

      </p>
    </div>
  );
}

export default Profile;
