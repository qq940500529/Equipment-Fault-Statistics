/**
 * 设备妥善率计算器集成测试
 * Integration Tests for Equipment Availability Calculator with Real Data
 * 
 * Note: These tests are currently skipped in Jest due to XLSX module compatibility issues.
 * Run the manual test script instead: node tests/manual/testWithRealData.js
 */

import { EquipmentAvailabilityCalculator } from '../../js/modules/equipmentAvailabilityCalculator.js';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe.skip('EquipmentAvailabilityCalculator Integration Tests', () => {
    let calculator;
    let equipmentData;
    let faultData;

    beforeAll(() => {
        // Read equipment ledger file (设备台账.xlsx)
        const equipmentFilePath = path.join(__dirname, '../../examples/设备台账.xlsx');
        const equipmentWorkbook = XLSX.readFile(equipmentFilePath);
        const equipmentSheet = equipmentWorkbook.Sheets[equipmentWorkbook.SheetNames[0]];
        equipmentData = XLSX.utils.sheet_to_json(equipmentSheet);

        // Read fault information file (12月设备故障信息.xlsx)
        const faultFilePath = path.join(__dirname, '../../examples/12月设备故障信息.xlsx');
        const faultWorkbook = XLSX.readFile(faultFilePath);
        const faultSheet = faultWorkbook.Sheets[faultWorkbook.SheetNames[0]];
        faultData = XLSX.utils.sheet_to_json(faultSheet);

        calculator = new EquipmentAvailabilityCalculator();
    });

    describe('with real data files', () => {
        test('should successfully load equipment data', () => {
            expect(equipmentData).toBeDefined();
            expect(Array.isArray(equipmentData)).toBe(true);
            expect(equipmentData.length).toBeGreaterThan(0);
        });

        test('should successfully load fault data', () => {
            expect(faultData).toBeDefined();
            expect(Array.isArray(faultData)).toBe(true);
            expect(faultData.length).toBeGreaterThan(0);
        });

        test('should extract equipment count correctly', () => {
            const equipmentCount = calculator.extractEquipmentCount(equipmentData);
            
            expect(Object.keys(equipmentCount).length).toBeGreaterThan(0);
            expect(Object.values(equipmentCount).reduce((sum, count) => sum + count, 0)).toBeGreaterThan(0);
            
            console.log(`\n  Total workshops: ${Object.keys(equipmentCount).length}`);
            console.log(`  Total equipment: ${Object.values(equipmentCount).reduce((sum, count) => sum + count, 0)}`);
        });

        test('should aggregate fault time correctly', () => {
            const faultTime = calculator.aggregateFaultTime(faultData);
            
            expect(Object.keys(faultTime).length).toBeGreaterThan(0);
            expect(Object.values(faultTime).reduce((sum, time) => sum + time, 0)).toBeGreaterThan(0);
            
            console.log(`\n  Total workshops with faults: ${Object.keys(faultTime).length}`);
            console.log(`  Total fault time: ${Object.values(faultTime).reduce((sum, time) => sum + time, 0).toFixed(2)} hours`);
        });

        test('should generate complete availability report', () => {
            calculator.reset();
            const report = calculator.generateReport(equipmentData, faultData);
            
            expect(report).toHaveProperty('overall');
            expect(report).toHaveProperty('workshops');
            expect(report).toHaveProperty('metadata');
            
            expect(report.overall.totalEquipment).toBeGreaterThan(0);
            expect(report.overall.totalFaultTimeHours).toBeGreaterThan(0);
            expect(report.overall.availabilityRate).toBeGreaterThan(0);
            expect(report.overall.availabilityRate).toBeLessThanOrEqual(100);
            
            expect(report.workshops.length).toBeGreaterThan(0);
            expect(report.metadata.monthHours).toBe(720);
            
            console.log('\n=== Overall Equipment Availability ===');
            console.log(`  Total Equipment: ${report.overall.totalEquipment}`);
            console.log(`  Total Fault Time: ${report.overall.totalFaultTimeHours} hours`);
            console.log(`  Overall Availability Rate: ${report.overall.availabilityRate}%`);
            
            console.log('\n=== Workshop Availability (Bottom 10) ===');
            const bottom10 = report.workshops.slice(0, 10);
            bottom10.forEach((workshop, index) => {
                console.log(`  ${index + 1}. ${workshop.workshop}`);
                console.log(`     Equipment: ${workshop.equipmentCount}, Fault Time: ${workshop.faultTimeHours}h, Availability: ${workshop.availabilityRate}%`);
            });
            
            console.log('\n=== Workshop Availability (Top 10) ===');
            const top10 = report.workshops.slice(-10).reverse();
            top10.forEach((workshop, index) => {
                console.log(`  ${index + 1}. ${workshop.workshop}`);
                console.log(`     Equipment: ${workshop.equipmentCount}, Fault Time: ${workshop.faultTimeHours}h, Availability: ${workshop.availabilityRate}%`);
            });
        });

        test('should have valid availability rates for all workshops', () => {
            calculator.reset();
            const report = calculator.generateReport(equipmentData, faultData);
            
            report.workshops.forEach(workshop => {
                expect(workshop.availabilityRate).toBeGreaterThanOrEqual(0);
                expect(workshop.availabilityRate).toBeLessThanOrEqual(100);
            });
        });

        test('should calculate availability rates within reasonable range', () => {
            calculator.reset();
            const report = calculator.generateReport(equipmentData, faultData);
            
            // Overall availability should be high (> 90%) for well-maintained equipment
            expect(report.overall.availabilityRate).toBeGreaterThan(90);
            
            // Most workshops should have high availability
            const highAvailabilityCount = report.workshops.filter(w => w.availabilityRate >= 95).length;
            const totalWorkshops = report.workshops.length;
            
            console.log(`\n  Workshops with ≥95% availability: ${highAvailabilityCount}/${totalWorkshops} (${((highAvailabilityCount/totalWorkshops)*100).toFixed(1)}%)`);
        });

        test('should handle workshops with equipment but no faults', () => {
            calculator.reset();
            const report = calculator.generateReport(equipmentData, faultData);
            
            const noFaultWorkshops = report.workshops.filter(w => w.faultTimeHours === 0 && w.equipmentCount > 0);
            
            console.log(`\n  Workshops with equipment but no faults: ${noFaultWorkshops.length}`);
            
            noFaultWorkshops.forEach(workshop => {
                expect(workshop.availabilityRate).toBe(100);
            });
        });

        test('should handle workshops with faults but no equipment', () => {
            calculator.reset();
            const report = calculator.generateReport(equipmentData, faultData);
            
            const noEquipmentWorkshops = report.workshops.filter(w => w.equipmentCount === 0 && w.faultTimeHours > 0);
            
            console.log(`\n  Workshops with faults but no equipment in ledger: ${noEquipmentWorkshops.length}`);
            
            noEquipmentWorkshops.forEach(workshop => {
                expect(workshop.availabilityRate).toBe(0);
            });
        });
    });

    describe('data quality checks', () => {
        test('should have matching workshop formats between data sources', () => {
            calculator.reset();
            calculator.extractEquipmentCount(equipmentData);
            calculator.aggregateFaultTime(faultData);
            
            const equipmentWorkshops = Object.keys(calculator.equipmentByWorkshop);
            const faultWorkshops = Object.keys(calculator.faultTimeByWorkshop);
            
            const matchingWorkshops = equipmentWorkshops.filter(w => faultWorkshops.includes(w));
            
            console.log(`\n  Equipment workshops: ${equipmentWorkshops.length}`);
            console.log(`  Fault workshops: ${faultWorkshops.length}`);
            console.log(`  Matching workshops: ${matchingWorkshops.length}`);
            
            // At least some workshops should match
            expect(matchingWorkshops.length).toBeGreaterThan(0);
        });

        test('should handle missing or null values gracefully', () => {
            calculator.reset();
            
            // This should not throw errors even with potentially missing data
            expect(() => {
                calculator.extractEquipmentCount(equipmentData);
            }).not.toThrow();
            
            expect(() => {
                calculator.aggregateFaultTime(faultData);
            }).not.toThrow();
        });
    });
});
