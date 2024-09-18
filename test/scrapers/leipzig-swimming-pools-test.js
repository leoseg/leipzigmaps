import scrapeIt from "scrape-it";

const domain = `https://www.leipzig.de`;
const url_indoor_pool = `${domain}/freizeit-kultur-und-tourismus/sport/sportstaetten/schwimmhallen`;

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

const scrapeDetailsUrlIndoor = scrapeIt(url_indoor_pool, scrapeDetailsUrl);

const handleScrapeResponse = async ([indoor_pool]) => {
    let data = [
      ...indoor_pool.data.list.map(sh => ({ ...sh, type: 'indoor_pool' })),
    ]
    let element = data[0];
    scrapeIt(`${domain}${element.detailsUrl}`, scrapeDetailsData).then(details => {
      console.log(details.data);
      const result = {
        title: element.title,
        address: details.data.address,
      }
      console.log(JSON.stringify(result, null, 2));
    })
};

Promise.all([scrapeDetailsUrlIndoor]).then(handleScrapeResponse)
