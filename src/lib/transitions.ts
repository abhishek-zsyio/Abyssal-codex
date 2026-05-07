
export const spring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const softSpring = {
  type: "spring" as const,
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const bounceSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 10,
};

export const microSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30,
};

export const transitionDefaults = {
  duration: 0.3,
  ease: [0.23, 1, 0.32, 1], // easeOutQuint
};

export const staggerContainer = {
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: softSpring
  },
  exit: { 
    opacity: 0, 
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: spring
  },
  exit: { 
    opacity: 0, 
    x: -10,
    transition: { duration: 0.15 }
  }
};
