import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Task from './Task';

const TaskSection = ({ 
  id, 
  title, 
  tasks = [], 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const queryClient = useQueryClient();

  // Mutation for updating task order
  const updateTaskOrderMutation = useMutation({
    mutationFn: async ({ id, order }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error('Failed to update task order');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const moveTask = (dragIndex, hoverIndex) => {
    const draggedTask = tasks[dragIndex];
    const targetTask = tasks[hoverIndex];

    if (!draggedTask || !targetTask) return;

    // Calculate new order value
    let newOrder;
    if (hoverIndex === 0) {
      // Moving to the start
      newOrder = targetTask.order - 1000;
    } else if (hoverIndex === tasks.length - 1) {
      // Moving to the end
      newOrder = (targetTask.order + 1000);
    } else {
      // Moving between two tasks
      const prevTask = tasks[hoverIndex - 1];
      newOrder = (prevTask.order + targetTask.order) / 2;
    }

    // Update the task's order in the database
    updateTaskOrderMutation.mutate({
      id: draggedTask.id,
      order: newOrder
    });
  };

  return (
    <div 
      className="task-section"
      data-section-id={id}
    >
      <div 
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} 
          size={16} 
        />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              {...task}
              index={index}
              moveTask={moveTask}
              onToggleCompletion={onToggleCompletion}
              onDeleteTask={onDeleteTask}
              onSelectTask={onSelectTask}
              selected={task.id === selectedTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSection;