import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Settings from "../components/AppSettings/Settings";
import "@testing-library/jest-dom";

describe("SettingsPage Component", () => {
  beforeEach(() => {
    localStorage.clear(); // Reset localStorage before each test
  });

  test("loads the default theme from localStorage", () => {
    localStorage.setItem("theme", "light"); // Simulate saved theme
    render(<Settings />);
    
    // Check that the document theme was set correctly
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  test("clicking a theme button updates the theme", () => {
    render(<Settings />);
    
    const darkButton = screen.getByText(/dark/i);
    fireEvent.click(darkButton);

    // Ensure the theme changes to "dark"
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  test("clicking the Pistachio button updates the theme", () => {
    render(<Settings />);

    const pistachioButton = screen.getByText(/pistachio/i);
    fireEvent.click(pistachioButton);

    // Ensure the theme changes to "forest"
    expect(document.documentElement.getAttribute("data-theme")).toBe("forest");
    expect(localStorage.getItem("theme")).toBe("forest");
  });
});
