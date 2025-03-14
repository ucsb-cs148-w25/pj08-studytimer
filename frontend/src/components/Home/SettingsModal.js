import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

// Preset Vals for Settings
const FLOW_PRESETS = [5, 15, 25, 30, 45, 60];
const SHORT_BREAK_PRESETS = [5, 10, 15];
const LONG_BREAK_PRESETS = [10, 20, 30];
const CYCLE_PRESETS = [1, 2, 3, 4, 5];

export default function SettingsModal({
  isOpen,
  onClose,
  flowDuration,
  shortBreakDuration,
  longBreakDuration,
  cycle,
  startBreaksAutomatically,
  startFlowsAutomatically,
  onSave
}) {
  // Local state for user selections
  const [tempFlow, setTempFlow] = useState(flowDuration);
  const [tempShortBreak, setTempShortBreak] = useState(shortBreakDuration);
  const [tempLongBreak, setTempLongBreak] = useState(longBreakDuration);
  const [tempCycle, setTempCycle] = useState(cycle);

  const [tempStartBreaks, setTempStartBreaks] = useState(startBreaksAutomatically);
  const [tempStartFlows, setTempStartFlows] = useState(startFlowsAutomatically);

  // Which sub-picker is open? 'flow' | 'break' | 'cycle' | null
  const [pickerOpen, setPickerOpen] = useState(null);

  // Custom screen tracking
  const [customTarget, setCustomTarget] = useState(null);
  const [showCustomScreen, setShowCustomScreen] = useState(false);

  // For flow/short/long custom entry
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);

  // For cycle custom entry
  const [customCycle, setCustomCycle] = useState('');

  // Load props into local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempFlow(flowDuration);
      setTempShortBreak(shortBreakDuration);
      setTempLongBreak(longBreakDuration);
      setTempCycle(cycle);

      setTempStartBreaks(startBreaksAutomatically);
      setTempStartFlows(startFlowsAutomatically);

      setPickerOpen(null);
      setCustomTarget(null);
      setShowCustomScreen(false);

      setCustomHours(0);
      setCustomMinutes(0);
      setCustomCycle('');
    }
  }, [
    isOpen,
    flowDuration,
    shortBreakDuration,
    longBreakDuration,
    cycle,
    startBreaksAutomatically,
    startFlowsAutomatically
  ]);

  if (!isOpen) return null;

  // ---------------------------
  // Overlay Click → Save & Close
  // ---------------------------
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('settings-modal-overlay')) {
      onSave(
        tempFlow,
        tempShortBreak,
        tempLongBreak,
        tempCycle,
        tempStartBreaks,
        tempStartFlows
      );
      onClose();
    }
  };

  // Helper: close sub-picker
  const closePicker = () => {
    setPickerOpen(null);
    setCustomTarget(null);
  };

  // ---------------------------
  // Main Settings
  // ---------------------------
  const renderMainSettings = () => (
    <div className="settings-modal-content">
      <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => setPickerOpen('flow')}>
        <div className="settings-label">Focus Duration</div>
        <div className="settings-value clickable-value">{tempFlow} min</div>
      </div>

      <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => setPickerOpen('break')}>
        <div className="settings-label">Break Duration</div>
        <div className="settings-value clickable-value">
          {tempShortBreak} min, {tempLongBreak} min
        </div>
      </div>

      <div className="settings-row" style={{ cursor: 'pointer' }} onClick={() => setPickerOpen('cycle')}>
        <div className="settings-label">Cycle</div>
        <div className="settings-value clickable-value">{tempCycle}</div>
      </div>

      <div className="settings-row">
        <div className="settings-label">Start Focus automatically</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={tempStartFlows}
            onChange={() => setTempStartFlows((prev) => !prev)}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="settings-row">
        <div className="settings-label">Start Breaks automatically</div>
        <label className="switch">
          <input
            type="checkbox"
            checked={tempStartBreaks}
            onChange={() => setTempStartBreaks((prev) => !prev)}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );

  // ---------------------------
  // Sub-Pickers
  // ---------------------------
  const renderFlowPicker = () => (
    <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Select Focus Duration</h3>
      {FLOW_PRESETS.map((val) => (
        <div
          key={val}
          className={`picker-item ${val === tempFlow ? 'selected' : ''}`}
          onClick={() => {
            setTempFlow(val);
            closePicker();
          }}
        >
          {val} min
        </div>
      ))}
      <div
        className="picker-item"
        onClick={() => {
          setCustomTarget('flow');
          // Default to 1 minute (0 hours, 1 minute)
          setCustomHours(0);
          setCustomMinutes(1);
          setShowCustomScreen(true);
        }}
      >
        Custom
      </div>
    </div>
  );

  const renderBreakPicker = () => (
    <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Short Break</h3>
      {SHORT_BREAK_PRESETS.map((val) => (
        <div
          key={val}
          className={`picker-item ${val === tempShortBreak ? 'selected' : ''}`}
          onClick={() => {
            setTempShortBreak(val);
            closePicker();
          }}
        >
          {val} min
        </div>
      ))}
      <div
        className="picker-item"
        onClick={() => {
          setCustomTarget('short');
          // Default to 1 minute
          setCustomHours(0);
          setCustomMinutes(1);
          setShowCustomScreen(true);
        }}
      >
        Custom
      </div>

      <h3 style={{ marginTop: '1rem' }}>Long Break</h3>
      {LONG_BREAK_PRESETS.map((val) => (
        <div
          key={val}
          className={`picker-item ${val === tempLongBreak ? 'selected' : ''}`}
          onClick={() => {
            setTempLongBreak(val);
            closePicker();
          }}
        >
          {val} min
        </div>
      ))}
      <div
        className="picker-item"
        onClick={() => {
          setCustomTarget('long');
          // Default to 1 minute
          setCustomHours(0);
          setCustomMinutes(1);
          setShowCustomScreen(true);
        }}
      >
        Custom
      </div>
    </div>
  );

  const renderCyclePicker = () => (
    <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Select Cycle</h3>
      {CYCLE_PRESETS.map((val) => (
        <div
          key={val}
          className={`picker-item ${val === tempCycle ? 'selected' : ''}`}
          onClick={() => {
            setTempCycle(val);
            closePicker();
          }}
        >
          {val}
        </div>
      ))}
      <div
        className="picker-item"
        onClick={() => {
          setCustomTarget('cycle');
          setCustomCycle('1'); // Default cycle to 1
          setShowCustomScreen(true);
        }}
      >
        Custom
      </div>
    </div>
  );

  // ---------------------------
  // Custom Screen
  // ---------------------------
  const renderCustomScreen = () => {
    let title = '';
    if (customTarget === 'flow') title = 'Focus Duration';
    else if (customTarget === 'short') title = 'Short Break';
    else if (customTarget === 'long') title = 'Long Break';
    else if (customTarget === 'cycle') title = 'Cycle';

    const handleCancel = () => {
      setShowCustomScreen(false);
      setCustomTarget(null);
    };

    const handleApply = () => {
      if (customTarget === 'cycle') {
        const val = Number(customCycle);
        if (Number.isNaN(val) || val <= 0) {
          alert('Please enter a valid cycle number greater than 0');
          return;
        }
        setTempCycle(val);
      } else {
        // For flow, short, or long, convert hours + minutes to total minutes
        const total = customHours * 60 + customMinutes;
        if (total < 1) {
          alert('Please select a duration of at least 1 minute');
          return;
        }
        if (customTarget === 'flow') {
          setTempFlow(total);
        } else if (customTarget === 'short') {
          setTempShortBreak(total);
        } else if (customTarget === 'long') {
          setTempLongBreak(total);
        }
      }
      setShowCustomScreen(false);
      closePicker();
    };

    return (
      <div className="custom-screen" onClick={(e) => e.stopPropagation()}>
        <h3>Custom {title}</h3>

        {customTarget === 'cycle' ? (
          <div className="custom-input-area">
            <input
              type="number"
              value={customCycle}
              onChange={(e) => setCustomCycle(e.target.value)}
              min="1"
              className="cycle-input"
            />
          </div>
        ) : (
          <div className="custom-input-area">
            <div className="number-input-group">
              <label>Hours:</label>
              <input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                min="1"
                max="3"
                step="1"
              />
            </div>
            <div className="number-input-group">
              <label>Minutes:</label>
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                min="1"
                max="59"
                step="1"
              />
            </div>
          </div>
        )}

        <div className="custom-screen-buttons">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleApply}>Apply</button>
        </div>
      </div>
    );
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      {/* If no sub-picker and no custom screen, show the main settings */}
      {!pickerOpen && !showCustomScreen && renderMainSettings()}

      {/* If a sub-picker is open (presets list), show it */}
      {pickerOpen && !showCustomScreen && (
        <div
          className="picker-overlay"
          onClick={(e) => {
            // Only close if clicking outside the sub-modal
            if (e.target.classList.contains('picker-overlay')) {
              closePicker();
            }
          }}
        >
          {pickerOpen === 'flow' && renderFlowPicker()}
          {pickerOpen === 'break' && renderBreakPicker()}
          {pickerOpen === 'cycle' && renderCyclePicker()}
        </div>
      )}

      {/* If the custom screen is open, show it */}
      {showCustomScreen && (
        <div
          className="picker-overlay"
          onClick={(e) => {
            // Only close if clicking outside
            if (e.target.classList.contains('picker-overlay')) {
              closePicker();
              setShowCustomScreen(false);
            }
          }}
        >
          {renderCustomScreen()}
        </div>
      )}
    </div>
  );
}
