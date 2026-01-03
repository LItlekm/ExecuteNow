// 任务拆解助手 - 主应用逻辑

// ==================== 工具函数 ====================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 任务管理器 ====================

class TaskManager {
    constructor() {
        this.tasks = [];
        this.storageKey = 'plancoach_tasks';
        this.loadFromStorage();
    }

    // 创建任务
    createTask(name, steps, coachId) {
        const task = {
            id: generateId(),
            name: name.trim(),
            steps: steps.map(s => ({
                content: s,
                completed: false,
                skipped: false
            })),
            currentStep: 0,
            status: 'in_progress', // in_progress, completed, shelved
            shelveReason: '',
            coachId: coachId,
            createdAt: Date.now(),
            completedAt: null
        };
        this.tasks.unshift(task);
        this.saveToStorage();
        return task;
    }

    // 删除任务
    deleteTask(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }

    // 获取任务
    getTask(taskId) {
        return this.tasks.find(t => t.id === taskId);
    }

    // 获取所有任务
    getAllTasks() {
        return this.tasks;
    }

    // 完成当前步骤
    completeStep(taskId) {
        const task = this.getTask(taskId);
        if (!task) return null;

        if (task.currentStep < task.steps.length) {
            task.steps[task.currentStep].completed = true;
            task.currentStep++;

            // 检查是否完成所有步骤
            if (task.currentStep >= task.steps.length) {
                task.status = 'completed';
                task.completedAt = Date.now();
            }

            this.saveToStorage();
        }
        return task;
    }

    // 跳过当前步骤
    skipStep(taskId) {
        const task = this.getTask(taskId);
        if (!task) return null;

        if (task.currentStep < task.steps.length) {
            task.steps[task.currentStep].skipped = true;
            task.currentStep++;

            // 检查是否完成所有步骤
            if (task.currentStep >= task.steps.length) {
                task.status = 'completed';
                task.completedAt = Date.now();
            }

            this.saveToStorage();
        }
        return task;
    }

    // 搁置任务
    shelveTask(taskId, reason) {
        const task = this.getTask(taskId);
        if (!task) return null;

        task.status = 'shelved';
        task.shelveReason = reason || '';
        this.saveToStorage();
        return task;
    }

    // 恢复任务
    resumeTask(taskId) {
        const task = this.getTask(taskId);
        if (!task) return null;

        task.status = 'in_progress';
        this.saveToStorage();
        return task;
    }

    // 获取任务进度
    getProgress(task) {
        if (!task || !task.steps.length) return 0;
        return Math.round((task.currentStep / task.steps.length) * 100);
    }

    // 保存到 LocalStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (e) {
            console.error('保存数据失败:', e);
        }
    }

    // 从 LocalStorage 加载
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.tasks = JSON.parse(data);
            }
        } catch (e) {
            console.error('加载数据失败:', e);
            this.tasks = [];
        }
    }

    // 清除所有数据
    clearAll() {
        this.tasks = [];
        localStorage.removeItem(this.storageKey);
    }
}

// ==================== 设置管理器 ====================

class SettingsManager {
    constructor() {
        this.storageKey = 'plancoach_settings';
        this.defaults = {
            theme: 'light',
            defaultCoach: 'gentle',
            vibrationEnabled: true
        };
        this.settings = this.load();
    }

    get(key) {
        return this.settings[key] ?? this.defaults[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (e) {
            console.error('保存设置失败:', e);
        }
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { ...this.defaults };
        } catch (e) {
            return { ...this.defaults };
        }
    }

    clearAll() {
        this.settings = { ...this.defaults };
        localStorage.removeItem(this.storageKey);
    }
}

// ==================== 主应用 ====================

class App {
    constructor() {
        this.taskManager = new TaskManager();
        this.settingsManager = new SettingsManager();

        // 当前状态
        this.currentTask = null;
        this.selectedCoachId = null;
        this.tempSteps = [];
        this.selectedTemplate = null;
        this.pendingDeleteTaskId = null;
        this.selectedCategory = '全部';

        this.initElements();
        this.initEventListeners();
        this.applyTheme();
        this.render();
    }

    // ==================== 初始化 ====================

