function mainMap() {
    const displayMap = L.map('map').setView([39.0458, -76.6413], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(displayMap);
return displayMap;
    
}

function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FED976';
}

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

function changeExistingToEVNum (featurePropertyExisting, featurepropertyZip, evobject) {
    //Searches for Zip Code in evoObject List, Adds one to get Count Value (assuming same structure)
    zipLocator = evobject.indexOf(parseInt(featurepropertyZip))
    //If Ziplocator cannot find a value for the Zip, 1 will be assigned for Zip
    if (zipLocator < 0) {
        featurePropertyExisting = 1
        return featurePropertyExisting
    } else {
        featurePropertyExisting = evobject[zipLocator+1]
        return featurePropertyExisting
    }
}

function onEachFeature1(feature, layer) {
        //iterates through each feature in the zipDataJSON geojson data, changing the property "EXISTING" to be used for numerical count of EVs instead
        feature.properties.EXISTING = changeExistingToEVNum(feature.properties.EXISTING, feature.properties.ZIPCODE1, evobject)
}


var geojson
const mapObject = mainMap();
const mapLayer = L.geoJSON().addTo(mapObject)
let evobject = [];


async function mainPage() {
    const loadZIP = document.querySelector('#DataLoadZIP');
    const loadCarRegis = document.querySelector('#BUTTONCAR');

    loadZIP.addEventListener('click', async(SubmitEvent) => {
        console.log("Refreshing Map");
        const zipData = await fetch('./Maryland_Political_Boundaries_-_ZIP_Codes_-_5_Digit.geojson');
        const zipDataJSON = await zipData.json();
        mapLayer.addData(zipDataJSON);

        geojson = L.geoJSON(zipDataJSON)

        L.geoJSON(zipDataJSON, {
            onEachFeature : onEachFeature1
        }).addTo(mapLayer);

        L.geoJSON(zipDataJSON, {style: style}).addTo(mapLayer);
        loadZIP.classList.add('hidden')
        
    });

    loadCarRegis.addEventListener('click', async(ClickEvent) => {
        console.log("Fetching Car Registration Data")
        const yearFilter = document.getElementById('yearFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;
        const evtypeFilter = document.getElementById('evtypeFilter').value;
        const carData = await fetch(`https://opendata.maryland.gov/resource/tugr-unu9.json?Fuel_Category=${evtypeFilter}&Year_Month=${yearFilter}/${monthFilter}`);
        carDataJSON = await carData.json();
        carDataJSON.forEach(element => {
            evobject.push(parseInt(element.zip_code), parseInt(element.count)) 
        });
        loadZIP.classList.remove('hidden')
    });
}

document.addEventListener('DOMContentLoaded', async () => mainPage());