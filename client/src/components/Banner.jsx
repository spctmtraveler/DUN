import React, { useState } from 'react';
import ToggleSwitches from './ToggleSwitches';

const Banner = ({ visiblePanels, togglePanel, onAddTask, onFilterChange }) => {
  const [taskInput, setTaskInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'triage', label: 'Triage' },
    { value: 'today', label: "Today's tasks" },
    { value: 'tomorrow', label: "Tomorrow's tasks" },
    { value: 'thisWeek', label: "This week's tasks" },
    { value: 'nextWeek', label: "Next week's tasks" },
    { value: 'thisMonth', label: "This month's tasks" },
    { value: 'nextMonth', label: "Next month's tasks" }
  ];

  return (
    <div className="banner">
      <h1>DUN</h1>
      <div className="banner-controls">
        <input
          type="text"
          placeholder="Enter task"
          className="task-input"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="add-button"
          onClick={() => {
            if (taskInput.trim()) {
              onAddTask(taskInput);
              setTaskInput('');
            }
          }}
        >
          Add
        </button>
        <select 
          className="view-filter"
          onChange={(e) => onFilterChange(e.target.value)}
          defaultValue="all"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ToggleSwitches visiblePanels={visiblePanels} togglePanel={togglePanel} />
      </div>
    </div>
  );
};

export default Banner;