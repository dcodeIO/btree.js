var path = require("path"),
    btree = require(path.join(__dirname, '..', 'btree.min.js'));

/**
 * Builds a custom benchmark.
 * @param {number} order Order
 * @param {number} size Tree size
 * @param {boolean=} skipAsserted Skips assertions if set to true
 */
function buildBenchmark(order, size, skipAsserted) {
    var Tree, tree;
    var max = size* 2;
    return {
        "init": function(test) {
            Tree = btree.create(order);
            tree = new Tree();
            test.done();
        },

        "put": {
            
            "asserted": skipAsserted ? null : {
                
                "notExisting": function(test) {
                    for (var i=0; i<max; i+=2) {
                        test.strictEqual(tree.put(i, i), true);
                    }
                    test.done();
                },

                "existing": function(test) {
                    for (var i=0; i<max; i+=2) {
                        test.strictEqual(tree.put(i, i), false);
                    }
                    test.done();
                }
            },
            
            "reset": function(test) {
                tree = new Tree();
                test.done();
            },
            
            "notExisting": function(test) {
                for (var i=0; i<max; i+=2) {
                    tree.put(i, i);
                }
                test.done();
            },

            "existing": function(test) {
                for (var i=0; i<max; i+=2) {
                    tree.put(i, i);
                }
                test.done();
            }
        },

        "get": {
            
            "asserted": skipAsserted ? null : {
                "notExisting": function(test) {
                    for (var i=1; i<max; i+=2) {
                        test.strictEqual(tree.get(i), undefined);
                    }
                    test.done();
                },

                "existing": function(test) {
                    for (var i=0; i<max; i+=2) {
                        test.strictEqual(tree.get(i), i);
                    }
                    test.done();
                }
            },
            
            "notExisting": function(test) {
                for (var i=1; i<max; i+=2) {
                    tree.get(i);
                }
                test.done();
            },

            "existing": function(test) {
                for (var i=0; i<max; i+=2) {
                    tree.get(i);
                }
                test.done();
            }
        },

        "walk": {
            
            "asserted": skipAsserted ? null : {
                
                "asc": function(test) {
                    var n=0;
                    tree.walkAsc(0, max, function(key, value) {
                        test.strictEqual(key, value);
                        n++;
                    });
                    test.strictEqual(n, size);
                    test.done();
                },

                "desc": function(test) {
                    var n=0;
                    tree.walkDesc(0, max, function(key, value) {
                        test.strictEqual(key, value);
                        n++;
                    });
                    test.strictEqual(n, size);
                    test.done();
                },

                "count": function(test) {
                    test.strictEqual(tree.count(0, max), size);
                    test.done();
                }
            },
            
            "asc": function(test) {
                var n=0;
                tree.walkAsc(0, max, function(key, value) {
                    n++;
                });
                test.done();
            },

            "desc": function(test) {
                var n=0;
                tree.walkDesc(0, max, function(key, value) {
                    n++;
                });
                test.done();
            },

            "count": function(test) {
                tree.count(0, max);
                test.done();
            }
        },

        "del": {

            "notExisting": function(test) {
                for (var i=1; i<max; i+=2) {
                    tree.del(i);
                }
                test.done();
            },

            "existing": !skipAsserted ? null : function(test) {
                for (var i=0; i<max; i+=2) {
                    tree.del(i);
                }
                test.done();
            },

            // slipped existing to make the asserted block work. doesn't matter anyhow.
            
            "asserted": skipAsserted ? null : {
                
                "notExisting": function(test) {
                    for (var i=1; i<max; i+=2) {
                        test.strictEqual(tree.del(i), false);
                    }
                    test.done();
                },

                "existing": function(test) {
                    for (var i=0; i<max; i+=2) {
                        test.strictEqual(tree.del(i), true);
                    }
                    test.done();
                }
                
            }
        },

        "finish": function(test) {
            if (!skipAsserted) {
                test.strictEqual(tree.count(), 0);
            }
            test.done();
        }
    };
}

module.exports = buildBenchmark;
