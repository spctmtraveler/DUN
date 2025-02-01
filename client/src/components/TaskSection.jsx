import React, { useState, useCallback, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  useSortable
} from '@dnd-kit/sortable';
import { 
  SortableContext, 
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import SortableTask from './SortableTask';

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

  // Make the section droppable
  const { setNodeRef } = useDroppable({
    id: `section-${id}`,
  });

  // Memoize sorted tasks to prevent unnecessary re-renders
  const sortedTasks = useMemo(() => {
    return [...tasks].filter(task => task.section === id)
      .sort((a, b) => a.order - b.order);
  }, [tasks, id]);

  console.log(`[TaskSection ${id}] Rendering with ${sortedTasks.length} tasks`);
  sortedTasks.forEach(t => console.log(`[TaskSection ${id}] Task ${t.id}: order=${t.order}`));

  return (
    <div className="task-section" data-section-id={id} ref={setNodeRef}>
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronRight className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} size={16} />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
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
        </div>
      )}
    </div>
  );
};

export default React.memo(TaskSection);