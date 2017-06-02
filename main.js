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
        const v1 = Math.round((car.wheelVertex0 / (Math.PI * 2)) * 8)
        const v2 = Math.round((car.wheelVertex1 / (Math.PI * 2)) * 8)

        console.log(car);

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

    run() {
        this.evolve()
        const car = this.population[0]
        this.shape = this.makeCarShapes(car)
        this.stage.addChild(this.shape)
        this.renderer.render(this.stage)

        // create two boxes and a ground
        var boxA = this.Bodies.rectangle(400, 200, 80, 80);
        var boxB = this.Bodies.rectangle(450, 50, 80, 80);
        var ground = this.Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

        // add all of the bodies to the world
        this.World.add(this.engine.world, [boxA, boxB, ground]);

        // run the engine
        this.Engine.run(this.engine);

        console.log(this.engine.world);

        window.requestAnimationFrame(() => this.renderLoop(this));
    }

    renderLoop(_this) {
        _this.shape.children[0].rotation += .1
        _this.shape.children[1].rotation += .1
        _this.renderer.render(_this.stage);
        // run the matter renderer
        _this.Render.run(this.render);
        window.requestAnimationFrame((timestamp) => _this.renderLoop(_this));
    }

    test() {
        console.log("test");
    }

}

const m = new Main();
m.run();
