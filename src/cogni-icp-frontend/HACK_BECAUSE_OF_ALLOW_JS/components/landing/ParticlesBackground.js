import React, { useRef, useEffect } from 'react';
const ParticlesBackground = () => {
    const particlesContainerRef = useRef(null);
    useEffect(() => {
        if (!particlesContainerRef.current)
            return;
        const container = particlesContainerRef.current;
        container.innerHTML = '';
        // Create multiple particles with different sizes, colors and animations
        const particleCount = 35;
        const colors = ['#4FACFE', '#00F2FE', '#7367F0', '#A166F4', '#6A7BFF'];
        const animationClasses = ['animate-float', 'animate-float-alt', 'animate-float-alt-2'];
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            // Random properties
            const size = Math.random() * 120 + 30; // 30-150px
            const posX = Math.random() * 100; // 0-100%
            const posY = Math.random() * 100; // 0-100%
            const color = colors[Math.floor(Math.random() * colors.length)];
            const opacity = Math.random() * 0.5 + 0.1; // 0.1-0.6
            const delay = Math.random() * 15; // 0-15s delay
            // Randomly select one of the animation types
            const animationIndex = Math.floor(Math.random() * animationClasses.length);
            const animationClass = animationClasses[animationIndex];
            // Assign a random delay class for staggered animations
            const delayClass = Math.random() > 0.66
                ? 'animation-delay-4000'
                : Math.random() > 0.33
                    ? 'animation-delay-2000'
                    : 'animation-delay-6000';
            // Set styling
            particle.className = `absolute rounded-full filter blur-xl ${animationClass} ${delayClass}`;
            Object.assign(particle.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${posX}%`,
                top: `${posY}%`,
                backgroundColor: color,
                opacity: opacity.toString(),
                animationDelay: `${delay}s`
            });
            container.appendChild(particle);
        }
        // Clean up function
        return () => {
            if (container) {
                container.innerHTML = '';
            }
        };
    }, []);
    return (<div ref={particlesContainerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0" aria-hidden="true"/>);
};
export default ParticlesBackground;
