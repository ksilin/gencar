function pointFromOriginAngleLength(origin, angle, length) {
    return {
        x: origin.x + Math.cos(angle) * length,
        y: origin.y + Math.sin(angle) * length
    }
}

export {pointFromOriginAngleLength}
