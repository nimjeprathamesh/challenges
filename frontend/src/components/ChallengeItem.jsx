import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { ChallengesContext } from '../store/challenges-context.jsx';
import { BACKEND_URL } from '../utils/constants.jsx';

export default function ChallengeItem({
  challenge,
  onViewDetails,
  isExpanded,
  type,
}) {
  const { updateChallengeStatus } = useContext(ChallengesContext);

  const formattedDate = new Date(challenge.deadline).toLocaleDateString(
    'en-US',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );

  let selectedType = null;
  if(type === "active") {
    selectedType = "active_challenges";
  } else if(type === "completed") {
    selectedType = "completed_challenges";
  } else if(type === "failed") {
    selectedType = "failed_challenges";
  }

  async function handleCancel() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          fromTable: selectedType, // Current tab
          toTable: 'failed_challenges',
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update challenge');
      } else {
        console.log('Success:', data);
      }
  
      updateChallengeStatus(challenge.id, 'failed');
    } catch (error) {
      console.error('Error marking challenge as failed:', error);
    }
  }

  async function handleComplete() {
    try {
      const response = await fetch(`${BACKEND_URL}/api/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: challenge.id,
          fromTable: selectedType, // Current tab
          toTable: 'completed_challenges',
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update challenge');
      } else {
        console.log('Success:', data);
      }
  
      updateChallengeStatus(challenge.id, 'completed');
    } catch (error) {
      console.error('Error marking challenge as completed:', error);
    }
  }

  return (
    <motion.li layout exit={{y: -30, opacity: 0}}>
      <article className="challenge-item">
        <header>
          <img {...challenge.image} />
          <div className="challenge-item-meta">
            <h2>{challenge.title}</h2>
            <p>Complete until {formattedDate}</p>
            <p className="challenge-item-actions">
              <button onClick={handleCancel} className="btn-negative">
                Mark as failed
              </button>
              <button onClick={handleComplete}>Mark as completed</button>
            </p>
          </div>
        </header>
        <div className={'challenge-item-details'}>
          <p>
            <button onClick={onViewDetails}>
              View Details{' '}
              <motion.span
                animate={{rotate: isExpanded ? 180 : 0}}
                className="challenge-item-details-icon"
              >
                &#9650;
              </motion.span>
            </button>
          </p>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{height: 0, opacity: 0}}
                animate={{height: 'auto', opacity: 1}}
                exit={{height: 0, opacity: 0}}
              >
                <p className="challenge-item-description">
                  {challenge.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </article>
    </motion.li>
  );
}
