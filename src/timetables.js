import {stationNetwork} from './data';

// Create a timetable card given the card's line, destination name, and stop id
const createTimetable = (line, {name, id}) => {
  let lineClass = line.split('-')[0];
  if(document.getElementById(`timetable-${lineClass}|${id}`) == null) {
    let card = document.createElement('div');
  
    card.classList = `card station-timetable ${lineClass}`;
    if (lineClass == 'green') {
      card.classList += ` ${line}`;
    }

    card.style.display = lineClass == 'green' ? 'block' : 'none';
    card.innerHTML = `<h3 class="station-header">${name}</h3>
                      <table id="timetable-${lineClass}|${id}"></table>`;
    document.getElementById('timetable-holder').appendChild(card);
  }
}

// Format the given arrival timestamp relative to the given current timestamp
// Usually 'X min' unless it's less than 1 minute ('arriving')
const formatArrivalTime = (now, arrival) => {
  const timeDifference = Math.round((arrival - now) / 1000 / 60);

  if (timeDifference < 1) {
    return 'Arriving';
  } else {
    return `${timeDifference} min`
  }
}

// Given a list of trips reduce it to an object of station IDs corresponding to upcoming trains at
// that station
const getTimetables = (mareyTrips) => {
  return mareyTrips.reduce((timetables, {line, stations, destination}) => {
    if (stations.length > 0) {
      return stations.reduce((currentTT, {arrival, placeID}) => {
        let data = {
          destination: destination,
          arrival: arrival
        }
        let stationID = `${line.split('-')[0]}|${placeID}`;
        if (stationID in currentTT) {
          currentTT[stationID].push(data);
        } else {
          currentTT[stationID] = [data];
        }
        return currentTT;
      }, timetables);
    } else {
      return timetables;
    }
  }, {});
}

// Given a list of trips and a timestamp, update each timetable card accordingly
const updateTimetables = (mareyTrips, timestamp) => {
  const timetables = getTimetables(mareyTrips);
  
  Object.entries(timetables).forEach(([stationID, incoming]) => {
    let table = incoming
    .filter(({arrival}) => arrival > 0 && arrival > timestamp)
    .sort((a, b) => a.arrival - b.arrival)
    .slice(0, 5)
    .map(({destination, arrival}) => `<tr>
      <td>${destination}</td>
      <td>${formatArrivalTime(timestamp, arrival)}</td>
    </tr>`);
    document.getElementById(`timetable-${stationID}`).innerHTML = table.join('');
  });
}

// Show the given line's timetables (for use with the line selector)
const showLine = (className) => {
  Array.from(document.getElementsByClassName('station-timetable'))
  .forEach((item) => {
    if (item.classList.contains(className)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
};

// Create timetable cards for each station in the network
const showTimetables = () => {
  stationNetwork.links.forEach(({source, target, line}) => {
    createTimetable(line, stationNetwork.nodes[source]);
    createTimetable(line, stationNetwork.nodes[target]);
  });

  Array.from(document.getElementsByClassName('line-select')).forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      showLine(e.target.dataset.line);

      if (e.target.dataset.line.includes('green')) {
        document.getElementById('green-selector').style.display = 'inline-flex';
      } else {
        document.getElementById('timetable-green-all').checked = true;
        document.getElementById('green-selector').style.display = 'none';
      }
    });
  });
};

export {
  showTimetables,
  updateTimetables,
  getTimetables
};