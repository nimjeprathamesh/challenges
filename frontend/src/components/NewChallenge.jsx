import { motion, stagger, useAnimate } from 'framer-motion';
import { useContext, useRef, useState } from 'react';
import images from '../assets/images.js';
import { ChallengesContext } from '../store/challenges-context.jsx';
import { BACKEND_URL } from '../utils/constants.jsx';
import Modal from './Modal.jsx';

export default function NewChallenge({ onDone }) {
  const title = useRef();
  const description = useRef();
  const deadline = useRef();

  const [scope, animate] = useAnimate();

  const [selectedImage, setSelectedImage] = useState(null);
  const { addChallenge } = useContext(ChallengesContext);

  function handleSelectImage(image) {
    setSelectedImage(image);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const challenge = {
      title: title.current.value,
      description: description.current.value,
      deadline: deadline.current.value,
      image: selectedImage,
    };

    console.log("data", challenge);

    if (
      !challenge.title.trim() ||
      !challenge.description.trim() ||
      !challenge.deadline.trim() ||
      !challenge.image
    ) {
      animate('input, textarea', {x: [-10, 0, 10, 0]}, {type: 'spring', duration: 0.2, delay: stagger(0.05)});
      return;
    }

    try {
      const response = await fetch(BACKEND_URL + '/api/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challenge),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Challenge added successfully:', data);
        onDone();
        addChallenge(challenge);
      } else {
        console.error('Failed to add challenge:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <Modal title="New Challenge" onClose={onDone}>
      <form id="new-challenge" onSubmit={handleSubmit} ref={scope}>
        <p>
          <label htmlFor="title">Title</label>
          <input ref={title} type="text" name="title" id="title" />
        </p>

        <p>
          <label htmlFor="description">Description</label>
          <textarea ref={description} name="description" id="description" />
        </p>

        <p>
          <label htmlFor="deadline">Deadline</label>
          <input ref={deadline} type="date" name="deadline" id="deadline" />
        </p>

        <motion.ul
          id="new-challenge-images"
          variants={{
            visible: {transition: {staggerChildren: 0.05}}
          }}
        >
          {images.map((image) => (
            <motion.li
              exit={{opacity: 1, scale: 1}}
              transition={{type: 'spring'}}
              key={image.alt}
              onClick={() => handleSelectImage(image)}
              className={selectedImage === image ? 'selected' : undefined}
            >
              <img {...image} />
            </motion.li>
          ))}
        </motion.ul>

        <p className="new-challenge-actions">
          <button type="button" onClick={onDone}>
            Cancel
          </button>
          <button>Add Challenge</button>
        </p>
      </form>
    </Modal>
  );
}
