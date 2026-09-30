// Spider Web — Originkit

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const DEFAULTS = {
    color: "#DCE6FF",
    opacity: 100,
    segments: 28,
    rings: 14,
    thickness: 3,
    sag: 20,
    irregularity: 0,
    hoverIntensity: 20,
    nodes: false,
    nodeColor: "#FFFFFF",
    nodeSize: 4,
}

const STIFFNESS = 460
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.05

const REACH = 370
const PUSH = 90

type Config = {
    color: string
    opacity: number
    segments: number
    rings: number
    thickness: number
    sag: number
    irregularity: number
    hoverIntensity: number
    nodes: boolean
    nodeColor: string
    nodeSize: number
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

function hash(a: number, b: number): number {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return s - Math.floor(s)
}

function settingsFor(cfg: Config) {
    return {
        color: cfg.color || DEFAULTS.color,
        opacity: clamp(cfg.opacity, 0, 100, DEFAULTS.opacity) / 100,
        segments: Math.round(clamp(cfg.segments, 5, 28, DEFAULTS.segments)),
        rings: Math.round(clamp(cfg.rings, 3, 14, DEFAULTS.rings)),
        thickness: 0.3 + clamp(cfg.thickness, 1, 10, DEFAULTS.thickness) * 0.22,
        sag: clamp(cfg.sag, 0, 20, DEFAULTS.sag) * 0.011,
        irregularity: clamp(cfg.irregularity, 0, 20, DEFAULTS.irregularity) * 0.02,
        push: (PUSH * clamp(cfg.hoverIntensity, 0, 20, DEFAULTS.hoverIntensity)) / 10,
        nodes: !!cfg.nodes,
        nodeColor: cfg.nodeColor || DEFAULTS.nodeColor,
        nodeSize: 0.4 + clamp(cfg.nodeSize, 1, 10, DEFAULTS.nodeSize) * 0.18,
    }
}

type Node = {
    restX: number
    restY: number
    x: number
    y: number
    vx: number
    vy: number
    pinned: boolean
}

class WebScene {
    private container: HTMLElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cfg: Config

    private grid: Node[][] = []
    private width = 0
    private height = 0
    private dpr = 1

    private pointerX = 0
    private pointerY = 0
    private pointerIn = false

    private frameId = 0
    private lastT = 0
    private running = false
    private disposed = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg

        this.canvas = document.createElement("canvas")
        const el = this.canvas
        el.style.position = "absolute"
        el.style.inset = "0"
        el.style.width = "100%"
        el.style.height = "100%"
        el.style.display = "block"
        el.style.touchAction = "none"
        container.appendChild(el)

        const ctx = el.getContext("2d")
        if (!ctx) throw new Error("No 2D context")
        this.ctx = ctx

        this.bindEvents()
    }

    private build() {
        const S = settingsFor(this.cfg)
        const cx = this.width / 2
        const cy = this.height / 2

        const outer = Math.hypot(this.width, this.height) * 0.56

        this.grid = []
        for (let i = 0; i < S.rings; i++) {
            const row: Node[] = []

            const t = (i + 1) / S.rings
            const radius = outer * Math.pow(t, 1.35)
            for (let j = 0; j < S.segments; j++) {
                const wobbleA = (hash(i, j) - 0.5) * S.irregularity
                const wobbleR = 1 + (hash(j, i) - 0.5) * S.irregularity
                const angle = (j / S.segments) * Math.PI * 2 + wobbleA
                const r = radius * wobbleR
                const x = cx + Math.cos(angle) * r
                const y = cy + Math.sin(angle) * r
                row.push({
                    restX: x,
                    restY: y,
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    pinned: i === S.rings - 1,
                })
            }
            this.grid.push(row)
        }
    }

    private bindEvents() {
        const el = this.canvas
        const move = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            this.pointerX = e.clientX - rect.left
            this.pointerY = e.clientY - rect.top
            this.pointerIn = true

            this.wake()
        }
        const leave = () => {
            this.pointerIn = false
            this.wake()
        }
        el.addEventListener("pointermove", move)
        el.addEventListener("pointerleave", leave)
        el.addEventListener("pointercancel", leave)
        this.unbind = () => {
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerleave", leave)
            el.removeEventListener("pointercancel", leave)
        }
    }

    private unbind = () => {}

    setSize(width: number, height: number) {
        if (this.disposed || width <= 0 || height <= 0) return
        this.width = width
        this.height = height
        this.dpr = Math.min(window.devicePixelRatio || 1, 2)
        this.canvas.width = Math.round(width * this.dpr)
        this.canvas.height = Math.round(height * this.dpr)
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        this.build()
        this.wake()
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        const prev = this.cfg
        this.cfg = cfg

        if (
            prev.segments !== cfg.segments ||
            prev.rings !== cfg.rings ||
            prev.irregularity !== cfg.irregularity
        ) {
            this.build()
        }
        this.wake()
    }

    private wake() {
        if (this.disposed || this.running) return
        this.running = true
        this.lastT = performance.now()
        const loop = () => {
            if (!this.running) return
            this.frameId = requestAnimationFrame(loop)
            this.step()
        }
        loop()
    }

    private step() {
        if (this.disposed) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0

        if (dt > 0.033) dt = 0.033

        const S = settingsFor(this.cfg)
        const reach2 = REACH * REACH
        let energy = 0

        for (const row of this.grid) {
            for (const n of row) {
                if (n.pinned) continue

                let ax = (n.restX - n.x) * STIFFNESS - n.vx * DAMPING
                let ay = (n.restY - n.y) * STIFFNESS - n.vy * DAMPING

                if (this.pointerIn && S.push > 0) {
                    const dx = n.x - this.pointerX
                    const dy = n.y - this.pointerY
                    const d2 = dx * dx + dy * dy
                    if (d2 < reach2) {
                        const d = Math.sqrt(d2) || 0.0001

                        const fall = 1 - d / REACH
                        const f = (S.push * fall * fall * STIFFNESS) / 40
                        ax += (dx / d) * f
                        ay += (dy / d) * f
                    }
                }

                n.vx += ax * dt
                n.vy += ay * dt
                n.x += n.vx * dt
                n.y += n.vy * dt
                energy += Math.abs(n.vx) + Math.abs(n.vy)
            }
        }

        this.draw(S)

        if ((!this.pointerIn || S.push <= 0) && energy < 0.5) {
            this.running = false
            cancelAnimationFrame(this.frameId)
        }
    }

    private draw(S: ReturnType<typeof settingsFor>) {
        const ctx = this.ctx
        const cx = this.width / 2
        const cy = this.height / 2
        ctx.clearRect(0, 0, this.width, this.height)
        if (!this.grid.length) return

        ctx.strokeStyle = S.color
        ctx.globalAlpha = S.opacity
        ctx.lineWidth = S.thickness
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        const rings = this.grid.length
        const segments = this.grid[0].length

        for (let j = 0; j < segments; j++) {
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            for (let i = 0; i < rings; i++) {
                const n = this.grid[i][j]
                ctx.lineTo(n.x, n.y)
            }
            ctx.stroke()
        }

        for (let i = 0; i < rings; i++) {
            const row = this.grid[i]
            ctx.beginPath()
            for (let j = 0; j < segments; j++) {
                const a = row[j]
                const b = row[(j + 1) % segments]
                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2
                const cxp = mx + (cx - mx) * S.sag
                const cyp = my + (cy - my) * S.sag
                if (j === 0) ctx.moveTo(a.x, a.y)
                ctx.quadraticCurveTo(cxp, cyp, b.x, b.y)
            }
            ctx.stroke()
        }

        if (S.nodes) {
            ctx.fillStyle = S.nodeColor
            for (const row of this.grid) {
                for (const n of row) {
                    ctx.beginPath()
                    ctx.arc(n.x, n.y, S.nodeSize, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }

        ctx.globalAlpha = 1
    }

    dispose() {
        this.disposed = true
        this.running = false
        cancelAnimationFrame(this.frameId)
        this.unbind()
        if (this.canvas.parentNode === this.container)
            this.container.removeChild(this.canvas)
    }
}

export interface SpiderWebProps {
    color?: string
    opacity?: number
    segments?: number
    rings?: number
    thickness?: number
    sag?: number
    irregularity?: number
    hoverIntensity?: number
    nodes?: boolean
    nodeColor?: string
    nodeSize?: number
    style?: React.CSSProperties
}

export default function SpiderWeb(props: SpiderWebProps) {
    const {
        color = DEFAULTS.color,
        opacity = DEFAULTS.opacity,
        segments = DEFAULTS.segments,
        rings = DEFAULTS.rings,
        thickness = DEFAULTS.thickness,
        sag = DEFAULTS.sag,
        irregularity = DEFAULTS.irregularity,
        hoverIntensity = DEFAULTS.hoverIntensity,
        nodes = DEFAULTS.nodes,
        nodeColor = DEFAULTS.nodeColor,
        nodeSize = DEFAULTS.nodeSize,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<WebScene | null>(null)

    const cfgRef = useRef<Config>({
        color: DEFAULTS.color,
        opacity: DEFAULTS.opacity,
        segments: DEFAULTS.segments,
        rings: DEFAULTS.rings,
        thickness: DEFAULTS.thickness,
        sag: DEFAULTS.sag,
        irregularity: DEFAULTS.irregularity,
        hoverIntensity: DEFAULTS.hoverIntensity,
        nodes: DEFAULTS.nodes,
        nodeColor: DEFAULTS.nodeColor,
        nodeSize: DEFAULTS.nodeSize,
    })
    cfgRef.current = {
        color,
        opacity,
        segments,
        rings,
        thickness,
        sag,
        irregularity,
        hoverIntensity,
        nodes,
        nodeColor,
        nodeSize,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: WebScene
        try {
            scene = new WebScene(container, cfgRef.current)
        } catch {
            return
        }
        sceneRef.current = scene
        scene.setSize(container.clientWidth, container.clientHeight)

        const ro = new ResizeObserver(() => {
            scene.setSize(container.clientWidth, container.clientHeight)
        })
        ro.observe(container)

        // Re-dispatch window pointer events into the canvas so the web
        // responds everywhere on the page (the canvas sits at z-0 behind
        // content, so it never receives pointer events directly when the
        // cursor is over content). Uses synthetic PointerEvent dispatch into
        // the canvas's own listener (WebScene.bindEvents) so the original
        // physics is unchanged.
        const canvas = (scene as unknown as { canvas: HTMLCanvasElement }).canvas
        const onMove = (e: PointerEvent) => {
            canvas.dispatchEvent(
                new PointerEvent("pointermove", {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    bubbles: false,
                    cancelable: true,
                })
            )
        }
        const onLeave = () => {
            canvas.dispatchEvent(
                new PointerEvent("pointerleave", { bubbles: false })
            )
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("blur", onLeave)
        document.addEventListener("mouseleave", onLeave)

        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("blur", onLeave)
            document.removeEventListener("mouseleave", onLeave)
            ro.disconnect()
            scene.dispose()
            sceneRef.current = null
        }
    }, [])

    useEffect(() => {
        sceneRef.current?.updateConfig(cfgRef.current)
    }, [
        color,
        opacity,
        segments,
        rings,
        thickness,
        sag,
        irregularity,
        hoverIntensity,
        nodes,
        nodeColor,
        nodeSize,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Spider web"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

SpiderWeb.displayName = "Spider Web"
