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
    hover: (item, monitor) => {
      console.debug('DnD: Section hover', {
        draggedTask: item,
        targetSection: id,
        isOverSection: monitor.isOver({ shallow: true })
      });

      // Only handle section-level hover when the task isn't over a specific task
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
    drop: (item, monitor) => {
      // Only handle drops that weren't handled by a nested target
      if (!monitor.didDrop()) {
        console.debug('DnD: Section drop', {
          task: item,
          targetSection: id,
          finalIndex: tasks.length
        });
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    })
  });

  return (
    <div 
      ref={drop}
      className={`task-section ${isOver && canDrop ? 'drop-target' : ''}`}
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