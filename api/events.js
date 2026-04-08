/**
 * Vercel Serverless Function — AI-powered Amsterdam Events Scraper
 *
 * Fetches HTML from multiple Amsterdam event listing sites,
 * uses Claude AI (Haiku) to extract structured event data.
 * Falls back to Ticketmaster API if available.
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 * Optional: TICKETMASTER_API_KEY for additional events.
 */

var SOURCES = [
  {
    name: 'iamsterdam',
    url: 'https://www.iamsterdam.com/en/see-and-do/whats-on',
    label: 'I Amsterdam'
  },
  {
    name: 'uitinamsterdam',
    url: 'https://www.uitinamsterdam.nl/en/events',
    label: 'Uit in Amsterdam'
  },
  {
    name: 'timeout',
    url: 'https://www.timeout.com/amsterdam/things-to-do/things-to-do-in-amsterdam-this-month',
    label: 'Time Out Amsterdam'
  }
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var anthropicKey = process.env.ANTHROPIC_API_KEY;
  var ticketmasterKey = process.env.TICKETMASTER_API_KEY;

  if (!anthropicKey && !ticketmasterKey) {
    return res.status(200).json({
      data: [],
      source: 'none',
      message: 'No API keys configured. Set ANTHROPIC_API_KEY for AI scraping or TICKETMASTER_API_KEY for Ticketmaster.'
    });
  }

  var allEvents = [];
  var sources = [];

  try {
    // Run AI scraping and Ticketmaster in parallel
    var tasks = [];

    if (anthropicKey) {
      tasks.push(
        scrapeAllSources(anthropicKey)
          .then(function(events) { return { name: 'ai-scraper', events: events }; })
          .catch(function(err) { console.error('AI scraper error:', err.message); return { name: 'ai-scraper', events: [] }; })
      );
    }

    if (ticketmasterKey) {
      tasks.push(
        fetchTicketmasterEvents(ticketmasterKey)
          .then(function(events) { return { name: 'ticketmaster', events: events }; })
          .catch(function(err) { console.error('Ticketmaster error:', err.message); return { name: 'ticketmaster', events: [] }; })
      );
    }

    var results = await Promise.all(tasks);

    results.forEach(function(result) {
      if (result.events.length > 0) {
        sources.push(result.name + '(' + result.events.length + ')');
        allEvents = allEvents.concat(result.events);
      }
    });

    // Deduplicate by title + date (fuzzy)
    allEvents = deduplicateEvents(allEvents);

    return res.status(200).json({
      data: allEvents,
      source: sources.join(' + ') || 'none',
      count: allEvents.length
    });
  } catch (err) {
    console.error('Scraper error:', err.message);
    return res.status(200).json({ data: [], source: 'error', message: err.message });
  }
};

/* ==========================================================
   AI SCRAPING
   ========================================================== */

async function scrapeAllSources(apiKey) {
  var results = await Promise.allSettled(
    SOURCES.map(function(source) {
      return scrapeSource(source, apiKey);
    })
  );

  var allEvents = [];
  results.forEach(function(result, i) {
    if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
      allEvents = allEvents.concat(result.value);
    } else if (result.status === 'rejected') {
      console.error('Source ' + SOURCES[i].name + ' failed:', result.reason);
    }
  });

  return allEvents;
}

async function scrapeSource(source, apiKey) {
  // 1. Fetch HTML
  var response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8'
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(source.name + ' returned ' + response.status);
  }

  var html = await response.text();

  // 2. Trim HTML — remove noise, keep content
  var trimmed = trimHtml(html);

  // Skip if too little content (likely JS-rendered)
  if (trimmed.length < 500) {
    return [];
  }

  // 3. Extract events with Claude
  var events = await extractEventsWithAI(trimmed, source, apiKey);
  return events;
}

function trimHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<input[^>]*>/gi, '')
    .replace(/<button[\s\S]*?<\/button>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .substring(0, 40000);
}

