import React from 'react';
import Panel from './Panel';
import config from '../config.json';

const PanelContainer = ({ 
  visiblePanels, 
  tasks, 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
  onReorderTasks
}) => {
  const visiblePanelCount = Object.values(visiblePanels).filter(Boolean).length;
  const panelWidth = visiblePanelCount > 0 ? `${100 / visiblePanelCount}%` : '0';

  return (
    <div className="panel-container">
      {config.panels.map((panel) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.title}
          icon={panel.icon}
          isVisible={visiblePanels[panel.id]}
          width={panelWidth}
          tasks={tasks}
          onToggleCompletion={onToggleCompletion}
          onDeleteTask={onDeleteTask}
          onSelectTask={onSelectTask}
          selectedTaskId={selectedTaskId}
          onReorderTasks={onReorderTasks}
        />
      ))}
    </div>
  );
};

export default PanelContainer;