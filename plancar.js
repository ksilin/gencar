// wheel spring settings
const HZ = 4.0;
const ZETA = 0.7;
const SPEED = 50.0;

class Main {

    constructor() {
        this.pl = planck
        this.stage = this.pl.testbed
        this.v2 = this.pl.Vec2;
        this.world = new this.pl.World({
            gravity: this.v2(0, -10)
        });

        this.ground = this.createGround(this.pl, this.world, this.v2)
        this.createTeeter(this.pl, this.world, this.v2, this.ground)
        this.createBridge(this.pl, this.world, this.v2, this.ground)
        this.createBoxes(this.pl, this.world, this.v2)

        const {car, springFront, springBack} = this.createCar(this.pl, this.world, this.v2)
        this.car = car
        this.springFront = springFront
        this.springBack = springBack
    }

    init() {
        planck.testbed('Car', (testbed) => {

            testbed.speed = 1.3;
            testbed.hz = 50;

            const springBack = this.springBack
            const springFront = this.springFront

            testbed.keydown = function() {
                if (testbed.activeKeys.down) {
                    HZ = Math.max(0.0, HZ - 1.0);
                    springBack.setSpringFrequencyHz(HZ);
                    springFront.setSpringFrequencyHz(HZ);

                } else if (testbed.activeKeys.up) {
                    HZ += 1.0;
                    springBack.setSpringFrequencyHz(HZ);
                    springFront.setSpringFrequencyHz(HZ);
                }
            };

            testbed.step = () => {
                if (testbed.activeKeys.right && testbed.activeKeys.left) {
                    springBack.setMotorSpeed(0);
                    springBack.enableMotor(true);

                } else if (testbed.activeKeys.right) {
                    springBack.setMotorSpeed(-SPEED);
                    springBack.enableMotor(true);

                } else if (testbed.activeKeys.left) {
                    springBack.setMotorSpeed(+ SPEED);
                    springBack.enableMotor(true);

                } else {
                    springBack.setMotorSpeed(0);
                    springBack.enableMotor(false);
                }

                var cp = this.car.getPosition();
                if (cp.x > testbed.x + 10) {
                    testbed.x = cp.x - 10;

                } else if (cp.x < testbed.x - 10) {
                    testbed.x = cp.x + 10;
                }
            };

            testbed.info('←/→: Accelerate car, ↑/↓: Change spring frequency');

            return this.world;
        })
    }

    createCar(pl, world, Vec2) {
        var car = world.createDynamicBody(Vec2(0.0, 1.0));
        car.createFixture(pl.Polygon([
            Vec2(-1.5, -0.5),
            Vec2(1.5, -0.5),
            Vec2(1.5, 0.0),
            Vec2(0.0, 0.9),
            Vec2(-1.15, 0.9),
            Vec2(-1.5, 0.2)
        ]), 1.0);

        var wheelFD = {};
        wheelFD.density = 1.0;
        wheelFD.friction = 0.9;

        var wheelBack = world.createDynamicBody(Vec2(-1.0, 0.35));
        wheelBack.createFixture(pl.Circle(0.4), wheelFD);

        var wheelFront = world.createDynamicBody(Vec2(1.0, 0.4));
        wheelFront.createFixture(pl.Circle(0.4), wheelFD);

        var springBack = world.createJoint(pl.WheelJoint({
            motorSpeed: 0.0,
            maxMotorTorque: 20.0,
            enableMotor: true,
            frequencyHz: HZ,
            dampingRatio: ZETA
        }, car, wheelBack, wheelBack.getPosition(), Vec2(0.0, 1.0)));

        var springFront = world.createJoint(pl.WheelJoint({
            motorSpeed: 0.0,
            maxMotorTorque: 10.0,
            enableMotor: false,
            frequencyHz: HZ,
            dampingRatio: ZETA
        }, car, wheelFront, wheelFront.getPosition(), Vec2(0.0, 1.0)));

        return {car, springFront, springBack}
    }

    createGround(pl, world, Vec2) {
        var ground = world.createBody();

        var groundFD = {
            density: 0.0,
            friction: 0.6
        };

        ground.createFixture(pl.Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD);

        var hs = [
            0.25,
            1.0,
            4.0,
            0.0,
            0.0,
            -1.0,
            -2.0,
            -2.0,
            -1.25,
            0.0
        ];

        var x = 20.0,
            y1 = 0.0,
            dx = 5.0;

        for (var i = 0; i < 10; ++i) {
            var y2 = hs[i];
            ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
            y1 = y2;
            x += dx;
        }

        for (var i = 0; i < 10; ++i) {
            var y2 = hs[i];
            ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
            y1 = y2;
            x += dx;
        }

        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 80.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 40.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);

        x += 20.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);

        x += 40.0;
        ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);

        return ground
    }

    createTeeter(pl, world, Vec2, ground) {
        // Teeter
        var teeter = world.createDynamicBody(Vec2(140.0, 1.0));
        teeter.createFixture(pl.Box(10.0, 0.25), 1.0);
        world.createJoint(pl.RevoluteJoint({
            lowerAngle: -8.0 * Math.PI / 180.0,
            upperAngle: 8.0 * Math.PI / 180.0,
            enableLimit: true
        }, ground, teeter, teeter.getPosition()));

        teeter.applyAngularImpulse(100.0, true);
        return teeter
    }

    createBridge(pl, world, Vec2, ground) {
        // Bridge
        var bridgeFD = {};
        bridgeFD.density = 1.0;
        bridgeFD.friction = 0.6;

        var prevBody = ground;
        for (var i = 0; i < 20; ++i) {
            var bridgeBlock = world.createDynamicBody(Vec2(161.0 + 2.0 * i, -0.125));
            bridgeBlock.createFixture(pl.Box(1.0, 0.125), bridgeFD);

            world.createJoint(pl.RevoluteJoint({}, prevBody, bridgeBlock, Vec2(160.0 + 2.0 * i, -0.125)));

            prevBody = bridgeBlock;
        }
        world.createJoint(pl.RevoluteJoint({}, prevBody, ground, Vec2(160.0 + 2.0 * i, -0.125)));
        return bridgeFD
    }

    createBoxes(pl, world, Vec2) {
        // Boxes
        var box = pl.Box(0.5, 0.5);

        world.createDynamicBody(Vec2(230.0, 0.5)).createFixture(box, 0.5);
        world.createDynamicBody(Vec2(230.0, 1.5)).createFixture(box, 0.5);
        world.createDynamicBody(Vec2(230.0, 2.5)).createFixture(box, 0.5);
        world.createDynamicBody(Vec2(230.0, 3.5)).createFixture(box, 0.5);
        world.createDynamicBody(Vec2(230.0, 4.5)).createFixture(box, 0.5);

        return box
    }

}

const main = new Main()
main.init()
