export const BACKEND_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://pj08-studytimer.onrender.com");

// Function to fetch user data
export async function fetchUser() {
  try {
    const response = await fetch(`${BACKEND_URL}/get-user`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { error: "Failed to fetch user data" };
  }
}

export function login() {
  window.location.href = `${BACKEND_URL}/login`;
}

export async function logout() {
  try {
    const response = await fetch(`${BACKEND_URL}/logout`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error logging out:", error);
    return { error: "Failed to log out" };
  }
}