import fetch from 'node-fetch';
import fs from 'fs';
import slugify from '@sindresorhus/slugify';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const save_dir = join(dirname(fileURLToPath(import.meta.url)), '../..', 'public/data-raw');

const prefix = `https://statistik.leipzig.de/opendata/api/kdvalues?format=json`;

const urls = [
  `${prefix}&kategorie_nr=2&rubrik_nr=5&periode=y`, // Einwohner mit Migrationshintergund
  `${prefix}&kategorie_nr=2&rubrik_nr=9&periode=y`, // Einwohnerdichte
  `${prefix}&kategorie_nr=7&rubrik_nr=3&periode=y`, // Arbeitslose
  `${prefix}&kategorie_nr=4&rubrik_nr=4&periode=y`, // Bedarfsgemeinschaften
  `${prefix}&kategorie_nr=12&rubrik_nr=1&periode=y`, // Straftaten
  `${prefix}&kategorie_nr=4&rubrik_nr=6&periode=y`, // Ärzte
  `${prefix}&kategorie_nr=6&rubrik_nr=5&periode=y`, // Wohnungsbestand
  `${prefix}&kategorie_nr=2&rubrik_nr=1&periode=y`, // Einwohner gesamt
  `${prefix}&kategorie_nr=2&rubrik_nr=3&periode=y`, // Alter
  `${prefix}&kategorie_nr=4&rubrik_nr=4&periode=y`, // Grundsicherung für Arbeitssuchende
  `${prefix}&kategorie_nr=1&rubrik_nr=1&periode=y`, // Flächennutzung
  `${prefix}&kategorie_nr=8&rubrik_nr=6&periode=y`, // Einzelhandel
  `${prefix}&kategorie_nr=9&rubrik_nr=1&periode=y`, // Einkommen
  `${prefix}&kategorie_nr=10&rubrik_nr=1&periode=y`, // Kraftfahrzeuge
]

;(async () => {
  try {
    if (!fs.existsSync(save_dir)) {
      fs.mkdirSync(save_dir);
    }
  } catch (err) {
  console.error(err);
  }

  const num_digits = Math.ceil(Math.log10(urls.length))
  for (let i = 0; i < urls.length; i++) {
    const response = await fetch(urls[i]);
    process.stdout.write('[' + String(i+1).padStart(num_digits, '0') + '/' + urls.length + '] \"' + urls[i] + '\": ')
    const data = await response.json();
    if (data && data.length > 0) {
      let filename = `leipzig-${slugify(data[0].name)}`
	  fs.writeFileSync(join(save_dir, `${filename}.json`), JSON.stringify({
        meta: {
          source: urls[i],
          title: data[0].name
        },
        data
      }, null, 2))  
	  console.log(`data saved to ${filename}.json `)
    } else {
      console.log("no data found ")
    }
  }
})()
