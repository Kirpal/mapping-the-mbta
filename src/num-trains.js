import { getTimetables } from "./timetables";

// Update the 'number of trains' widget based on the given list of trips and timestamp
const numTrains = (mareyTrips, timestamp) => {
  const lines = mareyTrips
  .filter(({startTime, endTime}) => startTime < timestamp && endTime > timestamp)
  .reduce((lines, trip) => {
    const lineClass = trip.line.split('-')[0];
    if (lineClass in lines) {
      lines[lineClass] += 1;
    } else {
      lines[lineClass] = 1;
    }
    return lines;
  }, {});
  Object.entries(lines).forEach(([line, count]) => {
    document.getElementById(`num-trains-${line}`).innerHTML = count;
  });
}

// Update the 'average wait' widget with the given list of trips and timestamp
const avgWait = (mareyTrips, timestamp) => {
  const totalWaits = Object.entries(getTimetables(mareyTrips)).reduce((lineWaits, [stationID, incoming]) => {
    let line = stationID.split('|')[0];
    let nextIncoming = incoming
      .filter(({arrival}) => arrival > timestamp)
      .sort((a, b) => a.arrival - b.arrival);

    if (nextIncoming.length > 0) {
      let eta = nextIncoming[0].arrival - timestamp;
      if (line in lineWaits) {
        lineWaits[line].total += eta;
        lineWaits[line].count += 1;

      } else {
        lineWaits[line] = {total: eta, count: 1};
      }
    }

    return lineWaits;
  }, {});
  Object.entries(totalWaits).forEach(([line, {total, count}]) => {
    document.getElementById(`avg-wait-${line}`).innerHTML = `${Math.round(total / count / 1000 / 60)} min`;
  });
}

// Update the 'reliability' widget based on the given list of trips and timestamp
const reliability = (mareyTrips, timestamp) => {
  let pastHour = timestamp - 60 * 60 * 1000;
  let goodDelta = 3 * 60;
  const lines = mareyTrips
  .filter(({startTime, endTime}) => startTime > pastHour && endTime < timestamp)
  .reduce((lines, {line, stations}) => {
    const lineClass = line.split('-')[0];
    if (!(lineClass in lines)) {
      lines[lineClass] = [];
    }

    stations.forEach(stop => {
      if (stop.delta != null) lines[lineClass].push(stop.delta);
    });
    return lines;
  }, {});
  Object.entries(lines).forEach(([line, deltas]) => {
    document.getElementById(`reliability-${line}`).innerHTML = Math.round(100 * (deltas.filter(d => Math.abs(d) < goodDelta).length / deltas.length)) + '%';
  });
}

export {
  numTrains,
  avgWait,
  reliability
}