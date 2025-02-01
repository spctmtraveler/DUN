import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Task from './Task';

const SortableTask = ({ id, ...props }) => {
  console.log(`[SortableTask ${id}] Rendering`);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  console.log(`[SortableTask ${id}] isDragging: ${isDragging}, transform:`, transform);

  const style = {
    transform: CSS.Transform.toString(transform) || 'translate3d(0, 0, 0)',
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
    touchAction: 'none',
  };

  console.log(`[SortableTask ${id}] Applied style:`, style);

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Task 
        id={id} 
        dragHandleProps={listeners} 
        {...props} 
      />
    </div>
  );
};

export default SortableTask;