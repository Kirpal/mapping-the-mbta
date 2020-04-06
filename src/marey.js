import mareyTrips from '../data/marey-trips.json';
import mareyHeaders from '../data/marey-header.json';
import stationNetwork from '../data/station-network.json';
import moment from 'moment';
import Chartist from 'chartist';
import MareyTooltip from './marey-tooltip';
import {StationMap} from './map';

const stationNames = Object.fromEntries(stationNetwork.nodes.map((node) => [node.id, node.name]));

const showMarey = async () => {
    const mareyMap = StationMap('marey-map');

    mareyTrips.map((trip) => {
        trip.stops.map((stop) => {
            stop.y = mareyHeaders[`${stop.stop}|${trip.line}`];
            stop.time = stop.time * 1000;
        });
        trip.begin = trip.begin * 1000;
        trip.end = trip.end * 1000;
    });

    const series = mareyTrips.map((trip) => {
        return {
            className: trip.line,
            data: trip.stops.map(stop => ({x: stop.time, y: stop.y}))
        };
    });

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

    new Chartist.Line('#marey-main', {
        series: series
    }, {
        axisX: {
            showGrid: false,
            divisor: 25,
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
        width: '3000px',
        lineSmooth: false,
        showPoint: false,
        chartPadding: {
            right: 40
        },
        plugins: [
            MareyTooltip(mareyMap)
        ]
    });

    document.getElementById('marey-main').addEventListener('wheel', (e) => {
        let element = document.getElementById('marey-main');
        if ((element.scrollLeft < element.scrollWidth - element.clientWidth && e.wheelDeltaY < 0)
            || (element.scrollLeft > 0 && e.wheelDeltaY > 0)) {
            element.scrollLeft -= e.wheelDeltaY;
            e.preventDefault();
        }
    });
}

export default showMarey;