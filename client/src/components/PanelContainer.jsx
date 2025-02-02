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
      return element.parentElement ? getSectionId(element.parentElement) : null;
    };

    // Try to get section ID from over data first, then fallback to DOM traversal
    const targetSectionId = over.data?.current?.sectionId || getSectionId(over.node);

    if (!targetSectionId || !['Triage', 'A', 'B', 'C'].includes(targetSectionId)) {
      console.error("[DragEnd] Invalid target section:", targetSectionId);
      return;
    }

    // Get all tasks in the target section, sorted by order
    const sectionTasks = tasks
      .filter(task => task.section === targetSectionId)
      .sort((a, b) => a.order - b.order);

    // Remove the dragged task from the section's task list
    const filteredTasks = sectionTasks.filter(task => task.id !== draggedTaskId);

    // Try to get destination index from the drop target
    let destIndex;
    if (over.data?.current?.sortable?.index !== undefined) {
      // If dropping on another task, use its index
      destIndex = over.data.current.sortable.index;
    } else {
      // If dropping in a section (not on a task), append to the end
      destIndex = filteredTasks.length;
    }

    // Insert the dragged task at the computed position
    filteredTasks.splice(destIndex, 0, {
      ...draggedTask,
      section: targetSectionId
    });

    // Recalculate orders for all tasks in the section
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