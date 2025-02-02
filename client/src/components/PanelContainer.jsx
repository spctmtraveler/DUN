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

  const handleDragEnd = ({ active, over }) => {
    if (!over) {
      console.log('[DragEnd] No valid drop target');
      return;
    }

    // Get active task details
    const draggedTaskId = parseInt(active.id);
    const draggedTask = tasks.find(task => task.id === draggedTaskId);

    if (!draggedTask) {
      console.error("[DragEnd] Dragged task not found:", draggedTaskId);
      return;
    }

    // Get section ID reliably from DOM traversal
    const getSectionId = (element) => {
      if (!element) return null;
      if (element.dataset && element.dataset.sectionId) {
        return element.dataset.sectionId;
      }
      if (element.parentElement) {
        return getSectionId(element.parentElement);
      }
      return null;
    };

    const targetSectionId = over.data?.current?.sectionId || getSectionId(over.node);

    if (!targetSectionId || !['Triage', 'A', 'B', 'C'].includes(targetSectionId)) {
      console.error("[DragEnd] Invalid target section:", targetSectionId);
      return;
    }

    // Get the full sorted list for the target section
    const sectionTasks = tasks
      .filter(task => task.section === targetSectionId)
      .sort((a, b) => a.order - b.order);

    // Remove dragged task from the list if it's in this section
    const filteredTasks = sectionTasks.filter(task => task.id !== draggedTaskId);

    // Compute destination index with fallback
    const destIndex = over.data?.current?.index ?? filteredTasks.length;

    // Insert dragged task at the correct position
    filteredTasks.splice(destIndex, 0, {
      ...draggedTask,
      section: targetSectionId
    });

    // Recalculate all orders sequentially
    const finalTasks = filteredTasks.map((task, index) => ({
      ...task,
      order: (index + 1) * 10000
    }));

    console.log(`[DragEnd] Moving task ${draggedTaskId} to section ${targetSectionId} at index ${destIndex}`);
    onReorderTasks(targetSectionId, finalTasks);
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