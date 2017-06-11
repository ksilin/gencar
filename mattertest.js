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

  run() {

    const simpleCar = new PopulationGenerator().simpleCar()
    let centre = this.m.Vertices.centre(simpleCar.vertices)
    console.log("centre: " + centre.x + ", " +  centre.y);

    const carGroup = this.m.Body.nextGroup(true);
    const wheel0 = this.m.makeCircle(simpleCar.wheel0.center.x - centre.x, simpleCar.wheel0.center.y - centre.y, simpleCar.wheel0.rad, carGroup)
    const wheel1 = this.m.makeCircle(simpleCar.wheel1.center.x - centre.x, simpleCar.wheel1.center.y - centre.y, simpleCar.wheel1.rad, carGroup)
    const carBody = this.m.makeCarBody(simpleCar.vertices, carGroup)


    let wheel0Shift = this.m.Vector.sub(simpleCar.wheel0.center, centre)
    let options0 = {
      bodyA: carBody.bodies[0],
      pointA: wheel0Shift,
      bodyB: wheel0,
      stiffness: 1
    }
    const wheel0C = this.m.Constraint.create(options0)

    let wheel1Shift = this.m.Vector.sub(simpleCar.wheel1.center, centre)
    let options1 = {
      bodyA: carBody.bodies[0],
      pointA: wheel1Shift,
      bodyB: wheel1,
      stiffness: 1
    }
    const wheel1C = this.m.Constraint.create(options1)

    var carComposite = this.m.Composite.create({
      label: 'Car'
    })
    this.m.Composite.addBody(carBody, wheel0);
    this.m.Composite.addBody(carBody, wheel1);
    this.m.Composite.addConstraint(carBody, wheel0C)
    this.m.Composite.addConstraint(carBody, wheel1C)
    var ground = this.m.Bodies.rectangle(400, 610, 1810, 800, {
      isStatic: true
    });
    this.World.add(this.engine.world, [ground, carBody]) //, wheel1, wheel2]);
    // this.engine.world.gravity.y = 0.1;
    // this.engine.world.gravity.x = 0;
    this.Engine.run(this.engine);

    this.addMouseControl()

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
