import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const API_URL = 'https://apis.data.go.kr/1220000/retrieveTrifFxrtInfo/getRetrieveTrifFxrtInfo';
const SOURCE_URL = 'https://www.data.go.kr/data/15101230/openapi.do';
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'CHF', 'HKD', 'GBP', 'CNY', 'JPY', 'AUD'];
const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;

if (!serviceKey) {
  throw new Error('DATA_GO_KR_SERVICE_KEY is required');
}

function getKoreaDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function getCurrentSunday() {
  const parts = getKoreaDateParts();
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const date = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const day = weekdayIndex[parts.weekday];
  if (!Number.isInteger(day)) throw new Error(`Unknown weekday: ${parts.weekday}`);
  date.setUTCDate(date.getUTCDate() - day);
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function decodeXml(value) {
  return value
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&');
}

function readXmlTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1].trim()) : '';
}

function parseXmlRates(xml) {
  const resultCode = readXmlTag(xml, 'resultCode');
  if (resultCode && resultCode !== '00') {
    throw new Error(`Customs API error ${resultCode}: ${readXmlTag(xml, 'resultMsg')}`);
  }

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => ({
    currency: readXmlTag(match[1], 'currSgn'),
    rate: Number(readXmlTag(match[1], 'fxrt')),
    weekStart: readXmlTag(match[1], 'aplyBgnDt')
  }));
}

function normalizeJsonItems(data) {
  const items = data?.response?.body?.items?.item ?? data?.body?.items?.item ?? [];
  return (Array.isArray(items) ? items : [items]).map((item) => ({
    currency: item.currSgn,
    rate: Number(item.fxrt),
    weekStart: item.aplyBgnDt
  }));
}

async function fetchRates(weekStart) {
  const decodedServiceKey = serviceKey.includes('%') ? decodeURIComponent(serviceKey) : serviceKey;
  const params = new URLSearchParams({
    serviceKey: decodedServiceKey,
    aplyBgnDt: weekStart.replaceAll('-', ''),
    weekFxrtTpcd: '2',
    pageNo: '1',
    numOfRows: '100'
  });
  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Customs API request failed: ${response.status}`);
  }

  const body = await response.text();
  const items = body.trim().startsWith('{') ? normalizeJsonItems(JSON.parse(body)) : parseXmlRates(body);
  const filtered = items.filter((item) => SUPPORTED_CURRENCIES.includes(item.currency));

  for (const currency of SUPPORTED_CURRENCIES) {
    const item = filtered.find((entry) => entry.currency === currency);
    if (!item || !Number.isFinite(item.rate) || item.rate <= 0) {
      throw new Error(`Missing or invalid customs rate: ${currency}`);
    }
  }

  return Object.fromEntries(SUPPORTED_CURRENCIES.map((currency) => {
    const item = filtered.find((entry) => entry.currency === currency);
    return [currency, item.rate];
  }));
}

const sunday = getCurrentSunday();
const saturday = new Date(sunday);
saturday.setUTCDate(saturday.getUTCDate() + 6);
const weekStart = formatDate(sunday);
const weekEnd = formatDate(saturday);
const rates = await fetchRates(weekStart);
const payload = {
  source: 'Korea Customs Service weekly import exchange rates',
  sourceUrl: SOURCE_URL,
  rateType: 'import',
  weekStart,
  weekEnd,
  generatedAt: new Date().toISOString(),
  rates
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(scriptDirectory, '..', 'customs-rates.json');
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Updated ${outputPath} for ${weekStart} through ${weekEnd}`);
