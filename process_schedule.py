import json
from collections import defaultdict
from datetime import datetime

stations = json.load(open("data/stations.json"))
routes = [
    json.load(open("data/schedule-red.json"))["data"],
    json.load(open("data/schedule-orange.json"))["data"],
    json.load(open("data/schedule-blue.json"))["data"],
    json.load(open("data/schedule-green-b.json"))["data"],
    json.load(open("data/schedule-green-c.json"))["data"],
    json.load(open("data/schedule-green-d.json"))["data"],
    json.load(open("data/schedule-green-e.json"))["data"]
]
trips = defaultdict(lambda: {"stops": []})
# Trips Format:
# Permalink: https://github.com/mbtaviz/mbtaviz.github.io/wiki/The-Trains-Visualization#marey-tripsjson
# [
#   {
#     "stops": [
#       {
#         "time": unix timestamp (in seconds) when the train reached this stop,
#         "stop": "GTFS ID of this stop"
#       }, other stops along this trip ...
#     ],
#     "begin": pre-calculated min time from stops list,
#     "end": pre-calculated max time from stops list,
#     "line": "name of the subway line this trip is on",
#     "trip": "unique identifier for this trip"
#   },
#   ...
# ]
main_green = [
    "place-lech",
    "place-spmnl",
    "place-north",
    "place-haecl",
    "place-gover",
    "place-pktrm",
    "place-boyls",
    "place-armnl",
    "place-coecl",
    "place-hymnl"
]

for route in routes:
    for stop in route:
        tripId = stop["relationships"]["trip"]["data"]["id"]

        line = stop["relationships"]["route"]["data"]["id"].lower()
        stopId = stop["relationships"]["stop"]["data"]["id"]
        station = stations[stopId]
        time = stop["attributes"]["arrival_time"]
        if time is None:
            time = stop["attributes"]["departure_time"]

        stopInfo = {
            "time": int(datetime.fromisoformat(time).timestamp()),
            "stop": stations[stopId],
        }

        if "green" in line and ((station == "place-kencl" and stop["attributes"]["direction_id"] == 1) or station in main_green):
            tripId += "-main"
            trips[tripId]["line"] = "green"
        else:
            trips[tripId]["line"] = line

        trips[tripId]["stops"].append(stopInfo)

marey_trips = []
for tripId, trip in trips.items():
    trip["stops"].sort(key=lambda s: s["time"])
    marey_trip = {
        "stops": trip["stops"],
        "line": trip["line"],
        "trip": tripId,
        "begin": trip["stops"][0]["time"],
        "end": trip["stops"][-1]["time"]
    }
    marey_trips.append(marey_trip)

json.dump(marey_trips, open("data/marey-trips.json", "w"))


# {
#     "attributes": {
#         "arrival_time": null,
#         "departure_time": "2020-03-26T05:16:00-04:00",
#         "direction_id": 1,
#         "drop_off_type": 1,
#         "pickup_type": 0,
#         "stop_sequence": 50,
#         "timepoint": false
#     },
#     "id": "schedule-43870655C0-70094-50",
#     "relationships": {
#         "prediction": {},
#         "route": {
#             "data": {
#                 "id": "Red",
#                 "type": "route"
#             }
#         },
#         "stop": {
#             "data": {
#                 "id": "70094",
#                 "type": "stop"
#             }
#         },
#         "trip": {
#             "data": {
#                 "id": "43870655C0",
#                 "type": "trip"
#             }
#         }
#     },
#     "type": "schedule"
# }
