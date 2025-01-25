import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { ChevronRight } from 'lucide-react';
import Task from './Task';

const TaskSection = ({ 
  id, 
  title, 
  tasks = [], 
  onMoveTask,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      // When hovering over a section with no tasks,
      // move the item to the end of this section
      if (tasks.length === 0 && item.section !== id) {
        const additionalData = item.revisitDate ? { revisitDate: item.revisitDate } : {};
        onMoveTask(item, id, 0, additionalData);
        item.section = id;
        item.index = 0;
      }
    },
    drop(item, monitor) {
      // Handle drops only if we're not dropping on a Task
      if (!monitor.didDrop()) {
        const additionalData = item.revisitDate ? { revisitDate: item.revisitDate } : {};
        onMoveTask(item, id, tasks.length, additionalData);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`task-section ${isOver ? 'drop-target' : ''}`}
    >
      <div 
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} 
          size={16} 
        />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              {...task}
              index={index}
              onMoveTask={onMoveTask}
              onToggleCompletion={onToggleCompletion}
              onDeleteTask={onDeleteTask}
              onSelectTask={onSelectTask}
              selected={task.id === selectedTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSection;