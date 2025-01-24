import React from 'react';
import { AiOutlineAim, AiOutlineUnorderedList, AiOutlineCheck, AiOutlineCalendar, AiOutlineBulb, AiOutlineHourglass } from 'react-icons/ai';
import TaskSection from './TaskSection';
import TaskDetails from './TaskDetails';

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
  onMoveTask,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId
}) => {
  const Icon = iconMap[icon];
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const renderHoursList = () => {
    const hours = [];
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
    return sections.map(section => {
      const sectionTasks = tasks.filter(task => task.section === section)
        .sort((a, b) => a.order - b.order);
      return (
        <TaskSection
          key={section}
          id={section}
          title={section}
          tasks={sectionTasks}
          onMoveTask={onMoveTask}
          onToggleCompletion={onToggleCompletion}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
          selectedTaskId={selectedTaskId}
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
        {title === 'Task' && (
          <TaskDetails task={selectedTask} />
        )}
      </div>
    </div>
  );
};

export default Panel;