import json


# Find the given node id in the list of nodes and return the index
def nodeIndex(nodes: list, id: str) -> int:
    for index, node in enumerate(nodes):
        if node["id"] == id:
            return index
    raise RuntimeError("Node ID not found")


# Load the data from the green line and old charts
station_network = json.load(open("data/old-station-network.json"))
spider = json.load(open("data/old-spider.json"))

green_station_network = json.load(open("data/green-line-station-network.json"))
green_spider = json.load(open("data/green-line-spider.json"))

minX = 0

# Add each node and spider location that doesn't already exist
for station in green_station_network["nodes"]:
    if station["id"] not in [node["id"] for node in station_network["nodes"]]:
        station_network["nodes"].append(station)

    # Offset the green line nodes so they line up with park st on the old
    # chart (shared station)
    if station["id"] not in spider:
        newX = green_spider[station["id"]][0] - 12.242640689000002
        newY = green_spider[station["id"]][1] + 1.050252532
        spider[station["id"]] = [newX, newY]
        minX = min(minX, newX)

# Add each green line link with the new list of nodes
for link in green_station_network["links"]:
    sourceId = green_station_network["nodes"][link["source"]]["id"]
    targetId = green_station_network["nodes"][link["target"]]["id"]

    link["source"] = nodeIndex(station_network["nodes"], sourceId)
    link["target"] = nodeIndex(station_network["nodes"], targetId)
    link["color"] = "427b1d"

    station_network["links"].append(link)


nodes_to_shift = [
    "place-haecl",
    "place-north",
    "place-ccmnl",
    "place-sull",
    "place-welln",
    "place-mlmnl",
    "place-ogmnl"
]

# Shift the necessary nodes to line everything up correctly
for nodeId in nodes_to_shift:
    spider[nodeId][0] = spider["place-state"][0]
    spider[nodeId][1] -= 0.707106781

# Make sure all nodes are on the chart (x and y greater than 0)
for nodeId, pos in spider.items():
    pos[0] += abs(minX)
    pos[1] += 0.707106781

# Save the spider and network data
json.dump(spider, open("data/spider.json", "w"))
json.dump(station_network, open("data/station-network.json", "w"))


# Load the marey trip data
marey_trips = json.load(open("data/old-marey-trips.json"))
green_marey_trips = json.load(open("data/green-line-marey-trips.json"))

# Add all green line trips
for trip in green_marey_trips:
    marey_trips.append(trip)

# Save trip data
json.dump(marey_trips, open("data/marey-trips.json", "w"))

# Load the header data
marey_header = json.load(open("data/old-marey-header.json"))
green_marey_header = json.load(open("data/green-line-marey-header.json"))
maxX = 0

# Find the max x coordinate on the old chart
for coord in marey_header.values():
    maxX = max(coord[0], maxX)

# Add the green line stations to the right of the existing chart
maxX += 2
for name, coord in green_marey_header.items():
    marey_header[name] = [coord[0] + maxX, coord[1]]

# Save header data
json.dump(marey_header, open("data/marey-header.json", "w"))
