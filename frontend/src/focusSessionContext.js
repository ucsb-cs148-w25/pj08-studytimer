import React, { createContext, useState, useContext } from "react";

const FocusSessionContext = createContext();
export function FocusSessionProvider({ children }) {
  const [inFocusSession, setInFocusSession] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

  return (
    <FocusSessionContext.Provider value={{ inFocusSession, setInFocusSession, selectedView, setSelectedView }}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession() {
  return useContext(FocusSessionContext);
}
