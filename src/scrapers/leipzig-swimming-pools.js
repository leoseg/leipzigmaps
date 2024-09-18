import scrapeIt from "scrape-it";
import fs from 'fs';
import { search } from "../../lib/nominatim.mjs";

const domain = `https://www.leipzig.de`;
const url_indoor_pool = `${domain}/freizeit-kultur-und-tourismus/sport/sportstaetten/schwimmhallen`;
const url_outdoor_pool = `${domain}/freizeit-kultur-und-tourismus/sport/sportstaetten/freibaeder`;

const __dirname = new URL('.', import.meta.url).pathname;

const scrapeDetailsUrl = {
  list: {
    listItem: '.project-attributes',
    data: {
      title: {
        selector: 'h3 a'
      },
      detailsUrl: {
        selector: 'h3 a',
        attr: "href"
      }
    }
  }
}

const scrapeDetailsData = {
  address: {
    selector: '.t3booking-t3booking-main-content p',
    eq: 0, 
    convert: value => value.replace(' 04', ', 04').replace('Im Stadtplan anzeigen', '')
  }
}

const enrichWithCoords = async (element) => {
  console.log('search for ' + element.address)
  try {
    const resp = await search(element.address)
    const search_results = resp.filter(r => ['water_park', 'sports_centre'].includes(r.type));
    if(search_results.length > 0) {
      return {
        ...element,
        address: resp[0].address,
        lat: resp[0].lat,
        lon: resp[0].lon
      }      
    } else {
      console.log(element.title, element.address, 'could not be found')
      console.log(resp)
      return element;
    }
  } catch(e) {
    console.log(element.title, element.address, 'could not be resolved')
    console.log(resp)
    return element;
  }   
}

const scrapeDetailsUrlIndoor = scrapeIt(url_indoor_pool, scrapeDetailsUrl);
const scrapeDetailsUrlOutdoor = scrapeIt(url_outdoor_pool, scrapeDetailsUrl);

const handleScrapeResponse = async ([indoor_pool, outdoor_pool]) => {
  const data = [
    ...indoor_pool.data.list.map(sh => ({ ...sh, type: 'indoor_pool' })),
    ...outdoor_pool.data.list.map(sh => ({ ...sh, type: 'outdoor_pool' })),
  ]
  const promises = [];
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    const detailsUrl = `${domain}${element.detailsUrl}`;
    const details = await scrapeIt(detailsUrl, scrapeDetailsData);
    const result = await enrichWithCoords(details.data);
    promises.push({
      title: element.title,
      ...result,
      link: detailsUrl
    });
  }
  const details = await Promise.all(promises);
  fs.writeFileSync(`${__dirname}../../public/data/leipzig-swimming-pools.json`, JSON.stringify(details), 'utf8')
};

Promise.all([scrapeDetailsUrlIndoor, scrapeDetailsUrlOutdoor]).then(handleScrapeResponse)