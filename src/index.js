import showMarey from './marey';
import showTimetables from './timetables';
import {StationMap, drawTrainsAtTime} from './map';
import './styles/style.scss';

showMarey();
const heroMap = StationMap('hero-map');

drawTrainsAtTime(heroMap, 1585262220000);

showTimetables();

document.getElementById('scroll-down').onclick = () => {
  window.scrollTo(0, window.innerHeight - 4 * parseFloat(getComputedStyle(document.documentElement).fontSize));
}