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

export {
  numTrains,
  avgWait
}