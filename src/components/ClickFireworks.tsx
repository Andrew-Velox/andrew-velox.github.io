'use client';

import { useEffect, useRef } from 'react';

type ParticleShape = 'heart' | 'kanji';

type Particle = {
	x: number;
	y: number;
	color: string;
	radius: number;
	vx: number;
	vy: number;
	gravity: number;
	alpha: number;
	startTime: number;
	duration: number;
	shape: ParticleShape;
	glyph?: string;
	rotation: number;
	rotationSpeed: number;
};

type Circle = {
	x: number;
	y: number;
	radius: number;
	alpha: number;
	lineWidth: number;
	startTime: number;
	duration: number;
};

const HEART_COLORS = ['#f43f5e', '#ec4899', '#fb7185'];
const KANJI_COLORS = ['#e5e7eb', '#a855f7', '#facc15'];

// A tasteful pool of kanji — love, dream, light, craft, way, etc.
const KANJI_GLYPHS = ['愛', '夢', '光', '心', '風', '月', '星', '力', '侍', '忍', '道', '匠', '工', '火', '空'];

const KANJI_FONT_STACK =
	"'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif";

function easeOutExpo(t: number): number {
	return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function randomInRange(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

function setCanvasSize(canvas: HTMLCanvasElement) {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = window.innerWidth * dpr;
	canvas.height = window.innerHeight * dpr;
	canvas.style.width = `${window.innerWidth}px`;
	canvas.style.height = `${window.innerHeight}px`;
	const ctx = canvas.getContext('2d');
	if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawHeart(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	size: number,
	color: string,
	alpha: number,
	rotation: number
) {
	const top = size * 0.3;
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.translate(cx, cy);
	ctx.rotate(rotation);
	ctx.beginPath();
	ctx.moveTo(0, -size / 2 + top);
	ctx.bezierCurveTo(0, -size / 2, -size / 2, -size / 2, -size / 2, -size / 2 + top);
	ctx.bezierCurveTo(-size / 2, top / 2, 0, top / 2, 0, size / 2);
	ctx.bezierCurveTo(0, top / 2, size / 2, top / 2, size / 2, -size / 2 + top);
	ctx.bezierCurveTo(size / 2, -size / 2, 0, -size / 2, 0, -size / 2 + top);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

function drawKanji(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	size: number,
	color: string,
	alpha: number,
	glyph: string
) {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.fillStyle = color;
	ctx.font = `700 ${size}px ${KANJI_FONT_STACK}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(glyph, cx, cy);
	ctx.restore();
}

export default function ClickFireworks({
	numberOfParticles = 18,
}: {
	colors?: string[];
	numberOfParticles?: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const circlesRef = useRef<Circle[]>([]);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		setCanvasSize(canvas);

		const handleResize = () => setCanvasSize(canvas);
		window.addEventListener('resize', handleResize);

		const ensureLoopRunning = () => {
			if (rafRef.current === null) {
				rafRef.current = requestAnimationFrame(render);
			}
		};

		const handlePointerDown = (e: MouseEvent | TouchEvent) => {
			const pointerX =
				'clientX' in e
					? e.clientX
					: (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? 0);
			const pointerY =
				'clientY' in e
					? e.clientY
					: (e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY ?? 0);

			const rect = canvas.getBoundingClientRect();
			const x = pointerX - rect.left;
			const y = pointerY - rect.top;
			const startTime = performance.now();

			// expanding shockwave ring
			circlesRef.current.push({
				x,
				y,
				radius: 0.1,
				alpha: 0.5,
				lineWidth: 6,
				startTime,
				duration: randomInRange(1200, 1800),
			});

			// heart + kanji particles — real projectile motion: launched outward,
			// gravity curves the path continuously from the moment of the burst
			for (let i = 0; i < numberOfParticles; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = randomInRange(160, 340); // px/s

				const isHeart = Math.random() < 0.4;
				const shape: ParticleShape = isHeart ? 'heart' : 'kanji';
				const color = isHeart
					? HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]
					: KANJI_COLORS[Math.floor(Math.random() * KANJI_COLORS.length)];

				particlesRef.current.push({
					x,
					y,
					color,
					radius: isHeart ? randomInRange(12, 20) : randomInRange(16, 26),
					vx: speed * Math.cos(angle),
					vy: speed * Math.sin(angle),
					gravity: randomInRange(420, 620), // px/s^2
					alpha: randomInRange(0.5, 0.9),
					startTime,
					duration: randomInRange(1200, 1800),
					shape,
					glyph: isHeart ? undefined : KANJI_GLYPHS[Math.floor(Math.random() * KANJI_GLYPHS.length)],
					rotation: randomInRange(0, Math.PI * 2),
					rotationSpeed: randomInRange(-2, 2),
				});
			}

			ensureLoopRunning();
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('touchstart', handlePointerDown, { passive: true });

		const render = () => {
			const now = performance.now();

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// draw particles — real projectile motion (position = x + v*t + 1/2*g*t^2)
			for (let i = particlesRef.current.length - 1; i >= 0; i--) {
				const p = particlesRef.current[i];
				const elapsed = now - p.startTime;
				const lifeT = Math.min(elapsed / p.duration, 1);
				if (lifeT >= 1) {
					particlesRef.current.splice(i, 1);
					continue;
				}
				const t = elapsed / 1000; // seconds, for kinematics
				const cx = p.x + p.vx * t;
				const cy = p.y + p.vy * t + 0.5 * p.gravity * t * t;
				const scale = 1 - lifeT * 0.35;
				// stay fully visible through the arc, fade only in the last third
				const alpha = p.alpha * (lifeT < 0.66 ? 1 : 1 - (lifeT - 0.66) / 0.34);

				if (p.shape === 'heart') {
					drawHeart(
						ctx,
						cx,
						cy,
						Math.max(p.radius * scale, 0.1),
						p.color,
						alpha,
						p.rotation + p.rotationSpeed * (elapsed / 1000)
					);
				} else if (p.glyph) {
					drawKanji(ctx, cx, cy, Math.max(p.radius * scale, 0.1), p.color, alpha, p.glyph);
				}
			}

			// draw expanding shockwave ring
			for (let i = circlesRef.current.length - 1; i >= 0; i--) {
				const c = circlesRef.current[i];
				const elapsed = now - c.startTime;
				const t = Math.min(elapsed / c.duration, 1);
				if (t >= 1) {
					circlesRef.current.splice(i, 1);
					continue;
				}
				const eased = easeOutExpo(t);
				const radius = randomInRange(50, 100) * eased;
				const lineWidth = c.lineWidth * (1 - eased);
				const alpha = c.alpha * (1 - eased);

				ctx.globalAlpha = alpha;
				ctx.beginPath();
				ctx.arc(c.x, c.y, Math.max(radius, 0.1), 0, Math.PI * 2, true);
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
				ctx.globalAlpha = 1;
			}

			if (particlesRef.current.length > 0 || circlesRef.current.length > 0) {
				rafRef.current = requestAnimationFrame(render);
			} else {
				// nothing left to animate — stop the loop until the next click
				rafRef.current = null;
			}
		};

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('touchstart', handlePointerDown);
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [numberOfParticles]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			style={{
				position: 'fixed',
				left: 0,
				top: 0,
				width: '100vw',
				height: '100vh',
				zIndex: 9999,
				pointerEvents: 'none',
			}}
		/>
	);
}
