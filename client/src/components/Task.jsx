import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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
    item: { id, title, section, index, order, revisitDate },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (draggedItem) => {
      if (draggedItem.id === id) return;

      const additionalData = draggedItem.revisitDate ? { revisitDate: draggedItem.revisitDate } : {};
      onMoveTask(draggedItem, section, index, additionalData);
    },
    hover(item, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      if (item.id === id) return;
      if (item.index === index && item.section === section) return;
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
          <span className="task-date-label">
            {formatDate(revisitDate) || 'Set date'}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="task-date"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
              <div onClick={(e) => e.stopPropagation()}>
                <CalendarComponent
                  mode="single"
                  selected={revisitDate ? addDays(parseISO(revisitDate), 1) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() - 1); 
                      newDate.setHours(12, 0, 0, 0);
                      onMoveTask(
                        { id, title, section, index, order },
                        section,
                        index,
                        { revisitDate: newDate.toISOString() }
                      );
                    }
                  }}
                  initialFocus
                />
              </div>
            </PopoverContent>
          </Popover>
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