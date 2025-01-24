import React from 'react';
import { Target, List, Check, Calendar, Lightbulb, Hourglass } from 'lucide-react';
import config from '../config.json';

const iconMap = {
  target: Target,
  list: List,
  check: Check,
  calendar: Calendar,
  lightbulb: Lightbulb,
  hourglass: Hourglass
};

const ToggleSwitches = ({ visiblePanels, togglePanel }) => {
  return (
    <div className="toggle-switches">
      {config.panels.map((panel) => {
        const Icon = iconMap[panel.icon];
        return (
          <button
            key={panel.id}
            className={`toggle-switch ${visiblePanels[panel.id] ? 'active' : ''}`}
            onClick={() => togglePanel(panel.id)}
            title={`Toggle ${panel.title} panel`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
};

export default ToggleSwitches;