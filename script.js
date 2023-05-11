
//Initializes the Map, Returns a Map Object.
function mainMap() {
    const displayMap = L.map('map').setView([39.0458, -76.6413], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(displayMap);
return displayMap;
    
}

//Based on the property being read, it will return a color association for the data presentation on the map.
function getColor(d) {
    return d > 100 ? '#005824' :
           d > 80  ? '#238b45' :
           d > 70  ? '#41ae76' :
           d > 50  ? '#66c2a4' :
           d > 20   ? '#99d8c9' :
           d > 10   ? '#ccece6' :
           d > 5   ? '#e5f5f9' :
                      '#f7fcfd';
}

//Used getColor() in order to apply coloring to each of the datapoints being referenced
function style(feature) {
    return {
        fillColor: getColor(feature.properties.EXISTING),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

//Takes the Property "EXISTING" from the GEOJSON, Changes it to reflect the number of EVs registered in the ZIP Code, since Leaflet does not need this information to function
function changeExistingToEVNum (featurePropertyExisting, featurepropertyZip, evobject) {
    //Searches for Zip Code in evoObject List, Adds one to get Count Value (This is based on the structure of evObject being [ZIP CODE, EV COUNT])
    zipLocator = evobject.indexOf(parseInt(featurepropertyZip))
    //If Ziplocator cannot find a value for the Zip, 1 will be assigned to account for NaN values.
    if (zipLocator < 0) {
        featurePropertyExisting = 1
        return featurePropertyExisting
    } else {
        featurePropertyExisting = evobject[zipLocator+1]
        return featurePropertyExisting
    }
}

//Loop Iteration to loop through each property in the GEOJSON, refers to changeExistingToEVNum to apply the data from the EV registration API.
function onEachFeature1(feature, layer) {
        //iterates through each feature in the zipDataJSON geojson data, changing the property "EXISTING" to be used for numerical count of EVs instead
        feature.properties.EXISTING = changeExistingToEVNum(feature.properties.EXISTING, feature.properties.ZIPCODE1, evobject)
}

//Initialization of Global Map-related variables
const mapObject = mainMap();
const mapLayer = L.geoJSON().addTo(mapObject)
let evobject = [];


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [5, 10, 20, 50, 70, 80, 100],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};



async function mainPage() {
    const loadZIP = document.querySelector('#DataLoadZIP');
    const loadCarRegis = document.querySelector('#BUTTONCAR');

    loadZIP.addEventListener('click', async(SubmitEvent) => {
        //Loads the GEOJSON Data locally available to the website
        console.log("Refreshing Map");
        const zipData = await fetch('./Maryland_Political_Boundaries_-_ZIP_Codes_-_5_Digit.geojson');
        const zipDataJSON = await zipData.json();

        //Adds GEOJSON Data to mapLayer in order to present ZIP Codes via Leaflet
        mapLayer.addData(zipDataJSON);

        //Iterates through each Property in order to apply EV Registration data found in EvoObject
        L.geoJSON(zipDataJSON, {
            onEachFeature : onEachFeature1
        }).addTo(mapLayer);

        //Applies coloring based on EV Count per Zip Code
        L.geoJSON(zipDataJSON, {style: style}).addTo(mapLayer);

        legend.addTo(mapObject)
        loadZIP.classList.add('hidden')
        
    });

    loadCarRegis.addEventListener('click', async(ClickEvent) => {
        console.log("Fetching Car Registration Data")
        //Fetches Dataset based on what the user wanted to display, assigns it to carData, which is converted to a JSON Object
        const yearFilter = document.getElementById('yearFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;
        const evtypeFilter = document.getElementById('evtypeFilter').value;
        const carData = await fetch(`https://opendata.maryland.gov/resource/tugr-unu9.json?Fuel_Category=${evtypeFilter}&Year_Month=${yearFilter}/${monthFilter}`);
        carDataJSON = await carData.json();

        //Iterates through each Array in carDataJSON and makes an array consisting of [ZIP CODE, EV COUNT NUMBER], assigns it to evObject
        carDataJSON.forEach(element => {
            evobject.push(parseInt(element.zip_code), parseInt(element.count)) 
        });

        //Displays the Reload Data Button for the user to click.
        loadZIP.classList.remove('hidden')
    });
}

document.addEventListener('DOMContentLoaded', async () => mainPage());