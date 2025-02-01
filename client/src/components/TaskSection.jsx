import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';
import Task from './Task';

const TaskSection = ({ 
  id, 
  title, 
  tasks = [], 
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId,
  onReorderTasks
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const shouldEnableDragAndDrop = id === 'Triage';

  // Memoize sorted tasks to prevent unnecessary re-renders
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex(task => task.id === parseInt(active.id));
      const newIndex = sortedTasks.findIndex(task => task.id === parseInt(over.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(sortedTasks, oldIndex, newIndex);
        onReorderTasks(id, newTasks);
      }
    }
  }, [sortedTasks, id, onReorderTasks]);

  const renderTasks = () => {
    if (shouldEnableDragAndDrop) {
      return (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sortedTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedTasks.map((task) => (
              <SortableTask
                key={task.id}
                {...task}
                onToggleCompletion={onToggleCompletion}
                onDeleteTask={onDeleteTask}
                onSelectTask={onSelectTask}
                selected={task.id === selectedTaskId}
              />
            ))}
          </SortableContext>
        </DndContext>
      );
    }

    return sortedTasks.map((task) => (
      <Task
        key={task.id}
        {...task}
        onToggleCompletion={onToggleCompletion}
        onDeleteTask={onDeleteTask}
        onSelectTask={onSelectTask}
        selected={task.id === selectedTaskId}
      />
    ));
  };

  return (
    <div className="task-section" data-section-id={id}>
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronRight className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} size={16} />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {renderTasks()}
        </div>
      )}
    </div>
  );
};

// Prevent unnecessary re-renders
export default React.memo(TaskSection);