import {stationNetwork} from './data';

const createTimetable = (line, {name, id}) => {
  let card = document.createElement('div');
  let lineClass = line.split('-')[0];
  
  card.classList = `card station-timetable ${lineClass}`;
  if (lineClass == 'green') {
    card.classList += ` ${line}`;
  }

  card.style.display = lineClass == 'green' ? 'block' : 'none';
  card.innerHTML = `<h3 class="station-header">${name}</h3>
                    <table id="timetable-${lineClass}|${id}"></table>`;

  if(document.getElementById(`timetable-${lineClass}|${id}`) == null) {
    document.getElementById('timetable-holder').appendChild(card);
  }
}

const formatArrivalTime = (now, arrival) => {
  const timeDifference = Math.round((arrival - now) / 1000 / 60);

  if (timeDifference < 1) {
    return 'Arriving';
  } else {
    return `${timeDifference} min`
  }
}

const getTimetables = (mareyTrips) => {
  return mareyTrips.reduce((timetables, {line, stations, destination}) => {
    if (stations.length > 0) {
      return stations.reduce((currentTT, {arrival, station}) => {
        let data = {
          destination: destination,
          arrival: arrival
        }
        let stationID = `${line.split('-')[0]}|${station.placeID}`;
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

const updateTimetables = (mareyTrips) => {
  const timetables = getTimetables(mareyTrips);
  
  Object.entries(timetables).forEach(([stationID, incoming]) => {
    let now = new Date().getTime();
    let table = incoming
    .filter(({arrival}) => arrival > 0 && arrival > now)
    .sort((a, b) => a.arrival - b.arrival)
    .slice(0, 5)
    .map(({destination, arrival}) => `<tr>
      <td>${destination}</td>
      <td>${formatArrivalTime(now, arrival)}</td>
    </tr>`);
    document.getElementById(`timetable-${stationID}`).innerHTML = table.join('');
  });
}

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