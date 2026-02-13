import React, { useState, useEffect } from "react";
import {
  getAllCalendars,
  getActiveCalendarId,
  setActiveCalendar,
  createCalendar,
  deleteCalendar,
  renameCalendar,
} from "../utils/storage";
import { Calendar } from "../types/index";
import "../styles/CalendarSelector.css";

interface CalendarSelectorProps {
  onCalendarChange: () => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({
  onCalendarChange,
}) => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  useEffect(() => {
    loadCalendars();
  }, []);

  const loadCalendars = () => {
    const allCals = getAllCalendars();
    setCalendars(allCals);
    const active = getActiveCalendarId();
    setActiveId(active);
  };

  const handleAddCalendar = () => {
    if (newName.trim()) {
      createCalendar(newName.trim());
      setNewName("");
      setShowNewForm(false);
      loadCalendars();
      onCalendarChange();
    }
  };

  const handleSelectCalendar = (id: string) => {
    setActiveCalendar(id);
    setActiveId(id);
    onCalendarChange();
  };

  const handleDeleteCalendar = (id: string) => {
    if (calendars.length > 1 && window.confirm("Delete this calendar?")) {
      deleteCalendar(id);
      loadCalendars();
      onCalendarChange();
    }
  };

  const handleRenameCalendar = (id: string, oldName: string) => {
    setRenaming(id);
    setRenamingValue(oldName);
  };

  const handleSaveRename = (id: string) => {
    if (renamingValue.trim()) {
      renameCalendar(id, renamingValue.trim());
      setRenaming(null);
      loadCalendars();
      onCalendarChange();
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    callback: () => void
  ) => {
    if (e.key === "Enter") {
      callback();
    } else if (e.key === "Escape") {
      setRenaming(null);
    }
  };

  return (
    <div className="calendar-selector">
      <div className="selector-header">
        <h3>Calendars</h3>
        <button
          className="add-calendar-btn"
          onClick={() => setShowNewForm(!showNewForm)}
          title="Add new calendar"
        >
          +
        </button>
      </div>

      {showNewForm && (
        <div className="new-calendar-form">
          <input
            type="text"
            placeholder="Calendar name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) =>
              handleKeyPress(e, () => handleAddCalendar())
            }
            className="calendar-input"
            autoFocus
          />
          <div className="form-buttons">
            <button
              className="btn-confirm"
              onClick={handleAddCalendar}
              disabled={!newName.trim()}
            >
              Create
            </button>
            <button
              className="btn-cancel-small"
              onClick={() => {
                setShowNewForm(false);
                setNewName("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="calendars-list">
        {calendars.map((cal) => (
          <div
            key={cal.id}
            className={`calendar-item ${
              activeId === cal.id ? "active" : ""
            }`}
          >
            {renaming === cal.id ? (
              <div className="rename-form">
                <input
                  type="text"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onKeyPress={(e) =>
                    handleKeyPress(e, () =>
                      handleSaveRename(cal.id)
                    )
                  }
                  className="rename-input"
                  autoFocus
                />
                <button
                  className="btn-confirm-small"
                  onClick={() => handleSaveRename(cal.id)}
                >
                  ✓
                </button>
                <button
                  className="btn-cancel-small"
                  onClick={() => setRenaming(null)}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  className="calendar-name"
                  onClick={() => handleSelectCalendar(cal.id)}
                >
                  {cal.name}
                </button>
                <div className="calendar-actions">
                  <button
                    className="btn-rename"
                    onClick={() =>
                      handleRenameCalendar(cal.id, cal.name)
                    }
                    title="Rename"
                  >
                    ✎
                  </button>
                  {calendars.length > 1 && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCalendar(cal.id)}
                      title="Delete"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSelector;
