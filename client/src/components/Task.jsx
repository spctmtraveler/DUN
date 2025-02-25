import React, { useState } from 'react';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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
  dragHandleProps,
  // Destructure but don't use these props to prevent them from being passed to DOM
  createdAt,
  updatedAt,
  order,
  ...otherProps // Any other valid DOM props
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteTaskMutation.mutateAsync(id);
      onDeleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleClick = (e) => {
    // Don't trigger selection when clicking controls
    if (!e.target.closest('.task-controls, .task-checkbox, .task-grip')) {
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
      className={`task ${selected ? 'selected' : ''} ${completed ? 'completed' : ''}`}
      onClick={handleClick}
      {...otherProps}
    >
      <div className="task-content">
        <div className="task-grip" {...dragHandleProps}>
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
            {formatDate(revisitDate) || 'Set date'}
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
            onClick={handleDelete}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Task);