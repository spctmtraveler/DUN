/**
 * Home.jsx
 * Main container component for the task management application.
 * Manages global state and coordinates interactions between components.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import Banner from '../components/Banner';
import PanelContainer from '../components/PanelContainer';
import config from '../config.json';
import DragDropProvider from '../components/DndProvider';

const Home = () => {
  // Panel visibility state - initialized from config
  const [visiblePanels, setVisiblePanels] = useState(
    Object.fromEntries(config.panels.map(panel => [panel.id, true]))
  );

  // Currently selected task for editing in the Task Details panel
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Active filter for the task list (e.g., 'all', 'today', 'thisWeek')
  const [activeFilter, setActiveFilter] = useState('all');

  const queryClient = useQueryClient();

  // Fetch all tasks from the backend
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  /**
   * Filters tasks based on the active filter setting.
   * - 'all': Returns all tasks
   * - 'triage': Returns only tasks in the Triage section
   * - 'today', 'tomorrow', 'thisWeek', etc.: Filters by revisit date
   */
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

  // Mutation for creating new tasks
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

  // Mutation for updating existing tasks
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

  // Mutation for deleting tasks
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

  /**
   * Toggles visibility of a panel
   * @param {string} panelId - ID of the panel to toggle
   */
  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  /**
   * Creates a new task
   * @param {string} taskTitle - Title of the new task
   */
  const handleAddTask = (taskTitle) => {
    if (!taskTitle.trim()) return;

    // Calculate the order value for the new task (max + 1000)
    const maxOrder = tasks.length ? Math.max(...tasks.map(t => t.order)) : 0;
    const newTask = {
      title: taskTitle,
      section: 'Triage',
      completed: false,
      order: maxOrder + 1000
    };

    createTaskMutation.mutate(newTask);
  };

  /**
   * Toggles the completion status of a task
   * @param {number} taskId - ID of the task to toggle
   */
  const toggleTaskCompletion = (taskId, currentCompleted) => {
    updateTaskMutation.mutate({
      id: taskId,
      completed: !currentCompleted
    });
  };

  /**
   * Deletes a task
   * @param {number} taskId - ID of the task to delete
   */
  const deleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  /**
   * Selects a task for viewing/editing in the Task Details panel
   * @param {number} taskId - ID of the task to select
   */
  const selectTask = (taskId) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  };

  /**
   * Updates the active filter for tasks
   * @param {string} filter - New filter to apply
   */
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <DragDropProvider>
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
        />
      </div>
    </DragDropProvider>
  );
};

export default Home;