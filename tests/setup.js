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

// Mock ECharts for chart tests - use simple functions instead of jest.fn()
const mockChart = {
    on: () => {},
    setOption: () => {},
    dispose: () => {},
    resize: () => {}
};

global.echarts = {
    init: () => mockChart
};

// Make echarts available on window as well
if (typeof window !== 'undefined') {
    window.echarts = global.echarts;
}

