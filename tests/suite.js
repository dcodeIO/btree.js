var path = require("path"),
    btree = require(path.join(__dirname, '..', 'btree.js')),
    Tree, tree;

module.exports = {
    'init/put': function(test) {
        var data = [2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
        test.log("data: "+data);
        Tree = btree.create();
        tree = new Tree();
        for (var i=0; i<data.length; i++) {
            tree.put(data[i], ""+data[i]);
        }
        // tree.print();
        test.done();
    },
    
    "putMore": function(test) {
        var data = [7, 9, 11, 13];
        test.log("data: "+data);
        for (var i=0; i<data.length; i++) {
            test.strictEqual(tree.put(data[i], ""+data[i]), true);
        }
        test.done();
    },
    
    "get": function(test) {
        test.strictEqual(tree.get(8), "8");
        test.strictEqual(tree.get(3), undefined);
        test.done();
    },
    
    "delete": function(test) {
        test.log("del: "+8);
        test.strictEqual(tree.del(8), true);
        test.strictEqual(tree.get(8), undefined);
        
        test.log("del: 14, 36, 37*");
        test.strictEqual(tree.del(14), true);
        test.strictEqual(tree.del(36), true);
        test.strictEqual(tree.del(37), false);
        
        test.strictEqual(tree.get(14), undefined);
        test.strictEqual(tree.get(36), undefined);
        test.strictEqual(tree.get(37), undefined);
        
        test.done();
    },
    
    "walkAsc(from,to)": function(test) {
        var comp = [2,4,5,6,7,9,10,11,12,13];
        var res = [];
        tree.walkAsc(2, 14, function(key, val) {
            res.push(key);
            test.strictEqual(key+"", val);
        });
        test.deepEqual(res, comp);
        test.done();
    },
    
    "walkDesc(to,from)": function(test) {
        var comp = [18,16,13,12,11,10,9,7,6,5,4,2];
        var res = [];
        tree.walkDesc(2, 18, function(key, val) {
            res.push(key);
            test.strictEqual(key+"", val);
        });
        test.deepEqual(res, comp);
        test.done();
    },
    
    "count(from,to)": function(test) {
        test.strictEqual(tree.count(2,18), 12);
        test.done();
    },
    
    "walk": function(test) {
        var comp = [2,4,5,6,7,9,10,11,12,13,16,18,20,22,24,26,28,30,32,34];
        var res = [];
        tree.walk(function(key, val) {
            res.push(key);
            test.strictEqual(key+"", val);
        });
        test.deepEqual(res, comp);
        test.done();
    },

    "walkEmptyRanges": function(test) {
        tree.walkAsc(37, 40, function(key, val) { test.ok(false); });
        tree.walkAsc(0, 1, function(key, val) { test.ok(false); });
        tree.walkDesc(37, 40, function(key, val) { test.ok(false); });
        tree.walkDesc(0, 1, function(key, val) { test.ok(false); });
        test.done();
    },
    
    "count": function(test) {
        test.strictEqual(tree.count(), 20);
        test.done();
    },
    
    "100k": require(path.join(__dirname, 'bench.js'))(100, 100000)
};
