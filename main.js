"use strict";

import Car from "./car.js"
import {PopulationGenerator, Evolver} from "./genetics.js"
import {getRandomElement} from "./helper.js"
import {initRenderer, makeTriangle} from "./pixis.js"
import {pointFromOriginAngleLength} from "./geo.js"

class Main {
    constructor() {

        // this.createTriangle = this.createTriangle.bind(this)

        this.populationGen = new PopulationGenerator()
        this.population = this.populationGen.generatePopulation(10)

        this.renderer = initRenderer()
        this.stage = new PIXI.Container()

        this.evolver = new Evolver()

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
    }

    run() {
        const car = this.population[0]
        console.log(car);

        const lengths = car.lengths.sort((a, b) => a.key.localeCompare(b.key))
        const angles = car.angles.sort((a, b) => a.key.localeCompare(b.key))

        var carGeoSortedByAngle = angles.map(function(e, i) {
            return Object.assign(e, lengths[i]);
        }).sort((a, b) => a.angle - b.angle);

        const center = {
            x: this.renderer.view.width / 2,
            y: this.renderer.view.height / 2
        }

        const lengthFactor = 50

        const withPoints = carGeoSortedByAngle.map(function(e, i) {
            e.point = pointFromOriginAngleLength(center, e.angle, e.len * lengthFactor)
            return e
        })

        withPoints.map((e, i) => {
            const nextIdx = (i + 1) % (withPoints.length)
            const nextElem = withPoints[nextIdx]
            const tri = makeTriangle(center, e.point, nextElem.point)
            this.stage.addChild(tri)
        })

        this.renderer.render(this.stage)
    }

}

const m = new Main();
m.run();
