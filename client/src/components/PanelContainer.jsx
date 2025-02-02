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

    if (!active || !over) {
      console.log('[DragEnd] No valid drop target');
      return;
    }

    const activeId = parseInt(active.id);
    const activeTask = tasks.find(t => t.id === activeId);

    if (!activeTask) {
      console.log('[DragEnd] Task not found:', activeId);
      return;
    }

    // Get target section ID directly from the data property
    const targetSection = over.data.current?.sectionId;

    if (!targetSection || !['Triage', 'A', 'B', 'C'].includes(targetSection)) {
      console.log('[DragEnd] Invalid target section:', targetSection);
      return;
    }

    // Get tasks in target section and sort by order
    const targetSectionTasks = tasks
      .filter(task => task.section === targetSection)
      .sort((a, b) => a.order - b.order);

    // Calculate new order
    let newOrder;
    if (targetSectionTasks.length === 0) {
      newOrder = 10000;
    } else {
      const lastTask = targetSectionTasks[targetSectionTasks.length - 1];
      newOrder = lastTask.order + 10000;
    }

    // Create updated task list
    const updatedTasks = tasks.filter(t => t.section === targetSection);
    if (activeTask.section !== targetSection) {
      updatedTasks.push({
        ...activeTask,
        section: targetSection,
        order: newOrder
      });
    }

    console.log(`[DragEnd] Moving task ${activeId} to section ${targetSection} with order ${newOrder}`);
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