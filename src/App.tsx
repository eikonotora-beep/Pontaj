import React, { useState, useCallback } from "react";
import Calendar from "./components/Calendar";
import DayEntryForm from "./components/DayEntryForm";
import CalendarSelector from "./components/CalendarSelector";
import "./App.css";

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleFormSave = useCallback(() => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleCalendarChange = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>⏰ Pontaj Calendar</h1>
        <p>Track your work hours with daily shifts</p>
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <CalendarSelector onCalendarChange={handleCalendarChange} />
        </aside>

        <div className="app-content" key={refreshKey}>
          <Calendar onDayClick={handleDayClick} selectedDate={selectedDate ?? undefined} />
        </div>
      </main>

      {showForm && selectedDate && (
        <DayEntryForm
          date={selectedDate}
          onSave={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

export default App;
