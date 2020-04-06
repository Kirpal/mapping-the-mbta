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

# Add assembly stop (2014)
station_network["nodes"].append({"id": "place-astao", "name": "Assembly Station"})
spider["place-astao"] = [8.485281374, 2]
spider["place-welln"] = [8.485281374, 1]
spider["place-mlmnl"] = [8.485281374, 0]
spider["place-ogmnl"] = [8.485281374, -1]
assembly_target = ""
assembly_source = ""
assembly_index = nodeIndex(station_network["nodes"], "place-astao")

newlinks = []

for link in station_network["links"]:
    if link["source"] == nodeIndex(station_network["nodes"], "place-sull"):
        newlinks.append({
            "source": link["source"],
            "target": assembly_index,
            "line": link["line"],
            "color": link["color"]
        })
        newlinks.append({
            "source": assembly_index,
            "target": link["target"],
            "line": link["line"],
            "color": link["color"]
        })
    else:
        newlinks.append(link)

station_network["links"] = newlinks


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
    "place-astao",
    "place-welln",
    "place-mlmnl",
    "place-ogmnl"
]

# Shift the necessary nodes to line everything up correctly
for nodeId in nodes_to_shift:
    spider[nodeId][0] = spider["place-state"][0]
    spider[nodeId][1] -= 0.707106781

# Make sure all nodes are on the chart (x and y greater than 0)
minX = 0
minY = 0
for pos in spider.values():
    minX = min(minX, pos[0])
    minY = min(minY, pos[1])

for nodeId, pos in spider.items():
    pos[0] += abs(minX)
    pos[1] += abs(minY)

# Save the spider and network data
json.dump(spider, open("data/spider.json", "w"))
json.dump(station_network, open("data/station-network.json", "w"))
