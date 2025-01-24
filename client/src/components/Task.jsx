import React from 'react';
import { useDrag } from 'react-dnd';
import { Grip, Calendar, X } from 'lucide-react';

const Task = ({ id, title, sectionId, index, order = 10000.0000 }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: { id, title, sectionId, index, order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={preview}
      className={`task ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="task-content">
        <div ref={drag} className="drag-handle">
          <Grip size={16} />
        </div>
        <input type="checkbox" className="task-checkbox" />
        <span className="task-title">{title}</span>
        <div className="task-controls">
          <button className="task-date">
            <Calendar size={16} />
          </button>
          <button className="task-delete">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task;
