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
      />
    </div>
  );
};

export default Home;