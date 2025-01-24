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

  return (
    <div className="panel">
      <div className="panel-header">
        <Icon className="panel-icon" size={24} />
        <h2 className="panel-title">{title}</h2>
      </div>
      {title === 'Hours' && (
        <ul className="hours-list">
          {[...Array(24)].map((_, i) => {
            const hour = i < 12 ? i || 12 : i - 12;
            const ampm = i < 12 ? 'AM' : 'PM';
            return (
              <li key={i}>
                {hour} {ampm}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Panel;
