import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import useFetch from '../hooks/useFetch.jsx';
import ChallengeItem from './ChallengeItem.jsx';
import ChallengeTabs from './ChallengeTabs.jsx';

export default function Challenges() {
  // const { challenges } = useContext(ChallengesContext);
  const { data: activeData } = useFetch('/api/active');
  const { data: failedData } = useFetch('/api/failed');
  const { data: completedData } = useFetch('/api/completed');
  const [selectedType, setSelectedType] = useState('active');
  const [expanded, setExpanded] = useState(null);

  function handleSelectType(newType) {
    setSelectedType(newType);
  }

  function handleViewDetails(id) {
    setExpanded((prevId) => {
      if (prevId === id) {
        return null;
      }

      return id;
    });
  }

  const filteredChallenges = {
    active: activeData,
    completed: completedData,
    failed: failedData,
  };

  const displayedChallenges = filteredChallenges[selectedType];

  return (
    <div id="challenges">
      <ChallengeTabs
        onSelectType={handleSelectType}
        selectedType={selectedType}
        counts={{
          active: activeData?.length || 0,
          completed: completedData?.length || 0,
          failed: failedData?.length || 0,
        }}
      >
        <AnimatePresence mode='wait'>
          {displayedChallenges.length > 0 && (
            <motion.ol
              key='list'
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              exit={{y: -30, opacity: 0}}
              className="challenge-items"
            >
              <AnimatePresence>
                {displayedChallenges.map((challenge) => (
                  <ChallengeItem
                    key={challenge.id}
                    type={selectedType}
                    challenge={challenge}
                    onViewDetails={() => handleViewDetails(challenge.id)}
                    isExpanded={expanded === challenge.id}
                  />
                ))}
              </AnimatePresence>
            </motion.ol>
          )}
          {displayedChallenges.length === 0 && (
            <p
              key='fallback'
            >
              No challenges found.
            </p>
          )}
        </AnimatePresence>
      </ChallengeTabs>
    </div>
  );
}
