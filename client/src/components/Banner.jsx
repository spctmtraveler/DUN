import React from 'react';
import ToggleSwitches from './ToggleSwitches';

const Banner = ({ visiblePanels, togglePanel }) => {
  return (
    <div className="banner">
      <h1>DUN</h1>
      <div className="banner-controls">
        <input type="text" placeholder="Enter task" className="task-input" />
        <button className="add-button">Add</button>
        <select className="view-filter">
          <option value="all">All</option>
        </select>
        <ToggleSwitches visiblePanels={visiblePanels} togglePanel={togglePanel} />
      </div>
    </div>
  );
};

export default Banner;