import React, { useState } from 'react';
import Banner from '../components/Banner';
import PanelContainer from '../components/PanelContainer';
import config from '../config.json';

const Home = () => {
  const [visiblePanels, setVisiblePanels] = useState(
    Object.fromEntries(config.panels.map(panel => [panel.id, true]))
  );

  const [tasks, setTasks] = useState([]);

  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleAddTask = (taskTitle) => {
    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle,
      section: 'Triage',
      completed: false,
      order: tasks.length * 1000
    };

    setTasks(prev => [...prev, newTask]);
  };

  const moveTask = (draggedTask, targetSection, targetIndex) => {
    setTasks(prevTasks => {
      const tasksCopy = [...prevTasks];
      const sectionTasks = tasksCopy.filter(t => t.section === targetSection);

      // Remove the task from its current position
      const taskIndex = tasksCopy.findIndex(t => t.id === draggedTask.id);
      if (taskIndex > -1) {
        tasksCopy.splice(taskIndex, 1);
      }

      // Calculate new order
      let newOrder;
      if (sectionTasks.length === 0) {
        newOrder = 10000; // First task in section
      } else if (targetIndex === 0) {
        newOrder = sectionTasks[0].order / 2; // Before first task
      } else if (targetIndex >= sectionTasks.length) {
        newOrder = sectionTasks[sectionTasks.length - 1].order + 1000; // After last task
      } else {
        // Between two tasks
        newOrder = (sectionTasks[targetIndex - 1].order + sectionTasks[targetIndex].order) / 2;
      }

      // Insert the task at the new position with updated section and order
      const updatedTask = { ...draggedTask, section: targetSection, order: newOrder };
      tasksCopy.push(updatedTask);

      // Sort tasks by section and order
      return tasksCopy.sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section); //Added for section sorting
        return a.order - b.order;
      });
    });
  };

  return (
    <div className="app-container">
      <Banner 
        visiblePanels={visiblePanels} 
        togglePanel={togglePanel} 
        onAddTask={handleAddTask}
      />
      <PanelContainer 
        visiblePanels={visiblePanels} 
        tasks={tasks}
        onMoveTask={moveTask}
      />
    </div>
  );
};

export default Home;