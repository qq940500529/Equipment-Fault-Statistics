import * as XLSX from './node_modules/xlsx/xlsx.mjs';
import fs from 'fs';

// Mock window.XLSX BEFORE importing modules that depend on it
global.window = { XLSX: XLSX };

// Now import the modules
const { DataParser } = await import('./js/modules/dataParser.js');
const { REQUIRED_COLUMNS } = await import('./js/config/constants.js');

const excelBuffer = fs.readFileSync('./examples/10月份维修数据.xlsx');

const parser = new DataParser();
const result = parser.parseExcel(excelBuffer);

console.log('Parse result:', {
  success: result.success,
  error: result.error,
  rowCount: result.rowCount
});

if (result.success) {
  console.log('\nHeaders (first 10):', result.headers.slice(0, 10));
  console.log('\nRequired columns:', REQUIRED_COLUMNS);
  console.log('\nMapped columns:', result.columnMapping);
  if (result.data && result.data.length > 0) {
    console.log('\nFirst row keys (first 10):', Object.keys(result.data[0]).slice(0, 10));
    console.log('\nFirst row sample:', {
      workshop: result.data[0][result.columnMapping.workshop],
      workOrder: result.data[0][result.columnMapping.workOrder]
    });
  }
}
