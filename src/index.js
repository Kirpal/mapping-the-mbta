import {showMarey, updateMarey} from './marey';
import {showTimetables, updateTimetables} from './timetables';
import { numTrains, avgWait, reliability } from './num-trains';
import {StationMap, drawTrainsAtTime, getCurrentTrains} from './map';
import {getTrips, getDates, startOfDay, endOfDay} from './data';
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

// Is the given date today?
const sameDate = (other) => {
  let now = new Date();

  return other.getFullYear() == now.getFullYear() && other.getMonth() == now.getMonth() && other.getDate() == now.getDate()
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
const $timeInput = document.getElementById('time-selector-input');
getDates().then(dates => {
  $dateInput.min = dates[0];
  $dateInput.max = dates[dates.length - 1];
  $dateInput.value = moment(DATE).format('YYYY-MM-DD');

  $timeInput.min = startOfDay(DATE.valueOf());
  $timeInput.max = endOfDay(DATE.valueOf());
  $timeInput.value = DATE.valueOf();
  $timeInput.step = 100;
  $timeInput.disabled = "true";

  document.getElementById('start-day-label').innerHTML = moment(startOfDay(DATE)).format('M/D h:mmA');
  document.getElementById('end-day-label').innerHTML = moment(endOfDay(DATE)).format('M/D h:mmA');
});

let drawInterval;
let marey;
let MAREY_TRIPS;

// Draw all trip displays
const drawTrips = (mareyTrips, first) => {
  let timestamp = parseInt($timeInput.value);

  numTrains(mareyTrips, timestamp);
  avgWait(mareyTrips, timestamp);
  reliability(mareyTrips, timestamp);
  updateTimetables(mareyTrips, timestamp);
  
  if (first) {
    marey = showMarey(mareyTrips, timestamp);
  } else {
    updateMarey(marey, mareyTrips, timestamp);
  }
}


// Reload all displays by fetching updated trips
const reloadTrips = (first, deltaTime = 100) => {
  getTrips(DATE).then((mareyTrips) => {
    if (!first) {
      mareyTrips = MAREY_TRIPS
      .filter(t => t.delta != null)
      .concat(mareyTrips
        .filter(trip => {
          let other = MAREY_TRIPS.find(t=>t.id==trip.id);
          return other == undefined || other.delta == null;
        }));
    }
    MAREY_TRIPS = mareyTrips;
    drawTrips(mareyTrips, first);

    let currentTrips = mareyTrips;
    if (deltaTime == 100) {
      currentTrips = getCurrentTrains($timeInput.value, mareyTrips);
    }
    
    clearInterval(drawInterval);
    drawInterval = setInterval(() => {
      $timeInput.value = parseInt($timeInput.value) + deltaTime;
      drawTrainsAtTime(heroMap, parseInt($timeInput.value), currentTrips);
    }, 100);
  });
}

reloadTrips(true);

let reloadTripInterval = setInterval(reloadTrips, 5000);
// Handle the date selector input being changed
$dateInput.addEventListener('change', (_) => {
  let [y, m, d] = $dateInput.value.split('-');
  clearInterval(reloadTripInterval);
  
  DATE = new Date(y, m - 1, d);

  $timeInput.min = startOfDay(currentTimestamp(DATE));
  $timeInput.max = endOfDay(currentTimestamp(DATE));
  $timeInput.value = currentTimestamp(DATE);

  document.getElementById('start-day-label').innerHTML = moment(startOfDay(currentTimestamp(DATE))).format('M/D h:mmA');
  document.getElementById('end-day-label').innerHTML = moment(endOfDay(currentTimestamp(DATE))).format('M/D h:mmA');

  if (sameDate(DATE)) {
    // Reload the trip data on a regular interval
    reloadTripInterval = setInterval(reloadTrips, 5000);
    document.getElementById('live-indicator').style.opacity = 1;
    $timeInput.disabled = "true";
  } else {
    reloadTrips(false, 5000);
    reloadTripInterval = setInterval(() => drawTrips(MAREY_TRIPS), 5000);

    document.getElementById('live-indicator').style.opacity = 0;
    $timeInput.removeAttribute("disabled");
  }
});

$timeInput.addEventListener('change', (_) => {
  drawTrips(MAREY_TRIPS);
  clearInterval(drawInterval);
  drawInterval = setInterval(() => {
    $timeInput.value = parseInt($timeInput.value) + 5000;
    drawTrainsAtTime(heroMap, parseInt($timeInput.value), MAREY_TRIPS);
  }, 100);
});