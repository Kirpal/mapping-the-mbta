import Chartist from 'chartist';
import {spider, stationNetwork} from './data';

const prevStops = Object.assign(
  ...stationNetwork.links.map((link) => Object.fromEntries([[
    link.line + '|' + stationNetwork.nodes[link.target].id,
    stationNetwork.nodes[link.source].id
  ],[
    link.line + '|' + stationNetwork.nodes[link.source].id,
    stationNetwork.nodes[link.target].id
  ]]))
);

// Gets the station that the given trip is between
const getTripStations = (trip, timestamp) => {
  // Filter out any stations the train is not currently at, to see if it is at a single station
  let currentStations = trip.stations
  .filter(({departure, arrival}) => departure > timestamp && (arrival < timestamp && arrival > 0));
  let to, from;

  // If at a station return just that station
  if (currentStations.length > 0) {
    to = currentStations[0];
    from = currentStations[0];
  } else {
    // Find the next station it will be at
    let toIdx = trip.stations.findIndex(({arrival}) => arrival > timestamp);
    to = trip.stations[toIdx];
    if (toIdx > 0) {
      from = trip.stations[toIdx - 1];
    } else {
      from = trip.stations[toIdx];
    }
    from.placeID = prevStops[trip.line + '|' + to.placeID];
    if (from.placeID == undefined) from.placeID = prevStops[trip.line.split('-')[0] + '|' + to.placeID];
  }

  to.coord = spider[to.placeID];
  from.coord = spider[from.placeID];

  return Object.assign({}, trip, {to, from});
}

// Gets the current train positions based on the given timestamp and trip data
const getCurrentTrains = (timestamp, mareyTrips) => {
  return mareyTrips
  .filter(({stations}) => stations.length > 1) // Filter out trips with 1 or fewer stops
  .filter(({stations}) => stations[0].departure < timestamp && stations[stations.length - 1].arrival > timestamp) // Filter out non-current trips
  .map(trip => {
      if (!('to' in trip) || trip.to.arrival < timestamp) {
        trip = getTripStations(trip, timestamp);
      }
      // Find where along the line between the stations the train currently is
      let ratio = (timestamp - trip.from.departure) / (trip.to.arrival - trip.from.departure);

      // Translate that relative position to coordinates
      let x = trip.from.coord[0];
      let y = trip.from.coord[1];
      if ((ratio >= 0 && ratio <= 1)
        && (trip.from.coord[0] != trip.to.coord[0] || trip.from.coord[1] != trip.to.coord[1])) {
        x = trip.from.coord[0] + ratio * (trip.to.coord[0] - trip.from.coord[0]);
        y = trip.from.coord[1] + ratio * (trip.to.coord[1] - trip.from.coord[1]);
      }
      return Object.assign({}, trip, {x, y});
    });
}

// Draw trains on the given svg at the given time using the given trip data
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
      currentPositions
      .map(({x, y, id}) => {
        return [
          id,
          Chartist.Svg('circle',
                {r: 0.15, cx: x, cy: y},
                'map-train', svg)
        ];
      }));
  }
}

// Create a new MBTA map in the element wih the given id
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

export { StationMap, drawTrainsAtTime, getCurrentTrains };