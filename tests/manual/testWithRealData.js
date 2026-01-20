/**
 * 设备妥善率计算器真实数据测试脚本
 * Test script for Equipment Availability Calculator with real data
 * 
 * 运行方式: node tests/manual/testWithRealData.js
 */

import { EquipmentAvailabilityCalculator } from '../../js/modules/equipmentAvailabilityCalculator.js';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== 设备妥善率计算器真实数据测试 ===\n');

try {
    // Read equipment ledger file (设备台账.xlsx)
    console.log('1. 读取设备台账文件...');
    const equipmentFilePath = path.join(__dirname, '../../examples/设备台账.xlsx');
    const equipmentBuffer = fs.readFileSync(equipmentFilePath);
    const equipmentWorkbook = XLSX.read(equipmentBuffer, { type: 'buffer' });
    const equipmentSheet = equipmentWorkbook.Sheets[equipmentWorkbook.SheetNames[0]];
    const equipmentData = XLSX.utils.sheet_to_json(equipmentSheet);
    console.log(`   ✓ 成功读取 ${equipmentData.length} 条设备记录\n`);

    // Read fault information file (12月设备故障信息.xlsx)
    console.log('2. 读取故障信息文件...');
    const faultFilePath = path.join(__dirname, '../../examples/12月设备故障信息.xlsx');
    const faultBuffer = fs.readFileSync(faultFilePath);
    const faultWorkbook = XLSX.read(faultBuffer, { type: 'buffer' });
    const faultSheet = faultWorkbook.Sheets[faultWorkbook.SheetNames[0]];
    const faultData = XLSX.utils.sheet_to_json(faultSheet);
    console.log(`   ✓ 成功读取 ${faultData.length} 条故障记录\n`);

    // Create calculator and generate report
    console.log('3. 计算设备妥善率...');
    const calculator = new EquipmentAvailabilityCalculator();
    const report = calculator.generateReport(equipmentData, faultData);
    console.log('   ✓ 计算完成\n');

    // Display overall results
    console.log('=== 总体统计 ===');
    console.log(`设备总数: ${report.overall.totalEquipment} 台`);
    console.log(`故障时间总和: ${report.overall.totalFaultTimeHours} 小时`);
    console.log(`总体设备妥善率: ${report.overall.availabilityRate}%`);
    console.log('');

    // Display workshop statistics
    console.log('=== 车间妥善率统计 (按妥善率从低到高排序) ===');
    console.log('');
    
    console.log('【妥善率最低的10个车间】');
    const bottom10 = report.workshops.slice(0, 10);
    bottom10.forEach((workshop, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${workshop.workshop}`);
        console.log(`    设备数量: ${workshop.equipmentCount.toString().padStart(4)} 台`);
        console.log(`    故障时间: ${workshop.faultTimeHours.toString().padStart(8)} 小时`);
        console.log(`    妥善率:   ${workshop.availabilityRate.toString().padStart(6)}%`);
        console.log('');
    });

    console.log('【妥善率最高的10个车间】');
    const top10 = report.workshops.slice(-10).reverse();
    top10.forEach((workshop, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${workshop.workshop}`);
        console.log(`    设备数量: ${workshop.equipmentCount.toString().padStart(4)} 台`);
        console.log(`    故障时间: ${workshop.faultTimeHours.toString().padStart(8)} 小时`);
        console.log(`    妥善率:   ${workshop.availabilityRate.toString().padStart(6)}%`);
        console.log('');
    });

    // Statistics summary
    console.log('=== 统计摘要 ===');
    console.log(`车间总数: ${report.workshops.length}`);
    console.log(`月度时间: ${report.metadata.monthHours} 小时 (30天 × 24小时)`);
    
    const highAvailability = report.workshops.filter(w => w.availabilityRate >= 99).length;
    const mediumAvailability = report.workshops.filter(w => w.availabilityRate >= 95 && w.availabilityRate < 99).length;
    const lowAvailability = report.workshops.filter(w => w.availabilityRate < 95).length;
    
    console.log(`\n妥善率分布:`);
    console.log(`  ≥99%: ${highAvailability} 个车间`);
    console.log(`  95%-99%: ${mediumAvailability} 个车间`);
    console.log(`  <95%: ${lowAvailability} 个车间`);

    console.log('\n✓ 测试成功完成！');
    process.exit(0);

} catch (error) {
    console.error('✗ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
}
