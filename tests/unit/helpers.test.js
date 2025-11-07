/**
 * 辅助函数模块测试
 * Helper Functions Module Tests
 */

import { extractAllColumns } from '../../js/utils/helpers.js';

describe('Helper Functions - extractAllColumns', () => {
    test('应该从数据中提取所有列名', () => {
        const data = [
            { '工单号': 'WO001', '车间': '一车间', '设备': '设备A' },
            { '工单号': 'WO002', '车间': '二车间', '设备': '设备B', '备注': '测试' }
        ];
        
        const columns = extractAllColumns(data);
        
        expect(columns).toContain('工单号');
        expect(columns).toContain('车间');
        expect(columns).toContain('设备');
        expect(columns).toContain('备注');
        expect(columns.length).toBe(4);
    });
    
    test('应该按照优先顺序排列列名', () => {
        const data = [
            { '备注': '测试', '工单号': 'WO001', '车间': '一车间', '设备': '设备A' }
        ];
        
        const preferredOrder = ['工单号', '车间', '设备', '备注'];
        const columns = extractAllColumns(data, preferredOrder);
        
        expect(columns).toEqual(['工单号', '车间', '设备', '备注']);
    });
    
    test('应该在优先列后添加其他列', () => {
        const data = [
            { '工单号': 'WO001', '车间': '一车间', '设备': '设备A', '新列': '新值' }
        ];
        
        const preferredOrder = ['工单号', '车间'];
        const columns = extractAllColumns(data, preferredOrder);
        
        // 优先列应该在前面
        expect(columns.indexOf('工单号')).toBe(0);
        expect(columns.indexOf('车间')).toBe(1);
        // 其他列应该在后面
        expect(columns).toContain('设备');
        expect(columns).toContain('新列');
    });
    
    test('应该跳过不存在于数据中的优先列', () => {
        const data = [
            { '工单号': 'WO001', '车间': '一车间' }
        ];
        
        const preferredOrder = ['工单号', '不存在的列', '车间'];
        const columns = extractAllColumns(data, preferredOrder);
        
        expect(columns).toEqual(['工单号', '车间']);
        expect(columns).not.toContain('不存在的列');
    });
    
    test('应该处理空数据', () => {
        const columns = extractAllColumns([]);
        expect(columns).toEqual([]);
    });
    
    test('应该处理空数据但有优先顺序', () => {
        const preferredOrder = ['工单号', '车间'];
        const columns = extractAllColumns([], preferredOrder);
        expect(columns).toEqual(preferredOrder);
    });
    
    test('应该处理null和undefined数据', () => {
        const columns1 = extractAllColumns(null);
        expect(columns1).toEqual([]);
        
        const columns2 = extractAllColumns(undefined);
        expect(columns2).toEqual([]);
    });
    
    test('应该保持列的唯一性', () => {
        const data = [
            { '工单号': 'WO001', '车间': '一车间' },
            { '工单号': 'WO002', '车间': '二车间' },
            { '工单号': 'WO003', '车间': '三车间' }
        ];
        
        const columns = extractAllColumns(data);
        
        // 应该只有两列，不重复
        expect(columns.length).toBe(2);
        expect(columns).toEqual(['工单号', '车间']);
    });
    
    test('应该处理包含新增列的处理后数据', () => {
        const data = [
            { 
                '车间': '一车间-A区', 
                '工单号': 'WO001', 
                '维修人': '王兴森',
                '报修时间': '2024-01-01 08:00:00',
                '维修开始时间': '2024-01-01 10:00:00',
                '维修结束时间': '2024-01-01 12:00:00',
                '区域': 'A区',  // 新增列
                '维修人分类': '维修工',  // 新增列
                '等待时间h': 2.0,  // 新增列
                '维修时间h': 2.0,  // 新增列
                '故障时间h': 4.0   // 新增列
            }
        ];
        
        const originalOrder = ['车间', '工单号', '维修人', '报修时间', '维修开始时间', '维修结束时间'];
        const columns = extractAllColumns(data, originalOrder);
        
        // 应该包含所有原始列和新增列
        expect(columns).toContain('车间');
        expect(columns).toContain('工单号');
        expect(columns).toContain('维修人');
        expect(columns).toContain('区域');
        expect(columns).toContain('维修人分类');
        expect(columns).toContain('等待时间h');
        expect(columns).toContain('维修时间h');
        expect(columns).toContain('故障时间h');
        
        // 原始列应该在前面
        const workshopIndex = columns.indexOf('车间');
        const areaIndex = columns.indexOf('区域');
        expect(workshopIndex).toBeLessThan(areaIndex);
    });
});
