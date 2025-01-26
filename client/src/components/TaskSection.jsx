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

  // Temporarily comment out section-level drop handling to debug task-level drag and drop
  /*
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    hover: (item, monitor) => {
      console.debug('DnD: Section hover', {
        draggedTask: item,
        targetSection: id,
        isOverSection: monitor.isOver({ shallow: true })
      });

      if (monitor.isOver({ shallow: true })) {
        if (item.section === id) return;

        console.debug('DnD: Moving to end of section', {
          from: item.section,
          to: id,
          newIndex: tasks.length
        });

        onMoveTask(item, id, tasks.length, {
          revisitDate: item.revisitDate
        });

        item.index = tasks.length;
        item.section = id;
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    })
  });
  */

  return (
    <div 
      className="task-section"
      data-section-id={id}
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