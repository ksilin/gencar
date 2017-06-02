function initRenderer() {

    const settings = {
        antialias: true,
        transparent: false,
        resolution: 1
    }
    const renderer = PIXI.autoDetectRenderer(800, 600, settings)
    renderer.view.style.border = "1px dashed black";
    renderer.backgroundColor = 0x061639;
    renderer.autoResize = true;
    document.body.appendChild(renderer.view)
    return renderer
}

function makeTriangle(center, b, c) {
    const tri = new PIXI.Graphics()
    tri.beginFill(0x66CCFF);
    tri.lineStyle(1, 0xFF0000, 1);
    tri.moveTo(center.x, center.y);
    tri.lineTo(b.x, b.y);
    tri.lineTo(c.x, c.y);
    tri.endFill()
    return tri
}

function makeWheel(pt, rad) {
  var wheel = new PIXI.Container()
  const circle = new PIXI.Graphics();
  circle.beginFill(0x0099FF);
  circle.drawCircle(0, 0, rad);
  circle.endFill();
  wheel.addChild(circle)

  const line = makeLine({x: 0, y: 0 }, {x: 0, y: rad})
  wheel.addChild(line)
  return wheel
}

function makeLine(start, end){
  const line = new PIXI.Graphics()
  line.lineStyle(1, 0xFFFFFF, 1);
  line.moveTo(start.x, start.y);
  line.lineTo(end.x, end.y);
  return line
}



export {initRenderer, makeTriangle, makeWheel, makeLine}
