"use client"

import React, { useEffect } from 'react';

const BackgroundTextAnimation = () => {
  useEffect(() => {
    // Function to generate and position text elements
    const generateTextElements = () => {
      const container = document.getElementById('background-text-container');
      const textCount = 100;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      for (let i = 0; i < textCount; i++) {
        const textElement = document.createElement('div');
        textElement.textContent = 'good morning';
        textElement.classList.add('absolute', 'text-blue', 'font-monumentbold', 'tracking-wide', 'font-bold', 'text-opacity-80', 'animate-fadeInFadeOut');
        textElement.style.left = `${Math.random() * viewportWidth}px`;
        textElement.style.top = `${Math.random() * viewportHeight}px`;
        textElement.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(textElement);
      }
    };

    generateTextElements();

    // Cleanup function to remove text elements on unmount
    return () => {
      const container = document.getElementById('background-text-container');
      if (container && container?.innerHTML) {
        container.innerHTML = ''; // Remove all child elements
      }
    };
  }, []);

  return (
    <div id="background-text-container" className="fixed top-0 left-0 w-full h-full pointer-events-none hidden md:block"></div>
  );
};

export default BackgroundTextAnimation;
