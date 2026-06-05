'use strict';

const { makeBadge } = require('badge-maker');
const si = require('simple-icons');
const octiconsPkg = require('@primer/octicons');
const octicons = octiconsPkg.default || octiconsPkg;

// Normalise a name to a comparable key: lowercase, alphanumerics only.
// This makes "Next.js", "next.js" and "nextjs" all collapse to "nextjs".
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// ---------------------------------------------------------------------------
// Logo lookup tables (built once at module load)
// ---------------------------------------------------------------------------

// simple-icons: keyed by normalised slug and normalised title.
const siMap = Object.create(null);
for (const key of Object.keys(si)) {
  const icon = si[key];
  if (!icon || !icon.slug || !icon.path) continue;
  const bySlug = norm(icon.slug);
  const byTitle = norm(icon.title);
  if (!(bySlug in siMap)) siMap[bySlug] = icon;
  if (!(byTitle in siMap)) siMap[byTitle] = icon;
}

// GitHub Octicons that simple-icons does not provide. These are the logos the
// custom-icon-badges service was being used for (device-desktop, server,
// terminal, code) plus a few common security/IT extras for future badges.
const OCTICON_LOGOS = [
  'device-desktop',
  'server',
  'terminal',
  'code',
  'shield',
  'shield-lock',
  'lock',
  'key',
  'database',
  'globe',
  'desktop-download',
  'cpu',
  'gear',
  'container',
];
const octMap = Object.create(null);
for (const name of OCTICON_LOGOS) {
  if (octicons[name]) octMap[norm(name)] = octicons[name];
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

// Accept "FCC624", "#FCC624" or a CSS colour name ("white", "black", ...).
function cssColor(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const v = String(value).trim();
  if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(v)) {
    return '#' + v;
  }
  return v; // named colour
}

// ---------------------------------------------------------------------------
// Logo -> base64 data URI
// ---------------------------------------------------------------------------

function logoDataUri(name, logoColor) {
  if (!name) return null;
  const key = norm(name);

  const oct = octMap[key];
  if (oct) {
    const h = oct.heights['24'] || oct.heights['16'];
    const fill = cssColor(logoColor, 'whitesmoke');
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${h.width} 24" ` +
      `fill="${fill}">${h.path}</svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }

  const icon = siMap[key];
  if (icon) {
    const fill = cssColor(logoColor, '#' + icon.hex);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ` +
      `fill="${fill}"><path d="${icon.path}"/></svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }

  return null;
}

// ---------------------------------------------------------------------------
// Path parsing (shields.io static-badge grammar)
//
//   /badge/<label>-<message>-<color>   (3 segments)
//   /badge/<message>-<color>           (2 segments, empty label)
//
// Escapes (per shields.io):
//   --  -> literal dash
//   __  -> literal underscore
//   _   -> space
// A trailing ".svg" extension (used by custom-icon-badges) is stripped.
// ---------------------------------------------------------------------------

const DASH = String.fromCharCode(1); // sentinel for an escaped "--"
const UND = String.fromCharCode(2); // sentinel for an escaped "__"

function decodeText(part) {
  return part
    .split('_').join(' ')
    .split(UND).join('_')
    .split(DASH).join('-');
}

function decodeColor(part) {
  return part
    .split(UND).join('_')
    .split(DASH).join('-');
}

function parsePath(raw) {
  let s = String(raw || '');
  try {
    s = decodeURIComponent(s);
  } catch (_) {
    /* already decoded or contains a stray %, use as-is */
  }
  if (s.toLowerCase().endsWith('.svg')) s = s.slice(0, -4);

  s = s.split('--').join(DASH).split('__').join(UND);
  const parts = s.split('-');

  let label = '';
  let message = '';
  let color = '';

  if (parts.length === 1) {
    message = parts[0];
  } else if (parts.length === 2) {
    message = parts[0];
    color = parts[1];
  } else {
    label = parts[0];
    color = parts[parts.length - 1];
    message = parts.slice(1, -1).join('-');
  }

  return {
    label: decodeText(label),
    message: decodeText(message),
    color: decodeColor(color),
  };
}

// ---------------------------------------------------------------------------
// Public API: build an SVG badge from a path slug + query params.
// Query params mirror shields.io: style, logo, logoColor, label, color,
// labelColor, message.
// ---------------------------------------------------------------------------

function buildBadge(pathSlug, query) {
  query = query || {};
  const parsed = parsePath(pathSlug);

  const format = {
    label: query.label !== undefined ? query.label : parsed.label,
    message: query.message !== undefined ? query.message : parsed.message,
    color: query.color || parsed.color || 'blue',
    style: query.style || 'flat',
  };
  if (query.labelColor) format.labelColor = query.labelColor;

  if (query.logo) {
    const uri = logoDataUri(query.logo, query.logoColor);
    if (uri) format.logoBase64 = uri;
  }

  return makeBadge(format);
}

module.exports = { buildBadge, logoDataUri, parsePath, cssColor };
