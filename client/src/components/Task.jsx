import React, { useRef } from 'react';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useDrag, useDrop } from 'react-dnd';

const TASK_DND_TYPE = 'task';

const Task = ({ 
  id, 
  title, 
  section, 
  completed,
  selected,
  revisitDate,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  index,
  moveTask,
  order 
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: TASK_DND_TYPE,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
  });

  const [, drop] = useDrop({
    accept: TASK_DND_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveTask(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  // Setup mutation for updating task date
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

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

  drag(drop(ref));

  return (
    <div 
      ref={ref}
      className={`task ${selected ? 'selected' : ''} ${completed ? 'completed' : ''}`}
      onClick={handleClick}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="task-content">
        <div className="task-grip">
          <Grip size={16} />
        </div>
        <input 
          type="checkbox" 
          className="task-checkbox" 
          checked={completed}
          onChange={() => onToggleCompletion(id, completed)}
        />
        <span className="task-title">{title}</span>
        <div className="task-controls">
          <span className="task-date-label">
            {formatDate(revisitDate)}
          </span>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <button 
                className="task-date"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
              <CalendarComponent
                mode="single"
                selected={revisitDate ? addDays(parseISO(revisitDate), 1) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setDate(newDate.getDate() - 1);
                    newDate.setHours(12, 0, 0, 0);
                    updateTaskMutation.mutate({
                      id,
                      revisitDate: newDate.toISOString()
                    });
                    setIsDatePickerOpen(false);
                  }
                }}
                initialFocus
              />
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