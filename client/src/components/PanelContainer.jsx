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
    const overId = parseInt(over.id);
    const overTask = tasks.find(t => t.id === overId);

    if (!activeTask) {
      console.log('[DragEnd] Active task not found:', activeId);
      return;
    }

    // Get target section ID - either from the over task or from the droppable section
    const targetSection = overTask ? overTask.section : over.data.current?.sectionId;

    if (!targetSection || !['Triage', 'A', 'B', 'C'].includes(targetSection)) {
      console.log('[DragEnd] Invalid target section:', targetSection);
      return;
    }

    // Get ALL tasks in target section and sort by order
    const sectionTasks = tasks
      .filter(task => task.section === targetSection)
      .sort((a, b) => a.order - b.order);

    // Create a full copy of section tasks excluding the active task
    const updatedTasks = sectionTasks.filter(t => t.id !== activeId);

    let newOrder;
    if (overTask) {
      const overIndex = updatedTasks.findIndex(t => t.id === overId);

      if (overIndex === -1) {
        // Over task not found - append to end
        newOrder = (updatedTasks.length === 0) 
          ? 10000 
          : updatedTasks[updatedTasks.length - 1].order + 10000;
      } else if (overIndex === 0) {
        // Dropped at start - place before first
        newOrder = updatedTasks[0].order / 2;
      } else {
        // Calculate midpoint between tasks
        const prevOrder = updatedTasks[overIndex - 1].order;
        const nextOrder = updatedTasks[overIndex].order;
        newOrder = (prevOrder + nextOrder) / 2;
      }
    } else {
      // Dropping into empty section or at the end
      newOrder = updatedTasks.length === 0 
        ? 10000 
        : updatedTasks[updatedTasks.length - 1].order + 10000;
    }

    // Insert task at correct position
    const updatedTask = {
      ...activeTask,
      section: targetSection,
      order: newOrder
    };

    // Find insert position based on order
    const insertIndex = updatedTasks.findIndex(t => t.order > newOrder);
    if (insertIndex === -1) {
      updatedTasks.push(updatedTask);
    } else {
      updatedTasks.splice(insertIndex, 0, updatedTask);
    }

    // Recalculate all orders to ensure even spacing
    const finalTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: (index + 1) * 10000
    }));

    console.log(`[DragEnd] Moving task ${activeId} to section ${targetSection} with order ${newOrder}`);
    onReorderTasks(targetSection, finalTasks);
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