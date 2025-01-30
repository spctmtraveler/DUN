/**
 * Task.jsx
 * Renders an individual task item with its controls and interactions.
 * Includes completion checkbox, title, date picker, and delete button.
 */

import React from 'react';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

/**
 * Task Component
 * @param {Object} props
 * @param {number} props.id - Task ID
 * @param {string} props.title - Task title
 * @param {string} props.section - Task section (Triage/A/B/C)
 * @param {boolean} props.completed - Task completion status
 * @param {boolean} props.selected - Whether the task is currently selected
 * @param {string} props.revisitDate - ISO date string for task revisit date
 * @param {Function} props.onMoveTask - Callback for moving tasks
 * @param {Function} props.onToggleCompletion - Callback for toggling completion
 * @param {Function} props.onDeleteTask - Callback for deleting tasks
 * @param {Function} props.onSelectTask - Callback for selecting tasks
 */
const Task = ({ 
  id, 
  title, 
  section, 
  completed,
  selected,
  revisitDate,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask 
}) => {
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

  /**
   * Handles clicking on the task
   * Prevents selection when clicking controls
   */
  const handleClick = (e) => {
    if (!e.target.closest('.task-controls, .task-checkbox')) {
      onSelectTask(id);
    }
  };

  /**
   * Formats the revisit date for display
   * Shows 'Today' or 'Tomorrow' for those dates
   * Otherwise shows MM/dd format
   */
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
            <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()} onOpenAutoFocus={(e) => e.preventDefault()}>
              <div onClick={(e) => e.stopPropagation()}>
                <CalendarComponent
                  mode="single"
                  selected={revisitDate ? addDays(parseISO(revisitDate), 1) : undefined}
                  onSelect={(date, e) => {
                    if (date) {
                      const newDate = new Date(date);
                      newDate.setDate(newDate.getDate() - 1); 
                      newDate.setHours(12, 0, 0, 0);
                      updateTaskMutation.mutate({
                        id,
                        revisitDate: newDate.toISOString()
                      });
                      const popoverElement = e?.target?.closest('[data-radix-popper-content-wrapper]');
                      if (popoverElement) {
                        const closeButton = popoverElement.querySelector('[data-radix-popper-close-trigger]');
                        closeButton?.click();
                      }
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