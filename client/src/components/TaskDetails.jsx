import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

const TaskDetails = ({ task, onClose }) => {
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
        revisitDate: task.revisitDate ? format(new Date(task.revisitDate), 'yyyy-MM-dd') : ''
      });
    }
  }, [task]);

  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    updateTaskMutation.mutate({ ...formData, [name]: value });
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
};

export default TaskDetails;
