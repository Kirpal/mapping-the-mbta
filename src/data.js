import mareyHeaders from '../data/marey-header.json';
import stationNetwork from '../data/station-network.json';
import spider from '../data/spider.json';

stationNetwork.nodes.forEach(node => {
  if (!/North|South/i.test(node.name)) {
    node.name = node.name.replace(' Station', '');
  }
});

const stationNames = Object.fromEntries(stationNetwork.nodes.map((node) => [node.id, node.name]));

const API_URL = 'https://mbta.kirp.al';

const processData = (data) => data
  .filter(({line}) => line != 'Mattapan')
  .map(trip => ({
    line: trip.line.toLowerCase(),
    vehicleID: trip.vehicleID,
    destination: trip.destination,
    startTime: trip.startTime * 1000,
    endTime: trip.endTime * 1000,
    stations: trip.stations.map((stop) => {
      return {
        station: stop.station,
        departure: stop.departure * 1000,
        arrival: stop.arrival * 1000,
        onTime: stop.onTime
      }
    })
  }));

const getTrips = async () => {
  const trips = (await (await fetch(`${API_URL}/api/scheduled`)).json()).trips;
  
  return processData(trips);
}

export {
  mareyHeaders,
  stationNetwork,
  stationNames,
  spider,
  getTrips
};