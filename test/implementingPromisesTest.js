var test = require('tape');
var MyPromise = require('../src/implementingPromises');

test('executor function is called immediately', function (t) {

    var string;

    new MyPromise(function () {
        string = 'foo';
    });

    t.equal(string, 'foo');

    t.end();
});

test('resolution handler is called when promise is resolved', function (t) {

    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
        }, 100);
    });

    promise.then(function (string) {
        t.equal(string, testString);
        t.end();
    });
});

test('promise supports many resolution handlers', function (t) {

    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
        }, 100);
    });

    promise.then(function (string) {
        t.equal(string, testString);
    });

    promise.then(function (string) {
        t.equal(string, testString);
        t.end();
    });
});


test('resolution handlers can be chained', function (t) {

    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise.then(function () {

        return new MyPromise(function (resolve) {
            setTimeout(function () {
                resolve(testString);
            }, 100);
        });

    }).then(function (string) {
        t.equal(string, testString);
        t.end();
    });
});

test('chaining works with non-promise return values', function (t) {

    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise.then(function () {

        return testString;

    }).then(function (string) {
        t.equal(string, testString);
        t.end();
    });
});

test('resolution handlers can be attached when promise is resolved', function (t) {

    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
        }, 100);
    });

    promise.then(function () {
        setTimeout(function () {
            promise.then(function (value) {
                t.equal(value, testString);
                t.end();
            });
        }, 100);
    });
});

test('calling resolve second time has no effect', function (t) {

    var testString = 'foo';
    var testString2 = 'bar';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
            resolve(testString2);
        }, 100);
    });

    promise.then(function (value) {
        t.equal(value, testString);

        setTimeout(function () {
            promise.then(function (value) {
                t.equal(value, testString);
                t.end();
            });
        }, 100);
    });
});

test('rejection handler is called when promise is rejected', function (t) {
    var testError = new Error('Something went wrong');

    var promise = new MyPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 100);
    });

    promise.catch(function (value) {
        t.equal(value, testError);
        t.end();
    });
});

test('rejections are passed downstream', function (t) {
    var testError = new Error('Something went wrong');

    var promise = new MyPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 100);
    });

    promise.then(function () {
        return new MyPromise(function (resolve) {
            setTimeout(function () {
                resolve(testError);
            }, 100);
        });
    }).catch(function (value) {
        t.equal(value, testError);
        t.end();
    });
});

test('rejecting promises returned from resolution handlers are caught properly', function (t) {
    var testError = new Error('Something went wrong');


    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise
        .then(function () {
            return new MyPromise(function (resolve, reject) {
                setTimeout(function () {
                    reject(testError);
                }, 100);
            });
        })
        .catch(function (value) {
            t.equal(value, testError);
            t.end();
        });
});

test('rejection handlers catch synchronous errors in resolution handlers', function (t) {
    var testError = new Error('Something went wrong');

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise.then(function () {
        throw testError;
    }).catch(function (value) {
        t.equal(value, testError);
        t.end();
    });
});

test('rejection handlers catch synchronous errors in the executor function', function (t) {
    var testError = new Error('Something went wrong');

    var promise = new MyPromise(function () {
        throw testError;
    });

    promise.then(function () {
        return new MyPromise(function (resolve) {
            setTimeout(function () {
                resolve(testError);
            }, 100);
        });
    }).catch(function (value) {
        t.equal(value, testError);
        t.end();
    });
});

test('rejection handlers catch synchronous erros', function (t) {
    var testError = new Error('Something went wrong');

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise
        .then(function () {
            throw new Error('some Error');
        })
        .catch(function () {
            throw testError;
        })
        .catch(function (value) {
            t.equal(value, testError);
            t.end();
        });
});

test('chaining works after "catch"', function (t) {
    var testString = 'foo';

    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise
        .then(function () {
            throw new Error('some Error');
        })
        .catch(function () {
            return new MyPromise(function (resolve) {
                setTimeout(function () {
                    resolve(testString);
                }, 100);
            });
        })
        .then(function (value) {
            t.equal(value, testString);
            t.end();
        });
});


test('rejecting promises returned from rejection handlers are caught properly', function (t) {
    var testError = new Error('Something went wrong');


    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise
        .then(function () {
            throw new Error('some Error');
        })
        .catch(function () {
            return new MyPromise(function (resolve, reject) {
                setTimeout(function () {
                    reject(testError);
                }, 100);
            });
        })
        .catch(function (value) {
            t.equal(value, testError);
            t.end();
        });
});

test('second argument in then is treated as a rejection handler', function (t) {
    var testError = new Error('Something went wrong');


    var promise = new MyPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 100);
    });

    promise
        .then(
            function () {},
            function (error) {
                t.equal(error, testError);
                t.end();
            });

});

test('second argument in then is attached to the promise then is called on', function (t) {
    var testError = new Error('Something went wrong');
    var didRun = false;


    var promise = new MyPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 100);
    });

    promise
        .then(
            function () {
                return new MyPromise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(testError);
                    }, 100);
                });
            },
            function () {
                didRun = true;
            })
        .catch(function (error) {
            t.equal(error, testError);
            t.equal(didRun, false);
            t.end();
        });

});
