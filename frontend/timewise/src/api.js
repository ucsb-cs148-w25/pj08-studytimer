export const BACKEND_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://pj08-studytimer.onrender.com");

// Function to fetch user data
export async function fetchUser() {
  const response = await fetch(`${BACKEND_URL}/get-user`, {
    credentials: 'include',
  });
  return response.json();
}