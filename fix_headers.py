import json

headers = json.load(open("data/marey-header.json"))
fixed = {}
items = list(headers.items())
items.sort(key=lambda e: e[1][0])
offset = 0
delta = 0
line = items[0][0].split("|")[1]

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
    "place-hymnl",
    "place-kencl"
]

for header in items:
    station, newLine = header[0].split("|")
    if newLine != line:
        line = newLine
        offset += 6

    elif "green" in newLine:
        offset += 2

    else:
        offset += 3

    fixed[header[0]] = [offset, 1]

json.dump(fixed, open("data/marey-header.json", "w"))
