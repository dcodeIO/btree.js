var path = require("path"),
    os = require("os"),
    cluster = require("cluster"),
    Suite = require("testjs"); // for colors

module.exports = function(min, max, size, times, cb) {

    if (!cluster.isMaster) {
        require(path.join(__dirname, 'worker.js'));
    } else {
        var worker = cluster.fork();

        worker.on("error", function(err) {
            console.error(err);
        });

        function calculateRange(range, size, callback) {
            worker.once('message', function(msg) {
                callback(msg['range'], msg['time']);
            });
            worker.send({
                'range':  range,
                'size': size,
                'times': times
            });
        }

        function process(range) {
            console.log("\nProcessing range: ".white.bold+"["+range+"]");
            calculateRange(range, size, function(newRange, time) {
                if (newRange[0] == newRange[1]) {
                    cluster.disconnect(); // Done
                    if (cb) {
                        cb(newRange[0], time);
                    } else {
                        console.log("\nResult: ".white.bold+(newRange[0]+"").green.bold+(" ("+(time/1000).toFixed(3)+" ms)").grey.bold);
                    }
                } else {
                    process(newRange);
                }
            });
        }
        
        console.log([
            "",
            "|_ |_ _ _ _".green.bold,
            "|_)|_| (-(- optimize".green.bold+" : range=["+min+","+max+"], size="+size+", times="+times
        ].join('\n'));
        process([min,max]);
    }
    
};
