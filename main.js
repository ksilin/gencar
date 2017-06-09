"use strict";

import Car from "./car.js"
import {PopulationGenerator, Evolver} from "./genetics.js"
import {getRandomElement} from "./helper.js"
import {initRenderer, makeTriangle, makeWheel} from "./pixis.js"

class Main {
    constructor() {
        this.populationGen = new PopulationGenerator()
        this.population = this.populationGen.generatePopulation(10)

        this.renderer = initRenderer()
        this.stage = new PIXI.Container()
        this.center = {
            x: this.renderer.view.width / 2,
            y: this.renderer.view.height / 2
        }
        this.evolver = new Evolver()

        this.Engine = Matter.Engine
        this.World = Matter.World
        this.Bodies = Matter.Bodies
        this.Body = Matter.Body
        this.Composite = Matter.Composite
        this.Constraint = Matter.Constraint
        this.Composites = Matter.Composites
        this.Vertices = Matter.Vertices
        this.Render = Matter.Render
        // create an engine
        this.engine = this.Engine.create();
        // create a renderer
        this.render = this.Render.create({element: document.body, engine: this.engine});
    }

    evolve() {
        const carsWithFitness = this.population.map(car => {
            return {car, "fitness": this.evolver.fitness(car)}
        })

        // this.evolver.mutate(this.population[0])
        const truncated = this.evolver.truncate(carsWithFitness, 0.7)
        const matingPool = this.evolver.tournament(this.population)

        const child1 = this.evolver.crossover(getRandomElement(matingPool), getRandomElement(matingPool))
        const child2 = this.evolver.crossover(getRandomElement(matingPool), getRandomElement(matingPool))

        const mutant = this.evolver.mutate(getRandomElement(truncated, 1).car)

        let newGen = []
        newGen = newGen.concat(truncated.map(elem => elem.car))
        newGen.push(child1)
        newGen.push(child2)
        newGen.push(mutant)
        this.population = newGen
    }

    makeCarShapes(car) {
        const group = new PIXI.Container()

        const v1 = Math.round((car.wheelVertex0 / (Math.PI * 2)) * 7)
        const v2 = Math.round((car.wheelVertex1 / (Math.PI * 2)) * 7)
        const rad1 = car.wheelRadius0 * car.radiusFactor
        const rad2 = car.wheelRadius1 * car.radiusFactor
        const wheel1 = makeWheel(car.geo[v1].point, rad1)

        const pt1 = car.geo[v1].point
        wheel1.x += pt1.x + this.center.x
        wheel1.y += pt1.y + this.center.y
        group.addChildAt(wheel1, 0);

        const wheel2 = makeWheel(car.geo[v2].point, rad2)
        const pt2 = car.geo[v2].point
        wheel2.x += pt2.x + this.center.x
        wheel2.y += pt2.y + this.center.y
        group.addChildAt(wheel2, 1);

        car.geo.map((e, i) => {
            const nextIdx = (i + 1) % (car.geo.length)
            const nextElem = car.geo[nextIdx]
            const tri = makeTriangle({
                x: 0,
                y: 0
            }, e.point, nextElem.point)
            tri.x = this.center.x
            tri.y = this.center.y
            group.addChild(tri)
        })
        return group
    }

    makeCarBody(car, group) {
        console.log(car);
        const points = car.geo.map(e => {
            return e.point
        })
        console.log(points);
        return this.Bodies.fromVertices(this.center.x, this.center.y, points, {
            collisionFilter: {
                group: group
            },
            friction: 0.01,
            chamfer: {
                radius: 10
            }
        }, true)
    }

    makeWheelBody(car, idx, group) {
        const v = Math.round((car[`wheelVertex${idx}`] / (Math.PI * 2)) * 7)
        const rad = car[`wheelVertex${idx}`] * car.radiusFactor
        const center = car.geo[v].point
        const x = center.x + this.center.x
        const y = center.y + this.center.y
        return this.Bodies.circle(x, y, rad, {
            collisionFilter: {
                group: group
            },
            friction: 0.8,
            density: 0.01
        })
    }

    makeCar(car) {
        var group = this.Body.nextGroup(true);

        var carComposite = this.Composite.create({label: 'Car'}),
            body = this.makeCarBody(car, group)

        var wheelA = this.makeWheelBody(car, 0, group)
        console.log(wheelA);

        var wheelB = this.makeWheelBody(car, 1, group)
        console.log(wheelB);

        var axelA = this.Constraint.create({
            bodyA: body,
            pointA: {
                x: wheelA.position.x,
                y: wheelA.position.y
            },
            bodyB: wheelA,
            stiffness: 0.2
        });

        var axelB = this.Constraint.create({
            bodyA: body,
            pointA: {
                x: wheelB.position.x,
                y: wheelB.position.y
            },
            bodyB: wheelB,
            stiffness: 0.2
        });

        this.Composite.addBody(carComposite, body);
        this.Composite.addBody(carComposite, wheelA);
        this.Composite.addBody(carComposite, wheelB);
        // this.Composite.addConstraint(carComposite, axelA);
        // this.Composite.addConstraint(carComposite, axelB);

        return carComposite;
    };

    run() {
        // this.evolve()
        const car = this.population[0]
        this.shape = this.makeCarShapes(car)
        this.stage.addChild(this.shape)

        // create two boxes and a ground
        var carBody = this.makeCar(car) //this.makeCarBody(car)
        var ground = this.Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

        // add all of the bodies to the world
        this.World.add(this.engine.world, [carBody, ground]);

        // run the engine
        this.Engine.run(this.engine);

        console.log(this.engine.world);

        window.requestAnimationFrame(() => this.renderLoop(this));
    }

    renderLoop(_this) {
        // _this.shape.children[0].rotation += .1
        // _this.shape.children[1].rotation += .1
        _this.renderer.render(_this.stage);
        // run the matter renderer
        _this.Render.run(this.render);
        debugger;
        window.requestAnimationFrame((timestamp) => _this.renderLoop(_this));
    }

}

const m = new Main();
// wait for resources
m.run();
