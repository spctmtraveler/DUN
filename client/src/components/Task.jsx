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

  // Handle dragging this task
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: () => {
      console.debug('Drag started:', { id, title, section, index });
      return { id, title, section, index, revisitDate };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // Handle dropping other tasks on this task
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && item.section === section) return;

      // Get the rectangle for this task
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get the middle of the task
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Get the mouse position
      const clientOffset = monitor.getClientOffset();
      // Get the pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      console.debug('Task hover move:', {
        from: { index: dragIndex, section: item.section },
        to: { index: hoverIndex, section }
      });

      onMoveTask(item, section, hoverIndex, {
        revisitDate: item.revisitDate
      });

      // Update the index and section reference
      item.index = hoverIndex;
      item.section = section;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  // Combine drag and drop refs
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