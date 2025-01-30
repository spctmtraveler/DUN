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
    staleTime: 500, // Prevent aggressive refetching
  });

  // Task mutations remain unchanged except updateTaskMutation
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
    onMutate: async ({ id, order }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['/api/tasks']);

      // Optimistically update to the new value
      queryClient.setQueryData(['/api/tasks'], old => 
        old.map(task => 
          task.id === id ? { ...task, order } : task
        )
      );

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(['/api/tasks'], context.previousTasks);
    },
    onSettled: () => {
      // Always refetch after error or success
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
    try {
      // Calculate new order values with consistent spacing
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order: (index + 1) * 10000 // Use larger gaps (10000) to prevent floating point issues
      }));

      // Update tasks in parallel with optimistic updates
      await Promise.all(
        updates.map(update => 
          updateTaskMutation.mutateAsync({
            id: update.id,
            order: update.order
          })
        )
      );
    } catch (error) {
      console.error('Error reordering tasks:', error);
      // Error handling is managed by the mutation
    }
  };

  const getFilteredTasks = () => {
    if (activeFilter === 'all') return tasks;
    if (activeFilter === 'triage') return tasks.filter(task => task.section === 'Triage');

    const today = new Date();
    const intervals = {
      today: {
        start: startOfDay(today),
        end: endOfDay(today)
      },
      tomorrow: {
        start: startOfDay(addDays(today, 1)),
        end: endOfDay(addDays(today, 1))
      },
      thisWeek: {
        start: startOfWeek(today),
        end: endOfWeek(today)
      },
      nextWeek: {
        start: startOfWeek(addDays(today, 7)),
        end: endOfWeek(addDays(today, 7))
      },
      thisMonth: {
        start: startOfMonth(today),
        end: endOfMonth(today)
      },
      nextMonth: {
        start: startOfMonth(addDays(endOfMonth(today), 1)),
        end: endOfMonth(addDays(endOfMonth(today), 1))
      }
    };

    if (intervals[activeFilter]) {
      return tasks.filter(task => {
        if (!task.revisitDate) return false;
        const taskDate = parseISO(task.revisitDate);
        return isWithinInterval(taskDate, intervals[activeFilter]);
      });
    }

    return tasks;
  };

  const filteredTasks = getFilteredTasks();

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
      order: maxOrder + 1000
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
        tasks={filteredTasks}
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