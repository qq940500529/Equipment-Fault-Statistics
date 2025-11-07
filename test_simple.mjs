import * as XLSX from 'xlsx';

global.window = { XLSX: XLSX };

const { DataParser } = await import('./js/modules/dataParser.js');

console.log('window.XLSX:', global.window.XLSX ? 'defined' : 'undefined');
console.log('DataParser:', typeof DataParser);

const parser = new DataParser();
console.log('Parser created');
