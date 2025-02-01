import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = parseInt(active.id);
    const activeTask = tasks.find(t => t.id === activeId);

    if (!activeTask) return;

    // Extract section ID from the over.id (format: section-{sectionId})
    const targetSection = over.id.replace('section-', '');

    // Get tasks in target section
    const targetSectionTasks = tasks
      .filter(task => task.section === targetSection)
      .sort((a, b) => a.order - b.order);

    let newOrder;
    if (targetSectionTasks.length === 0) {
      newOrder = 10000;
    } else {
      // Place at the end of the target section
      newOrder = targetSectionTasks[targetSectionTasks.length - 1].order + 10000;
    }

    // Create updated task list
    const updatedTasks = [...targetSectionTasks];
    if (activeTask.section !== targetSection) {
      updatedTasks.push({ ...activeTask, section: targetSection, order: newOrder });
    }

    console.log(`[PanelContainer] Moving task ${activeId} to section ${targetSection} with order ${newOrder}`);
    onReorderTasks(targetSection, updatedTasks);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
    </DndContext>
  );
};

export default PanelContainer;