import {mareyHeaders, stationNames} from './data';
import moment from 'moment';
import Chartist from 'chartist';
import MareyTooltip from './marey-tooltip';
import {StationMap} from './map';

const endOfDay = () => {
    let now = moment(new Date());

    if (now.hours() > 2) {
        now.add({days: 1});
    }

    return now.startOf('day').add({hours: 2}).valueOf();
}

const startOfDay = () => {
    let now = moment(new Date());

    if (now.hours() < 4) {
        now.subtract({days: 1});
    }

    return now.startOf('day').add({hours: 4}).valueOf();
}

const generateMareyTicks = () => {
    let start = startOfDay();
    let ticks = [];

    for(let t = start; t <= endOfDay(); t += 60 * 60 * 1000) {
        ticks.push(t);
    }

    return ticks
}
const tripToCoord = trip => ({
    className: trip.line + ' ' + (trip.startTime > new Date().getTime() ? 'scheduled' : ''),
    data: trip.stations
    .map(stop => {
        let time;
        if (stop.arrival != 0) {
            time = stop.arrival;
        } else {
            time = stop.departure;
        }
        return {x: time, y: mareyHeaders[`${stop.station.placeID}|${trip.line}`]}
    })
});

const getMareySeries = (mareyTrips) => {
    let mainGreen = [
        'place-lech',
        'place-spmnl',
        'place-north',
        'place-haecl',
        'place-gover',
        'place-pktrm',
        'place-boyls',
        'place-armnl',
        'place-hymnl',
    ];

    let doubleCountGreen = [
        'place-coecl',
        'place-kencl'
    ];

    const trips = mareyTrips.map((trip) => tripToCoord(trip));

    mareyTrips
    .filter((trip) => trip.line.startsWith('green'))
    .forEach((trip) => {
        let greenTrip = {
            line: 'green',
            stations: trip.stations,
            startTime: trip.startTime
        };
        trips.push(tripToCoord(greenTrip));
    });

    return trips;
}

const updateMarey = ({chart, map, tooltip}, mareyTrips) => {
    tooltip.updateTrips(mareyTrips);
    chart.update({
        series: getMareySeries(mareyTrips)
    }, {
        axisX: {
            low: startOfDay(),
            high: endOfDay(),
            ticks: generateMareyTicks(),
        },
        width: `${(endOfDay() - startOfDay()) / 60 / 60 / 1000 * 100}px`
    }, true);
}

const showMarey = (mareyTrips) => {
    const mareyMap = StationMap('marey-map');

    const series = getMareySeries(mareyTrips);

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

    const tooltip = new MareyTooltip(mareyMap, mareyTrips, 'marey-main');

    const mareyChart = new Chartist.Line('#marey-main', {
        series: series
    }, {
        axisX: {
            showGrid: false,
            low: startOfDay(),
            high: endOfDay(),
            ticks: generateMareyTicks(),
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
        width: `${(endOfDay() - startOfDay()) / 60 / 60 / 1000 * 100}px`,
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