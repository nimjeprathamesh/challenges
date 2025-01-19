import { motion } from 'framer-motion';
import Badge from './Badge.jsx';

function Tab({ isSelected, onSelect, badgeCaption, children }) {
  return (
    <li>
      <button
        className={isSelected ? 'selected' : undefined}
        onClick={onSelect}
      >
        {children}
        <Badge key={badgeCaption} caption={badgeCaption}></Badge>
      </button>
      {isSelected && (
        <motion.div layoutId='tab-indicator' className="active-tab-indicator" />
      )}
    </li>
  );
}

export default function ChallengeTabs({
  selectedType,
  onSelectType,
  children,
  counts,
}) {
  return (
    <>
      <menu id="tabs">
        <Tab
          isSelected={selectedType === 'active'}
          onSelect={() => onSelectType('active')}
          badgeCaption={counts.active}
        >
          Active
        </Tab>
        <Tab
          isSelected={selectedType === 'completed'}
          onSelect={() => onSelectType('completed')}
          badgeCaption={counts.completed}
        >
          Completed
        </Tab>
        <Tab
          isSelected={selectedType === 'failed'}
          onSelect={() => onSelectType('failed')}
          badgeCaption={counts.failed}
        >
          Failed
        </Tab>
      </menu>
      <div>{children}</div>
    </>
  );
}
