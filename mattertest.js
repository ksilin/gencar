"use strict";

import M from "./matterwrap.js"
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

    this.m = new M()
    this.Engine = Matter.Engine
    this.World = Matter.World
    this.Render = Matter.Render
    this.Mouse = Matter.Mouse
    this.MouseConstraint = Matter.MouseConstraint
    this.engine = this.Engine.create();
    this.render = this.Render.create({
      element: document.body,
      engine: this.engine,
      options: {
        hasBounds: true,
        // showVelocity: true,
        showCollisions: true,
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

  addMouseControl() {
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
  }

  constrainWheel(carBody, wheel, wheelCenter, offset){
    let wheelShift = this.m.Vector.sub(wheelCenter, offset)
    let options = {
      bodyA: carBody,
      pointA: wheelShift,
      bodyB: wheel,
      stiffness: 0.5
    }
    return this.m.Constraint.create(options)
  }

  run() {

    const simpleCar = new PopulationGenerator().randomCar()
    let centre = this.m.Vertices.centre(simpleCar.vertices)
    console.log("offet: " + centre.x + ", " +  centre.y);

    const carGroup = this.m.Body.nextGroup(true);
    let wheel0Pos = this.m.Vector.sub(simpleCar.wheel0.center, centre)
    const wheel0 = this.m.makeCircle(wheel0Pos.x, wheel0Pos.y, simpleCar.wheel0.rad, carGroup)
    let wheel1Pos = this.m.Vector.sub(simpleCar.wheel1.center, centre)
    const wheel1 = this.m.makeCircle(wheel1Pos.x, wheel1Pos.y, simpleCar.wheel1.rad, carGroup)

    const carBody = this.m.makeCarBody(simpleCar.vertices, carGroup)

    this.m.Composite.addBody(carBody, wheel0);
    this.m.Composite.addBody(carBody, wheel1);

    const wheel0C = this.constrainWheel(carBody.bodies[0], wheel0, simpleCar.wheel0.center, centre)
    const wheel1C = this.constrainWheel(carBody.bodies[0], wheel1, simpleCar.wheel1.center, centre)
    this.m.Composite.addConstraint(carBody, wheel0C)
    this.m.Composite.addConstraint(carBody, wheel1C)

    var ground = this.m.Bodies.rectangle(400, 610, 1810, 800, {
      isStatic: true
    });
    this.World.add(this.engine.world, [ground, carBody])
    // this.engine.world.gravity.y = 0.1;
    // this.engine.world.gravity.x = 0;
    this.Engine.run(this.engine);

    this.addMouseControl()
    var rotationSpeed = -10;
  //  this.m.Body.applyForce(wheel0, simpleCar.wheel0.center, {x: 100, y: 0});
   this.m.Body.rotate(wheel1, rotationSpeed);
   this.m.Body.rotate(wheel0, rotationSpeed);

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
