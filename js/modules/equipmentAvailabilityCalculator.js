/**
 * 设备妥善率计算模块
 * Equipment Availability Rate Calculator Module
 * 
 * 根据设备台账和故障信息计算各车间和总体的设备妥善率
 * Calculates equipment availability rate for each workshop and overall
 * 
 * 公式 Formula: (1 - (设备故障时间总和 / (总设备数量 * 1个月的时间))) * 100%
 * (1 - (total fault time / (total equipment count * 1 month time))) * 100%
 */

/**
 * 设备妥善率计算器类
 */
export class EquipmentAvailabilityCalculator {
    constructor() {
        // 1个月的时间 = 30天 * 24小时 = 720小时
        this.MONTH_HOURS = 30 * 24; // 720 hours
        this.equipmentData = null;
        this.faultData = null;
        this.equipmentByWorkshop = {};
        this.faultTimeByWorkshop = {};
    }

    /**
     * 从设备台账数据中提取车间设备数量
     * @param {Array} equipmentData - 设备台账数据数组 (from 设备台账.xlsx)
     * @param {String} areaColumnName - 区域列名，默认为"区域"
     * @returns {Object} 车间设备数量映射 {workshop: count}
     */
    extractEquipmentCount(equipmentData, areaColumnName = '区域') {
        this.equipmentData = equipmentData;
        this.equipmentByWorkshop = {};

        if (!equipmentData || !Array.isArray(equipmentData) || equipmentData.length === 0) {
            throw new Error('设备台账数据为空或格式不正确');
        }

        // 遍历设备台账数据
        for (const row of equipmentData) {
            const areaFull = row[areaColumnName];
            
            if (!areaFull || typeof areaFull !== 'string') {
                continue;
            }

            // 从区域字段提取车间信息
            // 格式: TPM天津工厂-TPM七车间-组装区域
            // 提取: TPM七车间
            const workshop = this.extractWorkshopFromArea(areaFull);
            
            if (workshop) {
                this.equipmentByWorkshop[workshop] = (this.equipmentByWorkshop[workshop] || 0) + 1;
            }
        }

        return this.equipmentByWorkshop;
    }

    /**
     * 从故障信息数据中聚合车间故障时间
     * @param {Array} faultData - 故障信息数据数组 (from 12月设备故障信息.xlsx)
     * @param {String} workshopColumnName - 车间列名，默认为"车间"
     * @param {String} repairTimeColumnName - 修理耗时列名，默认为"修理耗时(秒)"
     * @param {String} waitTimeColumnName - 等待耗时列名，默认为"等待耗时(秒)"
     * @returns {Object} 车间故障时间映射（小时） {workshop: hours}
     */
    aggregateFaultTime(faultData, workshopColumnName = '车间', repairTimeColumnName = '修理耗时(秒)', waitTimeColumnName = '等待耗时(秒)') {
        this.faultData = faultData;
        this.faultTimeByWorkshop = {};

        if (!faultData || !Array.isArray(faultData) || faultData.length === 0) {
            throw new Error('故障信息数据为空或格式不正确');
        }

        // 遍历故障信息数据
        for (const row of faultData) {
            const workshopFull = row[workshopColumnName];
            
            if (!workshopFull || typeof workshopFull !== 'string') {
                continue;
            }

            // 从车间字段提取车间信息
            // 格式可能是: TPM七车间-组装区域-伺服插接设备 或 TPM天津工厂-设备科公共任务区域-零星类安装
            const workshop = this.extractWorkshopFromFaultData(workshopFull);
            
            if (!workshop) {
                continue;
            }

            // 计算故障时间（秒转换为小时）
            let repairTimeSec = 0;
            let waitTimeSec = 0;

            try {
                repairTimeSec = parseFloat(row[repairTimeColumnName]) || 0;
                waitTimeSec = parseFloat(row[waitTimeColumnName]) || 0;
            } catch (error) {
                // 忽略转换错误的行
                continue;
            }

            const faultTimeHours = (repairTimeSec + waitTimeSec) / 3600;
            this.faultTimeByWorkshop[workshop] = (this.faultTimeByWorkshop[workshop] || 0) + faultTimeHours;
        }

        return this.faultTimeByWorkshop;
    }

    /**
     * 从区域字段提取车间名称（设备台账用）
     * 格式: TPM天津工厂-TPM七车间-组装区域 => TPM七车间
     * @param {String} areaFull - 完整的区域字符串
     * @returns {String|null} 车间名称
     */
    extractWorkshopFromArea(areaFull) {
        const parts = areaFull.split('-');
        
        // 查找包含"TPM"和"车间"的部分
        for (const part of parts) {
            if (part.includes('TPM') && part.includes('车间')) {
                return part.trim();
            }
        }

        // 如果没有找到标准车间名，检查其他模式
        if (parts.length >= 2) {
            // 如果第一部分是"TPM天津工厂"，返回第二部分
            if (parts[0].trim() === 'TPM天津工厂') {
                return parts[1].trim();
            }
        }

        // 返回第二部分（如果存在）
        return parts.length >= 2 ? parts[1].trim() : parts[0].trim();
    }

