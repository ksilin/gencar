export default class M {
  constructor(){
    this.defaultCategory = 0x0001
    this.noCollisionCategory = 0x0002
    this.carCategory = 0x0003

    this.Engine = Matter.Engine
    this.World = Matter.World
    this.Bodies = Matter.Bodies
    this.Body = Matter.Body
    this.Composite = Matter.Composite
    this.Common = Matter.Common
    this.Constraint = Matter.Constraint
    this.Composites = Matter.Composites
    this.Vertices = Matter.Vertices
    this.Render = Matter.Render
    this.Vector = Matter.Vector
    this.Mouse = Matter.Mouse
    this.MouseConstraint = Matter.MouseConstraint
  }

  // left upper corner positioning
  rect(x, y, w, h) {
    let r = this.Bodies.rectangle(0, 0, w, h, {
      isStatic: true,
      collisionFilter: {
        category: this.noCollisionCategory
      },
      render: {
        strokeStyle: "#CCC",
        lineWidth: 0.5,
        visible: true,
        showIds: true,
        showVertexNumbers: true
      }
    })
    let trans = this.Vector.sub({
      x,
      y
    }, r.bounds.min)
    this.Body.translate(r, trans)
    return r
  }

  makeGrid() {
    const gridScale = 100
    const halfScale = gridScale / 2
    const gridComp = this.Composite.create({
      label: 'grid'
    })
    for (let x = -3; x < 4; x++) {
      for (let y = -3; y < 2; y++) {
        this.Composite.addBody(gridComp, this.rect(x * gridScale, y * gridScale, gridScale, gridScale))
      }
    }
    return gridComp
  }

  makeCarBody(points, group) {
    var bodyComposite = this.Composite.create({
      label: 'body'
    })

    let body = this.Bodies.fromVertices(0, 0, points, {
      collisionFilter: {
        category: this.carCategory,
        group: group
      },
      friction: 1
    })

    let centre = this.Vertices.centre(points)
    console.log("centre: " + centre.x + ", " +  centre.y);

    // TODO - move body to origin
    console.log(body.position);
    let trans = this.Vector.sub({
      x: 0,
      y: 0
    }, centre)
    // this.Body.translate(body, trans)
    this.Composite.add(bodyComposite, body)
    return bodyComposite
  }

  makeCircle(x, y, rad, collisionGroup) {
    let circle = this.Bodies.circle(0, 0, rad, {
      collisionFilter: {
        // category: this.carCategory,
        group: collisionGroup
      },
      friction: 0.8,
      density: 0.01
    })
    let trans = this.Vector.sub({
      x,
      y
    }, circle.position)
    this.Body.translate(circle, trans)
    return circle
  }

}
