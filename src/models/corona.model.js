const axios = require('axios');
const scraper = require('../services/corona.scraper')

CoronaData = async function () {
    const json = await fetchData();
    const incHospital = (await scraper.scrapeIncHospital());

    console.log(json);

    return {
        'date': json.date.toISOString().split('T')[0],
        'admUnit': JSON.parse(json['keyData']['AdmUnitId']) ?? 7311,
        'county': json['hospitalData']?.county ?? 7,
        'newCases': JSON.parse(json['keyData']['AnzFallNeu']) ?? -1,
        'totalCases': JSON.parse(json['keyData']['AnzFall']) ?? -1,
        'newDeaths': JSON.parse(json['keyData']['AnzTodesfallNeu']) ?? -1,
        'totalDeaths': JSON.parse(json['keyData']['AnzTodesfall']) ?? -1,
        'inc7D': JSON.parse(json['keyData']['Inz7T']) ?? -1,
        'newRecovered': JSON.parse(json['keyData']['AnzGenesenNeu']) ?? -1,
        'totalRecovered': JSON.parse(json['keyData']['AnzGenesen']) ?? -1,
        'vaccination1': json['vaccination']['vaccinated'] ?? -1,
        'vaccination1Ratio': json['vaccination']['quote'] ?? -1,
        'vaccination2': json['vaccination']['secondVaccination']['vaccinated'] ?? -1,
        'vaccination2Ratio': json['vaccination']['secondVaccination']['quote'] ?? -1,
        'rValue': json['rValue']?.value ?? -1,
        'inhabitants': JSON.parse(json['inhabitants']['EWZ']) ?? -1,
        'infectionRate': (JSON.parse(json['keyData']['AnzFall']) / JSON.parse(json['inhabitants']['EWZ'])) * 100 ?? -1,
        'caseFatalityRatio': (JSON.parse(json['keyData']['AnzTodesfall']) / JSON.parse(json['keyData']['AnzFall'])) * 100 ?? -1,
        'intMedTreatment': JSON.parse(json['hospitalData']['faelle_covid_aktuell']) ?? -1,
        'intMedVentilation': JSON.parse(json['hospitalData']['faelle_covid_aktuell_beatmet']) ?? -1,
        'ICUBedPercentage': JSON.parse(json['hospitalData']['Anteil_betten_frei']) ?? -1,
        'incHospital': incHospital['value'] ?? -1,
        'intMedCapacity': JSON.parse(json['intMedCapacity']['bettenFreiToBettenGesamtPercent']) ?? -1
    }
}

async function fetchData() {
    const apiCovidKeyData = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_key_data_hubv/FeatureServer/0/query?where=AdmUnitId%20%3D%207311&outFields=*&f=pjson';
    const apiAgeGroups = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_altersgruppen_hubv/FeatureServer/0/query?where=AdmUnitId%20%3D%207311&outFields=*&f=pjson';
    const apiHospitalData = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=AGS%20%3D%207311&outFields=*&returnGeometry=false&f=pjson';
    const apiInhabitants = 'https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Kreisgrenzen_2018_mit_Einwohnerzahl/FeatureServer/1/query?where=AGS%3D07311&outFields=EWZ&returnGeometry=false&f=pjson';
    const apiIntMedCapacity = 'https://www.intensivregister.de/api/public/reporting/laendertabelle?onlyErwachsenenBetten=true';
    const api_vaccinations = 'https://api.corona-zahlen.org/vaccinations';
    const api_rValue = 'https://api.corona-zahlen.org/germany';

    const [keyData, ageGroups, hospitalData, inhabitants, intMedCapacity, rValue, vaccinations] = await Promise.all([
        axios.get(apiCovidKeyData),
        axios.get(apiAgeGroups),
        axios.get(apiHospitalData),
        axios.get(apiInhabitants),
        axios.get(apiIntMedCapacity),
        axios.get(api_rValue),
        axios.get(api_vaccinations),
    ]).catch(err => console.log(err));

    return Object.assign({}, {
        'date': new Date(),
        'keyData': keyData.data.features[0].attributes,
        'ageGroups': Object.assign({}, ageGroups.data.features),
        'hospitalData': hospitalData.data.features[0].attributes,
        'inhabitants': inhabitants.data.features[0].attributes,
        'intMedCapacity': intMedCapacity.data.data[6],
        'rValue': rValue.data.r,
        'vaccination': vaccinations.data.data.states['RP']
    });
}

module.exports = CoronaData;