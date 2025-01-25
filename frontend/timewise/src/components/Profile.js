import React from 'react';

function Profile() {
  const profileStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',   
    backgroundColor: '#282c34',
    color: 'white',
    fontSize: '2rem',   
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  };

  return (
    <div style={profileStyle}>
      <h1>Profile Page</h1>
      <p>Hello User!</p>
    </div>
  );
}

export default Profile;