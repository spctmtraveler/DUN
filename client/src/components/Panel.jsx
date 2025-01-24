import React from 'react';
import { AiOutlineAim, AiOutlineUnorderedList, AiOutlineCheck, AiOutlineCalendar, AiOutlineBulb, AiOutlineHourglass } from 'react-icons/ai';

const iconMap = {
  target: AiOutlineAim,
  list: AiOutlineUnorderedList,
  check: AiOutlineCheck,
  calendar: AiOutlineCalendar,
  lightbulb: AiOutlineBulb,
  hourglass: AiOutlineHourglass
};

const Panel = ({ title, icon }) => {
  const Icon = iconMap[icon];

  const renderHoursList = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(
        <li key={i}>
          {i.toString().padStart(2, '0')}
        </li>
      );
    }
    return hours;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <Icon className="panel-icon" size={24} />
        <h2 className="panel-title">{title}</h2>
      </div>
      {title === 'Hours' && (
        <ul className="hours-list">
          {renderHoursList()}
        </ul>
      )}
    </div>
  );
};

export default Panel;