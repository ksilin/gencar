"use strict";

import {
  PopulationGenerator,
  Evolver
} from "./genetics.js"

class Main {
  constructor() {
    this.center = {
      x: 400, //this.renderer.view.width / 2,
      y: 300 // this.renderer.view.height / 2
    }
    this.defaultCategory = 0x0001,
      this.noCollisionCategory = 0x0002,
      this.carCategory = 0x0003,

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
      // create an engine
      this.engine = this.Engine.create();
    // create a renderer
    this.render = this.Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        hasBounds: true,
        // showVelocity: true,
        showCollisions: false,
        showSeparations: false,
        // showAxes: true,
        showPositions: true,
        showBounds: true,
        // showAngleIndicator: true,
        // showIds: true,
        showShadows: false,
        // showVertexNumbers: true
      }
    });
    this.render.bounds = {
      min: {
        x: -800,
        y: -600
      },
      max: {
        x: this.render.canvas.width,
        y: this.render.canvas.height
      }
    };

    this.origin = {
      x: 0,
      y: 0
    }
  }


  triangleFan(points, composite) {
    let triangles = points.map((e, i) => {

      let nextIdx = (i + 1) % (points.length)
      let nextElem = points[nextIdx]
      let triPoints = [this.origin, e, nextElem]
      let triCenter = this.Vertices.centre(triPoints)
      let triCenterVec = this.Vector.sub(triCenter, this.origin)

      let tri = this.Bodies.fromVertices(0, 0, triPoints, {
        collisionFilter: {
          // category: this.carCategory,
          // group: group
        },
        friction: 1
      })
      this.Body.translate(tri, triCenterVec)
      this.Composite.add(composite, tri)
      return tri
    })

    let constraints = triangles.map((e, i) => {
      let nextIdx = (i + 1) % (triangles.length)
      let nextElem = triangles[nextIdx]
      let options = {
        bodyA: e,
        bodyB: nextElem,
        stiffness: 1
      }
      var constraint = this.Constraint.create(options)
      this.Composite.addConstraint(composite, constraint)

      let overNextIdx = (i + 2) % (triangles.length)
      let overNextElem = triangles[overNextIdx]
      let options2 = {
        bodyA: e,
        bodyB: overNextElem,
        stiffness: 1
      }
      var constraint2 = this.Constraint.create(options2)
      this.Composite.addConstraint(composite, constraint2)
      return constraint
    })
    return composite
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

    // TODO - move body to origin
    this.Composite.add(bodyComposite, body)
    // const triangleFan = this.triangleFan(points, bodyComposite)
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

  makeCar(car) {

    var group = this.Body.nextGroup(true);
    var carComposite = this.Composite.create({
      label: 'Car'
    })

    let carGeoPoints = car.geo.map(e => e.point)
    let body = this.makeCarBody(carGeoPoints, group)
    var wheelA = this.makeWheelBody(car, 0, group)
    var wheelB = this.makeWheelBody(car, 1, group)

    this.Composite.addBody(carComposite, body);
    this.Composite.addBody(carComposite, wheelA);
    this.Composite.addBody(carComposite, wheelB);
    return carComposite;
  };

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

  // left upper corner positioning
  rect(x, y, w, h) {
    let rect = this.Bodies.rectangle(0, 0, w, h, {
      isStatic: true,
      collisionFilter: {
        category: this.noCollisionCategory,
        mask: this.noCollisionCategory
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
    }, rect.bounds.min)
    this.Body.translate(rect, trans)
    return rect
  }

  run() {
    // const grid = this.makeGrid()

    const vertices = [{
      x: -100,
      y: -100
    }, {
      x: 100,
      y: -100
    }, {
      x: 100,
      y: 100
    }, {
      x: -100,
      y: 100
    }]
    const simpleCar = {
      lengthFactor: 50,
      radiusFactor: 10,
      vertices,
      wheel0: {
        rad: 50,
        center: vertices[2]
      },

      wheel1: {
        rad: 50,
        center: vertices[3]
      }
    }

    const carGroup = this.Body.nextGroup(true);
    const wheel1 = this.makeCircle(simpleCar.wheel0.center.x, simpleCar.wheel0.center.y, simpleCar.wheel0.rad, carGroup)
    const wheel2 = this.makeCircle(simpleCar.wheel1.center.x, simpleCar.wheel1.center.y, simpleCar.wheel1.rad, carGroup)
    const carBody = this.makeCarBody(simpleCar.vertices, carGroup)

    let options0 = {
      bodyA: carBody.bodies[0],
      pointA: {
        x: 100,
        y: 100
      },
      bodyB: wheel1,
      stiffness: 1
    }
    const wheel0C = this.Constraint.create(options0)

    let options1 = {
      bodyA: carBody.bodies[0],
      pointA: {
        x: -100,
        y: 100
      },
      bodyB: wheel2,
      stiffness: 1
    }
    const wheel1C = this.Constraint.create(options1)

    var carComposite = this.Composite.create({
      label: 'Car'
    })
    this.Composite.addBody(carBody, wheel1);
    this.Composite.addBody(carBody, wheel2);
    this.Composite.addConstraint(carBody, wheel0C)
    this.Composite.addConstraint(carBody, wheel1C)
    var ground = this.Bodies.rectangle(400, 610, 1810, 800, {
      isStatic: true
    });
    this.World.add(this.engine.world, [ground, carBody]) //, wheel1, wheel2]);
    // this.engine.world.gravity.y = 0.1;
    // this.engine.world.gravity.x = 0;
    this.Engine.run(this.engine);

    // add mouse control
    var mouse = this.Mouse.create(this.render.canvas),
      mouseConstraint = this.MouseConstraint.create(this.engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    this.World.add(this.engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    this.render.mouse = mouse;

    window.requestAnimationFrame(() => this.renderLoop(this));
  }

  renderLoop(_this) {
    _this.Render.run(this.render);
    // debugger;
    window.requestAnimationFrame((timestamp) => _this.renderLoop(_this));
  }

}

const m = new Main();
m.run();
