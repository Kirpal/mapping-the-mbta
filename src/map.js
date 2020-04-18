import Chartist from 'chartist';
import {spider, stationNetwork} from './data';

const getCurrentTrains = (timestamp, mareyTrips) => {
  return Object.fromEntries(mareyTrips
    .filter((trip) => trip.stations.length > 1)
    .filter((trip) => trip.startTime < timestamp && trip.endTime > timestamp)
    .map(({stations, line, vehicleID}) => {
      let currentStations = stations.filter(({departureEst, arrivalEst}) => departureEst > timestamp && arrivalEst < timestamp && arrivalEst > 0);
      let to, from;

      if (currentStations.length > 0) {
        to = currentStations[0];
        from = currentStations[0];
      } else {
        from = stations
        .sort((a, b) => a.departureEst - b.departureEst)
        .reduce((prev, curr) => {
          if (curr.departureEst > prev.departureEst && curr.departureEst < timestamp) {
            return curr;
          } else {
            return prev;
          }
        });

        to = stations
        .sort((a, b) => a.arrivalEst - b.arrivalEst)
        .reduce((prev, curr) => {
          if (curr.arrivalEst < prev.arrivalEst && curr.arrivalEst > timestamp) {
            return curr;
          } else {
            return prev;
          }
        }, stations[stations.length - 1]);
      }

      to.coord = spider[to.station.placeID];
      from.coord = spider[from.station.placeID];

      return {
        to,
        from,
        line,
        vehicleID
      };
    })
    .map(({to, from, line, vehicleID}) => {
      let ratio = (timestamp - from.departureEst) / (to.arrivalEst - from.departureEst);
      
      let x = from.coord[0];
      let y = from.coord[1];
      if (from.coord[0] != to.coord[0] || from.coord[1] != to.coord[1]) {
        x = from.coord[0] + ratio * (to.coord[0] - from.coord[0]);
        y = from.coord[1] + ratio * (to.coord[1] - from.coord[1]);
      }
      return [
        vehicleID,
        {
          x: x,
          y: y,
          line: line,
        }
      ];
    }));
}

const drawTrainsAtTime = (svg, timestamp, mareyTrips) => {
  const currentPositions = getCurrentTrains(timestamp, mareyTrips);
  if ('trainDots' in svg) {
    Object.keys(svg.trainDots).forEach((trip) => {
      if (!(trip in currentPositions)) {
        svg.trainDots[trip].remove();
        delete svg.trainDots[trip];
      }
    })
    Object.entries(currentPositions).forEach(([trip, {x, y}]) => {
      if (trip in svg.trainDots) {
        svg.trainDots[trip].attr({cx: x, cy: y});
      } else {
        svg.trainDots[trip] = Chartist.Svg('circle',
          {r: 0.15, cx: x, cy: y},
          'map-train', svg);
      }
    });
  } else {
    svg.trainDots = Object.fromEntries(
      Object.entries(currentPositions)
      .map(([trip, {x, y}]) => {
        return [
          trip,
          Chartist.Svg('circle',
                {r: 0.15, cx: x, cy: y},
                'map-train', svg)
        ];
      }));
  }
}

const StationMap = (elementId) => {
  const svg = Chartist.Svg('svg', {}, 'map');
  let maxX = 0;
  let maxY = 0;

  stationNetwork.links.forEach((link) => {
    let sourceId = stationNetwork.nodes[link.source].id;
    let targetId = stationNetwork.nodes[link.target].id;

    Chartist.Svg('line', 
            {x1: spider[sourceId][0], y1: spider[sourceId][1],
             x2: spider[targetId][0], y2: spider[targetId][1],
             'stroke-width': 0.4},
            `map-connect ${link.line}`, svg);
  });

  Object.values(spider).forEach(([x, y]) => {
    Chartist.Svg('circle',
            {r: 0.1, cx: x, cy: y},
            'map-node', svg);

    maxX = Math.max(x, maxX);
    maxY = Math.max(y, maxY);
  });

  const dot = (stationId, line) => {
    let node = spider[stationId];
    Chartist.Svg('circle',
            {r: 0.24, cx: node[0], cy: node[1]},
            `map-end ${line}`, svg);
  }

  dot('place-asmnl', 'red');
  dot('place-alfcl', 'red');
  dot('place-brntn', 'red');
  dot('place-wondl', 'blue');
  dot('place-bomnl', 'blue');
  dot('place-forhl', 'orange');
  dot('place-ogmnl', 'orange');
  dot('place-lech', 'green');
  dot('place-lake', 'green');
  dot('place-clmnl', 'green');
  dot('place-river', 'green');
  dot('place-hsmnl', 'green');

  svg.attr({viewBox: `-1 -1 ${maxX + 2} ${maxY + 2}`});
  document.getElementById(elementId).appendChild(svg.getNode());

  return svg;
}

export { StationMap, drawTrainsAtTime };