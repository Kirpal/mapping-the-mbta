import stationNetwork from '../data/station-network.json';

const createTimetable = (line, name) => {
  let card = document.createElement('div');
  let lineClass = line.split('-')[0];
  if (!/North|South/i.test(name)) {
    name = name.replace(' Station', '');
  }
  card.classList = `card station-timetable ${lineClass}`;
  card.style.display = lineClass == 'green' ? 'block' : 'none';
  card.innerHTML = `<h3 class="station-header">${name}</h3>
                    <table>
                        <tr>
                            <td></td>
                            <td></td>
                        </tr>
                    </table>`;

  return card;
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

  stationNetwork.links.forEach(({source, line}) => {
    let name = stationNetwork.nodes[source].name;

    let timetable = createTimetable(line, name);

    document.getElementById('timetable-holder').appendChild(timetable);
    
  });

  Array.from(document.getElementsByClassName('line-select')).forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      showLine(e.target.dataset.line);
    });
  });
};

export default showTimetables;