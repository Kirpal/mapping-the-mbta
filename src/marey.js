import {mareyHeaders, stationNames} from './data';
import moment from 'moment';
import Chartist from 'chartist';
import MareyTooltip from './marey-tooltip';
import {StationMap} from './map';

const showMarey = async (mareyTrips) => {
    const mareyMap = StationMap('marey-map');

    const series = mareyTrips.map((trip) => ({
        className: trip.line,
        data: trip.stations.map(stop => {
            let time;
            if (stop.departureEst != 0) {
                time = stop.departureEst;
            } else {
                time = stop.arrivalEst;
            }
            return {x: time, y: mareyHeaders[`${stop.station.placeID}|${trip.line}`]}
        })
    }));

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
            MareyTooltip(mareyMap, mareyTrips)
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