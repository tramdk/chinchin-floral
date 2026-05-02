import React, { useEffect, useState } from 'react';

interface CartFlyingAnimationProps {
    image: string;
    targetId: string;
    onComplete: () => void;
    productColor?: string;
}

export const CartFlyingAnimation: React.FC<CartFlyingAnimationProps> = ({
    image,
    targetId,
    onComplete,
    productColor = '#D88C9A'
}) => {
    const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
    const [startPos] = useState({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });

    useEffect(() => {
        const target = document.getElementById(targetId);
        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetPos({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        } else {
        }

        const timer = setTimeout(() => {
            onComplete();
        }, 1500);
        return () => clearTimeout(timer);
    }, [targetId, onComplete]);

    const controlX = startPos.x + (targetPos.x - startPos.x) * 0.5;
    const controlY = startPos.y - 200;

    return (
        <div
            className="fixed z-[999] pointer-events-none"
            style={{
                left: `${startPos.x}px`,
                top: `${startPos.y}px`,
                width: '120px',
                height: '120px',
                marginLeft: '-60px',
                marginTop: '-60px',
                animation: `flyToCart 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                '--target-x': `${targetPos.x - startPos.x}px`,
                '--target-y': `${targetPos.y - startPos.y}px`,
                '--control-x': `${controlX - startPos.x}px`,
                '--control-y': `${controlY - startPos.y}px`,
            } as React.CSSProperties}
        >
            {/* SVG Flower */}
            <div style={{ animation: 'spin 1.5s linear forwards' }}>
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 140 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* 8 petals */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i / 8) * 360;
                        return (
                            <g key={i} transform={`rotate(${angle} 70 70)`}>
                                <path
                                    d="M 70 25 Q 60 25 60 35 L 60 55 Q 60 65 70 65 Q 80 65 80 55 L 80 35 Q 80 25 70 25 Z"
                                    stroke={productColor}
                                    strokeWidth="6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                        );
                    })}

                    {/* Center circles */}
                    <circle cx="70" cy="70" r="18" stroke={productColor} strokeWidth="6" fill="none" />
                    <circle cx="70" cy="70" r="8" stroke={productColor} strokeWidth="4" fill="none" />

                    {/* Lines */}
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i / 8) * 360;
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 70 + Math.cos(rad) * 26;
                        const y1 = 70 + Math.sin(rad) * 26;
                        const x2 = 70 + Math.cos(rad) * 45;
                        const y2 = 70 + Math.sin(rad) * 45;

                        return (
                            <line
                                key={`line-${i}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={productColor}
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Glow */}
            <div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{
                    background: `radial-gradient(circle, ${productColor}aa, transparent)`,
                    animation: 'pulse 0.8s ease-in-out infinite',
                }}
            />

            <style>{`
        @keyframes flyToCart {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(var(--control-x), var(--control-y)) scale(1.5);
            opacity: 1;
          }
          100% {
            transform: translate(var(--target-x), var(--target-y)) scale(0.3);
            opacity: 0.8;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(1080deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
        }
      `}</style>
        </div>
    );
};
