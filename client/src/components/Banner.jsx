import React, { useState } from 'react';
import ToggleSwitches from './ToggleSwitches';

const Banner = ({ visiblePanels, togglePanel, onAddTask }) => {
  const [taskInput, setTaskInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

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
        <select className="view-filter">
          <option value="all">All</option>
        </select>
        <ToggleSwitches visiblePanels={visiblePanels} togglePanel={togglePanel} />
      </div>
    </div>
  );
};

export default Banner;