async function extractEventsWithAI(html, source, apiKey) {
  var today = new Date().toISOString().split('T')[0];
  var year = new Date().getFullYear();

  var prompt = 'Below is HTML from the website "' + source.label + '" (' + source.url + ').\n' +
    'Today is ' + today + '.\n\n' +
    'Extract all upcoming events in Amsterdam from this HTML. For each event, return a JSON object.\n\n' +
    'Rules:\n' +
    '- Only include events with a clear date (skip if no date found)\n' +
    '- Only include events happening in Amsterdam\n' +
    '- Dates must be in ' + year + ' or later\n' +
    '- Use ISO date format (YYYY-MM-DD)\n' +
    '- Category must be one of: muziek, theater, kunst, food, sport, tech, uitgaan, overig\n' +
    '- If the event is free, set isFree to true and price to null\n' +
    '- Keep descriptions concise (1-2 sentences in Dutch)\n\n' +
    'Return ONLY a JSON array (no markdown, no explanation). Each object:\n' +
    '{\n' +
    '  "title": "Event name",\n' +
    '  "description": "Short description in Dutch",\n' +
    '  "date": "YYYY-MM-DD",\n' +
    '  "time": "HH:MM",\n' +
    '  "location": "Venue name, Amsterdam",\n' +
    '  "category": "one of the categories above",\n' +
    '  "isFree": false,\n' +
    '  "price": "\u20AC25 or null",\n' +
    '  "sourceUrl": "URL to event page if available, otherwise ' + source.url + '"\n' +
    '}\n\n' +
    'If no events can be extracted, return an empty array: []\n\n' +
    'HTML:\n' + html;

  var response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) {
    var errText = await response.text();
    throw new Error('Claude API error ' + response.status + ': ' + errText.substring(0, 200));
  }

  var result = await response.json();
  var text = result.content && result.content[0] && result.content[0].text;

  if (!text) return [];

  // Parse JSON from response — handle markdown code blocks
  var jsonStr = text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  var parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    // Try to find JSON array in the response
    var match = jsonStr.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch (e2) {
        console.error('Failed to parse AI response for ' + source.name);
        return [];
      }
    } else {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  // Map to our format with source-specific IDs
  return parsed
    .filter(function(ev) { return ev.title && ev.date; })
    .map(function(ev, i) {
      return {
        id: source.name + '-' + i + '-' + ev.date,
        title: ev.title,
        description: ev.description || '',
        date: ev.date,
        time: ev.time || '00:00',
        location: ev.location || 'Amsterdam',
        category: validateCategory(ev.category),
        isFree: ev.isFree === true,
        price: ev.isFree ? null : (ev.price || null),
        imageUrl: null,
        sourceUrl: ev.sourceUrl || source.url,
        source: source.name
      };
    });
}

function validateCategory(cat) {
  var valid = ['muziek', 'theater', 'kunst', 'food', 'sport', 'tech', 'uitgaan', 'overig'];
  if (cat && valid.includes(cat.toLowerCase())) return cat.toLowerCase();
  return 'overig';
}

/* ==========================================================
   TICKETMASTER (bonus source)
   ========================================================== */

async function fetchTicketmasterEvents(apiKey) {
  var now = new Date();
  var monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  var startDate = now.toISOString().split('.')[0] + 'Z';
  var endDate = monthLater.toISOString().split('.')[0] + 'Z';

  var url =
    'https://app.ticketmaster.com/discovery/v2/events.json' +
    '?city=Amsterdam&countryCode=NL' +
    '&startDateTime=' + startDate +
    '&endDateTime=' + endDate +
    '&size=100&sort=date,asc' +
    '&page=0' +
    '&apikey=' + apiKey;

  var response = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (!response.ok) {
    throw new Error('Ticketmaster API returned ' + response.status);
  }

  var data = await response.json();
  var tmEvents = (data._embedded && data._embedded.events) || [];

  return tmEvents.map(function(tm) {
    var classification = (tm.classifications && tm.classifications[0]) || {};
    var venue = (tm._embedded && tm._embedded.venues && tm._embedded.venues[0]) || {};
    var priceRange = (tm.priceRanges && tm.priceRanges[0]) || null;
    var startDate = (tm.dates && tm.dates.start) || {};

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

    return {
      id: 'tm-' + tm.id,
      title: tm.name || 'Onbekend event',
      description: tm.info || tm.pleaseNote || '',
      date: startDate.localDate || '',
      time: startDate.localTime ? startDate.localTime.substring(0, 5) : '00:00',
      location: locationParts.length > 0 ? locationParts.join(', ') : 'Amsterdam',
      category: mapTMCategory(classification),
      isFree: isFree,
      price: isFree ? null : priceStr,
      imageUrl: null,
      sourceUrl: tm.url || '',
      source: 'ticketmaster'
    };
  });
}

function mapTMCategory(classification) {
  var segment = ((classification.segment && classification.segment.name) || '').toLowerCase();
  var genre = ((classification.genre && classification.genre.name) || '').toLowerCase();

  if (segment === 'music') return 'muziek';
  if (segment === 'sports') return 'sport';
  if (segment === 'arts & theatre' || segment === 'arts') {
    if (genre.includes('comedy') || genre.includes('theatre') || genre.includes('musical')) return 'theater';
    return 'kunst';
  }
  if (genre.includes('food') || genre.includes('drink')) return 'food';
  if (genre.includes('club') || genre.includes('dance') || genre.includes('electronic')) return 'uitgaan';
  return 'overig';
}

/* ==========================================================
   DEDUPLICATION
   ========================================================== */

function deduplicateEvents(events) {
  var seen = {};
  return events.filter(function(ev) {
    var key = normalizeTitle(ev.title) + '|' + ev.date;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 40);
}
