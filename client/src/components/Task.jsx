import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';

const Task = ({ 
  id, 
  title, 
  section, 
  index, 
  order, 
  completed,
  selected,
  revisitDate,
  onMoveTask,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask 
}) => {
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

  const handleClick = (e) => {
    // Only select if not clicking a control
    if (!e.target.closest('.task-controls, .task-checkbox')) {
      onSelectTask(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = addDays(parseISO(dateString), 1);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MM/dd');
  };

  return (
    <div
      ref={(node) => drop(preview(node))}
      className={`task ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''} ${selected ? 'selected' : ''} ${completed ? 'completed' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={handleClick}
    >
      <div className="task-content">
        <div ref={drag} className="drag-handle">
          <Grip size={16} />
        </div>
        <input 
          type="checkbox" 
          className="task-checkbox" 
          checked={completed}
          onChange={() => onToggleCompletion(id)}
        />
        <span className="task-title">{title}</span>
        <div className="task-controls">
          {revisitDate && (
            <span 
              className="task-date-label"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.target.getBoundingClientRect();
                const input = document.createElement('input');
                input.type = 'date';
                input.style.position = 'fixed';
                input.style.left = `${rect.left}px`;
                input.style.top = `${rect.bottom + 2}px`;
                input.style.opacity = '0';
                input.style.pointerEvents = 'none';
                document.body.appendChild(input);
                input.onchange = (e) => {
                  const date = new Date(e.target.value);
                  date.setHours(0, 0, 0, 0);
                  onSelectTask(id);
                  onMoveTask({ id, title, section, index }, section, index, { revisitDate: date.toISOString() });
                  document.body.removeChild(input);
                };
                input.onclose = () => document.body.removeChild(input);
                input.showPicker();
              }}
            >
              {formatDate(revisitDate)}
            </div>
          )}
          <button 
            className="task-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(id);
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task;