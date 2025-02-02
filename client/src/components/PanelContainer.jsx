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

    // Get tasks in target section and sort by order
    const sectionTasks = tasks
      .filter(task => task.section === targetSection)
      .sort((a, b) => a.order - b.order);

    let newOrder;

    if (overTask) {
      // Dropping on another task - calculate order between tasks
      const overTaskIndex = sectionTasks.findIndex(t => t.id === overId);

      if (overTaskIndex === 0) {
        // Dropped on first task - place before it
        newOrder = sectionTasks[0].order / 2;
      } else if (overTaskIndex === sectionTasks.length - 1) {
        // Dropped on last task - place after it
        newOrder = sectionTasks[overTaskIndex].order + 10000;
      } else {
        // Dropped between tasks - calculate middle point
        const prevTask = sectionTasks[overTaskIndex - 1];
        const nextTask = sectionTasks[overTaskIndex];
        newOrder = (prevTask.order + nextTask.order) / 2;
      }
    } else {
      // Dropping into empty section or at the end
      newOrder = sectionTasks.length === 0 ? 10000 : 
        sectionTasks[sectionTasks.length - 1].order + 10000;
    }

    // Create updated task list maintaining relative order
    const updatedTasks = sectionTasks.filter(t => t.id !== activeId);
    const updatedTask = {
      ...activeTask,
      section: targetSection,
      order: newOrder
    };

    // Insert the task at the appropriate position
    const insertIndex = updatedTasks.findIndex(t => t.order > newOrder);
    if (insertIndex === -1) {
      updatedTasks.push(updatedTask);
    } else {
      updatedTasks.splice(insertIndex, 0, updatedTask);
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