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
    if (hoverIndex === 0) {
      // Moving to the start: use half of first task's order
      newOrder = Math.max(1, targetTask.order / 2);
      console.log('📏 Calculating start position:', { newOrder, targetOrder: targetTask.order });
    } else if (hoverIndex === tasks.length - 1) {
      // Moving to the end: add 1000 to last task's order
      newOrder = targetTask.order + 1000;
      console.log('📏 Calculating end position:', { newOrder, targetOrder: targetTask.order });
    } else {
      // Moving between tasks: use midpoint
      const prevTask = tasks[hoverIndex - 1];
      newOrder = (prevTask.order + targetTask.order) / 2;
      console.log('📏 Calculating middle position:', { 
        newOrder, 
        prevOrder: prevTask.order, 
        targetOrder: targetTask.order 
      });
    }

    // Ensure order is a valid number
    if (typeof newOrder === 'number' && !isNaN(newOrder)) {
      console.log('✨ Updating task order:', {
        taskId: draggedTask.id,
        oldOrder: draggedTask.order,
        newOrder,
        dragIndex,
        hoverIndex
      });

      updateTaskOrderMutation.mutate({
        id: draggedTask.id,
        order: newOrder
      });
    } else {
      console.error('❌ Invalid order calculation:', { newOrder });
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