import { modifier } from 'ember-modifier';

// A simple modifier that uses an IntersectionObserver to determine if an element is visible.
export default modifier(
  function isVisible(element, [handler]) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && typeof handler === 'function') {
          handler();
        }
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  },
  // TODO: remove this when updating to ember-modifier v4
  { eager: false }
);
