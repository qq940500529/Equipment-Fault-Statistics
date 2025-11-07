/**
 * 加载动画测试
 * Loading Animations Tests
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { showLoadingOverlay, hideLoadingOverlay, updateProgress, delay } from '../../js/utils/helpers.js';

describe('Loading Animations', () => {
    beforeEach(() => {
        // 清空 DOM
        document.body.innerHTML = '';
        
        // 创建必要的DOM元素
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = '正在加载...';
        loadingOverlay.appendChild(loadingText);
        
        document.body.appendChild(loadingOverlay);
        
        // 创建进度条元素
        const progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        progressBar.className = 'progress-bar';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', '0');
        document.body.appendChild(progressBar);
        
        // 创建状态文本元素
        const statusText = document.createElement('p');
        statusText.id = 'processingStatusText';
        document.body.appendChild(statusText);
        
        const subStatusText = document.createElement('small');
        subStatusText.id = 'processingSubStatus';
        document.body.appendChild(subStatusText);
    });

    describe('showLoadingOverlay', () => {
        test('应该显示加载覆盖层', () => {
            const overlay = document.getElementById('loadingOverlay');
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            
            showLoadingOverlay('测试加载中...');
            
            expect(overlay.classList.contains('hidden')).toBe(false);
            expect(overlay.style.display).toBe('flex');
        });

        test('应该更新加载消息', () => {
            const message = '正在处理数据...';
            showLoadingOverlay(message);
            
            const loadingText = document.querySelector('.loading-text');
            expect(loadingText.textContent).toBe(message);
        });

        test('应该使用默认消息', () => {
            showLoadingOverlay();
            
            const loadingText = document.querySelector('.loading-text');
            expect(loadingText.textContent).toBe('正在加载...');
        });
    });

    describe('hideLoadingOverlay', () => {
        test('应该隐藏加载覆盖层', () => {
            const overlay = document.getElementById('loadingOverlay');
            overlay.style.display = 'flex';
            
            hideLoadingOverlay();
            
            expect(overlay.classList.contains('hidden')).toBe(true);
        });

        test('应该在延迟后设置display为none', (done) => {
            const overlay = document.getElementById('loadingOverlay');
            overlay.style.display = 'flex';
            
            hideLoadingOverlay();
            
            setTimeout(() => {
                expect(overlay.style.display).toBe('none');
                done();
            }, 350); // Slightly more than 300ms transition
        });
    });

    describe('updateProgress', () => {
        test('应该更新进度条宽度和值', () => {
            const progressBar = document.getElementById('progressBar');
            
            updateProgress(50, '处理中...');
            
            expect(progressBar.style.width).toBe('50%');
            expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
        });

        test('应该更新进度文本', () => {
            const progressBar = document.getElementById('progressBar');
            
            updateProgress(75, '即将完成...');
            
            expect(progressBar.textContent).toBe('即将完成...');
        });

        test('应该使用百分比作为默认文本', () => {
            const progressBar = document.getElementById('progressBar');
            
            updateProgress(30);
            
            expect(progressBar.textContent).toBe('30%');
        });

        test('应该更新状态文本', () => {
            const statusText = document.getElementById('processingStatusText');
            
            updateProgress(60, '验证数据中...');
            
            expect(statusText.textContent).toBe('验证数据中...');
        });

        test('应该更新子状态文本', () => {
            const subStatusText = document.getElementById('processingSubStatus');
            
            updateProgress(80, '处理中...', '共1000行数据');
            
            expect(subStatusText.textContent).toBe('共1000行数据');
        });

        test('应该清空子状态文本当未提供时', () => {
            const subStatusText = document.getElementById('processingSubStatus');
            subStatusText.textContent = '旧的子状态';
            
            updateProgress(90, '几乎完成...');
            
            expect(subStatusText.textContent).toBe('');
        });

        test('应该清空状态文本当传入空字符串时', () => {
            const statusText = document.getElementById('processingStatusText');
            statusText.textContent = '旧的状态';
            
            updateProgress(50, '');
            
            expect(statusText.textContent).toBe('');
        });

        test('应该处理0%进度', () => {
            const progressBar = document.getElementById('progressBar');
            
            updateProgress(0, '开始处理...');
            
            expect(progressBar.style.width).toBe('0%');
            expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
        });

        test('应该处理100%进度', () => {
            const progressBar = document.getElementById('progressBar');
            
            updateProgress(100, '完成！');
            
            expect(progressBar.style.width).toBe('100%');
            expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
        });
    });

    describe('进度条边界情况', () => {
        test('当进度条元素不存在时不应抛出错误', () => {
            document.getElementById('progressBar').remove();
            
            expect(() => {
                updateProgress(50, '测试');
            }).not.toThrow();
        });

        test('当状态文本元素不存在时不应抛出错误', () => {
            document.getElementById('processingStatusText').remove();
            
            expect(() => {
                updateProgress(50, '测试');
            }).not.toThrow();
        });

        test('当加载覆盖层不存在时不应抛出错误', () => {
            document.getElementById('loadingOverlay').remove();
            
            expect(() => {
                showLoadingOverlay('测试');
                hideLoadingOverlay();
            }).not.toThrow();
        });
    });

    describe('delay', () => {
        test('应该在指定时间后解析', async () => {
            const startTime = Date.now();
            await delay(100);
            const elapsed = Date.now() - startTime;
            
            // 允许一些误差
            expect(elapsed).toBeGreaterThanOrEqual(90);
            expect(elapsed).toBeLessThan(150);
        });

        test('应该返回Promise', () => {
            const result = delay(10);
            expect(result).toBeInstanceOf(Promise);
        });
    });
});
