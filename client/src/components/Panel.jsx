/**
 * Panel.jsx
 * Renders a single panel in the application.
 * Each panel can display different content based on its type (Tasks, Hours, Task Details, etc.)
 */

import React from 'react';
import { AiOutlineAim, AiOutlineUnorderedList, AiOutlineCheck, AiOutlineCalendar, AiOutlineBulb, AiOutlineHourglass } from 'react-icons/ai';
import TaskSection from './TaskSection';
import TaskDetails from './TaskDetails';

// Map panel icon IDs to their corresponding React icons
const iconMap = {
  target: AiOutlineAim,
  list: AiOutlineUnorderedList,
  check: AiOutlineCheck,
  calendar: AiOutlineCalendar,
  lightbulb: AiOutlineBulb,
  hourglass: AiOutlineHourglass
};

const Panel = ({ 
  id, 
  title, 
  icon, 
  isVisible, 
  width, 
  tasks = [], 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
  onReorderTasks
}) => {
  const Icon = iconMap[icon];
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const renderHoursList = () => {
    const hours = [];
    const currentHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
      const displayHour = i === 0 || i === 12 ? 12 : i % 12;
      const isPM = i >= 12;
      hours.push(
        <li key={i} className={`hour-item ${isPM ? 'hour-pm' : 'hour-am'}`}>
          <div className="hour-line"></div>
          <span className="hour-label">{displayHour}</span>
        </li>
      );
    }

    const hourListRef = React.useRef(null);
    React.useEffect(() => {
      if (hourListRef.current) {
        const hourHeight = hourListRef.current.scrollHeight / 24;
        const scrollPosition = (currentHour * hourHeight) - (hourListRef.current.clientHeight / 2);
        hourListRef.current.scrollTop = scrollPosition;
      }
    }, []);

    return (
      <ul className="hours-list" ref={hourListRef}>
        {hours}
      </ul>
    );
  };

  const renderTaskSections = () => {
    const sections = ['Triage', 'A', 'B', 'C'];
    return sections.map(section => {
      const sectionTasks = tasks.filter(task => task.section === section)
        .sort((a, b) => a.order - b.order);
      return (
        <TaskSection
          key={section}
          id={section}
          title={section}
          tasks={sectionTasks}
          onToggleCompletion={onToggleCompletion}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
          selectedTaskId={selectedTaskId}
          onReorderTasks={onReorderTasks}  // Make sure we pass this prop
        />
      );
    });
  };

  return (
    <div 
      className={`panel ${!isVisible ? 'hidden' : ''}`}
      style={{ width: isVisible ? width : '0' }}
    >
      <div className="panel-header">
        <Icon className="panel-icon" size={24} />
        <h2 className="panel-title">{title}</h2>
      </div>
      <div className="panel-content">
        {title === 'Hours' && renderHoursList()}
        {title === 'Tasks' && (
          <div className="task-sections">
            {renderTaskSections()}
          </div>
        )}
        {title === 'Task' && <TaskDetails task={selectedTask} />}
      </div>
    </div>
  );
};

export default Panel;