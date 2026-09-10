'use client';

import { useEffect, useRef } from 'react';

type ParticleShape = 'heart' | 'star';

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

const HEART_COLORS = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af'];
const STAR_COLORS = ['#facc15', '#e5e7eb', '#34d399', '#a855f7', '#38bdf8'];

function easeOutExpo(t: number): number {
	return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function randomInRange(min: number, max: number): number {
	return min + Math.random() * (max - min);
}

function setCanvasSize(canvas: HTMLCanvasElement) {
	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();
	const width = Math.max(Math.round(rect.width * dpr), 1);
	const height = Math.max(Math.round(rect.height * dpr), 1);

	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
	}

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
	ctx.globalAlpha = Math.max(alpha, 0);
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

function drawStar(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	spikes: number,
	outerRadius: number,
	innerRadius: number,
	color: string,
	alpha: number,
	rotation: number
) {
	let rot = (Math.PI / 2) * 3 + rotation;
	let x = cx;
	let y = cy;
	const step = Math.PI / spikes;

	ctx.save();
	ctx.globalAlpha = Math.max(alpha, 0);
	ctx.beginPath();
	ctx.moveTo(cx, cy - outerRadius);
	for (let i = 0; i < spikes; i++) {
		x = cx + Math.cos(rot) * outerRadius;
		y = cy + Math.sin(rot) * outerRadius;
		ctx.lineTo(x, y);
		rot += step;

		x = cx + Math.cos(rot) * innerRadius;
		y = cy + Math.sin(rot) * innerRadius;
		ctx.lineTo(x, y);
		rot += step;
	}
	ctx.lineTo(cx, cy - outerRadius);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
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

			// Ignore events outside the canvas bounds
			if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

			const startTime = performance.now();

			// Expanding shockwave ring
			circlesRef.current.push({
				x,
				y,
				radius: 0.1,
				alpha: 0.5,
				lineWidth: 5,
				startTime,
				duration: randomInRange(1000, 1500),
			});

			// Burst particles
			for (let i = 0; i < numberOfParticles; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = randomInRange(160, 340); // px/s

				const isHeart = Math.random() < 0.45;
				const shape: ParticleShape = isHeart ? 'heart' : 'star';
				const color = isHeart
					? HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]
					: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

				particlesRef.current.push({
					x,
					y,
					color,
					radius: isHeart ? randomInRange(12, 18) : randomInRange(10, 16),
					vx: speed * Math.cos(angle),
					vy: speed * Math.sin(angle),
					gravity: randomInRange(400, 580), // px/s^2
					alpha: randomInRange(0.6, 0.95),
					startTime,
					duration: randomInRange(1200, 1700),
					shape,
					rotation: randomInRange(0, Math.PI * 2),
					rotationSpeed: randomInRange(-2.5, 2.5),
				});
			}

			ensureLoopRunning();
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('touchstart', handlePointerDown, { passive: true });

		const render = () => {
			const now = performance.now();

			// Ensure transform is set properly and the full physical canvas buffer is cleared
			const dpr = window.devicePixelRatio || 1;
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore();

			// Set user coordinates to match CSS pixels
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			// Draw particles with projectile kinematics
			for (let i = particlesRef.current.length - 1; i >= 0; i--) {
				const p = particlesRef.current[i];
				const elapsed = now - p.startTime;
				const lifeT = Math.min(elapsed / p.duration, 1);
				if (lifeT >= 1) {
					particlesRef.current.splice(i, 1);
					continue;
				}
				const t = elapsed / 1000;
				const cx = p.x + p.vx * t;
				const cy = p.y + p.vy * t + 0.5 * p.gravity * t * t;
				const scale = Math.max(1 - lifeT * 0.35, 0.1);
				const alpha = p.alpha * (lifeT < 0.65 ? 1 : 1 - (lifeT - 0.65) / 0.35);

				if (p.shape === 'heart') {
					drawHeart(
						ctx,
						cx,
						cy,
						Math.max(p.radius * scale, 0.1),
						p.color,
						alpha,
						p.rotation + p.rotationSpeed * t
					);
				} else {
					drawStar(
						ctx,
						cx,
						cy,
						5,
						Math.max(p.radius * scale, 0.1),
						Math.max(p.radius * scale * 0.5, 0.05),
						p.color,
						alpha,
						p.rotation + p.rotationSpeed * t
					);
				}
			}

			// Draw expanding shockwave rings
			for (let i = circlesRef.current.length - 1; i >= 0; i--) {
				const c = circlesRef.current[i];
				const elapsed = now - c.startTime;
				const t = Math.min(elapsed / c.duration, 1);
				if (t >= 1) {
					circlesRef.current.splice(i, 1);
					continue;
				}
				const eased = easeOutExpo(t);
				const radius = 80 * eased;
				const lineWidth = Math.max(c.lineWidth * (1 - eased), 0.1);
				const alpha = Math.max(c.alpha * (1 - eased), 0);

				ctx.save();
				ctx.globalAlpha = alpha;
				ctx.beginPath();
				ctx.arc(c.x, c.y, Math.max(radius, 0.1), 0, Math.PI * 2, true);
				ctx.lineWidth = lineWidth;
				ctx.strokeStyle = '#FFFFFF';
				ctx.stroke();
				ctx.restore();
			}

			if (particlesRef.current.length > 0 || circlesRef.current.length > 0) {
				rafRef.current = requestAnimationFrame(render);
			} else {
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
			className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
		/>
	);
}

