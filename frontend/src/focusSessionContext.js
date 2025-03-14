import React, { createContext, useState, useContext, useEffect } from "react";

const FocusSessionContext = createContext();
export function FocusSessionProvider({ children }) {
  const [inFocusSession, setInFocusSession] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

  useEffect(() => {
    console.log("SelectView was modified to the following:", selectedView);
  }, [selectedView]);

  return (
    <FocusSessionContext.Provider value={{ inFocusSession, setInFocusSession, selectedView, setSelectedView }}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession() {
  return useContext(FocusSessionContext);
}
