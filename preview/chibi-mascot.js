// Procedural Chibi Slime 2D Mascot (Corner Badge for High-Tier Donates)

let chibiAnimId = null;

export function startChibiSlimeMascot(canvas, slimeColorHex = '#00f2fe') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  let t = 0;

  function render() {
    t += 0.08;
    ctx.clearRect(0, 0, w, h);

    const bounce = Math.sin(t * 3.0) * 5;
    const squish = Math.sin(t * 3.0) * 0.08;
    const cx = w / 2;
    const cy = h / 2 + 10 + bounce;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.0 + squish, 1.0 - squish);

    // Halo
    ctx.beginPath();
    ctx.ellipse(0, -30, 18, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffd700';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Body Teardrop
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(22, -22, 28, 14, 24, 22);
    ctx.bezierCurveTo(20, 28, -20, 28, -24, 22);
    ctx.bezierCurveTo(-28, 14, -22, -22, 0, -22);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -22, 0, 26);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, slimeColorHex);
    grad.addColorStop(1, '#050a18');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(-8, 0, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.arc(8, 0, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Blushing cheeks
    ctx.beginPath();
    ctx.ellipse(-14, 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(14, 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 80, 140, 0.65)';
    ctx.fill();

    // Waving Hands
    ctx.beginPath();
    ctx.arc(-24 + Math.sin(t * 4) * 3, -4, 4, 0, Math.PI * 2);
    ctx.arc(24 - Math.sin(t * 4) * 3, -4, 4, 0, Math.PI * 2);
    ctx.fillStyle = slimeColorHex;
    ctx.fill();

    ctx.restore();
    chibiAnimId = requestAnimationFrame(render);
  }

  if (chibiAnimId) cancelAnimationFrame(chibiAnimId);
  render();
}

export function stopChibiSlimeMascot() {
  if (chibiAnimId) {
    cancelAnimationFrame(chibiAnimId);
    chibiAnimId = null;
  }
}
