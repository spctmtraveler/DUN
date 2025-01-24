import React, { useState } from 'react';
import Banner from '../components/Banner';
import PanelContainer from '../components/PanelContainer';
import config from '../config.json';

const Home = () => {
  const [visiblePanels, setVisiblePanels] = useState(
    Object.fromEntries(config.panels.map(panel => [panel.id, true]))
  );

  const togglePanel = (panelId) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  return (
    <div className="app-container">
      <Banner visiblePanels={visiblePanels} togglePanel={togglePanel} />
      <PanelContainer visiblePanels={visiblePanels} />
    </div>
  );
};

export default Home;