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
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (draggedItem) => {
      if (draggedItem.section === id && tasks.length === 0) {
        // If dropping in the same empty section, don't do anything
        return;
      }

      let targetIndex;
      if (draggedItem.section === id) {
        // When moving within the same section
        targetIndex = tasks.length <= 1 ? 0 : tasks.length - 1;
      } else {
        // When moving to a different section
        targetIndex = tasks.length;
      }

      const additionalData = draggedItem.revisitDate ? { revisitDate: draggedItem.revisitDate } : {};
      onMoveTask(draggedItem, id, targetIndex, additionalData);
    },
    canDrop: (item) => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`task-section ${isOver && canDrop ? 'drop-target' : ''}`}
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