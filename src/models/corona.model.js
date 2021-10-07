const axios = require('axios');
const scraper = require('../services/corona.scraper')

CoronaData = async function () {
    const json = await fetchData();
    const scrape = (await scraper());

    console.log(json);
    console.log(scrape);

    return {
        'date': json.date.toISOString().split('T')[0],
        'admUnit': JSON.parse(json['keyData']['AdmUnitId']),
        'county': json['hospitalData'].county,
        'newCases': JSON.parse(json['keyData']['AnzFallNeu']),
        'totalCases': JSON.parse(json['keyData']['AnzFall']),
        'newDeaths': JSON.parse(json['keyData']['AnzTodesfallNeu']),
        'totalDeaths': JSON.parse(json['keyData']['AnzTodesfall']),
        'inc7D': JSON.parse(json['keyData']['Inz7T']),
        'newRecovered': JSON.parse(json['keyData']['AnzGenesenNeu']),
        'totalRecovered': JSON.parse(json['keyData']['AnzGenesen']),
        'vaccination1': json['vaccination']['vaccinated'],
        'vaccination1Ratio': json['vaccination']['quote'],
        'vaccination2': json['vaccination']['secondVaccination']['vaccinated'],
        'vaccination2Ratio': json['vaccination']['secondVaccination']['quote'],
        'rValue': json['rValue'].value,
        'inhabitants': JSON.parse(json['inhabitants']['EWZ']),
        'infectionRate': (JSON.parse(json['keyData']['AnzFall']) / JSON.parse(json['inhabitants']['EWZ'])) * 100,
        'caseFatalityRatio': (JSON.parse(json['keyData']['AnzTodesfall']) / JSON.parse(json['keyData']['AnzFall'])) * 100,
        'intMedTreatment': JSON.parse(json['hospitalData']['faelle_covid_aktuell']),
        'intMedVentilation': JSON.parse(json['hospitalData']['faelle_covid_aktuell_beatmet']),
        'ICUBedPercentage': JSON.parse(json['hospitalData']['Anteil_betten_frei']),
        'incHospital': scrape['incHospital'],
        'intMedCapacity': scrape['intMedCapacity']
    }
}

async function fetchData() {
    const apiCovidKeyData = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_key_data_hubv/FeatureServer/0/query?where=AdmUnitId%20%3D%207311&outFields=*&f=pjson';
    const apiAgeGroups = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/rki_altersgruppen_hubv/FeatureServer/0/query?where=AdmUnitId%20%3D%207311&outFields=*&f=pjson';
    const apiHospitalData = 'https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/DIVI_Intensivregister_Landkreise/FeatureServer/0/query?where=AGS%20%3D%207311&outFields=*&returnGeometry=false&f=pjson';
    const apiInhabitants = 'https://services2.arcgis.com/jUpNdisbWqRpMo35/arcgis/rest/services/Kreisgrenzen_2018_mit_Einwohnerzahl/FeatureServer/1/query?where=AGS%3D07311&outFields=EWZ&returnGeometry=false&f=pjson';
    const api_vaccinations = 'https://api.corona-zahlen.org/vaccinations';
    const api_rValue = 'https://api.corona-zahlen.org/germany';

    const [keyData, ageGroups, hospitalData, inhabitants, rValue, vaccinations] = await Promise.all([
        axios.get(apiCovidKeyData),
        axios.get(apiAgeGroups),
        axios.get(apiHospitalData),
        axios.get(apiInhabitants),
        axios.get(api_rValue),
        axios.get(api_vaccinations),
    ])

    return Object.assign({}, {
        'date': new Date(),
        'keyData': keyData.data.features[0].attributes,
        'ageGroups': Object.assign({}, ageGroups.data.features),
        'hospitalData': hospitalData.data.features[0].attributes,
        'inhabitants': inhabitants.data.features[0].attributes,
        'rValue': rValue.data.r,
        'vaccination': vaccinations.data.data.states['RP']
    });
}

module.exports = CoronaData;