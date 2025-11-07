/**
 * Jest setup file for integration tests
 * Sets up global mocks needed for browser-based modules
 */

import * as XLSX from 'xlsx';

// Mock window.XLSX for the browser-based modules
// In jsdom environment, window is already available
if (typeof window !== 'undefined') {
    window.XLSX = XLSX;
} else {
    global.window = { XLSX: XLSX };
}

// Also set global.XLSX for good measure
global.XLSX = XLSX;

