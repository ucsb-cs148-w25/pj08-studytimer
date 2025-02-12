// Login.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Login from "../components/NavBar/Login.js";
import { loginWithGoogle } from "../auth";

// Mock the loginWithGoogle function so we can spy on its calls.
jest.mock("../auth", () => ({
  loginWithGoogle: jest.fn(),
}));

describe("Login component", () => {
  let setUserMock;

  // Before each test, clear localStorage and reset mocks.
  beforeEach(() => {
    setUserMock = jest.fn();
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("calls setUser on mount if a user is stored in localStorage", () => {
    // Arrange: store a dummy user in localStorage.
    const dummyUser = { name: "John Doe", email: "john@example.com" };
    localStorage.setItem("user", JSON.stringify(dummyUser));

    // Act: render the component.
    render(<Login setUser={setUserMock} />);

    // Assert: expect setUser to have been called with the stored user.
    expect(setUserMock).toHaveBeenCalledWith(dummyUser);
  });

  test("does not call setUser on mount if no user is stored in localStorage", () => {
    // Act: render the component when nothing is stored.
    render(<Login setUser={setUserMock} />);

    // Assert: setUser should not be called.
    expect(setUserMock).not.toHaveBeenCalled();
  });

  test("calls loginWithGoogle when the button is clicked", () => {
    // Act: render the component.
    render(<Login setUser={setUserMock} />);
    const button = screen.getByRole("button", { name: /login with google/i });
    
    // Simulate a click on the button.
    fireEvent.click(button);
    
    // Assert: verify that loginWithGoogle was called with setUserMock.
    expect(loginWithGoogle).toHaveBeenCalledWith(setUserMock);
  });
});