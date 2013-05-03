var path = require("path"),
    Suite = require("testjs"),
    bench = require(path.join(__dirname, '..', 'bench.js'));

process.stdout.write = function() {}; // Disable console

// When a worker gets a message, it simply calculates
process.on("message", function(msg) {
    if (msg['range']) {
        calculateRange(msg['range'][0], msg['range'][1], msg['size'], function(range, minTime) {
            msg['range'] = range;
            msg['time'] = minTime;
            process.send(msg);
        }, msg['times']);
    } else {
        calculate(msg['order'], msg['size'], function(time) {
            msg['time'] = time;
            process.send(msg);
        }, msg['times']);
    }
});

// Cache what we calculated once
var cache = {};

/**
 * Gets the reference time in microseconds.
 * @returns {number} Microseconds (10^6 s)
 */
function hrtime() {
    var hr = process.hrtime();
    return Math.round(hr[0]*1000000 + hr[1]/1000);
}

/**
 * Calculates the time required to run the benchmark with the given parameters.
 * @param {number} order Tree order
 * @param {number} size Number of elements
 * @param {function(number)} callback Callback receiving the time
 * @param {number=} times Number of times to calculate to prevent random peeks
 */
function calculate(order, size, callback, times) {
    if (typeof cache[order] != 'undefined') {
        callback(cache[order]);
        return;
    }
    times = times || 3;
    var suite = new Suite(bench(order, size, /* skipAsserted */ true), ""+order, null);
    var startTime = hrtime();
    suite.run(function() {
        var time = hrtime() - startTime;
        if (times == 1) {
            cache[order] = time;
            callback(time);
        } else {
            startTime = hrtime();
            calculate(order, size, function() {
                var subTime = hrtime()-startTime;
                callback(time < subTime ? time : subTime);
            }, times-1);
        }
    });
}

/**
 * Calculates the new range depending on benchmark times.
 * @param {number} min Minimum order
 * @param {number} max Maximum order
 * @param {number} size Number of elements
 * @param {function(Array.<number>, number)} callback
 * @param {number=} times Number of times to calculate each order to prevent random peeks
 */
function calculateRange(min, max, size, callback, times) {
    times = times || 3;
    var mid = Math.round(min + (max-min)/2);
    calculate(min, size, function(minTime) {
        calculate(mid, size, function(midTime) {
            calculate(max, size, function(maxTime) {
                if (minTime < midTime && minTime < maxTime) {
                    callback([min, mid < max ? mid : mid-1], minTime);
                } else if (maxTime < minTime && maxTime < midTime) {
                    callback([min < mid ? mid : mid+1, max], maxTime);
                } else if (midTime < minTime && midTime < maxTime) {
                    callback([min+1, (max > min+1) ? max-1 : max], midTime);
                    /* if (minTime < maxTime) {
                        callback([min, mid], midTime);
                    } else if (maxTime < minTime) {
                        callback([mid, max], maxTime);
                    } else {
                        delete cache[min]; delete cache[mid]; delete cache[max];
                        callback([min, max], -1);
                    } */
                } else {
                    delete cache[min]; delete cache[mid]; delete cache[max];
                    callback([min, max], -1);
                }
            }, times);
        }, times)
    }, times);
}
