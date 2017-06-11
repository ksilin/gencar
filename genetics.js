import Car from "./car.js"
import {generateId, getRandomInt} from "./helper.js"

class PopulationGenerator {
    constructor() {};

    generatePopulation(count) {
        let cars = [];
        for (var i = 0; i < count; i++) {
            cars.push(this.randomCar());
        }
        return cars
    };

    getArray(length, max) {
        return [...new Array(length)].map(() => Math.random() * max);
    }

    randomCar() {
      return new Car(generateId(20), this.getArray(22, Math.PI * 2));
    }

    // TODO - no genes - does no fit here- for rendering only
    simpleCar(){
      const vertices = [{
        x: -100,
        y: -100
      }, {
        x: 100,
        y: -100
      }, {
        x: 250,
        y: 50
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
          center: vertices[3]
        },

        wheel1: {
          rad: 50,
          center: vertices[4]
        }
      }
      return simpleCar
    }
}

class Evolver {

    fitness(car) {
        return Math.random();
    }

    mutate(car) {
        const names = Object.getOwnPropertyNames(car)
        const idx = getRandomInt(0, names.length)
        car[names[idx]] = Math.random() * Math.PI * 2
        return car
    }

    tournament(cars) {

        return cars.reduce((acc, curr) => {

            const idxSet = new Set(cars.map((c, idx) => idx))
            const currIdx = cars.indexOf(curr)

            idxSet.delete(currIdx)
            const withoutCurrArray = Array.from(idxSet)
            const candidate = cars[withoutCurrArray[getRandomInt(0, withoutCurrArray.length)]]
            const fittest = this.fitness(curr) > this.fitness(candidate)
                ? curr
                : candidate
            return acc.concat(fittest)
        }, [])
    }

    crossover(carA, carB) {
        const names = Object.getOwnPropertyNames(carA).filter(name => name !== 'id')
        const genes = names.map(name => Math.random() > 0.5
            ? carA[name]
            : carB[name])
        return new Car(generateId(20), genes)
    }

    // [{ car: Car(...), fitness: 0.1}]
    truncate(carsAndFitness, rate = 0.9) {
        carsAndFitness.sort((a, b) => b.fitness - a.fitness)
        return carsAndFitness.slice(0, carsAndFitness.length * rate)
    }

}

export {PopulationGenerator, Evolver}
