'use strict';

// Renders every badge currently used in the profile README through the local
// engine and asserts the logo is embedded and the text is correct.
// Run with: npm test

const assert = require('assert');
const { buildBadge, parsePath } = require('../lib/render');

function q(str) {
  const out = {};
  for (const pair of str.split('&')) {
    if (!pair) continue;
    const [k, v] = pair.split('=');
    out[decodeURIComponent(k)] = decodeURIComponent(v || '');
  }
  return out;
}

// [ path, queryString, expectedMessage ]
const BADGES = [
  ['Linux-FCC624', 'style=plastic&logo=linux&logoColor=black', 'Linux'],
  ['Windows-0078D6.svg', 'style=plastic&logo=device-desktop&logoColor=white', 'Windows'],
  ['Active_Directory-003366.svg', 'style=plastic&logo=server&logoColor=white', 'Active Directory'],
  ['CLI-000000', 'style=plastic&logo=gnu-bash&logoColor=white', 'CLI'],
  ['Bash-4EAA25', 'style=plastic&logo=gnubash&logoColor=white', 'Bash'],
  ['PowerShell-5391FE.svg', 'style=plastic&logo=terminal&logoColor=white', 'PowerShell'],
  ['IT_Security-DC143C', 'style=plastic&logo=fortinet&logoColor=white', 'IT Security'],
  ['HTML5-E44D26', 'style=plastic&logo=html5&logoColor=white', 'HTML5'],
  ['CSS3-264DE4.svg', 'style=plastic&logo=code&logoColor=white', 'CSS3'],
  ['JavaScript-F0DB4F', 'style=plastic&logo=javascript&logoColor=black', 'JavaScript'],
  ['TypeScript-3178C6', 'style=plastic&logo=typescript&logoColor=white', 'TypeScript'],
  ['React-61DAFB', 'style=plastic&logo=react&logoColor=black', 'React'],
  ['Next.js-000000', 'style=plastic&logo=next.js&logoColor=white', 'Next.js'],
  ['Tailwind_CSS-38B2AC', 'style=plastic&logo=tailwindcss&logoColor=white', 'Tailwind CSS'],
  ['GSAP-88CE02', 'style=plastic&logo=greensock&logoColor=black', 'GSAP'],
  ['Three.js-000000', 'style=plastic&logo=three.js&logoColor=white', 'Three.js'],
  ['Python-3776AB', 'style=plastic&logo=python&logoColor=yellow', 'Python'],
  ['SQL-336791', 'style=plastic&logo=postgresql&logoColor=white', 'SQL'],
  ['PHP-777BB4', 'style=plastic&logo=php&logoColor=white', 'PHP'],
  ['Node.js-339933', 'style=plastic&logo=node.js&logoColor=white', 'Node.js'],
  ['Express.js-000000', 'style=plastic&logo=express&logoColor=white', 'Express.js'],
  ['PostgreSQL-4169E1', 'style=plastic&logo=postgresql&logoColor=white', 'PostgreSQL'],
  ['Hack_The_Box-9FEF00', 'style=plastic&logo=hackthebox&logoColor=1A472A', 'Hack The Box'],
  ['TryHackMe-212C42', 'style=plastic&logo=tryhackme&logoColor=white', 'TryHackMe'],
  ['Codecademy-FFF0E5', 'style=plastic&logo=codecademy&logoColor=1F243A', 'Codecademy'],
  ['SoloLearn-149EF2', 'style=plastic&logo=sololearn&logoColor=white', 'SoloLearn'],
  ['LeetCode-FFA116', 'style=plastic&logo=leetcode&logoColor=white', 'LeetCode'],
  ['Goodreads-372213', 'style=plastic&logo=goodreads&logoColor=white', 'Goodreads'],
  ['Monkeytype-000000', 'style=plastic&logo=monkeytype&logoColor=white', 'Monkeytype'],
  ['Email-0078D4', 'style=plastic&logo=minutemailer&logoColor=white', 'Email'],
  ['0xGI0-5865F2', 'style=plastic&logo=discord&logoColor=white', '0xGI0'],
  ['Matrix-@0xgi0:matrix.org-000000', 'style=plastic&logo=matrix&logoColor=white', '@0xgi0:matrix.org'],
  ['PGP-BCD2264C18EFF80A-672FAE', 'style=plastic&logo=gnuprivacyguard&logoColor=white', 'BCD2264C18EFF80A'],
];

let passed = 0;
for (const [path, query, expectedMessage] of BADGES) {
  const svg = buildBadge(path, q(query));
  assert.ok(svg.includes('<svg'), `${path}: not an SVG`);
  assert.ok(svg.includes('<image'), `${path}: logo not embedded`);
  assert.ok(
    svg.includes(expectedMessage),
    `${path}: expected message "${expectedMessage}" missing`
  );
  passed++;
  console.log('  ok  ', path);
}

// Parsing edge cases
assert.deepStrictEqual(parsePath('Matrix-@0xgi0:matrix.org-000000'), {
  label: 'Matrix',
  message: '@0xgi0:matrix.org',
  color: '000000',
});
assert.deepStrictEqual(parsePath('Active_Directory-003366.svg'), {
  label: '',
  message: 'Active Directory',
  color: '003366',
});
assert.deepStrictEqual(parsePath('Linux-FCC624'), {
  label: '',
  message: 'Linux',
  color: 'FCC624',
});

console.log(`\n${passed}/${BADGES.length} README badges rendered, parse checks passed.`);
