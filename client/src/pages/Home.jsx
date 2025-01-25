import React, { useState, useEffect } from 'react';
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

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Filter tasks based on the active filter
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

  // Create task mutation
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

  // Update task mutation
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

  // Delete task mutation
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

  const moveTask = (draggedTask, targetSection, targetIndex, additionalData = {}) => {
    const sectionTasks = tasks.filter(t => t.section === targetSection);

    let newOrder;
    if (sectionTasks.length === 0) {
      newOrder = 10000;
    } else if (targetIndex === 0) {
      newOrder = sectionTasks[0].order / 2;
    } else if (targetIndex >= sectionTasks.length) {
      newOrder = sectionTasks[sectionTasks.length - 1].order + 1000;
    } else {
      newOrder = (sectionTasks[targetIndex - 1].order + sectionTasks[targetIndex].order) / 2;
    }

    updateTaskMutation.mutate({
      id: draggedTask.id,
      section: targetSection,
      order: newOrder,
      ...additionalData
    });
  };

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        id: taskId,
        completed: !task.completed
      });
    }
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
        onMoveTask={moveTask}
        onToggleCompletion={toggleTaskCompletion}
        onDeleteTask={deleteTask}
        onSelectTask={selectTask}
        selectedTaskId={selectedTaskId}
      />
    </div>
  );
};

export default Home;