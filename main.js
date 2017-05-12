"use strict";

class Car {
    constructor(id, genes) {
        this.id = id;
        this.cartAngle0 = genes[0];
        this.cartMag0 = genes[1];
        this.cartAngle1 = genes[2];
        this.cartMag1 = genes[3];
        this.cartAngle2 = genes[4];
        this.cartMag2 = genes[5];
        this.cartAngle3 = genes[6];
        this.cartMag3 = genes[7];
        this.cartAngle4 = genes[8];
        this.cartMag4 = genes[9];
        this.cartAngle5 = genes[10];
        this.cartMag5 = genes[11];
        this.cartAngle6 = genes[12];
        this.cartMag6 = genes[13];
        this.cartAngle7 = genes[14];
        this.cartMag7 = genes[15];
        this.wheelVertex0 = genes[16];
        this.axleAngle0 = genes[17];
        this.wheelRadius0 = genes[18];
        this.wheelVertex1 = genes[19];
        this.axleAngle1 = genes[20];
        this.wheelRadius1 = genes[21];
    }
}

// dec2hex :: Integer -> String
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}
// Math.round(genes[16] /  Math.PI * 4);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomElement(ar, from = 0) {
  return ar[getRandomInt(from, ar.length - 1)]
}

class PopulationGenerator {
    constructor() {};

    generatePopulation(count) {
        let cars = [];
        for (var i = 0; i < count; i++) {
            cars.push(new Car(generateId(20), this.getArray(22, Math.PI * 2)));
        }
        return cars
    };

    getArray(length, max) {
        return [...new Array(length)].map(() => Math.random() * max);
    }
}

class Evolver {

    fitness(car) {
        return Math.random();
    }

    mutate(car) {
        const names = Object.getOwnPropertyNames(car)
        const idx = getRandomInt(0, names.length)
        console.log(car[names[idx]])
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
      carsAndFitness.sort((a, b) => b.fitness - a.fitness )
      return carsAndFitness.slice(0, carsAndFitness.length * rate)
    }

}

class Main {
    constructor() {
        this.populationGen = new PopulationGenerator()
        this.population = this.populationGen.generatePopulation(10)

        this.evolver = new Evolver()

        const carsWithFitness = this.population.map(car => {
          return { car, "fitness": this.evolver.fitness(car) }
        })

        // this.evolver.mutate(this.population[0])
        const truncated = this.evolver.truncate(carsWithFitness, 0.7)
        console.log(truncated.map(c => c.car.id));
        const matingPool = this.evolver.tournament(this.population)
        console.log(matingPool[0]);
        console.log(matingPool[1]);

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
}

const m = new Main();