    /**
     * 从车间字段提取车间名称（故障信息用）
     * 格式: TPM七车间-组装区域-伺服插接设备 => TPM七车间
     * 格式: TPM天津工厂-设备科公共任务区域-零星类安装 => 设备科公共任务区域
     * @param {String} workshopFull - 完整的车间字符串
     * @returns {String|null} 车间名称
     */
    extractWorkshopFromFaultData(workshopFull) {
        const parts = workshopFull.split('-');
        
        // 查找包含"TPM"和"车间"的部分
        for (const part of parts) {
            if (part.includes('TPM') && part.includes('车间')) {
                return part.trim();
            }
        }

        // 如果没有找到标准车间名，检查其他模式
        if (parts.length >= 1) {
            // 如果第一部分是"TPM天津工厂"，返回第二部分
            if (parts[0].trim() === 'TPM天津工厂' && parts.length > 1) {
                return parts[1].trim();
            }
            // 否则返回第一部分
            return parts[0].trim();
        }

        return null;
    }

    /**
     * 计算车间设备妥善率
     * @param {String} workshop - 车间名称
     * @returns {Number} 妥善率百分比
     */
    calculateWorkshopAvailability(workshop) {
        const equipmentCount = this.equipmentByWorkshop[workshop] || 0;
        const faultTime = this.faultTimeByWorkshop[workshop] || 0;

        if (equipmentCount === 0) {
            return 0; // 没有设备则返回0
        }

        // 公式: (1 - (故障时间总和 / (设备数量 * 月时间))) * 100%
        const availability = (1 - (faultTime / (equipmentCount * this.MONTH_HOURS))) * 100;
        
        // 确保结果在合理范围内 [0, 100]
        return Math.max(0, Math.min(100, availability));
    }

    /**
     * 计算所有车间的设备妥善率
     * @returns {Array} 车间妥善率数组
     */
    calculateAllWorkshopsAvailability() {
        const results = [];

        // 获取所有车间（设备台账和故障信息的并集）
        const allWorkshops = new Set([
            ...Object.keys(this.equipmentByWorkshop),
            ...Object.keys(this.faultTimeByWorkshop)
        ]);

        for (const workshop of allWorkshops) {
            const equipmentCount = this.equipmentByWorkshop[workshop] || 0;
            const faultTime = this.faultTimeByWorkshop[workshop] || 0;
            const availability = this.calculateWorkshopAvailability(workshop);

            results.push({
                workshop: workshop,
                equipmentCount: equipmentCount,
                faultTimeHours: parseFloat(faultTime.toFixed(2)),
                availabilityRate: parseFloat(availability.toFixed(2))
            });
        }

        // 按妥善率排序（从低到高）
        results.sort((a, b) => a.availabilityRate - b.availabilityRate);

        return results;
    }

    /**
     * 计算总体设备妥善率
     * @returns {Object} 总体统计信息
     */
    calculateOverallAvailability() {
        const totalEquipment = Object.values(this.equipmentByWorkshop).reduce((sum, count) => sum + count, 0);
        const totalFaultTime = Object.values(this.faultTimeByWorkshop).reduce((sum, time) => sum + time, 0);

        if (totalEquipment === 0) {
            return {
                totalEquipment: 0,
                totalFaultTimeHours: 0,
                availabilityRate: 0
            };
        }

        // 公式: (1 - (故障时间总和 / (设备数量 * 月时间))) * 100%
        const availability = (1 - (totalFaultTime / (totalEquipment * this.MONTH_HOURS))) * 100;

        return {
            totalEquipment: totalEquipment,
            totalFaultTimeHours: parseFloat(totalFaultTime.toFixed(2)),
            availabilityRate: parseFloat(Math.max(0, Math.min(100, availability)).toFixed(2))
        };
    }

    /**
     * 生成完整的妥善率报告
     * @param {Array} equipmentData - 设备台账数据
     * @param {Array} faultData - 故障信息数据
     * @param {Object} options - 选项配置
     * @returns {Object} 完整报告
     */
    generateReport(equipmentData, faultData, options = {}) {
        const {
            areaColumnName = '区域',
            workshopColumnName = '车间',
            repairTimeColumnName = '修理耗时(秒)',
            waitTimeColumnName = '等待耗时(秒)'
        } = options;

        // 提取设备数量
        this.extractEquipmentCount(equipmentData, areaColumnName);

        // 聚合故障时间
        this.aggregateFaultTime(faultData, workshopColumnName, repairTimeColumnName, waitTimeColumnName);

        // 计算所有车间的妥善率
        const workshopResults = this.calculateAllWorkshopsAvailability();

        // 计算总体妥善率
        const overall = this.calculateOverallAvailability();

        return {
            overall: overall,
            workshops: workshopResults,
            metadata: {
                monthHours: this.MONTH_HOURS,
                workshopCount: workshopResults.length,
                calculationDate: new Date().toISOString()
            }
        };
    }

    /**
     * 重置计算器状态
     */
    reset() {
        this.equipmentData = null;
        this.faultData = null;
        this.equipmentByWorkshop = {};
        this.faultTimeByWorkshop = {};
    }
}

export default EquipmentAvailabilityCalculator;
