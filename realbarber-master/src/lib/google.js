import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { google } from 'googleapis';
import { startOfDay, endOfDay } from 'date-fns';

// === Кешируемые события для разных локаций ===
const KEY_PATHS = {
  modrany: path.join(process.cwd(), 'src', 'accounts', 'modrany.json'),
  hagibor: path.join(process.cwd(), 'src', 'accounts', 'hagibor.json'),
  kacerov: path.join(process.cwd(), 'src', 'accounts', 'kacerov.json'),
};
const CALENDAR_CONFIG = {
  modrany: [
    { id: 'realbarberpivrnecmodrany@gmail.com', name: 'Denis' },
    { id: 'realbarbervobeckymodrany@gmail.com', name: 'Karel' },
    { id: 'realbarberpechackova@gmail.com', name: 'Káťa' },
    { id: 'realbarbertichy@gmail.com', name: 'Mára' },
    { id: 'realbarbercertok@gmail.com', name: 'Maty' },
    { id: 'realbarberturek@gmail.com', name: 'Ondřej' },
    { id: 'realbarberrejlek@gmail.com', name: 'Rejlis' },
    { id: 'realbarberproseniuc@gmail.com', name: 'Saša' },
    { id: 'realbarbersvorcik@gmail.com', name: 'Švorča' },
    { id: 'realbarberbouzek@gmail.com', name: 'Zlatej' },  
    { id: 'bascorealbarber@gmail.com', name: 'Evžen' },
    { id: 'realbarberdemeter@gmail.com', name: 'Samuel' },
    { id: 'realbarbersvyscev@gmail.com', name: 'Mark' },
  ],
  hagibor: [
    { id: 'realbarberkroupova@gmail.com', name: 'Bára' },
    { id: 'realbarbercecek@gmail.com', name: 'David' },
    { id: 'realbarberdemeterhagibor@gmail.com', name: 'Samuel' },
    { id: 'realbarbervobeckyhagibor@gmail.com', name: 'Karel' },
    { id: 'realbarbercertokhagibor@gmail.com', name: 'Maty' },
    { id: 'realbarberturekmodrany@gmail.com', name: 'Ondra' },
    { id: 'realbarberrejlekhagibor@gmail.com', name: 'Rejlis' },
  ],
  kacerov: [
    { id: 'realbarberurbanova@gmail.com', name: 'Anna' },
    { id: 'realbarberpivrenc@gmail.com', name: 'Denis' },
    { id: 'realbarberweinwurtnerova@gmail.com', name: 'Eliška' },
    { id: 'realbarbervobecky@gmail.com', name: 'Karel' },
    { id: 'realbarberkalvoda@gmail.com', name: 'Matyáš' },
    { id: 'realbarbersvyscevkacerov@gmail.com', name: 'Mark' },
    { id: 'realbarberchochola@gmail.com', name: 'Johny' },
  
  ]
};
let cache = {};

/**
 * Получить события Google Calendar для мастеров выбранной локации с кешем на 1 сек.
 * @param {'modrany'|'hagibor'|'kacerov'} location
 * @param {string} [date] - Дата в формате 'YYYY-MM-DD'
 * @returns {Promise<any[]>}
 */
export async function getEvents(location, date) {
  const calendars = CALENDAR_CONFIG[location];
  const keyPath = KEY_PATHS[location];
  if (!keyPath || !calendars) throw new Error('Unknown location');

  const cacheKey = date ? `${location}_${date}` : location;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < 5000) {
    return cache[cacheKey].data;
  }

  let timeMin, timeMax;
  if (date) {
    const d = new Date(date);
    timeMin = startOfDay(d).toISOString();
    timeMax = endOfDay(d).toISOString();
  } else {
    timeMin = new Date().toISOString();
    timeMax = undefined;
  }

  const key = JSON.parse(await fs.readFile(keyPath, 'utf-8'));
  const jwt = new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    ['https://www.googleapis.com/auth/calendar.readonly']
  );
  await jwt.authorize();
  const calendar = google.calendar({ version: 'v3', auth: jwt });

  // Получаем события только с календарей выбранной локации
  const allEvents = await Promise.all(
    calendars.map(async ({ id, name }) => {
      const res = await calendar.events.list({
        calendarId: id,
        timeMin,
        timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return (res.data.items || []).map(event => ({
        ...event,
        masterName: name,
        calendarId: id,
      }));
    })
  );

  const merged = allEvents.flat();
  cache[cacheKey] = { data: merged, timestamp: now };
  return merged;
}
