import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  // Increase stale time to prevent unnecessary refetches
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 5000,
  });

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
      return res.json();
    },
    onMutate: async ({ id, ...data }) => {
      console.log(`[updateTaskMutation.onMutate] Starting optimistic update for task ${id}:`, data);
      await queryClient.cancelQueries({ queryKey: ['/api/tasks'] });
      const previousTasks = queryClient.getQueryData(['/api/tasks']);

      queryClient.setQueryData(['/api/tasks'], old => 
        old.map(task => task.id === id ? { ...task, ...data } : task)
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      console.error('[updateTaskMutation.onError]', err);
      if (context?.previousTasks) {
        queryClient.setQueryData(['/api/tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      }, 1000);
    },
  });

  const handleReorderTasks = async (sectionId, reorderedTasks) => {
    console.log(`[handleReorderTasks] Starting reorder in section ${sectionId}`);

    try {
      // Calculate new orders with larger gaps to prevent decimal issues
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        section: sectionId, // Include section in update
        order: (index + 1) * 10000
      }));

      // Optimistically update the UI
      queryClient.setQueryData(['/api/tasks'], old => {
        const updated = [...old];
        updates.forEach(update => {
          const index = updated.findIndex(t => t.id === update.id);
          if (index !== -1) {
            updated[index] = { 
              ...updated[index], 
              order: update.order,
              section: update.section
            };
          }
        });
        return updated;
      });

      // Update tasks sequentially to maintain order
      for (const update of updates) {
        await updateTaskMutation.mutateAsync({
          id: update.id,
          section: update.section,
          order: update.order
        });
      }

    } catch (error) {
      console.error('[handleReorderTasks] Error:', error);
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  };

  // Other handlers remain unchanged
  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleAddTask = (taskTitle) => {
    if (!taskTitle.trim()) return;
    const maxOrder = tasks.length ? Math.max(...tasks.map(t => t.order)) : 0;
    createTaskMutation.mutate({
      title: taskTitle,
      section: 'Triage',
      completed: false,
      order: maxOrder + 10000
    });
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