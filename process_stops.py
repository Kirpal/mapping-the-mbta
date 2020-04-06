import json

stops = json.load(open("data/stops.json"))["data"]

stations = {}

for stop in stops:
    try:
        stationId = stop["relationships"]["parent_station"]["data"]["id"]
        if stationId is not None:
            stations[stop["id"]] = stationId

    except (TypeError, KeyError):
        pass


json.dump(stations, open("data/stations.json", "w"))
