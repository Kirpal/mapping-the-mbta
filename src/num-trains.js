import { getTimetables } from "./timetables";

const numTrains = (mareyTrips) => {
  const now = new Date().getTime();
  const lines = mareyTrips
  .filter(({startTime, endTime}) => startTime < now && endTime > now)
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

const avgWait = (mareyTrips) => {
  const totalWaits = Object.entries(getTimetables(mareyTrips)).reduce((lineWaits, [stationID, incoming]) => {
    let line = stationID.split('|')[0];
    let now = new Date().getTime();
    let nextIncoming = incoming
      .filter(({arrival}) => arrival > now)
      .sort((a, b) => a.arrival - b.arrival);

    if (nextIncoming.length > 0) {
      let eta = nextIncoming[0].arrival - now;
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