'use strict';

var setArrays = require('../lib/set-arrays'),
    setOpt = require('../lib/set-opt'),
    extendFlat = require('../lib/extend-flat'),
    consts = require('../lib/consts');

var ohlcFactory = require('./ohlc-factory'),
    validateData = require('./validate-data');

/**
 * @param {object} data
 *  with numeric arrays linked to keys 'open', 'high', 'low', 'close`
 *  and optionally an array of dates linked to 'dates'
 * @param {object} opts
 *  plotlyjs trace options and/or
 *  'direction' set to 'both' (the default), 'increasing' or 'decreasing'
**/
module.exports = function createOHLC(data, opts) {
    data = setArrays(data, ['open', 'high', 'low', 'close'], ['dates']);
    if(!data) return;
    validateData(data);

    if(opts === undefined) opts = {};
    var direction = setOpt(opts.direction,
        {dflt: 'both', values: ['increasing', 'decreasing']}
    );
    delete opts.direction;  // direction isn't a plotlyjs option

    var factory = new ohlcFactory(data),
        traces = [];

    if(['both', 'increasing'].indexOf(direction) !== -1) {
        traces.push(makeIncreasing(factory, opts));
    }
    if(['both', 'decreasing'].indexOf(direction) !== -1) {
        traces.push(makeDecreasing(factory, opts));
    }

    return {
        data: traces,
        layout: {
            xaxis: {
                type: data.dates[0] instanceof Date ?
                    'date' : 'linear',
                zeroline: false
            },
            hovermode: 'closest'
        }
    };
};

function makeIncreasing(factory, opts) {
    var incrData = factory.getIncrData();

    return extendFlat(
        {
            type: 'scatter',
            mode: 'lines',
            x: incrData.x,
            y: incrData.y,
            text: setOpt(opts.text, {dflt: incrData.text}),
            name: setOpt(opts.name, {dflt: 'Increasing'}),
            line: setOpt(opts.line,
                {dflt: {color: consts.DEFAULT_INCREASING_COLOR, width: 1}}
            ),
            showlegend: opts.name!==undefined
        },
        opts
   );
}

function makeDecreasing(factory, opts) {
    var decrData = factory.getDecrData();

    return extendFlat(
        {
            type: 'scatter',
            mode: 'lines',
            x: decrData.x,
            y: decrData.y,
            text: setOpt(opts.text, {dflt: decrData.text}),
            name: setOpt(opts.name, {dflt: 'Decreasing'}),
            line: setOpt(opts.line,
                {dflt: {color: consts.DEFAULT_DECREASING_COLOR, width: 1}}
            ),
            showlegend: setOpt(opts.showlegend, {dflt: false, values: [true, false]})
        },
        opts
   );
}
