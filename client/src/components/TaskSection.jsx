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
      console.log('🚀 Starting order update mutation:', { id, order });

      if (typeof order !== 'number' || isNaN(order)) {
        console.error('❌ Invalid order value:', { order });
        throw new Error('Invalid order value');
      }

      console.log('📤 Sending PATCH request:', { id, order });
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error('❌ Server responded with error:', { status: res.status, error });
        throw new Error(`Failed to update task order: ${error}`);
      }

      const data = await res.json();
      console.log('✅ Server response:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      console.error('💥 Mutation failed:', error);
    }
  });

  const moveTask = (dragIndex, hoverIndex) => {
    console.log('🎯 moveTask called:', { dragIndex, hoverIndex, tasks });

    const draggedTask = tasks[dragIndex];
    const targetTask = tasks[hoverIndex];

    if (!draggedTask || !targetTask) {
      console.error('❌ Invalid task indices:', { draggedTask, targetTask });
      return;
    }

    console.log('📊 Task positions:', {
      draggedTask: { id: draggedTask.id, order: draggedTask.order },
      targetTask: { id: targetTask.id, order: targetTask.order }
    });

    // Calculate new order value
    let newOrder;

    // Ensure we have valid order values
    const draggedOrder = parseFloat(draggedTask.order) || 0;
    const targetOrder = parseFloat(targetTask.order) || 0;

    if (hoverIndex === 0) {
      // Moving to the start: ensure we have a positive number greater than 0
      newOrder = Math.max(1, targetOrder / 2);
      console.log('📏 Calculating start position:', { newOrder, targetOrder });
    } else if (hoverIndex === tasks.length - 1) {
      // Moving to the end: add 1000 to ensure it's bigger than the last task
      newOrder = targetOrder + 1000;
      console.log('📏 Calculating end position:', { newOrder, targetOrder });
    } else {
      // Moving between tasks: calculate midpoint between previous and target tasks
      const prevTask = tasks[hoverIndex - 1];
      const prevOrder = parseFloat(prevTask.order) || 0;

      // Ensure we have valid numbers before calculation
      if (prevOrder > 0 && targetOrder > 0) {
        newOrder = (prevOrder + targetOrder) / 2;
      } else {
        // Fallback if orders are invalid: place between with fixed spacing
        newOrder = targetOrder + 500;
      }

      console.log('📏 Calculating middle position:', { 
        newOrder, 
        prevOrder,
        targetOrder,
        calculation: `(${prevOrder} + ${targetOrder}) / 2`
      });
    }

    // Ensure order is a valid number
    if (typeof newOrder === 'number' && !isNaN(newOrder) && newOrder > 0) {
      console.log('✨ Updating task order:', {
        taskId: draggedTask.id,
        oldOrder: draggedOrder,
        newOrder,
        dragIndex,
        hoverIndex
      });

      updateTaskOrderMutation.mutate({
        id: draggedTask.id,
        order: newOrder
      });
    } else {
      console.error('❌ Invalid order calculation:', { 
        newOrder,
        draggedOrder,
        targetOrder
      });
    }
  };

  return (
    <div className="task-section" data-section-id={id}>
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