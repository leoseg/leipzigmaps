import fs from "fs";

const file = fs.readFileSync("./leipzig-gesamtgebiet.geojson")
const json = JSON.parse(file)
const coords = json.features[0].geometry.coordinates.map((c1)=>c1.map((c2) => [c2[1], c2[0]]))
const newGeoJson = {
  "type": "FeatureCollection",
  "name": "leipzig-gesamtgebiet",
  "crs": {
      "type": "name",
      "properties": {
          "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
  },
  "features": [{
          "type": "Feature",
          "properties": {},
          "geometry": {
              "type": "Polygon",
              "coordinates": coords
          }
      }
  ]
}

fs.writeFileSync("out.geojson", JSON.stringify(newGeoJson));
