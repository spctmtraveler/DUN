import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

const TaskDetails = React.memo(({ task }) => {
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    details: '',
    revisitDate: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        overview: task.overview || '',
        details: task.details || '',
        // Add one day to the date when displaying from database
        revisitDate: task.revisitDate ? format(addDays(parseISO(task.revisitDate), 1), 'yyyy-MM-dd') : ''
      });
    }
  }, [task]);

  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, field, value }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update task: ${errorText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update local state immediately
    if (name === 'revisitDate' && value) {
      const date = new Date(value);
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        [name]: format(date, 'yyyy-MM-dd')
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Only send update if we have a task
    if (task) {
      let updateValue = value;
      if (name === 'revisitDate' && value) {
        const date = new Date(value);
        date.setHours(12, 0, 0, 0);
        updateValue = date.toISOString();
      }

      updateTaskMutation.mutate({
        id: task.id,
        field: name,
        value: updateValue
      }, {
        // Optimistic update
        onMutate: () => {
          queryClient.setQueryData(['/api/tasks'], (oldData) => {
            return oldData.map(t => 
              t.id === task.id 
                ? { ...t, [name]: updateValue }
                : t
            );
          });
        }
      });
    }
  };

  if (!task) {
    return (
      <div className="task-details empty">
        <p>Select a task to view details</p>
      </div>
    );
  }

  return (
    <div className="task-details">
      <div className="details-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="details-input"
          />
        </div>

        <div className="form-group">
          <label>Revisit Date</label>
          <div className="date-input-wrapper">
            <Calendar size={16} />
            <input
              type="date"
              name="revisitDate"
              value={formData.revisitDate}
              onChange={handleChange}
              className="details-input date-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Overview</label>
          <textarea
            name="overview"
            value={formData.overview}
            onChange={handleChange}
            className="details-input"
            placeholder="Brief overview of the task..."
          />
        </div>

        <div className="form-group">
          <label>Details</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="details-input"
            placeholder="Detailed description and notes..."
            rows={6}
          />
        </div>
      </div>
    </div>
  );
});

export default TaskDetails;