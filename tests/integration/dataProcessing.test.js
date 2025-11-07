/**
 * 数据处理集成测试
 * Integration Tests for Data Processing Workflow
 * 
 * 使用实际的Excel文件测试完整的数据处理流程
 * Tests the complete data processing workflow using actual Excel file
 */

import { DataParser } from '../../js/modules/dataParser.js';
import { DataValidator } from '../../js/modules/dataValidator.js';
import { DataTransformer } from '../../js/modules/dataTransformer.js';
import { REQUIRED_COLUMNS } from '../../js/config/constants.js';
import fs from 'fs';
import path from 'path';

describe('数据处理完整流程集成测试', () => {
    let dataParser;
    let dataValidator;
    let dataTransformer;
    let excelBuffer;
    let parseResult;

    beforeAll(() => {
        // 读取实际的Excel文件
        const excelPath = path.join(process.cwd(), 'examples', '10月份维修数据.xlsx');
        excelBuffer = fs.readFileSync(excelPath);
    });

    beforeEach(() => {
        dataParser = new DataParser();
        dataValidator = new DataValidator();
        dataTransformer = new DataTransformer();
    });

    afterEach(() => {
        dataParser.reset();
    });

    describe('步骤1: 解析Excel文件', () => {
        test('应该成功解析Excel文件', () => {
            parseResult = dataParser.parseExcel(excelBuffer);
            
            expect(parseResult).toBeDefined();
            expect(parseResult.success).toBe(true);
            expect(parseResult.headers).toBeDefined();
            expect(parseResult.data).toBeDefined();
            expect(parseResult.rowCount).toBeGreaterThan(0);
        });

        test('应该正确提取表头', () => {
            parseResult = dataParser.parseExcel(excelBuffer);
            const headers = dataParser.getHeaders();
            
            expect(headers).toBeDefined();
            expect(Array.isArray(headers)).toBe(true);
            expect(headers.length).toBeGreaterThan(0);
            
            // 验证包含必需列
            expect(headers).toContain(REQUIRED_COLUMNS.workshop);
            expect(headers).toContain(REQUIRED_COLUMNS.workOrder);
            expect(headers).toContain(REQUIRED_COLUMNS.repairPerson);
            expect(headers).toContain(REQUIRED_COLUMNS.reportTime);
            expect(headers).toContain(REQUIRED_COLUMNS.startTime);
            expect(headers).toContain(REQUIRED_COLUMNS.endTime);
        });

        test('应该创建正确的列映射', () => {
            parseResult = dataParser.parseExcel(excelBuffer);
            const columnMapping = dataParser.getColumnMapping();
            
            expect(columnMapping).toBeDefined();
            expect(columnMapping.workshop).toBeDefined();
            expect(columnMapping.workOrder).toBeDefined();
            expect(columnMapping.repairPerson).toBeDefined();
            expect(columnMapping.reportTime).toBeDefined();
            expect(columnMapping.startTime).toBeDefined();
            expect(columnMapping.endTime).toBeDefined();
        });

        test('应该提取数据行', () => {
            parseResult = dataParser.parseExcel(excelBuffer);
            
            expect(parseResult.data).toBeDefined();
            expect(Array.isArray(parseResult.data)).toBe(true);
            expect(parseResult.data.length).toBeGreaterThan(0);
            
            // 验证数据行包含正确的列
            const firstRow = parseResult.data[0];
            expect(firstRow).toBeDefined();
            expect(firstRow[REQUIRED_COLUMNS.workshop]).toBeDefined();
            expect(firstRow[REQUIRED_COLUMNS.workOrder]).toBeDefined();
        });
    });

    describe('步骤2: 验证数据', () => {
        beforeEach(() => {
            parseResult = dataParser.parseExcel(excelBuffer);
        });

        test('应该成功验证数据', () => {
            const validationResult = dataValidator.validate(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(validationResult).toBeDefined();
            expect(validationResult.valid).toBe(true);
            expect(validationResult.errors).toBeDefined();
            expect(validationResult.warnings).toBeDefined();
        });

        test('验证结果应该包含统计信息', () => {
            const validationResult = dataValidator.validate(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(validationResult.errorCount).toBeDefined();
            expect(validationResult.warningCount).toBeDefined();
            expect(validationResult.errors).toBeDefined();
            expect(validationResult.warnings).toBeDefined();
            expect(Array.isArray(validationResult.errors)).toBe(true);
            expect(Array.isArray(validationResult.warnings)).toBe(true);
        });
    });

    describe('步骤3: 转换数据', () => {
        beforeEach(() => {
            parseResult = dataParser.parseExcel(excelBuffer);
        });

        test('应该成功转换数据', () => {
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(transformResult).toBeDefined();
            expect(transformResult.data).toBeDefined();
            expect(transformResult.stats).toBeDefined();
            expect(Array.isArray(transformResult.data)).toBe(true);
        });

        test('应该删除合计行', () => {
            const initialRowCount = parseResult.data.length;
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(transformResult.stats.totalRowsRemoved).toBeGreaterThanOrEqual(0);
            
            // 验证转换后的数据中不包含"合计"行
            const hasTotalRow = transformResult.data.some(row => {
                const workshopValue = row[parseResult.columnMapping.workshop];
                return workshopValue === '合计';
            });
            expect(hasTotalRow).toBe(false);
        });

        test('应该分割车间列', () => {
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(transformResult.stats.workshopColumnSplit).toBe(true);
            
            // 检查是否创建了区域列
            const firstRow = transformResult.data[0];
            expect(firstRow).toBeDefined();
            
            // 区域列应该存在（即使原始数据中没有，转换过程会创建）
            const areaColumn = parseResult.columnMapping.area || '区域';
            if (firstRow[parseResult.columnMapping.workshop] && 
                typeof firstRow[parseResult.columnMapping.workshop] === 'string' &&
                firstRow[parseResult.columnMapping.workshop].includes('-')) {
                // 如果原始车间值包含"-"，则应该被分割
                expect(firstRow[areaColumn]).toBeDefined();
            }
        });

        test('应该对维修人进行分类', () => {
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(transformResult.stats.repairPersonClassified).toBe(true);
            
            // 验证维修人分类列已创建
            const firstRow = transformResult.data[0];
            const repairPersonTypeColumn = parseResult.columnMapping.repairPersonType || '维修人分类';
            expect(firstRow[repairPersonTypeColumn]).toBeDefined();
        });

        test('应该计算时间差', () => {
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            // 验证时间计算列已创建
            const firstRow = transformResult.data[0];
            const waitTimeColumn = parseResult.columnMapping.waitTime || '等待时间h';
            const repairTimeColumn = parseResult.columnMapping.repairTime || '维修时间h';
            const faultTimeColumn = parseResult.columnMapping.faultTime || '故障时间h';
            
            expect(firstRow[waitTimeColumn]).toBeDefined();
            expect(firstRow[repairTimeColumn]).toBeDefined();
            expect(firstRow[faultTimeColumn]).toBeDefined();
        });

        test('应该删除时间不完整的行', () => {
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            expect(transformResult.stats.incompleteTimeRowsRemoved).toBeGreaterThanOrEqual(0);
            
            // 验证转换后的数据中所有行都有完整的时间
            transformResult.data.forEach(row => {
                const reportTime = row[parseResult.columnMapping.reportTime];
                const startTime = row[parseResult.columnMapping.startTime];
                const endTime = row[parseResult.columnMapping.endTime];
                
                // 如果这些字段存在，它们应该都有值
                if (reportTime !== undefined && startTime !== undefined && endTime !== undefined) {
                    expect(reportTime).toBeTruthy();
                    expect(startTime).toBeTruthy();
                    expect(endTime).toBeTruthy();
                }
            });
        });
    });

    describe('完整流程: 上传 -> 解析 -> 验证 -> 转换', () => {
        test('应该成功完成完整的数据处理流程', () => {
            // 步骤1: 解析
            const parseResult = dataParser.parseExcel(excelBuffer);
            expect(parseResult.success).toBe(true);
            expect(parseResult.data.length).toBeGreaterThan(0);
            
            // 验证 getHeaders 方法工作正常
            const headers = dataParser.getHeaders();
            expect(headers).toBeDefined();
            expect(headers.length).toBeGreaterThan(0);
            
            // 步骤2: 验证
            const validationResult = dataValidator.validate(
                parseResult.data,
                parseResult.columnMapping
            );
            expect(validationResult.valid).toBe(true);
            
            // 步骤3: 转换
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            expect(transformResult.data).toBeDefined();
            expect(transformResult.data.length).toBeGreaterThan(0);
            
            // 验证最终数据质量
            expect(transformResult.data.length).toBeLessThanOrEqual(parseResult.data.length);
            
            // 验证统计信息
            expect(transformResult.stats.totalRowsRemoved).toBeGreaterThanOrEqual(0);
            expect(transformResult.stats.incompleteTimeRowsRemoved).toBeGreaterThanOrEqual(0);
            expect(transformResult.stats.workshopColumnSplit).toBe(true);
            expect(transformResult.stats.repairPersonClassified).toBe(true);
            
            console.log('数据处理完成:');
            console.log(`  原始数据行数: ${parseResult.data.length}`);
            console.log(`  处理后行数: ${transformResult.data.length}`);
            console.log(`  删除合计行: ${transformResult.stats.totalRowsRemoved}`);
            console.log(`  删除不完整行: ${transformResult.stats.incompleteTimeRowsRemoved}`);
            console.log(`  车间列分列: ${transformResult.stats.workshopColumnSplit ? '✓' : '✗'}`);
            console.log(`  维修人分类: ${transformResult.stats.repairPersonClassified ? '✓' : '✗'}`);
        });

        test('处理后的数据应该可以用于显示预览', () => {
            // 模拟 displayProcessedDataPreview 方法中使用的逻辑
            const parseResult = dataParser.parseExcel(excelBuffer);
            const transformResult = dataTransformer.transform(
                parseResult.data,
                parseResult.columnMapping
            );
            
            // 获取列头 - 这是 main.js:516 调用的方法
            const headers = dataParser.getHeaders();
            expect(headers).toBeDefined();
            expect(Array.isArray(headers)).toBe(true);
            
            // 获取预览数据（前50行）
            const previewData = transformResult.data.slice(0, 50);
            expect(previewData).toBeDefined();
            expect(Array.isArray(previewData)).toBe(true);
            
            // 验证预览数据结构
            if (previewData.length > 0) {
                const firstRow = previewData[0];
                headers.forEach(header => {
                    // 每个表头对应的列都应该在数据行中存在（可能为空）
                    expect(header in firstRow || firstRow[header] !== undefined).toBeTruthy();
                });
            }
        });
    });

    describe('错误处理', () => {
        test('应该处理空文件', () => {
            const emptyWorkbook = XLSX.utils.book_new();
            const emptySheet = XLSX.utils.aoa_to_sheet([]);
            XLSX.utils.book_append_sheet(emptyWorkbook, emptySheet, 'Sheet1');
            const emptyBuffer = XLSX.write(emptyWorkbook, { type: 'buffer', bookType: 'xlsx' });
            
            const parseResult = dataParser.parseExcel(emptyBuffer);
            expect(parseResult.success).toBe(false);
            expect(parseResult.error).toBeDefined();
        });

        test('应该处理缺少必需列的文件', () => {
            const invalidWorkbook = XLSX.utils.book_new();
            const invalidSheet = XLSX.utils.aoa_to_sheet([
                ['列1', '列2', '列3'],
                ['值1', '值2', '值3']
            ]);
            XLSX.utils.book_append_sheet(invalidWorkbook, invalidSheet, 'Sheet1');
            const invalidBuffer = XLSX.write(invalidWorkbook, { type: 'buffer', bookType: 'xlsx' });
            
            const parseResult = dataParser.parseExcel(invalidBuffer);
            expect(parseResult.success).toBe(false);
            expect(parseResult.error).toBeDefined();
        });

        test('应该处理无效的Excel数据', () => {
            const invalidBuffer = Buffer.from('invalid excel data');
            
            const parseResult = dataParser.parseExcel(invalidBuffer);
            expect(parseResult.success).toBe(false);
            expect(parseResult.error).toBeDefined();
        });
    });
});
