Extendable Map Form
=========================

If you can edit an HTML form, you can create a custom capture form for mapping data

## Usage

1) Remix this project from [Glitch](http://glitch.com/~extendable-map-form).

2) Modify the form fields in the `attr_fields` fielset in `index.html` to match the attribute information you need to capture. 
_NOTE_: Do not modify the `geo_fields` fieldset as it may break the app.

3) Start capturing data with your form. 

4) Click the `View Submissions` button to view your data on a web map.

Data captured in the form is saved in a [hyperlog](http://github.com/mafintosh/hyperlog) database in the `.data` folder in [GeoJSON](http://geojson.org) format. 

## API

`/queryAll` - returns all captured data in GeoJSON format. 
example: [`http://extendable-map-form.glitch.me/queryAll`](http://extendable-map-form.glitch.me/queryAll)

`/query?bbox=<bbox>` - returns only data within a bounding box. hint: use [bboxfinder](http://bboxfinder) to generate the bbox values. 
example: [`http://extendable-map-form.glitch.me/query?bbox=-125.859375,25.005973,-64.687500,49.496675`](http://extendable-map-form.glitch.me/query?bbox=-125.859375,25.005973,-64.687500,49.496675)

## Acknowledgments

This project borrows ideas from [`osm-p2p-db`](http://github.com/digidem/osm-p2p-db) which, honestly, is a lot more fleshed out and less buggy

## License
Apache v2 2017, Nick Peihl