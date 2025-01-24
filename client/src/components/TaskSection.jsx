import React from 'react';
import { useDrop } from 'react-dnd';
import { ChevronRight } from 'lucide-react';
import Task from './Task';

const TaskSection = ({ id, title, tasks = [], onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item) => {
      if (item.sectionId !== id) {
        onDrop(item, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`task-section ${isOver ? 'drop-target' : ''}`}
    >
      <div className="section-header">
        <ChevronRight className="section-caret" size={16} />
        <span>{title}</span>
      </div>
      <div className="section-content">
        {tasks.map((task, index) => (
          <Task
            key={task.id}
            {...task}
            index={index}
            sectionId={id}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskSection;
