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
    this.Constraint = Matter.Constraint
    this.Composites = Matter.Composites
    this.Vertices = Matter.Vertices
    this.Render = Matter.Render
    this.Vector = Matter.Vector
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
  }

  makeCarBody(points, group) {

    console.log("creating car body: ", points);

    var bodyComposite = this.Composite.create({
      label: 'body'
    })

    let triangles = points.map((e, i) => {

      let nextIdx = (i + 1) % (points.length)
      let nextElem = points[nextIdx]
      console.log(e, nextElem);
      let triPoints = [{
        x: 0,
        y: 0
      }, e, nextElem]
      let triCenter = this.Vertices.centre(triPoints)
      console.log("triCenter ", triCenter);
      let triCenterVec = this.Vector.sub(triCenter, {
        x: 0,
        y: 0
      })
      console.log("triCenterVec ", triCenterVec);

      let tri = this.Bodies.fromVertices(0, 0, triPoints, {
        collisionFilter: {
          category: this.carCategory,
          group: group
        },
        friction: 0.01
      })
      this.Body.translate(tri, triCenterVec)
      this.Composite.add(bodyComposite, tri)
      return tri
    })

    let constraints = triangles.map((e, i) => {
        let nextIdx = (i + 1) % (triangles.length)
        let nextElem = triangles[nextIdx]
        let options = {
          bodyA: e,
          bodyB: nextElem,
          pointA: e.position,
          pointB: nextElem.position,
          stiffness: 1
        }
        var constraint = this.Constraint.create(options)
        this.Composite.addConstraint(bodyComposite, constraint)
        return constraint
      })
      console.log(bodyComposite)
      return bodyComposite
    }

    makeWheelBody(car, idx, group) {
      const v = Math.round((car[`wheelVertex${idx}`] / (Math.PI * 2)) * 7)
      const rad = car[`wheelRadius${idx}`] * car.radiusFactor
      const wheelCenter = car.geo[v].point
      console.log("point ", idx, " : ", wheelCenter);
      return this.makeCircle(wheelCenter.x, wheelCenter.y, rad, group)
    }

    makeCircle(x, y, rad, collisionGroup) {
      let circle = this.Bodies.circle(0, 0, rad, {
        collisionFilter: {
          category: this.carCategory,
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
      console.log("carGeoPoints ", carGeoPoints);
      let body = this.makeCarBody(carGeoPoints, group)
      console.log("body ", body);
      var wheelA = this.makeWheelBody(car, 0, group)
      console.log("wheelA ", wheelA);
      var wheelB = this.makeWheelBody(car, 1, group)
      console.log("wheelB ", wheelB);

      this.Composite.addBody(carComposite, body);
      this.Composite.addBody(carComposite, wheelA);
      this.Composite.addBody(carComposite, wheelB);
      // this.Composite.addConstraint(carComposite, axelA);
      // this.Composite.addConstraint(carComposite, axelB);

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


      const gen = new PopulationGenerator()
      const car = gen.randomCar()
      const carPoints = car.geo.map(e => e.point)

      const geo = [{
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

      const carGroup = this.Body.nextGroup(true);
      const wheel1 = this.makeWheelBody(car, 0, carGroup)
      const wheel2 = this.makeWheelBody(car, 1, carGroup)
      const carBody = this.makeCarBody(carPoints, carGroup)

      var carComposite = this.Composite.create({
        label: 'Car'
      })
      this.Composite.addBody(carBody, wheel1);
      this.Composite.addBody(carBody, wheel2);
      // this.Composite.addBody(carComposite, wheel2);
      var ground = this.Bodies.rectangle(400, 610, 1810, 60, {
        isStatic: true
      });
      this.World.add(this.engine.world, [ground, carBody]) //, wheel1, wheel2]);
      // this.engine.world.gravity.y = 0;
      // this.engine.world.gravity.x = 0;
      this.Engine.run(this.engine);

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