    initElements() {
        // 主界面
        this.mainView = document.getElementById('mainView');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');

        // 头部按钮
        this.settingsBtn = document.getElementById('settingsBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.createTaskBtn = document.getElementById('createTaskBtn');
        this.useTemplateBtn = document.getElementById('useTemplateBtn');

        // 专注模式
        this.focusMode = document.getElementById('focusMode');
        this.focusTaskName = document.getElementById('focusTaskName');
        this.currentStepNum = document.getElementById('currentStepNum');
        this.totalStepNum = document.getElementById('totalStepNum');
        this.progressFill = document.getElementById('progressFill');
        this.stepContent = document.getElementById('stepContent');
        this.coachAvatar = document.getElementById('coachAvatar');
        this.coachMessage = document.getElementById('coachMessage');
        this.focusStepCard = document.getElementById('focusStepCard');
        this.completionOverlay = document.getElementById('completionOverlay');

        this.exitFocusBtn = document.getElementById('exitFocusBtn');
        this.completeStepBtn = document.getElementById('completeStepBtn');
        this.skipStepBtn = document.getElementById('skipStepBtn');
        this.shelveTaskBtn = document.getElementById('shelveTaskBtn');

        // 创建任务弹窗
        this.createTaskModal = document.getElementById('createTaskModal');
        this.taskNameInput = document.getElementById('taskNameInput');
        this.coachSelector = document.getElementById('coachSelector');
        this.stepInput = document.getElementById('stepInput');
        this.addStepBtn = document.getElementById('addStepBtn');
        this.stepsList = document.getElementById('stepsList');
        this.stepsEmpty = document.getElementById('stepsEmpty');
        this.closeCreateModal = document.getElementById('closeCreateModal');
        this.cancelCreateTask = document.getElementById('cancelCreateTask');
        this.confirmCreateTask = document.getElementById('confirmCreateTask');

        // 模板弹窗
        this.templateModal = document.getElementById('templateModal');
        this.templateCategories = document.getElementById('templateCategories');
        this.templateGrid = document.getElementById('templateGrid');
        this.closeTemplateModal = document.getElementById('closeTemplateModal');

        // 模板预览弹窗
        this.templatePreviewModal = document.getElementById('templatePreviewModal');
        this.previewTemplateName = document.getElementById('previewTemplateName');
        this.previewCoachSelector = document.getElementById('previewCoachSelector');
        this.previewSteps = document.getElementById('previewSteps');
        this.closePreviewModal = document.getElementById('closePreviewModal');
        this.cancelUseTemplate = document.getElementById('cancelUseTemplate');
        this.confirmUseTemplate = document.getElementById('confirmUseTemplate');

        // 搁置弹窗
        this.shelveModal = document.getElementById('shelveModal');
        this.shelveReasonInput = document.getElementById('shelveReasonInput');
        this.closeShelveModal = document.getElementById('closeShelveModal');
        this.cancelShelve = document.getElementById('cancelShelve');
        this.confirmShelve = document.getElementById('confirmShelve');

        // 设置弹窗
        this.settingsModal = document.getElementById('settingsModal');
        this.defaultCoachSelect = document.getElementById('defaultCoachSelect');
        this.vibrationToggle = document.getElementById('vibrationToggle');
        this.clearDataBtn = document.getElementById('clearDataBtn');
        this.closeSettingsModal = document.getElementById('closeSettingsModal');

        // 删除确认弹窗
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.closeDeleteModal = document.getElementById('closeDeleteModal');
        this.cancelDelete = document.getElementById('cancelDelete');
        this.confirmDelete = document.getElementById('confirmDelete');
    }

    initEventListeners() {
        // 头部按钮
        this.settingsBtn.addEventListener('click', () => this.showSettingsModal());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.createTaskBtn.addEventListener('click', () => this.showCreateTaskModal());
        this.useTemplateBtn.addEventListener('click', () => this.showTemplateModal());

        // 专注模式
        this.exitFocusBtn.addEventListener('click', () => this.exitFocusMode());
        this.completeStepBtn.addEventListener('click', () => this.completeCurrentStep());
        this.skipStepBtn.addEventListener('click', () => this.skipCurrentStep());
        this.shelveTaskBtn.addEventListener('click', () => this.showShelveModal());

        // 创建任务弹窗
        this.closeCreateModal.addEventListener('click', () => this.hideCreateTaskModal());
        this.cancelCreateTask.addEventListener('click', () => this.hideCreateTaskModal());
        this.confirmCreateTask.addEventListener('click', () => this.createTask());
        this.addStepBtn.addEventListener('click', () => this.addStep());
        this.stepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addStep();
        });
        this.taskNameInput.addEventListener('input', () => this.updateCreateButton());
        this.createTaskModal.addEventListener('click', (e) => {
            if (e.target === this.createTaskModal) this.hideCreateTaskModal();
        });

