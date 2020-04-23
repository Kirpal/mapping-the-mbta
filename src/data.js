import mareyHeaders from '../data/marey-header.json';
import stationNetwork from '../data/station-network.json';
import spider from '../data/spider.json';
import moment from 'moment';

// Rename all stations in the network by removing the unneded 'X Station' except for north/south
stationNetwork.nodes.forEach(node => {
  if (!/North|South/i.test(node.name)) {
    node.name = node.name.replace(' Station', '');
  }
});

const stationNames = Object.fromEntries(stationNetwork.nodes.map((node) => [node.id, node.name]));

const API_URL = 'https://mbta.kirp.al';

// Convert the given Date to the number of days since 1/1/1970
const dateToEffective = (rawDate) => {
  let date = moment(rawDate);

  return date.diff(new Date(1970, 0, 0), 'days') - 1;
}

// Convert the days since 1/1/1970 to a YYYY-MM-DD string
const effectiveToDateString = (effective) => {
  let date = moment(new Date(1970, 0, 0));

  date.add(effective + 1, 'days');

  return date.format('YYYY-MM-DD');
}

// Process the given api data for use in the website
const processData = (data) => data
  .filter(({line}) => line != 'Mattapan')
  .map(trip => ({
    line: trip.line.toLowerCase(),
    id: trip.tripID,
    destination: trip.destination,
    startTime: trip.startTime * 1000 + 4 * 60 * 60 * 1000,
    endTime: trip.endTime * 1000 + 4 * 60 * 60 * 1000,
    stations: trip.stops.map((stop) => {
      return {
        placeID: stop.placeID,
        departure: stop.departure * 1000 + 4 * 60 * 60 * 1000,
        arrival: stop.arrival * 1000 + 4 * 60 * 60 * 1000,
        delta: stop.delta
      }
    })
  }));

// Get the trips for the given date from the api
const getTrips = async (date = new Date()) => {
  const trips = (await (await fetch(`${API_URL}/api/data?date=${dateToEffective(date)}`)).json()).trips;

  return processData(trips);
}

// Get the available dates from the api
const getDates = async () => {
  const dates = await (await fetch(`${API_URL}/api/dates`)).json();

  return dates.sort().map(effectiveToDateString);
}

// Get the end of the day for the given timestamp
const endOfDay = (timestamp) => {
  let now = moment(new Date(timestamp));

  if (now.hours() > 3) {
      now.add({days: 1});
  }

  return now.startOf('day').add({hours: 3}).valueOf();
}

// Get the beginning of the day for the given timestamp
const startOfDay = (timestamp) => {
  let now = moment(new Date(timestamp));

  if (now.hours() < 3) {
      now.subtract({days: 1});
  }

  return now.startOf('day').add({hours: 3}).valueOf();
}

export {
  mareyHeaders,
  stationNetwork,
  stationNames,
  spider,
  getTrips,
  getDates,
  endOfDay,
  startOfDay
};