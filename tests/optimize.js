var path = require("path"),
    Suite = require("testjs"); // For colors

var optimize = require(path.join(__dirname, 'optimize', 'master.js'));
optimize(/* min */ 2, /* max */ 200, /* size */ 100000, /* times */ 20,
    function(order, time) {
        console.log("\nResult: ".white.bold+(order+"").green.bold+(" ("+(time/1000).toFixed(3)+" ms)").grey.bold);
    }
);
