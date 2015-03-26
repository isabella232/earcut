'use strict';

var test = require('tape'),
    earcut = require('../src/earcut'),
    fs = require('fs'),
    path = require('path');

areaTest('building');
areaTest('dude');
areaTest('water', 0.0019);
areaTest('water', 0.0019);
areaTest('water2');
areaTest('water3');
areaTest('water3b');
areaTest('water4');
areaTest('water-huge', 0.0015);
areaTest('water-huge2', 0.0020);
areaTest('degenerate');
areaTest('bad-hole', 0.0420);
areaTest('empty-square');
areaTest('issue16');
areaTest('issue17');

// indicesCreationTest('indices-2d');
// indicesCreationTest('indices-3d');

function areaTest(filename, expectedDeviation) {
    expectedDeviation = expectedDeviation || 1e-14;

    test(filename, function (t) {

        console.log(filename);

        var data = JSON.parse(fs.readFileSync(path.join(__dirname, '/fixtures/' + filename + '.json'))),
            result = flattenedEarcut(data),
            vertices = result.vertices,
            indices = result.indices,
            dim = result.dim,
            expectedArea = polygonArea(data),
            area = 0;

        for (var i = 0; i < indices.length; i += 3) {
            area += triangleArea(
                [vertices[dim * indices[i]], vertices[dim * indices[i] + 1]],
                [vertices[dim * indices[i + 1]], vertices[dim * indices[i + 1] + 1]],
                [vertices[dim * indices[i + 2]], vertices[dim * indices[i + 2] + 1]]);
        }

        var deviation = expectedArea === 0 && area === 0 ? 0 : Math.abs(area - expectedArea) / expectedArea;

        t.ok(deviation < expectedDeviation,
            'deviation ' + formatPercent(deviation) + ' is less than ' + formatPercent(expectedDeviation));

        t.end();
    });
}

function flattenedEarcut(data) {
    var flat = [],
        holes = [],
        dim = data[0][0].length,
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) {
                flat.push(data[i][j][d]);
            }
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            holes.push(holeIndex * dim);
        }
    }

    return {
        vertices: flat,
        indices: earcut(flat, holes, dim),
        dim: dim
    };
}

function formatPercent(num) {
    return (Math.round(1e8 * num) / 1e6) + '%';
}

function triangleArea(a, b, c) {
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1])) / 2;
}

function ringArea(points) {
    var sum = 0;
    for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        sum += (points[i][0] - points[j][0]) * (points[i][1] + points[j][1]);
    }
    return Math.abs(sum) / 2;
}

function polygonArea(rings) {
    var sum = ringArea(rings[0]);
    for (var i = 1; i < rings.length; i++) {
        sum -= ringArea(rings[i]);
    }
    return sum;
}

// function indicesCreationTest(filename) {
//     test(filename, function (t) {
//         var data = JSON.parse(fs.readFileSync(path.join(__dirname, '/fixtures/' + filename + '.json'))),
//             created = earcut(data.input, true);

//         t.ok(JSON.stringify(created.vertices) === JSON.stringify(data.expected.vertices), 'created vertices [' + created.vertices + '] are as expected: [' + data.expected.vertices + ']');
//         t.ok(JSON.stringify(created.indices) === JSON.stringify(data.expected.indices), 'created indices [' + created.indices + '] are as expected: [' + data.expected.indices + ']');
//         t.end();
//     });
// }
