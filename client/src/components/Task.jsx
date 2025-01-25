import React, { useRef } from 'react';
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
  completed,
  selected,
  revisitDate,
  onMoveTask,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask 
}) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: () => {
      console.debug('DnD: Starting drag', { id, title, section, index });
      return {
        id,
        title,
        section,
        index,
        revisitDate
      };
    },
    end: (item, monitor) => {
      console.debug('DnD: Ending drag', { 
        item, 
        dropResult: monitor.getDropResult(),
        didDrop: monitor.didDrop()
      });
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && item.section === section) {
        return;
      }

      console.debug('DnD: Task hover', {
        dragTask: { id: item.id, index: dragIndex, section: item.section },
        hoverTask: { id, index: hoverIndex, section }
      });

      onMoveTask(item, section, hoverIndex, {
        revisitDate: item.revisitDate
      });

      item.index = hoverIndex;
      item.section = section;
    },
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver()
      }
    }
  });

  drag(drop(ref));

  const handleClick = (e) => {
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
      ref={ref}
      className={`task ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''} ${selected ? 'selected' : ''} ${completed ? 'completed' : ''}`}
      onClick={handleClick}
      data-handler-id={handlerId}
      data-task-id={id}
      data-section={section}
      data-index={index}
    >
      <div className="task-content">
        <div className="drag-handle">
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
                        { id, title, section, index },
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