/**
 * Vercel Serverless Function — Amsterdam Events Scraper
 *
 * Fetches live events from Ticketmaster Discovery API,
 * maps them to our app format, and returns JSON.
 *
 * Requires TICKETMASTER_API_KEY environment variable.
 * Free signup: https://developer-acct.ticketmaster.com/user/register
 */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      data: [],
      source: 'none',
      message: 'TICKETMASTER_API_KEY not configured. Get a free key at https://developer-acct.ticketmaster.com/user/register'
    });
  }

  try {
    var events = await fetchTicketmasterEvents(apiKey);
    return res.status(200).json({ data: events, source: 'ticketmaster', count: events.length });
  } catch (err) {
    console.error('Scraper error:', err.message);
    return res.status(200).json({ data: [], source: 'error', message: err.message });
  }
};

async function fetchTicketmasterEvents(apiKey) {
  var now = new Date();
  var monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  var startDate = now.toISOString().split('.')[0] + 'Z';
  var endDate = monthLater.toISOString().split('.')[0] + 'Z';

  var allEvents = [];
  var page = 0;
  var maxPages = 3;

  while (page < maxPages) {
    var url =
      'https://app.ticketmaster.com/discovery/v2/events.json' +
      '?city=Amsterdam&countryCode=NL' +
      '&startDateTime=' + startDate +
      '&endDateTime=' + endDate +
      '&size=100&sort=date,asc' +
      '&page=' + page +
      '&apikey=' + apiKey;

    var response = await fetch(url);

    if (!response.ok) {
      throw new Error('Ticketmaster API returned ' + response.status);
    }

    var data = await response.json();
    var tmEvents = (data._embedded && data._embedded.events) || [];

    if (tmEvents.length === 0) break;

    allEvents = allEvents.concat(tmEvents.map(mapTicketmasterEvent));

    var totalPages = (data.page && data.page.totalPages) || 1;
    page++;
    if (page >= totalPages) break;
  }

  return allEvents;
}

function mapTicketmasterEvent(tm) {
  var classification = (tm.classifications && tm.classifications[0]) || {};
  var category = mapCategory(classification);
  var venue = (tm._embedded && tm._embedded.venues && tm._embedded.venues[0]) || {};
  var priceRange = (tm.priceRanges && tm.priceRanges[0]) || null;
  var startDate = (tm.dates && tm.dates.start) || {};
  var image = getBestImage(tm.images || []);

  var isFree = priceRange ? priceRange.min === 0 : false;
  var priceStr = null;
  if (priceRange && priceRange.min > 0) {
    priceStr = '\u20AC' + Math.round(priceRange.min);
    if (priceRange.max && priceRange.max > priceRange.min) {
      priceStr += ' - \u20AC' + Math.round(priceRange.max);
    }
  }

  var locationParts = [];
  if (venue.name) locationParts.push(venue.name);
  if (venue.address && venue.address.line1) locationParts.push(venue.address.line1);
  var location = locationParts.length > 0 ? locationParts.join(', ') : 'Amsterdam';

  return {
    id: 'tm-' + tm.id,
    title: tm.name || 'Onbekend event',
    description: tm.info || tm.pleaseNote || buildDescription(tm, venue),
    date: startDate.localDate || '',
    time: startDate.localTime ? startDate.localTime.substring(0, 5) : '00:00',
    location: location,
    category: category,
    isFree: isFree,
    price: isFree ? null : priceStr,
    imageUrl: image,
    sourceUrl: tm.url || '',
    source: 'ticketmaster'
  };
}

function mapCategory(classification) {
  var segment = ((classification.segment && classification.segment.name) || '').toLowerCase();
  var genre = ((classification.genre && classification.genre.name) || '').toLowerCase();
  var subGenre = ((classification.subGenre && classification.subGenre.name) || '').toLowerCase();

  if (segment === 'music') return 'muziek';
  if (segment === 'sports') return 'sport';

  if (segment === 'arts & theatre' || segment === 'arts') {
    if (genre.includes('comedy') || genre.includes('theatre') || genre.includes('musical') || genre.includes('cabaret')) {
      return 'theater';
    }
    return 'kunst';
  }

  if (genre.includes('food') || genre.includes('drink') || genre.includes('culinary')) return 'food';
  if (genre.includes('tech') || genre.includes('conference') || genre.includes('seminar')) return 'tech';
  if (genre.includes('club') || genre.includes('dance') || genre.includes('night') || genre.includes('electronic')) return 'uitgaan';
  if (subGenre.includes('club') || subGenre.includes('dance') || subGenre.includes('electronic')) return 'uitgaan';

  return 'overig';
}

function getBestImage(images) {
  if (!images || images.length === 0) return null;

  var preferred = images.find(function(img) {
    return img.width >= 500 && img.width <= 1200 && img.ratio === '3_2';
  });

  if (preferred) return preferred.url;

  var sorted = images.slice().sort(function(a, b) {
    return (b.width || 0) - (a.width || 0);
  });

  return sorted[0].url;
}

function buildDescription(tm, venue) {
  var parts = [];
  if (tm.classifications && tm.classifications[0]) {
    var c = tm.classifications[0];
    if (c.genre && c.genre.name) parts.push(c.genre.name);
    if (c.subGenre && c.subGenre.name && c.subGenre.name !== c.genre.name) parts.push(c.subGenre.name);
  }
  if (venue.name) parts.push('@ ' + venue.name);
  if (venue.city && venue.city.name) parts.push(venue.city.name);
  return parts.join(' \u2022 ') || 'Event in Amsterdam';
}
