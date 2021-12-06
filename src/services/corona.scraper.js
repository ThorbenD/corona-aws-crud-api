const axios = require('axios');
const cheerio = require('cheerio');

scrapeIncHospital = async function () {
    const response = await axios.get('https://lua.rlp.de/de/presse/detail/news/News/detail/coronavirus-sars-cov-2-aktuelle-fallzahlen-fuer-rheinland-pfalz/');
    const data = response.data;
    if (data.error) return data.error;

    const $ = cheerio.load(data);

    let incHospital = $('td:contains("KS Frankenthal")').prev().children().text();

    try { incHospital = JSON.parse(incHospital.trim().replace(',', '.')); }
    catch(e) { incHospital = -1; }

    return {
        'value': incHospital
    };
};

module.exports = { scrapeIncHospital };