/**
 * Animation & Transition utilities for premium motion design
 * Use these classes for consistent, tasteful animations throughout the app
 */

export const animations = {
  // Fade animations
  fadeIn: "animate-fadeIn",
  fadeOut: "animate-fadeOut",

  // Slide animations
  slideInUp: "animate-slideInUp",
  slideInDown: "animate-slideInDown",
  slideInLeft: "animate-slideInLeft",
  slideInRight: "animate-slideInRight",

  // Scale animations
  scaleIn: "animate-scaleIn",
  pulse: "animate-pulse",

  // Bounce animations
  bounce: "animate-bounce",
  bounceIn: "animate-bounceIn",

  // Spin animations
  spin: "animate-spin",
  spinSlow: "animate-spin-slow",
};

export const transitions = {
  // Standard transitions
  fast: "transition-all duration-150 ease-in-out",
  normal: "transition-all duration-300 ease-in-out",
  slow: "transition-all duration-500 ease-in-out",

  // Property-specific transitions
  colors: "transition-colors duration-300 ease-in-out",
  transform: "transition-transform duration-300 ease-in-out",
  opacity: "transition-opacity duration-300 ease-in-out",
  all: "transition-all duration-300 ease-in-out",

  // Cubic bezier variations
  easeOut: "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
  easeIn: "transition-all duration-300 cubic-bezier(0.4, 0, 1, 1)",
  easeInOut: "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
};

export const hoverEffects = {
  // Button hover effects
  buttonHover: "hover:shadow-lg hover:scale-105 transition-all duration-200",
  buttonLiftHover: "hover:shadow-xl hover:-translate-y-1 transition-all duration-200",
  buttonDim: "hover:opacity-80 transition-opacity duration-200",

  // Card hover effects
  cardLift: "hover:shadow-xl hover:-translate-y-2 transition-all duration-300",
  cardGlow: "hover:shadow-glow transition-all duration-300",
  cardScale: "hover:scale-105 transition-transform duration-300",

  // Link hover effects
  linkUnderline: "hover:underline transition-all duration-200",
  linkColorShift: "hover:text-brand transition-colors duration-200",
};

/**
 * CSS classes for Tailwind CSS animations (add these to tailwind.config.ts)
 * Paste this in the animation section of theme.extend
 */
export const tailwindAnimationConfig = {
  fadeIn: "fadeIn 0.3s ease-in-out",
  fadeOut: "fadeOut 0.3s ease-in-out",
  slideInUp: "slideInUp 0.4s ease-out",
  slideInDown: "slideInDown 0.4s ease-out",
  slideInLeft: "slideInLeft 0.4s ease-out",
  slideInRight: "slideInRight 0.4s ease-out",
  scaleIn: "scaleIn 0.3s ease-out",
  bounceIn: "bounceIn 0.5s ease-out",
};

/**
 * Keyframes for Tailwind CSS animations (add these to tailwind.config.ts)
 * Paste this in the keyframes section of theme.extend
 */
export const tailwindKeyframesConfig = {
  fadeIn: {
    "from": { opacity: "0" },
    "to": { opacity: "1" },
  },
  fadeOut: {
    "from": { opacity: "1" },
    "to": { opacity: "0" },
  },
  slideInUp: {
    "from": "%: { opacity: '0', transform: 'translateY(10px)' },",
    "to": { opacity: "1", transform: "translateY(0)" },
  },
  slideInDown: {
    "from": { opacity: "0", transform: "translateY(-10px)" },
    "to": { opacity: "1", transform: "translateY(0)" },
  },
  slideInLeft: {
    "from": { opacity: "0", transform: "translateX(-10px)" },
    "to": { opacity: "1", transform: "translateX(0)" },
  },
  slideInRight: {
    "from": { opacity: "0", transform: "translateX(10px)" },
    "to": { opacity: "1", transform: "translateX(0)" },
  },
  scaleIn: {
    "from": { opacity: "0", transform: "scale(0.95)" },
    "to": { opacity: "1", transform: "scale(1)" },
  },
  bounceIn: {
    "0%": { opacity: "0", transform: "scale(0.3)" },
    "50%": { opacity: "1", transform: "scale(1.05)" },
    "70%": { transform: "scale(0.9)" },
    "100%": { transform: "scale(1)" },
  },
};

/**
 * Helper function to combine animation classes
 */
export function combineAnimations(...animations: string[]): string {
  return animations.filter(Boolean).join(" ");
}

/**
 * Helper function to get hover effect classes
 */
export function getHoverEffect(
  type: "button" | "card" | "link" = "button"
): string {
  return {
    button: hoverEffects.buttonHover,
    card: hoverEffects.cardLift,
    link: hoverEffects.linkColorShift,
  }[type];
}

/**
 * Stagger animation helper for lists
 * Usage: staggerItem(index, itemCount)
 */
export function staggerItem(
  index: number,
  baseDelay: number = 0.05
): { style: { animationDelay: string } } {
  return {
    style: {
      animationDelay: `${index * baseDelay}s`,
    },
  };
}
