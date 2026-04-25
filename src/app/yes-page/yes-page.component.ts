import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';

interface FallingPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  w: number;
  h: number;
  opacity: number;
  color: string;
  timeOffset: number;
}

@Component({
  selector: 'app-yes-page',
  standalone: true,
  imports: [],
  templateUrl: './yes-page.component.html',
  styleUrl: './yes-page.component.scss',
})
export class YesPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private rafId!: number;
  private petals: FallingPetal[] = [];
  private tick = 0;
  private resizeFn!: () => void;

  private flowerPositions: Array<{ x: number; y: number }> = [];

  private readonly petalColors = [
    '#ffb7c5', '#ff8fab', '#ff6b9d', '#f48fb1',
    '#fce4ec', '#f8bbd0', '#ff80ab', '#ffcdd2',
    '#fff0f3', '#e91e8c', '#f06292', '#ff4081',
  ];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeFn = () => this.onResize();
    window.addEventListener('resize', this.resizeFn);
    this.onResize();
    this.seedPetals(55);
    this.zone.runOutsideAngular(() => this.loop());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeFn);
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private seedPetals(n: number): void {
    const canvas = this.canvasRef.nativeElement;
    for (let i = 0; i < n; i++) {
      this.petals.push(
        this.makePetal(
          Math.random() * canvas.width,
          Math.random() * canvas.height * 0.85,
        ),
      );
    }
  }

  private makePetal(spawnX?: number, spawnY?: number): FallingPetal {
    const canvas = this.canvasRef.nativeElement;
    const cx = canvas.width / 2;
    const vaseTopY = canvas.height * 0.60;

    // Stem tips (flower positions) — keep in sync with drawStemsAndFlowers
    const stemTips = [
      { dx: -44, h: 138, lean: -15 },
      { dx:   0, h: 168, lean:   0 },
      { dx:  40, h: 128, lean:  14 },
      { dx: -21, h: 112, lean:  -7 },
      { dx:  26, h: 152, lean:   9 },
    ].map(s => ({ x: cx + s.dx + s.lean, y: vaseTopY - s.h }));

    const tip = stemTips[Math.floor(Math.random() * stemTips.length)];
    const x = spawnX ?? tip.x + (Math.random() - 0.5) * 70;
    const y = spawnY ?? tip.y + (Math.random() - 0.5) * 28;
    const size = 5 + Math.random() * 9;

    return {
      x, y,
      vx: (Math.random() - 0.5) * 0.55,
      vy: 0.35 + Math.random() * 0.75,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      w: size,
      h: size * (0.45 + Math.random() * 0.3),
      opacity: 0.55 + Math.random() * 0.45,
      color: this.petalColors[Math.floor(Math.random() * this.petalColors.length)],
      timeOffset: Math.random() * 1000,
    };
  }

  private loop(): void {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.tick++;
    this.render();
  }

  private render(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const W = canvas.width;
    const H = canvas.height;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,    '#ffe0ec');
    bg.addColorStop(0.45, '#ffd6f5');
    bg.addColorStop(1,    '#fce4ec');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const cx = W / 2;
    const vaseTopY = H * 0.60;

    // Stems + flowers (drawn behind vase)
    this.drawStemsAndFlowers(ctx, cx, vaseTopY);

    // Vase (drawn over stems so it hides the stem bases)
    this.drawVase(ctx, cx, vaseTopY);

    // Falling petals
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      const sway = Math.sin(this.tick * 0.018 + p.timeOffset) * 0.72;
      p.x += p.vx + sway;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.y > H + 20) {
        this.petals.splice(i, 1);
      } else {
        this.drawPetalShape(ctx, p);
      }
    }

    // Continuously spawn new petals
    if (this.tick % 9 === 0 && this.petals.length < 85) {
      this.petals.push(this.makePetal());
    }
  }

  // ── Vase ──────────────────────────────────────────────────────────────────
  private drawVase(ctx: CanvasRenderingContext2D, cx: number, top: number): void {
    // Body gradient (left to right)
    const g = ctx.createLinearGradient(cx - 72, 0, cx + 72, 0);
    g.addColorStop(0,    '#880e4f');
    g.addColorStop(0.18, '#ad1457');
    g.addColorStop(0.5,  '#e91e8c');
    g.addColorStop(0.78, '#f48fb1');
    g.addColorStop(1,    '#ad1457');

    ctx.beginPath();
    ctx.moveTo(cx - 53, top);
    // Left: opening → neck → body → base
    ctx.bezierCurveTo(cx - 62, top + 20, cx - 32, top + 40, cx - 25, top + 60);
    ctx.bezierCurveTo(cx - 56, top + 92, cx - 66, top + 136, cx - 59, top + 178);
    ctx.lineTo(cx + 59, top + 178);
    // Right: base → body → neck → opening
    ctx.bezierCurveTo(cx + 66, top + 136, cx + 56, top + 92, cx + 25, top + 60);
    ctx.bezierCurveTo(cx + 32, top + 40, cx + 62, top + 20, cx + 53, top);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();

    // Decorative rings
    ctx.save();
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, top + 82 + i * 38, 36, 7, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();

    // Rim
    ctx.beginPath();
    ctx.ellipse(cx, top, 53, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#880e4f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Left-side shine
    ctx.save();
    ctx.globalAlpha = 0.32;
    const shine = ctx.createLinearGradient(cx - 32, top + 30, cx - 8, top + 155);
    shine.addColorStop(0, 'rgba(255,255,255,0.85)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.ellipse(cx - 18, top + 92, 11, 52, -0.22, 0, Math.PI * 2);
    ctx.fillStyle = shine;
    ctx.fill();
    ctx.restore();
  }

  // ── Stems & Flowers ────────────────────────────────────────────────────────
  private drawStemsAndFlowers(
    ctx: CanvasRenderingContext2D,
    cx: number,
    vaseTopY: number,
  ): void {
    const stems = [
      { dx: -44, height: 138, lean: -15, bloomR: 27 },
      { dx:   0, height: 168, lean:   0, bloomR: 33 },
      { dx:  40, height: 128, lean:  14, bloomR: 26 },
      { dx: -21, height: 112, lean:  -7, bloomR: 23 },
      { dx:  26, height: 152, lean:   9, bloomR: 29 },
    ];

    this.flowerPositions = [];

    for (const s of stems) {
      const sx = cx + s.dx;
      const sy = vaseTopY + 12;
      const tx = sx + s.lean;
      const ty = sy - s.height;

      this.flowerPositions.push({ x: tx, y: ty });

      // Stem
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + s.lean * 0.6, sy - s.height * 0.55, tx, ty);
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Leaf
      this.drawLeaf(ctx, sx + s.lean * 0.38, sy - s.height * 0.44, s.lean >= 0 ? 0.5 : -0.5);

      // Bloom
      this.drawBloom(ctx, tx, ty, s.bloomR);
    }
  }

  private drawLeaf(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    angle: number,
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(15, 0, 17, 7, 0, 0, Math.PI * 2);
    const lg = ctx.createLinearGradient(-4, 0, 32, 0);
    lg.addColorStop(0, '#81c784');
    lg.addColorStop(1, '#1b5e20');
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.restore();
  }

  private drawBloom(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, r: number,
  ): void {
    const cols = ['#e91e8c', '#f06292', '#f48fb1', '#ff80ab', '#c2185b', '#ff4081'];
    const n = 6;

    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const px = cx + Math.cos(a) * r * 0.54;
      const py = cy + Math.sin(a) * r * 0.54;
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.54, r * 0.33, a, 0, Math.PI * 2);
      ctx.fillStyle = cols[i % cols.length];
      ctx.fill();
    }

    // Centre
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.29);
    cg.addColorStop(0,   '#fff9c4');
    cg.addColorStop(0.5, '#ffca28');
    cg.addColorStop(1,   '#f9a825');
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.29, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
  }

  // ── Petal shape ───────────────────────────────────────────────────────────
  private drawPetalShape(ctx: CanvasRenderingContext2D, p: FallingPetal): void {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  }
}
