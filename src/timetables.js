import {stationNetwork, stationNames} from './data';

const createTimetable = (line, {name, id}) => {
  let card = document.createElement('div');
  let lineClass = line.split('-')[0];
  
  card.classList = `card station-timetable ${lineClass}`;
  card.style.display = lineClass == 'green' ? 'block' : 'none';
  card.innerHTML = `<h3 class="station-header">${name}</h3>
                    <table id="timetable-${lineClass}|${id}"></table>`;

  if(document.getElementById(`timetable-${lineClass}|${id}`) == null) {
    document.getElementById('timetable-holder').appendChild(card);
  }
}

const formatArrivalTime = (now, arrivalEst) => {
  const timeDifference = Math.round((arrivalEst - now) / 1000 / 60);

  if (timeDifference < 1) {
    return 'Arriving';
  } else {
    return `${timeDifference} min`
  }
}

const updateTimetables = (mareyTrips) => {
  const timetables = mareyTrips.reduce((timetables, {line, stations}) => {
    if (stations.length > 0) {
      let dest = stations[stations.length - 1].station.placeID;
      return stations.reduce((currentTT, {arrivalEst, station}) => {
        let stationID = `${line.split('-')[0]}|${station.placeID}`;
        let data = {
          destination: stationNames[dest],
          arrivalEst: arrivalEst
        }
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
  
  Object.entries(timetables).forEach(([stationID, incoming]) => {
    let now = new Date().getTime();
    let table = incoming
    .filter(({arrivalEst}) => arrivalEst > 0 && arrivalEst > now)
    .sort((a, b) => a.arrivalEst - b.arrivalEst)
    .slice(0, 5)
    .map(({destination, arrivalEst}) => `<tr>
      <td>${destination}</td>
      <td>${formatArrivalTime(now, arrivalEst)}</td>
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
    });
  });
};

export {
  showTimetables,
  updateTimetables
};