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

  run() {

    this.simpleCar = new PopulationGenerator().simpleCar()//randomCar()
    this.simpleCar = new PopulationGenerator().randomCar()
    this.carComp = this.m.makeCarComposite(this.simpleCar)

    var ground = this.m.Bodies.rectangle(400, 610, 1810, 800, {
      isStatic: true
    });
    this.World.add(this.engine.world, [ground, this.carComp.body])
    // this.engine.world.gravity.y = 0.1;
    // this.engine.world.gravity.x = 0;
    this.Engine.run(this.engine);
    //this.Engine.run(this.engine);
    this.addMouseControl()
    var rotationSpeed = -10;
    //  this.m.Body.applyForce(wheel0, simpleCar.wheel0.center, {x: 100, y: 0});
    // this.m.Body.rotate(wheel1, rotationSpeed);
    // this.m.Body.rotate(wheel0, rotationSpeed);
    window.requestAnimationFrame(() => this.renderLoop(this));
    this.Render.run(this.render);
  }

  renderLoop(_this) {
    // _this.m.Body.applyForce(_this.carComp.wheel0, _this.carComp.wheel0.position, {x: 10, y: 0});
    //console.log(_this.carComp.wheel0);
    _this.Engine.update(_this.engine, 30, 1)
    // _this.m.Body.rotate(_this.carComp.wheel0, 1)
    // _this.m.Body.rotate(_this.carComp.wheel1, 1)

    // debugger;
    window.requestAnimationFrame((timestamp) => _this.renderLoop(_this));
  }

}

const m = new Main();
m.run();
