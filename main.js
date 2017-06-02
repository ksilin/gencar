"use strict";

import Car from "./car.js"
import {PopulationGenerator, Evolver} from "./genetics.js"
import {getRandomElement} from "./helper.js"
import {initRenderer, makeTriangle} from "./pixis.js"

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
    }

    evolve(){
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

    drawCar(car) {
      car.geo.map((e, i) => {
          const nextIdx = (i + 1) % (car.geo.length)
          const nextElem = car.geo[nextIdx]
          const tri = makeTriangle({x: 0, y: 0}, e.point, nextElem.point)
          tri.x = this.center.x
          tri.y = this.center.y
          this.stage.addChild(tri)
      })
    }

    run() {
        this.evolve()
        const car = this.population[0]
        this.drawCar(car)
        this.renderer.render(this.stage)
    }
}

const m = new Main();
m.run();
