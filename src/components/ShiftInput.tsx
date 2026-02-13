import React, { useState } from "react";
import { ShiftType } from "../types/index";
import { calculateWorkHours, roundToNearestMinute } from "../utils/dateUtils";
import "../styles/ShiftInput.css";

interface ShiftInputProps {
  shiftType: ShiftType;
  onShiftChange: (
    shiftType: ShiftType,
    startTime: string,
    endTime: string
  ) => void;
  onRemoveShift: (shiftType: ShiftType) => void;
  startTime?: string;
  endTime?: string;
}

const ShiftInput: React.FC<ShiftInputProps> = ({
  shiftType,
  onShiftChange,
  onRemoveShift,
  startTime = "08:00",
  endTime = "16:00",
}) => {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStart(newStart);
    onShiftChange(shiftType, newStart, end);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEnd(newEnd);
    onShiftChange(shiftType, start, newEnd);
  };

  const getDefaultTimes = () => {
    switch (shiftType) {
      case "day":
        return { start: "06:45", end: "19:15" };
      case "night":
        return { start: "18:45", end: "07:15" };
      default:
        return { start: "08:00", end: "16:00" };
    }
  };

  const defaults = getDefaultTimes();
  const duration = roundToNearestMinute(
    calculateWorkHours(start || defaults.start, end || defaults.end)
  );
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return (
    <div className="shift-input">
      <label className="shift-label">{shiftType.toUpperCase()}</label>
      <div className="shift-inputs">
        <div className="time-group">
          <label>Start:</label>
          <input
            type="time"
            value={start || defaults.start}
            onChange={handleStartChange}
            className="time-input"
          />
        </div>
        <div className="time-group">
          <label>End:</label>
          <input
            type="time"
            value={end || defaults.end}
            onChange={handleEndChange}
            className="time-input"
          />
        </div>
        <div className="duration">
          <span className="duration-label">
            {hours}h {minutes}m
          </span>
        </div>
        <button
          className="remove-btn"
          onClick={() => onRemoveShift(shiftType)}
          title="Remove shift"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ShiftInput;
