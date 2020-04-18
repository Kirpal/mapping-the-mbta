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

export default numTrains;