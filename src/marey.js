import {mareyHeaders, stationNames} from './data';
import moment from 'moment';
import Chartist from 'chartist';
import MareyTooltip from './marey-tooltip';
import {StationMap} from './map';

// Get the end of the day for the given timestamp
const endOfDay = (timestamp) => {
    let now = moment(new Date(timestamp));

    if (now.hours() > 2) {
        now.add({days: 1});
    }

    return now.startOf('day').add({hours: 2}).valueOf();
}

// Get the beginning of the day for the given timestamp
const startOfDay = (timestamp) => {
    let now = moment(new Date(timestamp));

    if (now.hours() < 4) {
        now.subtract({days: 1});
    }

    return now.startOf('day').add({hours: 4}).valueOf();
}

// Generate the ticks every hour for the x-axis
const generateMareyTicks = (timestamp) => {
    let start = startOfDay(timestamp);
    let ticks = [];

    for(let t = start; t <= endOfDay(timestamp); t += 60 * 60 * 1000) {
        ticks.push(t);
    }

    return ticks
}

// Convert a given trip to coordinates on the marey chart
const tripToCoord = (trip, timestamp) => ({
    className: trip.line + ' ' + (trip.startTime > timestamp ? 'scheduled' : ''),
    data: trip.stations
    .map(stop => {
        let time;
        if (stop.arrival != 0) {
            time = stop.arrival;
        } else {
            time = stop.departure;
        }
        return {x: time, y: mareyHeaders[`${stop.placeID}|${trip.line}`]}
    })
});

// Get the series of data for the marey chart based on the trip data
const getMareySeries = (mareyTrips, timestamp) => {
    const trips = mareyTrips.map((trip) => tripToCoord(trip, timestamp));

    mareyTrips
    .filter((trip) => trip.line.startsWith('green'))
    .forEach((trip) => {
        let greenTrip = {
            line: 'green',
            stations: trip.stations,
            startTime: trip.startTime
        };
        trips.push(tripToCoord(greenTrip, timestamp));
    });

    return trips;
}

// Update the given marey chart with the given trips and timestamp
const updateMarey = ({chart, map, tooltip}, mareyTrips, timestamp) => {
    tooltip.updateTrips(mareyTrips, timestamp);
    chart.update({
        series: getMareySeries(mareyTrips, timestamp)
    }, {
        axisX: {
            low: startOfDay(timestamp),
            high: endOfDay(timestamp),
            ticks: generateMareyTicks(timestamp),
        },
        width: `${(endOfDay(timestamp) - startOfDay(timestamp)) / 60 / 60 / 1000 * 100}px`
    }, true);
}

// Show the marey chart with the given trips and timestamp
const showMarey = (mareyTrips, timestamp) => {
    const mareyMap = StationMap('marey-map');

    const series = getMareySeries(mareyTrips, timestamp);

    let verticalLabels = {};
    Object.entries(mareyHeaders).forEach(([key, value], index, headers) => {
        if (index == 0 || index == headers.length - 1
            || key.split('|')[1] != headers[index + 1][0].split('|')[1]
            || key.split('|')[1] != headers[index - 1][0].split('|')[1]) {
                verticalLabels[value] = stationNames[key.split('|')[0]];
        } else {
            verticalLabels[value] = '';
        }
    });

    const tooltip = new MareyTooltip(mareyMap, mareyTrips, 'marey-main', timestamp);

    const mareyChart = new Chartist.Line('#marey-main', {
        series: series
    }, {
        axisX: {
            showGrid: false,
            low: startOfDay(timestamp),
            high: endOfDay(timestamp),
            ticks: generateMareyTicks(timestamp),
            type: Chartist.FixedScaleAxis,
            labelInterpolationFnc: (val) => moment(new Date(val)).format('h:mm a')
        },
        axisY: {
            offset: 80,
            type: Chartist.FixedScaleAxis,
            ticks: Object.values(mareyHeaders),
            showGrid: true,
            labelInterpolationFnc: (val) => verticalLabels[val]
        },
        width: `${(endOfDay(timestamp) - startOfDay(timestamp)) / 60 / 60 / 1000 * 100}px`,
        lineSmooth: false,
        showPoint: false,
        chartPadding: {
            right: 0
        },
        plugins: [
            tooltip.tooltip()
        ]
    });

    let element = document.getElementById('marey-main');
    element.scrollLeft = element.scrollWidth;

    element.addEventListener('wheel', (e) => {
        if ((element.scrollLeft < element.scrollWidth - element.clientWidth && e.wheelDeltaY < 0)
            || (element.scrollLeft > 0 && e.wheelDeltaY > 0)) {
            element.scrollLeft -= e.wheelDeltaY;
            e.preventDefault();
        }
    });

    return {
        chart: mareyChart,
        map: mareyMap,
        tooltip: tooltip
    };
}

export {
    showMarey,
    updateMarey
};