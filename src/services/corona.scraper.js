const axios = require('axios');
const cheerio = require('cheerio');

scrapeData = async function () {
    const response = await axios.get('https://lua.rlp.de/de/presse/detail/news/News/detail/coronavirus-sars-cov-2-aktuelle-fallzahlen-fuer-rheinland-pfalz/');
    const data = response.data;
    if (data.error) return data.error;

    const $ = cheerio.load(data);
    let intMedCapacity = $('td:contains("Belastungswert")').parent('tr').next().children().eq(3).children().text()
    let incHospital = $('td:contains("Versorgungsgebiet Rheinpfalz")').parent('tr').children().eq(2).children().text();

    try { intMedCapacity = JSON.parse(intMedCapacity.trim().replace(',', '.')); }
    catch(e) { intMedCapacity = 0; }

    try { incHospital = JSON.parse(incHospital.trim().replace(',', '.')); }
    catch(e) { incHospital = 0; }

    return {
        'intMedCapacity': intMedCapacity,
        'incHospital': incHospital
    };
};

module.exports = scrapeData;