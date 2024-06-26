import fs from 'fs';

const __dirname = new URL('.', import.meta.url).pathname;

const files = [
  'leipzig-aerzte.json', 
  'leipzig-arbeitslose-insgesamt.json', 
  'leipzig-bedarfsgemeinschaften.json', 
  'leipzig-einwohner-insgesamt.json', 
  'leipzig-einwohnerdichte.json', 
  'leipzig-gebaeude-mit-wohnungen-insgesamt.json', 
  'leipzig-handwerksbetriebe-insgesamt.json', 
  'leipzig-jugendquote.json', 
  'leipzig-kraftfahrzeuge-insgesamt.json', 
  'leipzig-landwirtschaftsflaeche.json', 
  'leipzig-lebensmittelgewerbe.json', 
  'leipzig-migranten.json', 
  'leipzig-mit-1-person.json', 
  'leipzig-persoenliches-einkommen.json', 
  'leipzig-straftaten-insgesamt.json', 
  'leipzig-unternehmen-insgesamt.json', 
  'leipzig-wohnflaeche-insgesamt.json', 
  'leipzig-wohnungen.json',
]

files.forEach(f => {

  const contents = JSON.parse(fs.readFileSync(`${__dirname}../../public/data-raw/${f}`));
  const data = contents.data;

  const getUnique = (data, k) => {
    let list = [];
    data.forEach(d => {
      if(d[k] !== null && !list.includes(d[k].trim())) list.push(d[k].trim())
    })
    return list;
  }

  let years = getUnique(data, 'jahr');
  let result = {};

  years.forEach(year => {
    if(!result[year]) result[year] = {}
    data
      .filter(d => d.jahr === year)
      .forEach(d => {
        let category = d.name.trim();
        if(!result[year][category]) result[year][category] = []
        if(d.ortsteil !== null) {
          result[year][category].push({
            value: parseFloat(d.wert),
            district: d.ortsteil
          })
        }
      });
  })

  fs.writeFileSync(`${__dirname}/../../public/data/${f}`, JSON.stringify({
    meta: contents.meta,
    data: result,
  }, null, 2))

})
