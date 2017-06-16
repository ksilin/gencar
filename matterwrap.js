export default class M {
  constructor() {
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

    Matter.use('matter-collision-events');
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

  makeCarComposite(car) {
    let centre = this.Vertices.centre(car.vertices)
    console.log("offset: " + centre.x + ", " + centre.y);
    const carGroup = this.Body.nextGroup(true);
    let wheel0Pos = this.Vector.sub(car.wheel0.center, centre)
    const wheel0 = this.makeCircle(wheel0Pos.x, wheel0Pos.y, car.wheel0.rad, carGroup)
    let wheel1Pos = this.Vector.sub(car.wheel1.center, centre)
    const wheel1 = this.makeCircle(wheel1Pos.x, wheel1Pos.y, car.wheel1.rad, carGroup)
    wheel1.onCollide(function(pair) {
      console.log('wheel1 got hit!', pair)
      // pair.bodyA.render.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      // pair.bodyB.render.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    });

    const carBody = this.makeCarBody(car.vertices, carGroup)

    this.Composite.addBody(carBody, wheel0);
    this.Composite.addBody(carBody, wheel1);

    const wheel0C = this.constrainWheel(carBody.bodies[0], wheel0, car.wheel0.center, centre)
    const wheel1C = this.constrainWheel(carBody.bodies[0], wheel1, car.wheel1.center, centre)
    this.Composite.addConstraint(carBody, wheel0C)
    this.Composite.addConstraint(carBody, wheel1C)

    let masses = carBody.bodies.map(b => b.mass).reduce((a, b) => a + b)
    let areas = carBody.bodies.map(b => b.area).reduce((a, b) => a + b)

    console.log("carBody: mass: ", masses, " area: ", areas, "v: ", carBody.bodies[0].velocity);

    return {
      body: carBody,
      wheel0,
      wheel1
    }
  }

  constrainWheel(carBody, wheel, wheelCenter, offset) {
    let wheelShift = this.Vector.sub(wheelCenter, offset)
    let options = {
      bodyA: carBody,
      pointA: wheelShift,
      bodyB: wheel,
      stiffness: 0.5
    }
    return this.Constraint.create(options)
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
      friction: 0.9,
      frictionStatic: 0.5,
      density: 0.5
    })
    this.Composite.add(bodyComposite, body)
    return bodyComposite
  }

  makeCircle(x, y, rad, collisionGroup) {
    let circle = this.Bodies.circle(0, 0, rad, {
      collisionFilter: {
        // category: this.carCategory,
        group: collisionGroup
      },
      friction: 0.7,
      density: 0.5
    })
    let trans = this.Vector.sub({
      x,
      y
    }, circle.position)
    this.Body.translate(circle, trans)
    return circle
  }

}
