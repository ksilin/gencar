import {
  pointFromAngleLength
} from "./geo.js"

export default class Car {
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

    const lengths = Object.keys(this)
      .filter(key => key.includes("cartMag"))
      .map(key => {
        return {
          key,
          len: this[key]
        }
      })
      .sort((a, b) => a.key.localeCompare(b.key))

    const angles = Object.keys(this)
      .filter(key => key.includes("cartAngle"))
      .map(key => {
        return {
          key,
          angle: this[key]
        }
      })
      .sort((a, b) => a.key.localeCompare(b.key))

    const carGeoSortedByAngle = angles.map(function(e, i) {
      return Object.assign(e, lengths[i]);
    }).sort((a, b) => a.angle - b.angle);

    const lengthFactor = 50

    this.radiusFactor = 10

    this.geo = carGeoSortedByAngle.map((e, i) => {
      e.point = pointFromAngleLength(e.angle, e.len * lengthFactor)
      return e
    })

    this.vertices = this.geo.map(e => e.point)

    this.wheel0 = {
      rad: this.wheelRadius0 * this.radiusFactor,
      wheelCenter: this.geo[Math.round((this.wheelVertex0 / (Math.PI * 2)) * 7)].point
    }

    this.wheel1 = {
      rad: this.wheelRadius1 * this.radiusFactor,
      wheelCenter: this.geo[Math.round((this.wheelVertex1 / (Math.PI * 2)) * 7)].point
    }

    this.wheels = [this.wheel0, this.wheel1]
  }
}
