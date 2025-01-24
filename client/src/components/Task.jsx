import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Grip, Calendar, X } from 'lucide-react';

const Task = ({ id, title, section, index, order, onMoveTask }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'TASK',
    item: { id, title, section, index, order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    hover: (draggedItem) => {
      if (draggedItem.id === id) {
        return;
      }
      onMoveTask(draggedItem, section, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drop(preview(node))}
      className={`task ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
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