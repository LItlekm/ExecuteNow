// 自定义模板管理器

class CustomTemplateManager {
    constructor() {
        this.storageKey = 'plancoach_custom_templates';
        this.templates = [];
        this.loadFromStorage();
    }

    // ==================== CRUD 操作 ====================

    // 创建新模板
    create(templateData) {
        const template = {
            id: this.generateId(),
            name: templateData.name,
            icon: templateData.icon,
            category: templateData.category,
            steps: [...templateData.steps],
            isCustom: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            color: templateData.color || '#6366f1',
            tags: templateData.tags || [],
            description: templateData.description || ''
        };

        this.templates.push(template);
        this.saveToStorage();
        return template;
    }

    // 更新模板
    update(id, templateData) {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) return null;

        this.templates[index] = {
            ...this.templates[index],
            name: templateData.name,
            icon: templateData.icon,
            category: templateData.category,
            steps: [...templateData.steps],
            color: templateData.color || '#6366f1',
            tags: templateData.tags || [],
            description: templateData.description || '',
            updatedAt: Date.now()
        };

        this.saveToStorage();
        return this.templates[index];
    }

    // 删除模板
    delete(id) {
        const index = this.templates.findIndex(t => t.id === id);
        if (index === -1) return false;

        this.templates.splice(index, 1);
        this.saveToStorage();
        return true;
    }

    // 获取单个模板
    getById(id) {
        return this.templates.find(t => t.id === id);
    }

    // 获取所有模板
    getAll() {
        return this.templates;
    }

    // ==================== 导入导出 ====================

    // 导出单个模板为 JSON 文件
    exportTemplate(id) {
        const template = this.getById(id);
        if (!template) {
            alert('模板不存在');
            return;
        }

        const dataStr = JSON.stringify(template, null, 2);
        this.downloadJSON(dataStr, `template_${template.name}_${Date.now()}.json`);
    }

    // 导出所有模板
    exportAll() {
        if (this.templates.length === 0) {
            alert('没有可导出的模板');
            return;
        }

        const data = {
            templates: this.templates,
            version: 1,
            exportedAt: Date.now()
        };

        const dataStr = JSON.stringify(data, null, 2);
        this.downloadJSON(dataStr, `custom_templates_${Date.now()}.json`);
    }

    // 从 JSON 数据导入模板
    importTemplates(jsonData) {
        try {
            let templates = [];

            // 支持两种格式：单个模板对象 或 包含 templates 数组的对象
            if (Array.isArray(jsonData)) {
                templates = jsonData;
            } else if (jsonData.templates && Array.isArray(jsonData.templates)) {
                templates = jsonData.templates;
            } else if (jsonData.id && jsonData.name) {
                // 单个模板对象
                templates = [jsonData];
            } else {
                throw new Error('不支持的文件格式');
            }

            const imported = [];

            templates.forEach(template => {
                // 验证模板数据
                const validation = this.validateTemplate(template);
                if (!validation.valid) {
                    console.warn(`跳过无效模板: ${template.name}`, validation.errors);
                    return;
                }

                // 检查是否存在同名模板
                const nameExists = this.templates.some(t => t.name === template.name);
                if (nameExists) {
                    template.name = `${template.name} (导入)`;
                }

                // 重新生成 ID 和时间戳
                const newTemplate = {
                    ...template,
                    id: this.generateId(),
                    isCustom: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                this.templates.push(newTemplate);
                imported.push(newTemplate);
            });

            this.saveToStorage();

            return {
                imported: imported.length,
                skipped: templates.length - imported.length
            };
        } catch (error) {
            console.error('导入失败:', error);
            throw error;
        }
    }

    // ==================== 辅助方法 ====================

    // 生成唯一 ID
    generateId() {
        return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 验证模板数据
    validateTemplate(data) {
        const errors = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('模板名称不能为空');
        }

        if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
            errors.push('至少需要添加一个步骤');
        }

        if (!data.category) {
            errors.push('请选择分类');
        }

        if (!data.icon) {
            errors.push('请选择图标');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // 下载 JSON 文件
    downloadJSON(dataStr, filename) {
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==================== 存储操作 ====================

    // 保存到 localStorage
    saveToStorage() {
        try {
            const data = {
                templates: this.templates,
                version: 1
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('保存自定义模板失败:', e);
            if (e.name === 'QuotaExceededError') {
                alert('存储空间不足，请导出并删除一些模板');
            }
        }
    }

    // 从 localStorage 加载
    loadFromStorage() {
        try {
            const dataStr = localStorage.getItem(this.storageKey);
            if (dataStr) {
                const data = JSON.parse(dataStr);
                this.templates = data.templates || [];
            }
        } catch (e) {
            console.error('加载自定义模板失败:', e);
            this.templates = [];
        }
    }

    // 清除所有数据
    clearAll() {
        this.templates = [];
        localStorage.removeItem(this.storageKey);
    }
}
