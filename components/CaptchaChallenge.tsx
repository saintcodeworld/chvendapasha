import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CaptchaDifficulty } from '../types';

interface CaptchaChallengeProps {
    onVerify: (solution: string, expected: string) => Promise<{ success: boolean; error?: string }>;
    onSuccess: (difficulty: CaptchaDifficulty) => void;
    onStart: () => void;
    onMilestone: (distance: number) => void;
    onGameOver?: (score: number) => void;
    onScoreUpdate?: (score: number) => void;
    onSessionRewardUpdate?: (reward: number) => void;
    isMining: boolean;
}

const GAME_CONFIG = {
    [CaptchaDifficulty.EASY]: { speed: 4, gravity: 0.6, jumpStrength: -10, gapMin: 150, gapMax: 300, winScore: 500 },
    [CaptchaDifficulty.MEDIUM]: { speed: 6, gravity: 0.6, jumpStrength: -11, gapMin: 120, gapMax: 250, winScore: 1000 },
    [CaptchaDifficulty.HARD]: { speed: 6, gravity: 0.7, jumpStrength: -12, gapMin: 100, gapMax: 220, winScore: 2000 },
};

const CHARACTER_SIZE = 120;
const OBSTACLE_WIDTH = 25;
const OBSTACLE_HEIGHT = 45;

