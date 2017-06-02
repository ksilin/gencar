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
    console.log("creatingTriangle");
    tri.beginFill(0x66CCFF);
    tri.lineStyle(1, 0xFF0000, 1);
    tri.moveTo(center.x, center.y);
    tri.lineTo(b.x, b.y);
    tri.lineTo(c.x, c.y);
    tri.endFill()
    return tri
}



export {initRenderer, makeTriangle}
