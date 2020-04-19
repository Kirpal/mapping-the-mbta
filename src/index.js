import showMarey from './marey';
import {showTimetables, updateTimetables} from './timetables';
import numTrains from './num-trains';
import {StationMap, drawTrainsAtTime} from './map';
import {getTrips} from './data';
import './styles/style.scss';

const heroMap = StationMap('hero-map');

showTimetables();

document.getElementById('scroll-down').onclick = () => {
  window.scrollTo(0, window.innerHeight - 4 * parseFloat(getComputedStyle(document.documentElement).fontSize));
}

let drawInterval;
const reloadTrips = (first) => {
  getTrips().then((mareyTrips) => {
    numTrains(mareyTrips);
    avgWait(mareyTrips);
    updateTimetables(mareyTrips);
    clearInterval(drawInterval);
    drawInterval = setInterval(() => drawTrainsAtTime(heroMap, new Date().getTime(), mareyTrips), 100);
    if (first) {
      showMarey(mareyTrips);
    }
  });
}

reloadTrips(true);
setInterval(reloadTrips, 5000);