const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({ onVerify, onSuccess, onStart, onMilestone, onGameOver, onScoreUpdate, onSessionRewardUpdate, isMining }) => {
    const [difficulty, setDifficulty] = useState<CaptchaDifficulty>(CaptchaDifficulty.HARD);
    const [isExternalMining, setIsExternalMining] = useState(false); // Replaces 'loading' for UI state
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER' | 'VICTORY'>('IDLE');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [volume, setVolume] = useState(0.3); // Default volume 30%


    // We'll define initGame first then use another useEffect if needed, 
    // or just handle state logic in the render/callbacks.

    // Let's use a trigger effect after initGame is defined.

    const [sessionReward, setSessionReward] = useState(0);
    const [rewardMessage, setRewardMessage] = useState<string | null>(null);

    // Update parent component with score changes
    useEffect(() => {
        if (onScoreUpdate) {
            onScoreUpdate(score);
        }
    }, [score, onScoreUpdate]);

    // Update parent component with session reward changes
    useEffect(() => {
        if (onSessionRewardUpdate) {
            onSessionRewardUpdate(sessionReward);
        }
    }, [sessionReward, onSessionRewardUpdate]);

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();

    // Game State Refs (for Loop)
    const characterRef = useRef({ x: 50, y: 0, dy: 0, grounded: true });
    const characterSpriteRef = useRef<HTMLImageElement | null>(null);
    const flagBgRef = useRef<HTMLImageElement | null>(null);
    const obstaclesRef = useRef<{ x: number; width: number; height: number; type: 'duststorm'; y: number; warned?: boolean }[]>([]);
    const scoreRef = useRef(0);
    const lastMilestoneRef = useRef(0);
    const speedRef = useRef(0);
    const configRef = useRef(GAME_CONFIG[CaptchaDifficulty.HARD]);

    // Dust storm effect state
    const dustStormRef = useRef({ active: false, opacity: 0, particles: [] as { x: number; y: number; speed: number; size: number }[] });
    const lastDustSpawnRef = useRef(0);
    const heartsRef = useRef<{ x: number; y: number; speed: number; size: number; opacity: number; phase: number }[]>([]);

    // Animation state
    const animationRef = useRef({ frame: 0, frameTime: 0, jumpRotation: 0 });

    const jumpAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Load jump sound
        jumpAudio.current = new Audio('/sounds/chicken jump.mp3');

        // Load Character sprite
        const charImg = new Image();
        charImg.src = '/fish model.png';
        charImg.onload = () => { characterSpriteRef.current = charImg; };

        // Load Mars background
        const marsImg = new Image();
        marsImg.src = '/mars_background.png';
        marsImg.onload = () => { flagBgRef.current = marsImg; };

        // Initialize dust particles
        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * 800,
                y: Math.random() * 500,
                speed: Math.random() * 3 + 2,
                size: Math.random() * 4 + 1
            });
        }
        dustStormRef.current.particles = particles;
        // Initialize heart particles
        const hearts = [];
        for (let i = 0; i < 40; i++) {
            hearts.push({
                x: Math.random() * 800,
                y: Math.random() * 500,
                speed: Math.random() * 0.8 + 0.4,
                size: Math.random() * 15 + 10,
                opacity: Math.random() * 0.4 + 0.2,
                phase: Math.random() * Math.PI * 2
            });
        }
        heartsRef.current = hearts;
    }, []);

    const playSound = (audio: HTMLAudioElement | null) => {
        if (audio) {
            audio.volume = volume;
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Sound play failed:", e));
        }
    };

    // Frame Rate Independence
    const lastFrameTimeRef = useRef<number>(0);

    const initGame = useCallback(() => {
        configRef.current = GAME_CONFIG[difficulty];
        characterRef.current = { x: 50, y: 150 - CHARACTER_SIZE, dy: 0, grounded: true };
        obstaclesRef.current = [];
        scoreRef.current = 0;
        lastMilestoneRef.current = 0;
        speedRef.current = configRef.current.speed;
        lastFrameTimeRef.current = performance.now(); // Reset time
        setScore(0);
        setSessionReward(0);
        setGameState('PLAYING');
    }, [difficulty]);

    // ... (useEffect for mining/idle stays same)
    useEffect(() => {
        if (isMining && gameState === 'IDLE') {
            initGame();
        } else if (!isMining && gameState !== 'IDLE') {
            setGameState('IDLE');
        }
    }, [isMining, initGame]);

    const jump = useCallback(() => {
        if (gameState !== 'PLAYING') {
            if (gameState !== 'VICTORY') initGame();
            return;
        }
        const p = characterRef.current;
        if (p.grounded) {
            // Jump strength does NOT need dt scaling if applied instantaneously as velocity, 
            // but gravity handling usually implies consistent units. 
            // Standard approach: Velocity is pixels/frame @ 60fps.
            p.dy = configRef.current.jumpStrength;
            p.grounded = false;
            playSound(jumpAudio.current); // Play whale sound on jump
        }
    }, [gameState, initGame]);

    const keysPressed = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or textarea
            if (e.target instanceof HTMLElement && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                return;
            }

            keysPressed.current[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameState === 'IDLE') {
                    onStart();
                } else if (gameState === 'GAME_OVER') {
                    initGame();
                } else if (gameState === 'PLAYING') {
                    jump();
                }
            } else if (e.code === 'ArrowUp' && gameState === 'PLAYING') {
                e.preventDefault();
                jump();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.code] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [jump, gameState, onStart, initGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const loop = (timestamp: number) => {
            if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
            const deltaTime = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;

            // Target 60 FPS (approx 16.67ms per frame)
            // dtFactor will be ~1.0 for 60hz, ~0.5 for 120hz, ~0.25 for 240hz
            // We cap dt to avoid huge jumps if tab is inactive
            const dt = Math.min(deltaTime, 100) / 16.67;

            const width = canvas.width;
            const height = canvas.height;
            const groundY = height - 10;
            const cfg = configRef.current;

            const isPlaying = gameState === 'PLAYING';

            // 1. Dynamic Speed
            if (isPlaying) {
                if (speedRef.current < 13) {
                    speedRef.current += 0.001 * dt; // Scale acceleration
                }
            }

            // Update Character
            const p = characterRef.current;
            
            if (isPlaying) {
                // Variable Gravity
                const gravity = cfg.gravity;

                p.dy += gravity * dt; // Scale gravity
                p.y += p.dy * dt;     // Scale velocity application

                // Ground Collision
                if (p.y + CHARACTER_SIZE >= groundY) {
                    p.y = groundY - CHARACTER_SIZE;
                    p.dy = 0;
                    p.grounded = true;
                }
            } else if (gameState === 'IDLE') {
                p.y = groundY - CHARACTER_SIZE;
                p.dy = 0;
                p.grounded = true;
            }

            // Move Obstacles
            if (isPlaying) {
                obstaclesRef.current.forEach(obs => {
                    const moveSpeed = speedRef.current;
                    obs.x -= moveSpeed * dt; // Scale movement
                });
                if (obstaclesRef.current.length > 0 && obstaclesRef.current[0].x < -100) {
                    obstaclesRef.current.shift();
                }
            }

            // Obstacle Spawning relies on distance, which relies on Score.
            // Score usually increments by speed. 
            if (isPlaying) {
                scoreRef.current += speedRef.current * dt; // Scale score increment
                // The rest of logic uses limits based on scoreRef, so it auto-adjusts.

                const currentDistM = Math.floor(scoreRef.current / 50);


                // Mars Dust Storm Spawning logic
                const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];

                // Cap the gap so it doesn't get too wide at high speeds
                const minGap = Math.min(speedRef.current * 40, 450);
                const variance = Math.random() * 180;

                // Failsafe: If no obstacles, force spawn immediately
                const shouldSpawn = !lastObs || (width - lastObs.x > minGap + variance);

                if (shouldSpawn) {
                    const h = Math.floor(Math.random() * 30) + 35;
                    const mainObsWidth = OBSTACLE_WIDTH + 15;
                    obstaclesRef.current.push({
                        x: width,
                        width: mainObsWidth,
                        height: h,
                        type: 'duststorm',
                        y: groundY - h,
                        warned: false
                    });

                    // Add chance for "double" obstacle - requires "big jump"
                    if (Math.random() < 0.2 && scoreRef.current > 300) { // 20% chance, only after some score
                        const secondH = Math.floor(Math.random() * 30) + 35;
                        obstaclesRef.current.push({
                            x: width + mainObsWidth + 5, // Tiny 5px gap for "joined" look
                            width: mainObsWidth,
                            height: secondH,
                            type: 'duststorm',
                            y: groundY - secondH,
                            warned: false
                        });
                    }
                }

            }

            // Collision Detection
            if (isPlaying) {
                const hitMargin = CHARACTER_SIZE * 0.2; // 20% forgiveness
                const crash = obstaclesRef.current.some(obs => {
                    const px = p.x + hitMargin;
                    const py = p.y + hitMargin;
                    const pw = CHARACTER_SIZE - (hitMargin * 2);
                    const ph = CHARACTER_SIZE - (hitMargin * 2);

                    // Obstacle Hitbox
                    let ox = obs.x + (obs.width * 0.1);
                    let oy = obs.y;
                    let ow = obs.width * 0.8;
                    let oh = obs.height;

                    // Iceberg logic: obs.y is already top-left
                    oy = obs.y;

                    return (
                        px < ox + ow &&
                        px + pw > ox &&
                        py < oy + oh &&
                        py + ph > oy
                    );
                });

                if (crash) {
                    setGameState('GAME_OVER');
                    if (scoreRef.current > highScore) setHighScore(Math.floor(scoreRef.current));
                    if (onGameOver) onGameOver(scoreRef.current);
                    return; // Stop updating
                }
            }

            // Update Score
            if (isPlaying) {
                setScore(Math.floor(scoreRef.current));

                const distance = Math.floor(scoreRef.current / 50);
                const milestone = Math.floor(distance / 100) * 100;

                if (milestone > 0 && milestone > lastMilestoneRef.current) {
                    onMilestone(milestone);
                    lastMilestoneRef.current = milestone;

                    // Sync UI state
                    let added = 0;
                    if (milestone === 100) added = 0.00081;
                    else if (milestone === 200) added = 0.0011;
                    else if (milestone === 300) added = 0.0012;
                    else if (milestone === 400) added = 0.0016;
                    else if (milestone === 500) added = 0.0032;
                    else if (milestone > 500) {
                        added = 0.0016;
                    }
                    setSessionReward(prev => prev + added);
                    setRewardMessage(`+${added.toFixed(4)} SOL`);
                    setTimeout(() => setRewardMessage(null), 3000);
                    speedRef.current += 0.5;
                }
            }

            // Drawing
            const drawBackground = () => {
                const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
                skyGradient.addColorStop(0, '#0d0d1a');
                skyGradient.addColorStop(0.3, '#1a1a2e');
                skyGradient.addColorStop(0.6, '#2d2d44');
                skyGradient.addColorStop(1, '#3a3a5a');
                ctx.fillStyle = skyGradient;
                ctx.fillRect(0, 0, width, height);

                ctx.fillStyle = '#c0c0c0';
                for (let i = 0; i < 50; i++) {
                    const starX = (i * 137 + scoreRef.current * 0.01) % width;
                    const starY = (i * 89) % (height * 0.4);
                    ctx.beginPath();
                    ctx.arc(starX, starY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
                    ctx.fill();
                }

                const moonX = width * 0.85;
                const moonY = height * 0.12;
                ctx.fillStyle = '#e0e0e0';
                ctx.beginPath();
                ctx.arc(moonX, moonY, 35, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#0d0d1a';
                ctx.beginPath();
                ctx.arc(moonX + 12, moonY - 5, 30, 0, Math.PI * 2);
                ctx.fill();

                const drawChurch = (x: number, baseY: number, scale: number, color: string) => {
                    ctx.fillStyle = color;
                    const w = 50 * scale;
                    const h = 100 * scale;
                    ctx.fillRect(x, baseY - h, w, h);
                    ctx.beginPath();
                    ctx.moveTo(x - 10 * scale, baseY - h);
                    ctx.lineTo(x + w / 2, baseY - h - 50 * scale);
                    ctx.lineTo(x + w + 10 * scale, baseY - h);
                    ctx.fill();
                    ctx.fillRect(x + w / 2 - 5 * scale, baseY - h - 70 * scale, 10 * scale, 25 * scale);
                    ctx.fillRect(x + w / 2 - 10 * scale, baseY - h - 60 * scale, 20 * scale, 8 * scale);
                    ctx.fillStyle = '#d4af37';
                    ctx.beginPath();
                    ctx.arc(x + w / 2, baseY - h - 35 * scale, 8 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#b8960c';
                    ctx.beginPath();
                    ctx.moveTo(x + w / 2, baseY - h - 28 * scale);
                    ctx.lineTo(x + w / 2 - 3 * scale, baseY - h - 20 * scale);
                    ctx.lineTo(x + w / 2 + 3 * scale, baseY - h - 20 * scale);
                    ctx.fill();
                    ctx.fillStyle = '#ffdf00';
                    ctx.beginPath();
                    ctx.arc(x + w / 2, baseY - h - 35 * scale, 4 * scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = color;
                    ctx.fillRect(x + w / 2 - 8 * scale, baseY - 40 * scale, 16 * scale, 30 * scale);
                    ctx.beginPath();
                    ctx.arc(x + w / 2, baseY - 40 * scale, 8 * scale, Math.PI, 0);
                    ctx.fill();
                };

                drawChurch(width * 0.05, groundY, 0.6, '#1a1a2a');
                drawChurch(width * 0.18, groundY, 0.9, '#222233');
                drawChurch(width * 0.38, groundY, 0.5, '#181828');
                drawChurch(width * 0.55, groundY, 1.0, '#252538');
                drawChurch(width * 0.75, groundY, 0.7, '#1f1f2f');
                drawChurch(width * 0.88, groundY, 0.55, '#1c1c2c');

                const time = scoreRef.current * 0.02;
                for (let i = 0; i < 12; i++) {
                    const birdBaseX = (i * 150 + time * (2 + i % 3)) % (width + 200) - 100;
                    const birdBaseY = height * 0.2 + Math.sin(time + i * 2) * 25 + (i % 4) * 20;
                    const wingFlap = Math.sin(time * 3 + i * 5) * 0.5;
                    
                    ctx.strokeStyle = 'rgba(200, 200, 220, 0.3)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(birdBaseX, birdBaseY);
                    ctx.quadraticCurveTo(birdBaseX - 10, birdBaseY - 8 + wingFlap * 12, birdBaseX - 18, birdBaseY - 4 + wingFlap * 18);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(birdBaseX, birdBaseY);
                    ctx.quadraticCurveTo(birdBaseX + 10, birdBaseY - 8 + wingFlap * 12, birdBaseX + 18, birdBaseY - 4 + wingFlap * 18);
                    ctx.stroke();

                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(birdBaseX, birdBaseY);
                    ctx.quadraticCurveTo(birdBaseX - 10, birdBaseY - 8 + wingFlap * 12, birdBaseX - 18, birdBaseY - 4 + wingFlap * 18);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(birdBaseX, birdBaseY);
                    ctx.quadraticCurveTo(birdBaseX + 10, birdBaseY - 8 + wingFlap * 12, birdBaseX + 18, birdBaseY - 4 + wingFlap * 18);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(birdBaseX, birdBaseY, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = `rgba(40, 40, 60, ${0.15 - i * 0.04})`;
                    ctx.fillRect(0, groundY - 50 + i * 15, width, 20);
                }
            };

            drawBackground();

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, groundY, width, 10);
            ctx.fillStyle = '#2a2a2a';
            for (let i = 0; i < width; i += 30) {
                ctx.fillRect(i, groundY, 15, 3);
            }

            // Draw Obstacles (Tombstones)
            obstaclesRef.current.forEach(obs => {
                if (obs.type === 'duststorm') {
                    ctx.save();
                    ctx.translate(obs.x, groundY);

                    const stoneHeight = obs.height;
                    const stoneWidth = obs.width;

                    const stoneGradient = ctx.createLinearGradient(0, -stoneHeight, 0, 0);
                    stoneGradient.addColorStop(0, '#808080');
                    stoneGradient.addColorStop(0.5, '#696969');
                    stoneGradient.addColorStop(1, '#505050');
                    ctx.fillStyle = stoneGradient;

                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, -stoneHeight * 0.6);
                    ctx.quadraticCurveTo(0, -stoneHeight, stoneWidth / 2, -stoneHeight);
                    ctx.quadraticCurveTo(stoneWidth, -stoneHeight, stoneWidth, -stoneHeight * 0.6);
                    ctx.lineTo(stoneWidth, 0);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = '#3a3a3a';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.fillStyle = '#4a4a4a';
                    ctx.font = `bold ${stoneWidth * 0.3}px serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText('RIP', stoneWidth / 2, -stoneHeight * 0.4);

                    ctx.restore();
                }
            });

            // Draw Character (using sprite image)
            const drawCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
                const isJumping = !characterRef.current.grounded;

                ctx.save();
                ctx.translate(x + size / 2, y + size / 2);
                ctx.translate(-size / 2, -size / 2);

                // Draw shadow if grounded
                if (!isJumping) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.beginPath();
                    ctx.ellipse(size * 0.5, size * 0.95, size * 0.4, size * 0.08, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Draw Character sprite
                if (characterSpriteRef.current) {
                    ctx.drawImage(characterSpriteRef.current, 0, 0, size, size);
                } else {
                    // Fallback: simple silhouette
                    ctx.fillStyle = '#1e40af';
                    ctx.beginPath();
                    ctx.arc(size * 0.5, size * 0.3, size * 0.25, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(size * 0.3, size * 0.5, size * 0.4, size * 0.45);
                }

                ctx.restore();
            };

            drawCharacter(ctx, p.x, p.y, CHARACTER_SIZE);

            // Overlays
            if (gameState === 'IDLE') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(0, 0, width, height);

                // Draw "Press Space to Start" text
                ctx.font = 'bold 20px "JetBrains Mono"';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('PRESS SPACE TO START', width / 2, height / 2 + 8);
            } else if (gameState === 'GAME_OVER') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, width, height);

                // Draw "Press Space to Restart" text
                ctx.font = 'bold 20px "JetBrains Mono"';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('PRESS SPACE TO RESTART', width / 2, height / 2 + 8);
            } else if (gameState === 'VICTORY') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, width, height);
                ctx.font = 'bold 20px "JetBrains Mono"';
                ctx.fillStyle = '#10b981';
                ctx.textAlign = 'center';
                ctx.fillText('VALIDATION COMPLETE', width / 2, height / 2);
            }

            // Progress Bar (Only when playing or game over)
            if (gameState !== 'IDLE') {
                const currentCycleScore = scoreRef.current % cfg.winScore;
                const progress = Math.min(currentCycleScore / cfg.winScore, 1);

                ctx.fillStyle = '#3f3f46';
                ctx.fillRect(0, 0, width, 4);

                if (scoreRef.current > 0 && scoreRef.current % cfg.winScore < 100) {
                    ctx.fillStyle = '#22c55e';
                } else {
                    ctx.fillStyle = '#10b981';
                }
                ctx.fillRect(0, 0, width * progress, 4);
            }


            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState, difficulty, onSuccess, onVerify, highScore, canvasSize]);



    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className={`w-full h-full bg-zinc-900 transition-all duration-300 cursor-pointer
                    ${gameState === 'GAME_OVER' ? 'border-red-500/50' : gameState === 'VICTORY' ? 'border-green-500/50' : ''}
                `}
            />

            {rewardMessage && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/50">
                        <span className="text-xl font-black text-[#4ade80] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">
                            {rewardMessage}
                        </span>
                    </div>
                </div>
            )}

            
            {/* Game Info Overlay - Removed from canvas, now in Dashboard */}
        </div>
    );
};

export default CaptchaChallenge;
