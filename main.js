"use strict";

import Car from "./car.js"
import {PopulationGenerator, Evolver} from "./genetics.js"
import {getRandomElement} from "./helper.js"

const ctx = document.getElementById("canvas").getContext("2d")

class Geo {

  pointFromOriginAngleLength(origin, angle, length) {
      return {
          x: origin.x + Math.cos(angle) * length,
          y: origin.y + Math.sin(angle) * length
      }
  }

  createTriangle(center, b, c) {
      console.log("creatingTriangle");
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y);
      ctx.fill();
  }
}

class Main {
    constructor() {

        // this.createTriangle = this.createTriangle.bind(this)

        this.populationGen = new PopulationGenerator()
        this.population = this.populationGen.generatePopulation(10)

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
        console.log(newGen.map(c => c.id))
    }

    run() {
        const car = this.population[0]
        console.log(car);

        const lengths = car.lengths.sort((a, b) => a.key.localeCompare(b.key))
        const angles = car.angles.sort((a, b) => a.key.localeCompare(b.key))

        var carGeoSortedByAngle = angles.map(function(e, i) {
            return Object.assign(e, lengths[i]);
        }).sort((a, b) => a.angle - b.angle);

        const geo = new Geo()
        const center = {
            x: 400,
            y: 300
        }

        const lengthFactor = 50

        const withPoints = carGeoSortedByAngle.map(function(e, i) {
            e.point = geo.pointFromOriginAngleLength(center, e.angle, e.len * lengthFactor)
            return e
        })

        const polyPoints = withPoints.map(function(e, i) { return [e.point.x, e.point.y] })
        const poly = [].concat.apply([], polyPoints)
        console.log(poly);

        withPoints.map(function(e, i) {
            const nextIdx = (i + 1) % (withPoints.length - 1)
            const nextElem = withPoints[nextIdx]
            geo.createTriangle(center, e.point, nextElem.point)
        })

    }

}

const m = new Main();
m.run();
