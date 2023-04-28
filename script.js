function mainMap() {
    const displayMap = L.map('map').setView([39.0458, -76.6413], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(displayMap);
return displayMap;
    
}

function addgeoJSON(geoJSONObject, mainMAP) {
    console.log('Adding GEOJSON to Map');
    L.geoJson(geoJSONObject).addTo(mainMAP);
}


const mapObject = mainMap();

async function mainPage() {
    const loadZIP = document.querySelector('#DataLoadZIP');
    const loadCarRegis = document.querySelector('#DataLoadCARREGIS');

    loadZIP.addEventListener('click', async(SubmitEvent) => {
        console.log("Fetching ZIP Data");
        const zipData = await fetch('./Maryland_Political_Boundaries_-_ZIP_Codes_-_5_Digit.geojson');
        const zipDataJSON = await zipData.json();
        console.log(zipDataJSON)
        addgeoJSON(zipDataJSON, mapObject)
    });

    loadCarRegis.addEventListener('click', async(SubmitEvent) => {
        console.log("Fetching Car Registration Data");
        const carRegis = await fetch('https://opendata.maryland.gov/resource/tugr-unu9.json');
        const carRegisJSON = await carRegis.json();
        console.log(carRegisJSON);
    })
}

document.addEventListener('DOMContentLoaded', async () => mainPage());