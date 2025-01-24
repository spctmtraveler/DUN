import React, { useState } from 'react';
import { AiOutlineAim, AiOutlineUnorderedList, AiOutlineCheck, AiOutlineCalendar, AiOutlineBulb, AiOutlineHourglass } from 'react-icons/ai';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const iconMap = {
  target: AiOutlineAim,
  list: AiOutlineUnorderedList,
  check: AiOutlineCheck,
  calendar: AiOutlineCalendar,
  lightbulb: AiOutlineBulb,
  hourglass: AiOutlineHourglass
};

const Panel = ({ id, title, icon }) => {
  const [isCollapsed, setIsCollapsed] = useState(id === 'priority');
  const Icon = iconMap[icon];

  const renderHoursList = () => {
    const hours = [];
    // Only show hours from 8 AM to 10 PM
    for (let i = 8; i <= 22; i++) {
      hours.push(
        <li key={i} className="hour-item">
          <div className="hour-line"></div>
          <span className="hour-label">{i}</span>
        </li>
      );
    }
    return hours;
  };

  const renderTaskSections = () => {
    const sections = ['Triage', 'A', 'B', 'C'];
    return sections.map(section => (
      <div key={section} className="task-section">
        <div className="section-header">
          <ChevronRight className="section-caret" size={16} />
          <span>{section}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className={`panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="panel-header">
        <button 
          className="toggle-button" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <Icon className="panel-icon" size={24} />
        <h2 className="panel-title">{title}</h2>
      </div>
      <div className="panel-content">
        {title === 'Hours' && (
          <ul className="hours-list">
            {renderHoursList()}
          </ul>
        )}
        {title === 'Tasks' && (
          <div className="task-sections">
            {renderTaskSections()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Panel;