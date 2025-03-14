import React from "react";
import "./SelectPopUp.css";
import { useNavigate } from "react-router-dom"; 

const SelectPopUp = ({
  selectedCount,
  onUnselectAll,
  onDeleteAll,
  onStartFocusSession,
}) => {
  const navigate = useNavigate();

  const handleUnselectAll = () => {
    onUnselectAll();
  };

  const handleStartFocus = () => {
    onStartFocusSession();
    navigate("/"); 
  };

  const handleDeleteAll = () => {
    onDeleteAll();
  };

  return (
    <div className="select-popup-overlay">
      <div className="select-popup-container">
        <div 
          className="select-popup-option unselect-option" 
          onClick={handleUnselectAll}
        >
          <div className="unselect-icon-container">
            <img className="filled" src="/filledSelectCircle.svg" alt="Unselect" />
            <img className="empty" src="/emptySelectCircle.svg" alt="Unselect" />
          </div>
          <span>Unselect {selectedCount} Tasks</span>
        </div>

        <div className="select-popup-divider" />

        <div className="select-popup-option" onClick={handleStartFocus}>
          <span>Start Focus Session</span>
        </div>

        <div className="select-popup-divider" />

        <div className="select-popup-option delete-option" onClick={handleDeleteAll}>
          <span>Delete All Selected</span>
        </div>
      </div>
    </div>
  );
};

export default SelectPopUp;