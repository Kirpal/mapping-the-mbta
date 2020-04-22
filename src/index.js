import {showMarey, updateMarey} from './marey';
import {showTimetables, updateTimetables} from './timetables';
import { numTrains, avgWait } from './num-trains';
import {StationMap, drawTrainsAtTime} from './map';
import {getTrips, getDates} from './data';
import './styles/style.scss';
import moment from 'moment';

// Get the current time's timestamp on the given date's day
const currentTimestamp = (date) => {
  let now = moment(new Date());
  let dateTime = moment(date)
  .hours(now.hours())
  .minutes(now.minutes())
  .seconds(now.seconds())
  .milliseconds(now.milliseconds());

  return dateTime.valueOf();
}

// Load the hero section's map
const heroMap = StationMap('hero-map');

// Show the timetable cards
showTimetables();

// Scroll down when the scroll down button in the hero is pressed
document.getElementById('scroll-down').onclick = () => {
  window.scrollTo(0, window.innerHeight - 4 * parseFloat(getComputedStyle(document.documentElement).fontSize));
}

// Get available dates and populate the date selector with that range
let DATE = new Date();
const $dateInput = document.getElementById('date-selector-input');
getDates().then(dates => {
  $dateInput.min = dates[0];
  $dateInput.max = dates[dates.length - 1];
  $dateInput.value = moment(DATE).format('YYYY-MM-DD');
});

let drawInterval;
let marey;
// Reload all displays by fetching updated trips
const reloadTrips = (first) => {
  getTrips(DATE).then((mareyTrips) => {
    let timestamp = currentTimestamp(DATE);
    
    numTrains(mareyTrips, timestamp);
    avgWait(mareyTrips, timestamp);
    updateTimetables(mareyTrips, timestamp);
    
    if (first) {
      marey = showMarey(mareyTrips, timestamp);
    } else {
      updateMarey(marey, mareyTrips, timestamp);
    }

    clearInterval(drawInterval);
    drawInterval = setInterval(() => {
      drawTrainsAtTime(heroMap, currentTimestamp(DATE), mareyTrips);
    }, 100);
  });
}

reloadTrips(true);

// Handle the date selector input being changed
$dateInput.addEventListener('change', (_) => {
  let [y, m, d] = $dateInput.value.split('-');

  DATE = new Date(y, m - 1, d);
  reloadTrips();
  let now = new Date();
  if (DATE.getFullYear() == now.getFullYear() && DATE.getMonth() == now.getMonth() && DATE.getDate() == now.getDate()) {
    document.getElementById('live-indicator').style.opacity = 1;
  } else {
    document.getElementById('live-indicator').style.opacity = 0;
  }
});

// Reload the trip data on a regular interval
setInterval(reloadTrips, 5000);