        // 模板弹窗
        this.closeTemplateModal.addEventListener('click', () => this.hideTemplateModal());
        this.templateModal.addEventListener('click', (e) => {
            if (e.target === this.templateModal) this.hideTemplateModal();
        });

        // 模板预览弹窗
        this.closePreviewModal.addEventListener('click', () => this.hideTemplatePreviewModal());
        this.cancelUseTemplate.addEventListener('click', () => this.hideTemplatePreviewModal());
        this.confirmUseTemplate.addEventListener('click', () => this.useTemplate());
        this.templatePreviewModal.addEventListener('click', (e) => {
            if (e.target === this.templatePreviewModal) this.hideTemplatePreviewModal();
        });

        // 搁置弹窗
        this.closeShelveModal.addEventListener('click', () => this.hideShelveModal());
        this.cancelShelve.addEventListener('click', () => this.hideShelveModal());
        this.confirmShelve.addEventListener('click', () => this.shelveCurrentTask());
        this.shelveModal.addEventListener('click', (e) => {
            if (e.target === this.shelveModal) this.hideShelveModal();
        });

        // 设置弹窗
        this.closeSettingsModal.addEventListener('click', () => this.hideSettingsModal());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.hideSettingsModal();
        });
        this.defaultCoachSelect.addEventListener('change', (e) => {
            this.settingsManager.set('defaultCoach', e.target.value);
        });
        this.vibrationToggle.addEventListener('change', (e) => {
            this.settingsManager.set('vibrationEnabled', e.target.checked);
        });
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());

        // 删除确认弹窗
        this.closeDeleteModal.addEventListener('click', () => this.hideDeleteConfirmModal());
        this.cancelDelete.addEventListener('click', () => this.hideDeleteConfirmModal());
        this.confirmDelete.addEventListener('click', () => this.deleteTask());
        this.deleteConfirmModal.addEventListener('click', (e) => {
            if (e.target === this.deleteConfirmModal) this.hideDeleteConfirmModal();
        });
    }

    // ==================== 主题 ====================

    applyTheme() {
        const theme = this.settingsManager.get('theme');
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon();
    }

    toggleTheme() {
        const currentTheme = this.settingsManager.get('theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.settingsManager.set('theme', newTheme);
        this.applyTheme();
    }

    updateThemeIcon() {
        const theme = this.settingsManager.get('theme');
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    // ==================== 渲染 ====================

    render() {
        this.renderTaskList();
    }

    renderTaskList() {
        const tasks = this.taskManager.getAllTasks();

        this.taskCount.textContent = `${tasks.length} 个任务`;

        if (tasks.length === 0) {
            this.taskList.innerHTML = '';
            this.taskList.appendChild(this.emptyState);
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        const statusIcons = {
            'in_progress': '📝',
            'completed': '✅',
            'shelved': '⏸️'
        };

        const statusTexts = {
            'in_progress': '进行中',
            'completed': '已完成',
            'shelved': '已搁置'
        };

        this.taskList.innerHTML = tasks.map(task => {
            const progress = this.taskManager.getProgress(task);
            const completedSteps = task.steps.filter(s => s.completed || s.skipped).length;

            return `
                <div class="task-card" data-task-id="${task.id}">
                    <span class="task-status-icon">${statusIcons[task.status]}</span>
                    <div class="task-info">
                        <div class="task-name">${escapeHtml(task.name)}</div>
                        <div class="task-progress">
                            ${task.status === 'completed' ? '已完成' :
                              task.status === 'shelved' ? '已搁置' :
                              `${completedSteps}/${task.steps.length} 步`}
                        </div>
                        ${task.status === 'in_progress' ? `
                            <div class="task-progress-bar">
                                <div class="task-progress-fill" style="width: ${progress}%"></div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="task-actions">
                        ${task.status === 'in_progress' ? `
                            <button class="task-action-btn primary" data-action="continue" title="继续">▶</button>
                        ` : ''}
                        ${task.status === 'shelved' ? `
                            <button class="task-action-btn" data-action="resume" title="恢复">↩</button>
                        ` : ''}
                        ${task.status === 'completed' ? `
                            <button class="task-action-btn" data-action="view" title="查看">👁</button>
                        ` : ''}
                        <button class="task-action-btn" data-action="delete" title="删除">🗑</button>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定任务卡片事件
        this.taskList.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.taskId;

            card.querySelectorAll('.task-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;

                    switch (action) {
                        case 'continue':
                            this.enterFocusMode(taskId);
                            break;
                        case 'resume':
                            this.taskManager.resumeTask(taskId);
                            this.render();
                            break;
                        case 'view':
                            this.enterFocusMode(taskId, true);
                            break;
                        case 'delete':
                            this.showDeleteConfirmModal(taskId);
                            break;
                    }
                });
            });
        });
    }

    // ==================== 专注模式 ====================

    enterFocusMode(taskId, viewOnly = false) {
        const task = this.taskManager.getTask(taskId);
        if (!task) return;

        this.currentTask = task;
        this.focusMode.classList.add('active');

        // 如果是查看模式，重置到第一步
        if (viewOnly && task.status === 'completed') {
            // 创建一个临时的查看状态
            this.viewOnlyMode = true;
            this.viewCurrentStep = 0;
        } else {
            this.viewOnlyMode = false;
        }

        this.updateFocusMode();
    }

    exitFocusMode() {
        this.focusMode.classList.remove('active');
        this.currentTask = null;
        this.viewOnlyMode = false;
        this.render();
    }

    updateFocusMode() {
        if (!this.currentTask) return;

        const task = this.currentTask;
        const currentStep = this.viewOnlyMode ? this.viewCurrentStep : task.currentStep;
        const totalSteps = task.steps.length;
        const coach = COACHES.find(c => c.id === task.coachId) || COACHES[0];

        // 更新头部
        this.focusTaskName.textContent = task.name;

        // 更新进度
        this.currentStepNum.textContent = Math.min(currentStep + 1, totalSteps);
        this.totalStepNum.textContent = totalSteps;
        this.progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;

        // 更新步骤内容
        if (currentStep < totalSteps) {
            this.stepContent.textContent = task.steps[currentStep].content;
        } else {
            this.stepContent.textContent = '全部完成！';
        }

        // 更新教练消息
        this.coachAvatar.textContent = coach.avatar;

        let messageType = 'progress';
        if (currentStep === 0) {
            messageType = 'start';
        } else if (currentStep >= totalSteps) {
            messageType = 'finish';
        }

        this.coachMessage.textContent = getRandomMessage(coach, messageType);

        // 更新按钮状态
        if (this.viewOnlyMode) {
            this.completeStepBtn.innerHTML = '<span class="btn-icon">▶</span><span>下一步</span>';
            this.completeStepBtn.disabled = currentStep >= totalSteps - 1;
            this.skipStepBtn.style.display = 'none';
            this.shelveTaskBtn.style.display = 'none';
        } else {
            this.completeStepBtn.innerHTML = '<span class="btn-icon">✓</span><span>完成这一步</span>';
            this.completeStepBtn.disabled = currentStep >= totalSteps;
            this.skipStepBtn.style.display = '';
            this.shelveTaskBtn.style.display = '';
            this.skipStepBtn.disabled = currentStep >= totalSteps;
        }
    }

    completeCurrentStep() {
        if (!this.currentTask) return;

        if (this.viewOnlyMode) {
            // 查看模式下只是切换步骤
            if (this.viewCurrentStep < this.currentTask.steps.length - 1) {
                this.viewCurrentStep++;
                this.updateFocusMode();
            }
            return;
        }

        // 添加完成动画
        this.focusStepCard.classList.add('completing');
        setTimeout(() => {
            this.focusStepCard.classList.remove('completing');
        }, 500);

        // 震动反馈
        if (this.settingsManager.get('vibrationEnabled') && navigator.vibrate) {
            navigator.vibrate(50);
        }

        const task = this.taskManager.completeStep(this.currentTask.id);

        if (task.status === 'completed') {
            // 显示完成动画
            this.showCompletionAnimation();
        } else {
            this.updateFocusMode();
        }
    }

    skipCurrentStep() {
        if (!this.currentTask || this.viewOnlyMode) return;

        const coach = COACHES.find(c => c.id === this.currentTask.coachId) || COACHES[0];
        this.coachMessage.textContent = getRandomMessage(coach, 'skip');

        const task = this.taskManager.skipStep(this.currentTask.id);

        if (task.status === 'completed') {
            this.showCompletionAnimation();
        } else {
            setTimeout(() => this.updateFocusMode(), 500);
        }
    }

    showCompletionAnimation() {
        const coach = COACHES.find(c => c.id === this.currentTask.coachId) || COACHES[0];
        const finishMessage = getRandomMessage(coach, 'finish');

        this.completionOverlay.querySelector('.completion-text').textContent = finishMessage;
        this.completionOverlay.classList.add('active');

        // 震动反馈
        if (this.settingsManager.get('vibrationEnabled') && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => {
            this.completionOverlay.classList.remove('active');
            this.exitFocusMode();
        }, 2500);
    }

    // ==================== 创建任务弹窗 ====================

    showCreateTaskModal() {
        this.taskNameInput.value = '';
        this.tempSteps = [];
        this.selectedCoachId = this.settingsManager.get('defaultCoach');

        this.renderCoachSelector(this.coachSelector, this.selectedCoachId);
        this.renderStepsList();
        this.updateCreateButton();

        this.createTaskModal.classList.add('active');
        this.taskNameInput.focus();
    }

    hideCreateTaskModal() {
        this.createTaskModal.classList.remove('active');
    }

    renderCoachSelector(container, selectedId) {
        container.innerHTML = COACHES.map(coach => `
            <div class="coach-option ${coach.id === selectedId ? 'selected' : ''}" data-coach-id="${coach.id}">
                <span class="coach-option-avatar">${coach.avatar}</span>
                <span class="coach-option-name">${coach.name}</span>
                <span class="coach-option-desc">${coach.description}</span>
            </div>
        `).join('');

        container.querySelectorAll('.coach-option').forEach(option => {
            option.addEventListener('click', () => {
                container.querySelectorAll('.coach-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');

                if (container === this.coachSelector) {
                    this.selectedCoachId = option.dataset.coachId;
                } else {
                    this.previewSelectedCoachId = option.dataset.coachId;
                }
            });
        });
    }

    addStep() {
        const stepText = this.stepInput.value.trim();
        if (!stepText) return;

        this.tempSteps.push(stepText);
        this.stepInput.value = '';
        this.renderStepsList();
        this.updateCreateButton();
        this.stepInput.focus();
    }

    removeStep(index) {
        this.tempSteps.splice(index, 1);
        this.renderStepsList();
        this.updateCreateButton();
    }

    renderStepsList() {
        if (this.tempSteps.length === 0) {
            this.stepsList.innerHTML = '';
            this.stepsEmpty.style.display = 'block';
            return;
        }

        this.stepsEmpty.style.display = 'none';
        this.stepsList.innerHTML = this.tempSteps.map((step, index) => `
            <div class="step-item">
                <span class="step-number">${index + 1}</span>
                <span class="step-text">${escapeHtml(step)}</span>
                <button class="step-remove" data-index="${index}">&times;</button>
            </div>
        `).join('');

        this.stepsList.querySelectorAll('.step-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeStep(parseInt(btn.dataset.index));
            });
        });
    }

    updateCreateButton() {
        const hasName = this.taskNameInput.value.trim().length > 0;
        const hasSteps = this.tempSteps.length > 0;
        this.confirmCreateTask.disabled = !(hasName && hasSteps);
    }

    createTask() {
        const name = this.taskNameInput.value.trim();
        if (!name || this.tempSteps.length === 0) return;

        const task = this.taskManager.createTask(name, this.tempSteps, this.selectedCoachId);
        this.hideCreateTaskModal();
        this.render();

        // 直接进入专注模式
        this.enterFocusMode(task.id);
    }

    // ==================== 模板弹窗 ====================

    showTemplateModal() {
        this.selectedCategory = '全部';
        this.renderTemplateCategories();
        this.renderTemplateGrid();
        this.templateModal.classList.add('active');
    }

    hideTemplateModal() {
        this.templateModal.classList.remove('active');
    }

    renderTemplateCategories() {
        const categories = ['全部', ...getTemplateCategories()];

        this.templateCategories.innerHTML = categories.map(cat => `
            <button class="category-tag ${cat === this.selectedCategory ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        this.templateCategories.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                this.selectedCategory = tag.dataset.category;
                this.renderTemplateCategories();
                this.renderTemplateGrid();
            });
        });
    }

    renderTemplateGrid() {
        const templates = getTemplatesByCategory(this.selectedCategory);

        this.templateGrid.innerHTML = templates.map(template => `
            <button class="template-card" data-template-id="${template.id}">
                <span class="template-icon">${template.icon}</span>
                <span class="template-name">${template.name}</span>
                <span class="template-steps-count">${template.steps.length} 步</span>
            </button>
        `).join('');

        this.templateGrid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                this.showTemplatePreview(templateId);
            });
        });
    }

    // ==================== 模板预览弹窗 ====================

    showTemplatePreview(templateId) {
        const template = TASK_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        this.selectedTemplate = template;
        this.previewSelectedCoachId = this.settingsManager.get('defaultCoach');

        this.previewTemplateName.textContent = `${template.icon} ${template.name}`;
        this.renderCoachSelector(this.previewCoachSelector, this.previewSelectedCoachId);

        this.previewSteps.innerHTML = `
            <div class="steps-list">
                ${template.steps.map((step, index) => `
                    <div class="step-item">
                        <span class="step-number">${index + 1}</span>
                        <span class="step-text">${escapeHtml(step)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.hideTemplateModal();
        this.templatePreviewModal.classList.add('active');
    }

    hideTemplatePreviewModal() {
        this.templatePreviewModal.classList.remove('active');
        this.selectedTemplate = null;
    }

    useTemplate() {
        if (!this.selectedTemplate) return;

        const task = this.taskManager.createTask(
            this.selectedTemplate.name,
            this.selectedTemplate.steps,
            this.previewSelectedCoachId
        );

        this.hideTemplatePreviewModal();
        this.render();

        // 直接进入专注模式
        this.enterFocusMode(task.id);
    }

    // ==================== 搁置弹窗 ====================

    showShelveModal() {
        this.shelveReasonInput.value = '';
        this.shelveModal.classList.add('active');
    }

    hideShelveModal() {
        this.shelveModal.classList.remove('active');
    }

    shelveCurrentTask() {
        if (!this.currentTask) return;

        const reason = this.shelveReasonInput.value.trim();
        const coach = COACHES.find(c => c.id === this.currentTask.coachId) || COACHES[0];

        this.coachMessage.textContent = getRandomMessage(coach, 'shelve');
        this.taskManager.shelveTask(this.currentTask.id, reason);

        this.hideShelveModal();

        setTimeout(() => {
            this.exitFocusMode();
        }, 1000);
    }

    // ==================== 设置弹窗 ====================

    showSettingsModal() {
        // 填充教练选项
        this.defaultCoachSelect.innerHTML = COACHES.map(coach => `
            <option value="${coach.id}">${coach.avatar} ${coach.name}</option>
        `).join('');

        this.defaultCoachSelect.value = this.settingsManager.get('defaultCoach');
        this.vibrationToggle.checked = this.settingsManager.get('vibrationEnabled');

        this.settingsModal.classList.add('active');
    }

    hideSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    clearAllData() {
        if (confirm('确定要清除所有数据吗？此操作无法撤销。')) {
            this.taskManager.clearAll();
            this.settingsManager.clearAll();
            this.applyTheme();
            this.render();
            this.hideSettingsModal();
        }
    }

    // ==================== 删除确认弹窗 ====================

    showDeleteConfirmModal(taskId) {
        this.pendingDeleteTaskId = taskId;
        this.deleteConfirmModal.classList.add('active');
    }

    hideDeleteConfirmModal() {
        this.pendingDeleteTaskId = null;
        this.deleteConfirmModal.classList.remove('active');
    }

    deleteTask() {
        if (this.pendingDeleteTaskId) {
            this.taskManager.deleteTask(this.pendingDeleteTaskId);
            this.hideDeleteConfirmModal();
            this.render();
        }
    }
}

// ==================== 应用初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
