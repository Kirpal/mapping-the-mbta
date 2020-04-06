import Chartist from 'chartist';
import stationNetwork from '../data/station-network.json';
import spider from '../data/spider.json';
import mareyTrips from '../data/marey-trips.json';

const getCurrentTrains = (timestamp) => {
  return Object.fromEntries(mareyTrips
    .filter((trip) => trip.begin < timestamp && trip.end > timestamp)
    .map(({stops, line, trip}) => ({
      line: line,
      trip: trip,
      stops: stops.sort((a, b) => a.time - b.time)
    }))
    .map(({stops, line, trip}) => {
      let from = stops.reduce((prev, curr) => {
        if (curr.time > prev.time && curr.time < timestamp) {
          return curr;
        } else {
          return prev;
        }
      });
      from.coord = spider[from.stop];

      let to = stops.reduce((prev, curr) => {
        if (curr.time < prev.time && curr.time > timestamp) {
          return curr;
        } else {
          return prev;
        }
      }, stops[stops.length - 1]);
      to.coord = spider[to.stop];

      return {
        to,
        from,
        line,
        trip
      };
    })
    .map(({to, from, line, trip}) => {
      let ratio = (timestamp - from.time) / (to.time - from.time);

      return [
        trip,
        {
          x: from.coord[0] + ratio * (to.coord[0] - from.coord[0]),
          y: from.coord[1] + ratio * (to.coord[1] - from.coord[1]),
          line: line,
        }
      ];
    }));
}

const drawTrainsAtTime = (svg, timestamp) => {
  const currentPositions = getCurrentTrains(timestamp);
  
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