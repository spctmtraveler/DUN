import React from 'react';
import Panel from './Panel';
import config from '../config.json';

const PanelContainer = () => {
  return (
    <div className="panel-container">
      {config.panels.map((panel) => (
        <Panel
          key={panel.id}
          title={panel.title}
          icon={panel.icon}
        />
      ))}
    </div>
  );
};

export default PanelContainer;
