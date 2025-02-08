import React from 'react';

function Profile() {
  const profileStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    justifyContent: 'left',
    minHeight: '100vh',   
    backgroundColor: '#282c34',
    color: 'white',
    fontSize: '2rem',   
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  };

  return (
    <div style={profileStyle}>
      <h1>Settings</h1>
    </div>
  );
}

export default Profile;