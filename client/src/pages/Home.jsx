/**
 * Home.jsx
 * Main container component for the task management application.
 * Manages global state and coordinates interactions between components.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import Banner from '../components/Banner';
import PanelContainer from '../components/PanelContainer';
import config from '../config.json';

const Home = () => {
  const [visiblePanels, setVisiblePanels] = useState(
    Object.fromEntries(config.panels.map(panel => [panel.id, true]))
  );
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 500,
  });

  // Task mutations remain unchanged except updateTaskMutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, ...data }) => {
      console.log(`[updateTaskMutation] Starting update for task ${id}:`, data);
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[updateTaskMutation] Failed to update task ${id}:`, errorText);
        throw new Error(`Failed to update task: ${errorText}`);
      }
      const result = await res.json();
      console.log(`[updateTaskMutation] Successfully updated task ${id}:`, result);
      return result;
    },
    onMutate: async ({ id, ...data }) => {
      console.log(`[updateTaskMutation.onMutate] Starting optimistic update for task ${id}:`, data);
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });

      const previousTasks = queryClient.getQueryData(['/api/tasks']);
      console.log('[updateTaskMutation.onMutate] Previous tasks:', previousTasks);

      queryClient.setQueryData(['/api/tasks'], old => {
        const updated = old.map(task => 
          task.id === id ? { ...task, ...data } : task
        );
        console.log('[updateTaskMutation.onMutate] Updated tasks:', updated);
        return updated;
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      console.error('[updateTaskMutation.onError] Error updating task:', err);
      console.log('[updateTaskMutation.onError] Rolling back to previous state:', context.previousTasks);
      queryClient.setQueryData(['/api/tasks'], context.previousTasks);
    },
    onSettled: () => {
      console.log('[updateTaskMutation.onSettled] Invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  // Handle reordering tasks within a section
  const handleReorderTasks = async (sectionId, reorderedTasks) => {
    console.log(`[handleReorderTasks] Starting reorder in section ${sectionId}`);
    console.log('[handleReorderTasks] Reordered tasks:', reorderedTasks);

    try {
      // Calculate new order values with consistent spacing
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order: (index + 1) * 10000
      }));

      console.log('[handleReorderTasks] Calculated updates:', updates);

      // First, update the optimistic state
      queryClient.setQueryData(['/api/tasks'], old => {
        const updated = [...old];
        updates.forEach(update => {
          const index = updated.findIndex(t => t.id === update.id);
          if (index !== -1) {
            updated[index] = { ...updated[index], order: update.order };
          }
        });
        return updated;
      });

      // Then update tasks in parallel
      await Promise.all(
        updates.map(update => {
          console.log(`[handleReorderTasks] Updating task ${update.id} with order ${update.order}`);
          return updateTaskMutation.mutateAsync({
            id: update.id,
            order: update.order
          });
        })
      );

      console.log('[handleReorderTasks] All updates completed successfully');
    } catch (error) {
      console.error('[handleReorderTasks] Error reordering tasks:', error);
      // Invalidate queries to refresh the state
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  };

  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleAddTask = (taskTitle) => {
    if (!taskTitle.trim()) return;

    const maxOrder = tasks.length ? Math.max(...tasks.map(t => t.order)) : 0;
    const newTask = {
      title: taskTitle,
      section: 'Triage',
      completed: false,
      order: maxOrder + 10000
    };

    createTaskMutation.mutate(newTask);
  };

  const toggleTaskCompletion = (taskId, currentCompleted) => {
    updateTaskMutation.mutate({
      id: taskId,
      completed: !currentCompleted
    });
  };

  const deleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const selectTask = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="app-container">
      <Banner 
        visiblePanels={visiblePanels} 
        togglePanel={togglePanel} 
        onAddTask={handleAddTask}
        onFilterChange={handleFilterChange}
      />
      <PanelContainer 
        visiblePanels={visiblePanels} 
        tasks={tasks}
        onToggleCompletion={toggleTaskCompletion}
        onDeleteTask={deleteTask}
        onSelectTask={selectTask}
        selectedTaskId={selectedTaskId}
        onReorderTasks={handleReorderTasks}
      />
    </div>
  );
};

export default Home;