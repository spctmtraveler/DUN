/**
 * Task.jsx
 * Renders an individual task item with its controls and interactions.
 * Includes drag and drop functionality, completion checkbox, title, date picker, and delete button.
 */

import React, { useState, useRef } from 'react';
import { Grip, Calendar, X } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useDrag, useDrop } from 'react-dnd';
import TaskDragPreview from './TaskDragPreview';

const TASK_DND_TYPE = 'task';

/**
 * Task Component
 * @param {Object} props
 * @param {number} props.id - Task ID
 * @param {string} props.title - Task title
 * @param {string} props.section - Task section (Triage/A/B/C)
 * @param {boolean} props.completed - Task completion status
 * @param {boolean} props.selected - Whether the task is currently selected
 * @param {string} props.revisitDate - ISO date string for task revisit date
 * @param {Function} props.onToggleCompletion - Callback for toggling completion
 * @param {Function} props.onDeleteTask - Callback for deleting tasks
 * @param {Function} props.onSelectTask - Callback for selecting tasks
 * @param {number} props.index - Task's index in the list
 * @param {Function} props.moveTask - Callback for reordering tasks
 * @param {number} props.order - Task order in the list
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
  onSelectTask,
  index,
  moveTask,
  order 
}) => {
  // State to control the date picker popover
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const queryClient = useQueryClient();
  const ref = useRef(null);

  // Mutation for updating task date
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

  // Set up drag source
  const [{ isDragging }, drag, preview] = useDrag({
    type: TASK_DND_TYPE,
    item: () => {
      console.log('Drag started:', { id, index, title, order });
      return { id, index, title, completed, revisitDate, order };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: TASK_DND_TYPE,
    hover(item, monitor) {
      if (!ref.current) {
        console.log('No ref found for drop target');
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        console.log('Same index, skipping hover:', dragIndex);
        return;
      }

      console.log('Hover detected:', {
        dragIndex,
        hoverIndex,
        dragId: item.id,
        hoverId: id,
        dragOrder: item.order,
        hoverOrder: order
      });

      // Get rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      console.log('Position calculations:', {
        hoverMiddleY,
        hoverClientY,
        shouldSkip: (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) ||
                   (dragIndex > hoverIndex && hoverClientY > hoverMiddleY)
      });

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Time to actually perform the action
      console.log('Calling moveTask:', { dragIndex, hoverIndex });
      moveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Initialize drag and drop refs
  drag(drop(ref));

  const opacity = isDragging ? 0 : 1;

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
      ref={ref}
      className={`task ${selected ? 'selected' : ''} ${completed ? 'completed' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
      onClick={handleClick}
      style={{ opacity }}
    >
      <div className="task-content">
        <div className="task-grip" ref={drag}>
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
                    // Update the revisit date without affecting order
                    updateTaskMutation.mutate({
                      id,
                      revisitDate: newDate.toISOString()
                    });
                    // Close the date picker
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