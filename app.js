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
                skipped: false,
                timeSpent: 0  // 每个步骤的用时（秒）
            })),
            currentStep: 0,
            currentStepTime: 0,  // 当前步骤已用时间（用于暂停/恢复）
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
    completeStep(taskId, stepTime = 0) {
        const task = this.getTask(taskId);
        if (!task) return null;

        if (task.currentStep < task.steps.length) {
            task.steps[task.currentStep].completed = true;
            task.steps[task.currentStep].timeSpent = stepTime;
            task.currentStep++;
            task.currentStepTime = 0;  // 重置当前步骤时间

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
    skipStep(taskId, stepTime = 0) {
        const task = this.getTask(taskId);
        if (!task) return null;

        if (task.currentStep < task.steps.length) {
            task.steps[task.currentStep].skipped = true;
            task.steps[task.currentStep].timeSpent = stepTime;
            task.currentStep++;
            task.currentStepTime = 0;  // 重置当前步骤时间

            // 检查是否完成所有步骤
            if (task.currentStep >= task.steps.length) {
                task.status = 'completed';
                task.completedAt = Date.now();
            }

            this.saveToStorage();
        }
        return task;
    }

    // 保存当前步骤的临时时间（用于暂停/退出时保存）
    saveCurrentStepTime(taskId, stepTime) {
        const task = this.getTask(taskId);
        if (!task) return null;

        task.currentStepTime = stepTime;
        this.saveToStorage();
        return task;
    }

    // 获取任务总用时
    getTotalTime(task) {
        if (!task) return 0;
        return task.steps.reduce((total, step) => total + (step.timeSpent || 0), 0);
    }

    // 搁置任务
    shelveTask(taskId, reason) {
        const task = this.getTask(taskId);
        if (!task) return null;

        task.status = 'shelved';
        task.shelveReason = reason || '';
        task.shelvedAt = Date.now();
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
        this.customTemplateManager = new CustomTemplateManager();

        // 新功能管理器
        this.usageStats = new UsageStatsManager();
        this.challengeManager = new ChallengeManager();
        // 共享通知管理器
        this.challengeManager.notificationManager = this.usageStats.notificationManager;

        // 语言系统
        this.i18n = window.i18n || (typeof i18n !== 'undefined' ? i18n : null);
        if (!this.i18n) {
            console.error('i18n not found; falling back to identity translations');
            this.i18n = {
                set: () => { },
                get: () => 'zh',
                t: (key) => key,
                getAllCoaches: () => COACHES.map(c => ({ id: c.id, name: c.name, description: c.description, messages: c.messages })),
                getCoachData: (coachId) => {
                    const coach = COACHES.find(c => c.id === coachId) || COACHES[0];
                    return {
                        name: coach ? coach.name : coachId,
                        description: coach ? coach.description : '',
                        messages: coach ? coach.messages : {}
                    };
                }
            };
        }

        // 当前状态
        this.currentTask = null;
        this.selectedCoachId = null;
        this.tempSteps = [];
        this.selectedTemplate = null;
        this.pendingDeleteTaskId = null;
        this.selectedCategory = '全部';

        // 步骤计时器
        this.stepTimerInterval = null;
        this.stepTimerSeconds = 0;
        this.timerPaused = false;
        this.timerStartTime = null;        // 计时器开始的时间戳
        this.timerAccumulatedSeconds = 0;  // 暂停前累积的秒数

        // 自定义模板编辑器状态
        this.editingTemplateId = null;
        this.currentTab = 'preset';  // 'preset' | 'custom'
        this.editorData = {
            name: '',
            icon: '🌅',
            category: '日常',
            color: '#6366f1',
            tags: [],
            description: '',
            steps: []
        };

        this.initElements();
        this.initEventListeners();
        this.applyTheme();
        this.render();
        this.updateUIText();

        // 记录今日首次启动活动
        this.usageStats.recordActivity({
            tasksCompleted: 0,
            stepsCompleted: 0,
            timeSpent: 0
        });
    }

    // ==================== 初始化 ====================

    initElements() {
        // 主界面
        this.mainView = document.getElementById('mainView');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');

        // 连续天数显示区
        this.streakDisplay = document.getElementById('streakDisplay');
        this.streakFlame = document.getElementById('streakFlame');
        this.currentStreak = document.getElementById('currentStreak');
        this.longestStreak = document.getElementById('longestStreak');
        this.todayTasks = document.getElementById('todayTasks');
        this.freezeTokens = document.getElementById('freezeTokens');

        // 挑战系统
        this.challengesSection = document.getElementById('challengesSection');
        this.challengesList = document.getElementById('challengesList');
        this.challengesEmpty = document.getElementById('challengesEmpty');
        this.createChallengeBtn = document.getElementById('createChallengeBtn');

        // 创建挑战弹窗
        this.createChallengeModal = document.getElementById('createChallengeModal');
        this.closeCreateChallengeModal = document.getElementById('closeCreateChallengeModal');
        this.cancelCreateChallenge = document.getElementById('cancelCreateChallenge');
        this.confirmCreateChallenge = document.getElementById('confirmCreateChallenge');
        this.challengeTypeSelector = document.getElementById('challengeTypeSelector');
        this.challengeTemplateGrid = document.getElementById('challengeTemplateGrid');
        this.challengeNameInput = document.getElementById('challengeNameInput');
        this.challengeTargetInput = document.getElementById('challengeTargetInput');
        this.challengeUnitSelect = document.getElementById('challengeUnitSelect');
        this.challengeCategorySelect = document.getElementById('challengeCategorySelect');
        this.challengeIconGrid = document.getElementById('challengeIconGrid');
        this.challengeColorGrid = document.getElementById('challengeColorGrid');
        this.customPeriodGroup = document.getElementById('customPeriodGroup');
        this.challengePeriodInput = document.getElementById('challengePeriodInput');

        // 日历弹窗
        this.calendarModal = document.getElementById('calendarModal');
        this.closeCalendarModal = document.getElementById('closeCalendarModal');
        this.calendarMonthTitle = document.getElementById('calendarMonthTitle');
        this.calendarPrevBtn = document.getElementById('calendarPrevBtn');
        this.calendarNextBtn = document.getElementById('calendarNextBtn');
        this.calendarDaysGrid = document.getElementById('calendarDaysGrid');

        // 成就通知
        this.achievementNotification = document.getElementById('achievementNotification');
        this.achievementIcon = document.getElementById('achievementIcon');
        this.achievementName = document.getElementById('achievementName');

        // 挑战创建状态
        this.selectedChallengeType = 'daily';
        this.selectedChallengeIcon = '🎯';
        this.selectedChallengeColor = '#7c5cff';
        this.selectedTemplate = null;

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
        this.stepTimerDisplay = document.getElementById('stepTimerDisplay');
        this.stepTimerContainer = document.getElementById('stepTimerContainer');
        this.stepTimerWrapper = document.querySelector('.step-timer-wrapper');
        this.pauseTimerBtn = document.getElementById('pauseTimerBtn');
        this.totalTimeDisplay = document.getElementById('totalTimeDisplay');
        this.completedStepsDisplay = document.getElementById('completedStepsDisplay');

        this.exitFocusBtn = document.getElementById('exitFocusBtn');
        this.completeStepBtn = document.getElementById('completeStepBtn');
        this.skipStepBtn = document.getElementById('skipStepBtn');
        this.shelveTaskBtn = document.getElementById('shelveTaskBtn');
        this.celebrationContainer = document.getElementById('celebrationContainer');
        this.stepCelebrationOverlay = document.getElementById('stepCelebrationOverlay');

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
        this.languageSelector = document.getElementById('languageSelector');


        // 删除确认弹窗
        this.deleteConfirmModal = document.getElementById('deleteConfirmModal');
        this.closeDeleteModal = document.getElementById('closeDeleteModal');
        this.cancelDelete = document.getElementById('cancelDelete');
        this.confirmDelete = document.getElementById('confirmDelete');

        // 自定义模板 - 标签页
        this.templateTabs = document.querySelectorAll('.tab-btn');
        this.presetTab = document.getElementById('presetTab');
        this.customTab = document.getElementById('customTab');

        // 自定义模板 - 列表区域
        this.createCustomBtn = document.getElementById('createCustomBtn');
        this.importBtn = document.getElementById('importBtn');
        this.customGrid = document.getElementById('customGrid');
        this.customEmpty = document.getElementById('customEmpty');
        this.importFileInput = document.getElementById('importFileInput');

        // 自定义模板 - 编辑器弹窗
        this.customEditorModal = document.getElementById('customEditorModal');
        this.closeEditorModal = document.getElementById('closeEditorModal');
        this.editorTitle = document.getElementById('editorTitle');
        this.editorName = document.getElementById('editorName');
        this.iconSelector = document.getElementById('iconSelector');
        this.editorCategory = document.getElementById('editorCategory');
        this.colorSelector = document.getElementById('colorSelector');
        this.tagInput = document.getElementById('tagInput');
        this.tagsDisplay = document.getElementById('tagsDisplay');
        this.editorDesc = document.getElementById('editorDesc');
        this.editorStepInput = document.getElementById('editorStepInput');
        this.editorStepsList = document.getElementById('editorStepsList');
        this.editorStepsEmpty = document.getElementById('editorStepsEmpty');
        this.addEditorStep = document.getElementById('addEditorStep');
        this.cancelEditor = document.getElementById('cancelEditor');
        this.saveEditor = document.getElementById('saveEditor');
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
        this.pauseTimerBtn.addEventListener('click', () => this.toggleTimerPause());

        // 创建任务弹窗
        this.closeCreateModal.addEventListener('click', () => this.hideCreateTaskModal());
        this.cancelCreateTask.addEventListener('click', () => this.hideCreateTaskModal());
        this.confirmCreateTask.addEventListener('click', () => this.createTask());
        this.addStepBtn.addEventListener('click', () => this.addStep());
        this.stepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addStep();
        });
        this.taskNameInput.addEventListener('input', () => this.updateCreateButton());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 模板弹窗
        this.closeTemplateModal.addEventListener('click', () => this.hideTemplateModal());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 模板预览弹窗
        this.closePreviewModal.addEventListener('click', () => this.hideTemplatePreviewModal());
        this.cancelUseTemplate.addEventListener('click', () => this.hideTemplatePreviewModal());
        this.confirmUseTemplate.addEventListener('click', () => this.useTemplate());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 搁置弹窗
        this.closeShelveModal.addEventListener('click', () => this.hideShelveModal());
        this.cancelShelve.addEventListener('click', () => this.hideShelveModal());
        this.confirmShelve.addEventListener('click', () => this.shelveCurrentTask());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 设置弹窗
        this.closeSettingsModal.addEventListener('click', () => this.hideSettingsModal());
        // 禁用点击空白处关闭弹窗（防止误触）
        this.defaultCoachSelect.addEventListener('change', (e) => {
            this.settingsManager.set('defaultCoach', e.target.value);
        });
        this.vibrationToggle.addEventListener('change', (e) => {
            this.settingsManager.set('vibrationEnabled', e.target.checked);
        });
        this.clearDataBtn.addEventListener('click', () => this.clearAllData());

        // 语言切换
        const langInputs = this.languageSelector.querySelectorAll('input[name="language"]');
        langInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.switchLanguage(e.target.value);
                }
            });
        });

        // 初始化语言选择器状态
        this.initLanguageSelector();

        // 删除确认弹窗
        this.closeDeleteModal.addEventListener('click', () => this.hideDeleteConfirmModal());
        this.cancelDelete.addEventListener('click', () => this.hideDeleteConfirmModal());
        this.confirmDelete.addEventListener('click', () => this.deleteTask());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 自定义模板 - 标签页切换
        this.templateTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // 自定义模板 - 操作按钮
        this.createCustomBtn.addEventListener('click', () => this.showCustomEditor());
        this.importBtn.addEventListener('click', () => this.importFileInput.click());
        this.importFileInput.addEventListener('change', (e) => this.handleImport(e));

        // 自定义模板 - 编辑器弹窗
        this.closeEditorModal.addEventListener('click', () => this.hideCustomEditor());
        this.cancelEditor.addEventListener('click', () => this.hideCustomEditor());
        this.saveEditor.addEventListener('click', () => this.saveCustomTemplate());
        this.addEditorStep.addEventListener('click', () => this.addEditorStepMethod());
        this.editorStepInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEditorStepMethod();
        });
        this.editorName.addEventListener('input', () => this.updateEditorSaveButton());
        this.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });
        // 禁用点击空白处关闭弹窗（防止误触）

        // 连续天数显示区 - 点击显示日历
        this.streakDisplay.addEventListener('click', () => this.showCalendarModal());

        // 挑战系统
        this.createChallengeBtn.addEventListener('click', () => this.showCreateChallengeModal());
        this.closeCreateChallengeModal.addEventListener('click', () => this.hideCreateChallengeModal());
        this.cancelCreateChallenge.addEventListener('click', () => this.hideCreateChallengeModal());
        this.confirmCreateChallenge.addEventListener('click', () => this.createChallenge());
        // 禁用点击空白处关闭弹窗（防止误触）

        // 挑战类型选择
        this.challengeTypeSelector.querySelectorAll('.challenge-type-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectChallengeType(btn.dataset.type));
        });

        // 日历弹窗
        this.closeCalendarModal.addEventListener('click', () => this.hideCalendarModal());
        // 禁用点击空白处关闭弹窗（防止误触）
        this.calendarPrevBtn.addEventListener('click', () => this.changeCalendarMonth(-1));
        this.calendarNextBtn.addEventListener('click', () => this.changeCalendarMonth(1));

        // 应用内事件监听
        window.addEventListener('app:achievement-unlock', (e) => this.showAchievementNotification(e.detail.achievement));
        window.addEventListener('app:challenge-complete', (e) => this.handleChallengeComplete(e.detail.challenge));

        // 初始化挑战相关UI
        this.initChallengeUI();
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

    // ==================== 国际化 ====================

    initLanguageSelector() {
        const currentLang = this.i18n.get();
        const langInputs = this.languageSelector.querySelectorAll('input[name="language"]');
        langInputs.forEach(input => {
            input.checked = input.value === currentLang;
        });
    }

    switchLanguage(lang) {
        this.i18n.set(lang);
        this.updateUIText();
        this.render(); // 重新渲染界面
    }

    updateUIText() {
        // 更新所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.i18n.t(key);
            el.textContent = text;
        });

        // 更新页面标题
        document.title = this.i18n.t('app_title');

        // 更新 HTML lang 属性
        const currentLang = this.i18n.get();
        document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';

        // 更新特殊元素的文本
        this.updateTranslatableContent();
    }

    updateTranslatableContent() {
        // 更新任务计数
        const tasks = this.taskManager.getAllTasks();
        const countText = this.i18n.t('tasks_count', { count: tasks.length });
        this.taskCount.textContent = countText;

        // 更新按钮文本
        this.createTaskBtn.querySelector('.action-text').textContent = this.i18n.t('create_new_task');
        this.useTemplateBtn.querySelector('.action-text').textContent = this.i18n.t('use_template');

        // 更新设置面板标题
        document.querySelector('#settingsModal .modal-title').textContent = this.i18n.t('settings');

        // 更新教练选择器的选项
        this.updateCoachSelectorOptions();

        // 更新空状态文本
        this.updateEmptyStateText();

        // 更新连续天数显示
        this.renderStreakDisplay();

        // 更新挑战列表
        this.renderChallenges();
    }

    updateCoachSelectorOptions() {
        this.defaultCoachSelect.innerHTML = COACHES.map(coach => {
            const coachName = this.i18n.getCoachData(coach.id).name;
            return `<option value="${coach.id}">${coach.avatar} ${coachName}</option>`;
        }).join('');
    }

    updateEmptyStateText() {
        const emptyTitle = this.emptyState.querySelector('.empty-title');
        const emptyHint = this.emptyState.querySelector('.empty-hint');
        if (emptyTitle) emptyTitle.textContent = this.i18n.t('empty_state_title');
        if (emptyHint) emptyHint.textContent = this.i18n.t('empty_state_hint');
    }

    // 获取翻译文本的辅助方法
    t(key, params) {
        return this.i18n.t(key, params);
    }

    // ==================== 渲染 ====================

    render() {
        this.renderStreakDisplay();
        this.renderChallenges();
        this.renderTaskList();
    }

    renderTaskList() {
        const tasks = this.taskManager.getAllTasks();

        this.taskCount.textContent = this.t('tasks_count', { count: tasks.length });

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

        // 渲染单个任务卡片的辅助函数
        const renderTaskCard = (task) => {
            const progress = this.taskManager.getProgress(task);
            const completedSteps = task.steps.filter(s => s.completed || s.skipped).length;

            return `
                <div class="task-card" data-task-id="${task.id}">
                    <span class="task-status-icon">${statusIcons[task.status]}</span>
                    <div class="task-info">
                        <div class="task-name">${escapeHtml(task.name)}</div>
                        <div class="task-progress">
                            ${task.status === 'completed' ? this.t('status_completed') :
                              task.status === 'shelved' ? this.t('status_shelved') :
                              `${completedSteps}/${task.steps.length} ${this.t('unit_steps')}`}
                        </div>
                        ${task.status === 'in_progress' ? `
                            <div class="task-progress-bar">
                                <div class="task-progress-fill" style="width: ${progress}%"></div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="task-actions">
                        ${task.status === 'in_progress' ? `
                            <button class="task-action-btn primary" data-action="continue" title="${this.t('continue')}">▶</button>
                        ` : ''}
                        ${task.status === 'shelved' ? `
                            <button class="task-action-btn" data-action="resume" title="${this.t('resume')}">↩</button>
                        ` : ''}
                        ${task.status === 'completed' ? `
                            <button class="task-action-btn" data-action="view" title="${this.t('view')}">👁</button>
                        ` : ''}
                        <button class="task-action-btn" data-action="delete" title="${this.t('delete')}">🗑</button>
                    </div>
                </div>
            `;
        };

        // 分离任务：进行中 vs 已完成/已搁置
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
        const finishedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'shelved');

        // 按日期分组已完成/已搁置的任务
        const groupedByDate = {};
        finishedTasks.forEach(task => {
            const endTime = this.getTaskEndTime(task);
            const dateKey = this.getDateKey(endTime);
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = {
                    timestamp: endTime,
                    tasks: []
                };
            }
            groupedByDate[dateKey].tasks.push(task);
        });

        // 按日期倒序排列（最近的在前）
        const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

        // 构建完整的 HTML
        let html = '';

        // 1. 渲染进行中的任务（置顶）
        html += inProgressTasks.map(renderTaskCard).join('');

        // 2. 渲染已完成/已搁置的任务（按日期分组）
        sortedDateKeys.forEach(dateKey => {
            const group = groupedByDate[dateKey];
            const dateLabel = this.formatDateLabel(group.timestamp);

            // 添加日期分隔符
            html += `<div class="date-separator">${dateLabel}</div>`;

            // 渲染该日期下的所有任务
            html += group.tasks.map(renderTaskCard).join('');
        });

        this.taskList.innerHTML = html;

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
            // 查看模式隐藏计时器
            this.stepTimerWrapper.style.display = 'none';
        } else {
            this.viewOnlyMode = false;
            // 显示计时器并开始计时
            this.stepTimerWrapper.style.display = 'flex';
            // 恢复之前保存的步骤时间
            this.stepTimerSeconds = task.currentStepTime || 0;
            this.timerAccumulatedSeconds = this.stepTimerSeconds;
            this.timerPaused = false;
            this.updatePauseButtonIcon();
            this.startStepTimer();
        }

        this.updateFocusMode();
    }

    exitFocusMode() {
        // 保存当前步骤的时间（如果不是查看模式）
        if (this.currentTask && !this.viewOnlyMode) {
            this.taskManager.saveCurrentStepTime(this.currentTask.id, this.stepTimerSeconds);
        }
        this.stopStepTimer();
        this.focusMode.classList.remove('active');
        this.currentTask = null;
        this.viewOnlyMode = false;
        this.timerPaused = false;
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
            this.completeStepBtn.innerHTML = `<span>${this.t('next_step')}</span>`;
            this.completeStepBtn.disabled = currentStep >= totalSteps - 1;
            this.skipStepBtn.style.display = 'none';
            this.shelveTaskBtn.style.display = 'none';
        } else {
            this.completeStepBtn.innerHTML = `<span>${this.t('complete_step')}</span>`;
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

        // 触发按钮庆祝动画
        this.triggerCompleteAnimation();

        // 显示步骤完成庆祝动画（✅ + 音效）
        this.showStepCelebration();

        // 震动反馈
        if (this.settingsManager.get('vibrationEnabled') && navigator.vibrate) {
            navigator.vibrate(50);
        }

        // 保存当前步骤的用时
        const stepTime = this.stepTimerSeconds;
        const task = this.taskManager.completeStep(this.currentTask.id, stepTime);

        // 记录活动
        this.usageStats.recordActivity({
            stepsCompleted: 1,
            timeSpent: stepTime
        });

        // 更新挑战进度（步骤类型）
        const stepChallenges = this.challengeManager.getActiveChallenges().filter(c => c.unit === 'steps');
        stepChallenges.forEach(c => {
            this.challengeManager.updateProgress(c.id, 1);
        });
        this.renderChallenges();
        this.renderStreakDisplay();

        if (task.status === 'completed') {
            // 任务完成 - 记录活动
            this.usageStats.recordActivity({
                tasksCompleted: 1,
                stepsCompleted: 0,
                timeSpent: 0
            });

            // 更新任务类型挑战
            const taskChallenges = this.challengeManager.getActiveChallenges().filter(c => c.unit === 'tasks');
            taskChallenges.forEach(c => {
                this.challengeManager.updateProgress(c.id, 1);
            });

            // 停止计时器并显示完成动画
            this.stopStepTimer();
            this.showCompletionAnimation();
            this.renderChallenges();
            this.renderStreakDisplay();
        } else {
            // 重置计时器开始下一步
            this.stepTimerSeconds = 0;
            this.timerPaused = false;
            this.updatePauseButtonIcon();
            this.startStepTimer();
            this.updateFocusMode();
        }
    }

    skipCurrentStep() {
        if (!this.currentTask || this.viewOnlyMode) return;

        const coach = COACHES.find(c => c.id === this.currentTask.coachId) || COACHES[0];
        this.coachMessage.textContent = getRandomMessage(coach, 'skip');

        // 保存当前步骤的用时
        const stepTime = this.stepTimerSeconds;
        const task = this.taskManager.skipStep(this.currentTask.id, stepTime);

        if (task.status === 'completed') {
            // 停止计时器并显示完成动画
            this.stopStepTimer();
            this.showCompletionAnimation();
        } else {
            // 重置计时器开始下一步
            this.stepTimerSeconds = 0;
            this.timerPaused = false;
            this.updatePauseButtonIcon();
            this.startStepTimer();
            setTimeout(() => this.updateFocusMode(), 500);
        }
    }

    showCompletionAnimation() {
        const coach = COACHES.find(c => c.id === this.currentTask.coachId) || COACHES[0];
        const finishMessage = getRandomMessage(coach, 'finish');

        this.completionOverlay.querySelector('.completion-text').textContent = finishMessage;

        // 显示时间统计
        const totalSeconds = this.taskManager.getTotalTime(this.currentTask);
        this.totalTimeDisplay.textContent = this.formatTime(totalSeconds);

        const completedSteps = this.currentTask.steps.filter(s => s.completed).length;
        const totalSteps = this.currentTask.steps.length;
        this.completedStepsDisplay.textContent = `${completedSteps}/${totalSteps}`;

        this.completionOverlay.classList.add('active');

        // 震动反馈
        if (this.settingsManager.get('vibrationEnabled') && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => {
            this.completionOverlay.classList.remove('active');
            this.exitFocusMode();
        }, 3500);  // 延长显示时间以便查看统计
    }

    // 格式化时间为 HH:MM:SS
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // ==================== 庆祝动画系统 ====================

    // 创建表情粒子效果
    createCelebration() {
        if (!this.celebrationContainer) return;

        // 庆祝表情池
        const emojis = ['😆', '🤩', '🥳', '🎉', '✨', '💫', '⭐', '🌟', '💪', '👏'];

        // 获取按钮位置
        const buttonRect = this.completeStepBtn.getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;

        // 创建表情粒子 - 360度发射
        this.createEmojiBurst(centerX, centerY, emojis);
    }

    // 创建表情爆发效果
    createEmojiBurst(x, y, emojis) {
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            const particle = document.createElement('div');
            particle.className = 'emoji-particle';
            particle.textContent = emoji;

            // 360度均匀分布，稍微随机化
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const distance = 150 + Math.random() * 100;  // 增大到 150-250px
            const bx = Math.cos(angle) * distance;
            const by = Math.sin(angle) * distance;

            // 随机大小
            const size = 18 + Math.random() * 10;

            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                font-size: ${size}px;
                --bx: ${bx}px;
                --by: ${by}px;
                --rotate: ${(Math.random() - 0.5) * 40}deg;
                animation: emojiBurst 1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
            `;

            this.celebrationContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 1200);
        }
    }

    // 创建涟漪效果
    createRipple(x, y, container) {
        const rippleContainer = container.querySelector('.btn-ripple-container');
        if (!rippleContainer) return;

        const ripple = document.createElement('div');
        ripple.className = 'btn-ripple';

        const rect = container.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;

        ripple.style.cssText = `
            left: ${x - rect.left - size / 2}px;
            top: ${y - rect.top - size / 2}px;
            width: ${size}px;
            height: ${size}px;
            animation: rippleExpand 0.6s ease-out forwards;
        `;

        rippleContainer.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // 触发完成按钮庆祝动画
    triggerCompleteAnimation() {
        // 添加庆祝动画类 - 触发勾选图标弹出
        this.completeStepBtn.classList.add('celebrating');

        // 同时触发表情粒子
        this.createCelebration();

        // 添加成功发光状态
        setTimeout(() => {
            this.completeStepBtn.classList.add('success-glow');
        }, 200);

        // 统一清理所有动画类
        setTimeout(() => {
            this.completeStepBtn.classList.remove('celebrating', 'success-glow');
        }, 800);
    }

    // 播放"叮~"音效
    playDingSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 音效参数：清脆的"叮~"声
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
            oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1); // 滑向 A6

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // 音频播放失败时静默处理
            console.error('音效播放失败:', e);
        }
    }

    // 显示步骤完成庆祝动画
    showStepCelebration() {
        if (!this.stepCelebrationOverlay) return;

        // 重置动画状态
        this.stepCelebrationOverlay.classList.remove('active', 'fade-out');

        // 强制重绘
        void this.stepCelebrationOverlay.offsetWidth;

        // 激活动画
        this.stepCelebrationOverlay.classList.add('active');

        // 播放音效
        this.playDingSound();

        // 动画完成后自动隐藏
        setTimeout(() => {
            this.stepCelebrationOverlay.classList.add('fade-out');
            setTimeout(() => {
                this.stepCelebrationOverlay.classList.remove('active', 'fade-out');
            }, 300);
        }, 800);
    }

    // 格式化日期标签（今天、昨天、前天、X月X日）
    formatDateLabel(timestamp) {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBeforeYesterday = new Date(today);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

        const isSameDay = (d1, d2) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        if (isSameDay(date, today)) return '今天';
        if (isSameDay(date, yesterday)) return '昨天';
        if (isSameDay(date, dayBeforeYesterday)) return '前天';

        if (date.getFullYear() === today.getFullYear()) {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }

    // 生成日期分组键
    getDateKey(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 获取任务结束时间（用于日期分组）
    getTaskEndTime(task) {
        if (task.status === 'completed' && task.completedAt) {
            return task.completedAt;
        }
        if (task.status === 'shelved' && task.shelvedAt) {
            return task.shelvedAt;
        }
        return task.createdAt || parseInt(task.id);
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
                <span class="template-steps-count">${template.steps.length} ${this.t('unit_steps')}</span>
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
        // 支持预设模板和自定义模板
        let template;
        if (templateId.startsWith('custom_')) {
            template = this.customTemplateManager.getById(templateId);
        } else {
            template = TASK_TEMPLATES.find(t => t.id === templateId);
        }

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
        this.updateCoachSelectorOptions();

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

    // ==================== 自定义模板功能 ====================

    // 标签页切换
    switchTab(tab) {
        this.currentTab = tab;

        // 更新标签按钮状态
        this.templateTabs.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // 切换内容显示
        this.presetTab.classList.toggle('active', tab === 'preset');
        this.customTab.classList.toggle('active', tab === 'custom');

        // 切换到自定义模板时刷新列表
        if (tab === 'custom') {
            this.renderCustomTemplateGrid();
        }
    }

    // 渲染自定义模板网格
    renderCustomTemplateGrid() {
        const templates = this.customTemplateManager.getAll();

        if (templates.length === 0) {
            this.customGrid.style.display = 'none';
            this.customEmpty.style.display = 'block';
            return;
        }

        this.customGrid.style.display = 'grid';
        this.customEmpty.style.display = 'none';

        this.customGrid.innerHTML = templates.map(t => `
            <div class="template-card custom-card" data-id="${t.id}">
                <span class="template-icon" style="color: ${t.color || '#6366f1'}">${t.icon}</span>
                <span class="template-name">${escapeHtml(t.name)}</span>
                <span class="template-steps-count">${t.steps.length} ${this.t('unit_steps')}</span>
                <div class="template-actions">
                    <button class="action-btn" data-action="edit" title="${this.t('edit')}">✏️</button>
                    <button class="action-btn" data-action="export" title="${this.t('export_template')}">📤</button>
                    <button class="action-btn" data-action="delete" title="${this.t('delete')}">🗑️</button>
                </div>
            </div>
        `).join('');

        // 绑定事件
        this.customGrid.querySelectorAll('.template-card').forEach(card => {
            const id = card.dataset.id;

            // 点击卡片 = 预览（排除操作按钮区域）
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.template-actions')) {
                    this.showTemplatePreview(id);
                }
            });

            // 操作按钮事件
            card.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;

                    if (action === 'edit') this.showCustomEditor(id);
                    else if (action === 'export') this.exportTemplate(id);
                    else if (action === 'delete') this.confirmDeleteCustom(id);
                });
            });
        });
    }

    // 显示自定义模板编辑器
    showCustomEditor(templateId = null) {
        this.editingTemplateId = templateId;

        if (templateId) {
            // 编辑模式 - 加载现有模板数据
            const template = this.customTemplateManager.getById(templateId);
            if (!template) return;

            this.editorTitle.textContent = '编辑模板';
            this.editorData = {
                name: template.name,
                icon: template.icon,
                category: template.category,
                color: template.color || '#6366f1',
                tags: template.tags || [],
                description: template.description || '',
                steps: [...template.steps]
            };
        } else {
            // 创建模式 - 初始化默认数据
            this.editorTitle.textContent = '创建模板';
            this.editorData = {
                name: '',
                icon: '🌅',
                category: '日常',
                color: '#6366f1',
                tags: [],
                description: '',
                steps: []
            };
        }

        // 填充表单
        this.editorName.value = this.editorData.name || '';
        this.editorCategory.value = this.editorData.category || '日常';
        this.editorDesc.value = this.editorData.description || '';

        // 渲染选择器和列表
        this.renderIconSelector();
        this.renderColorSelector();
        this.renderEditorTags();
        this.renderEditorSteps();
        this.updateEditorSaveButton();

        this.customEditorModal.classList.add('active');
        this.editorName.focus();
    }

    // 隐藏编辑器
    hideCustomEditor() {
        this.customEditorModal.classList.remove('active');
        this.editingTemplateId = null;
    }

    // 保存自定义模板
    saveCustomTemplate() {
        const data = {
            name: this.editorName.value.trim(),
            icon: this.editorData.icon,
            category: this.editorCategory.value,
            color: this.editorData.color,
            tags: this.editorData.tags,
            description: this.editorDesc.value.trim(),
            steps: this.editorData.steps
        };

        // 验证数据
        const validation = this.customTemplateManager.validateTemplate(data);
        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // 保存
        if (this.editingTemplateId) {
            this.customTemplateManager.update(this.editingTemplateId, data);
        } else {
            this.customTemplateManager.create(data);
        }

        this.hideCustomEditor();
        this.renderCustomTemplateGrid();
    }

    // 确认删除自定义模板
    confirmDeleteCustom(id) {
        const template = this.customTemplateManager.getById(id);
        if (!template) return;

        if (confirm(`确定要删除模板"${template.name}"吗？此操作无法撤销。`)) {
            this.customTemplateManager.delete(id);
            this.renderCustomTemplateGrid();
        }
    }

    // 导出模板
    exportTemplate(id) {
        this.customTemplateManager.exportTemplate(id);
    }

    // 导出所有自定义模板
    exportAllCustomTemplates() {
        this.customTemplateManager.exportAll();
    }

    // 导入模板
    handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const result = this.customTemplateManager.importTemplates(data);
                alert(`成功导入 ${result.imported} 个模板`);
                this.renderCustomTemplateGrid();
            } catch (error) {
                alert('导入失败：文件格式不正确');
            }
        };
        reader.readAsText(file);

        // 重置文件输入
        event.target.value = '';
    }

    // 渲染图标选择器
    renderIconSelector() {
        const ICONS = [
            '🌅', '💼', '📚', '🏃', '🧹', '📝', '🍳', '😴',
            '📖', '🧘', '💻', '🎯', '⏰', '🎨', '🎵', '🏠',
            '🚗', '✈️', '🏋️', '🧑‍💻', '📱', '🎓', '💡', '🌟'
        ];

        this.iconSelector.innerHTML = ICONS.map(icon => `
            <button class="icon-option ${icon === this.editorData.icon ? 'selected' : ''}"
                    data-icon="${icon}" type="button">${icon}</button>
        `).join('');

        this.iconSelector.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editorData.icon = btn.dataset.icon;
                this.renderIconSelector();
            });
        });
    }

    // 渲染颜色选择器
    renderColorSelector() {
        const COLORS = [
            '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
            '#f59e0b', '#10b981', '#06b6d4', '#64748b'
        ];

        this.colorSelector.innerHTML = COLORS.map(color => `
            <button class="color-option ${color === this.editorData.color ? 'selected' : ''}"
                    data-color="${color}" style="background: ${color}" type="button"
                    title="${color}"></button>
        `).join('');

        this.colorSelector.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editorData.color = btn.dataset.color;
                this.renderColorSelector();
            });
        });
    }

    // 添加标签
    addTag() {
        const tagText = this.tagInput.value.trim();
        if (!tagText) return;

        if (this.editorData.tags.includes(tagText)) {
            alert('该标签已存在');
            return;
        }

        this.editorData.tags.push(tagText);
        this.tagInput.value = '';
        this.renderEditorTags();
    }

    // 移除标签
    removeTag(index) {
        this.editorData.tags.splice(index, 1);
        this.renderEditorTags();
    }

    // 渲染标签显示
    renderEditorTags() {
        if (this.editorData.tags.length === 0) {
            this.tagsDisplay.innerHTML = '';
            return;
        }

        this.tagsDisplay.innerHTML = this.editorData.tags.map((tag, index) => `
            <span class="tag-item">
                ${escapeHtml(tag)}
                <button class="tag-remove" data-index="${index}" type="button">&times;</button>
            </span>
        `).join('');

        this.tagsDisplay.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeTag(parseInt(btn.dataset.index));
            });
        });
    }

    // 添加编辑器步骤
    addEditorStepMethod() {
        const stepText = this.editorStepInput.value.trim();
        if (!stepText) return;

        this.editorData.steps.push(stepText);
        this.editorStepInput.value = '';
        this.renderEditorSteps();
        this.updateEditorSaveButton();
        this.editorStepInput.focus();
    }

    // 移除编辑器步骤
    removeEditorStep(index) {
        this.editorData.steps.splice(index, 1);
        this.renderEditorSteps();
        this.updateEditorSaveButton();
    }

    // 渲染编辑器步骤列表
    renderEditorSteps() {
        if (this.editorData.steps.length === 0) {
            this.editorStepsList.innerHTML = '';
            this.editorStepsEmpty.style.display = 'block';
            return;
        }

        this.editorStepsEmpty.style.display = 'none';
        this.editorStepsList.innerHTML = this.editorData.steps.map((step, index) => `
            <div class="step-item" data-index="${index}" draggable="true">
                <span class="drag-handle" title="拖拽排序">⋮⋮</span>
                <span class="step-number">${index + 1}</span>
                <span class="step-text" data-index="${index}">${escapeHtml(step)}</span>
                <input class="step-input" data-index="${index}" value="${escapeHtml(step)}"
                       style="display:none;" maxlength="100" type="text">
                <div class="step-controls">
                    <button class="step-remove" data-index="${index}" type="button" title="删除">&times;</button>
                </div>
            </div>
        `).join('');

        // 绑定删除事件
        this.editorStepsList.querySelectorAll('.step-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeEditorStep(parseInt(btn.dataset.index));
            });
        });

        // 点击步骤文本进入编辑模式
        this.editorStepsList.querySelectorAll('.step-text').forEach(span => {
            span.addEventListener('click', () => {
                this.enterEditMode(parseInt(span.dataset.index));
            });
        });

        // 设置拖拽排序
        this.setupDragAndDrop();
    }

    // 进入编辑模式
    enterEditMode(index) {
        const item = this.editorStepsList.querySelector(`[data-index="${index}"]`);
        if (!item) return;

        const textSpan = item.querySelector('.step-text');
        const input = item.querySelector('.step-input');

        textSpan.style.display = 'none';
        input.style.display = 'block';
        input.focus();
        input.select();

        // 保存事件处理器引用，用于后续清理
        input._saveHandler = () => this.saveStepEdit(index);
        input._cancelHandler = (e) => {
            if (e.key === 'Escape') this.cancelStepEdit(index);
        };
        input._enterHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveStepEdit(index);
            }
        };

        input.addEventListener('blur', input._saveHandler);
        input.addEventListener('keydown', input._cancelHandler);
        input.addEventListener('keypress', input._enterHandler);
    }

    // 保存编辑
    saveStepEdit(index) {
        const item = this.editorStepsList.querySelector(`[data-index="${index}"]`);
        if (!item) return;

        const input = item.querySelector('.step-input');
        const newText = input.value.trim();

        if (newText !== '') {
            this.editorData.steps[index] = newText;
        }

        this.exitEditMode(index);
        this.renderEditorSteps();
    }

    // 取消编辑
    cancelStepEdit(index) {
        this.exitEditMode(index);
        const item = this.editorStepsList.querySelector(`[data-index="${index}"]`);
        if (!item) return;

        const textSpan = item.querySelector('.step-text');
        const input = item.querySelector('.step-input');

        input.style.display = 'none';
        textSpan.style.display = 'block';
    }

    // 退出编辑模式
    exitEditMode(index) {
        const item = this.editorStepsList.querySelector(`[data-index="${index}"]`);
        if (!item) return;

        const input = item.querySelector('.step-input');

        if (input._saveHandler) {
            input.removeEventListener('blur', input._saveHandler);
            input.removeEventListener('keydown', input._cancelHandler);
            input.removeEventListener('keypress', input._enterHandler);
            delete input._saveHandler;
            delete input._cancelHandler;
            delete input._enterHandler;
        }
    }

    // 设置拖拽排序
    setupDragAndDrop() {
        let draggedIndex = null;

        this.editorStepsList.querySelectorAll('.step-item').forEach(item => {
            const index = parseInt(item.dataset.index);

            // 开始拖拽
            item.addEventListener('dragstart', (e) => {
                draggedIndex = index;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.innerHTML);
            });

            // 拖拽结束
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                this.editorStepsList.querySelectorAll('.step-item').forEach(i => {
                    i.classList.remove('drag-over');
                });
            });

            // 拖拽经过
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                const targetIndex = parseInt(item.dataset.index);
                if (draggedIndex !== null && draggedIndex !== targetIndex) {
                    item.classList.add('drag-over');
                }
            });

            // 离开
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            // 放下
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const targetIndex = parseInt(item.dataset.index);
                if (draggedIndex !== null && draggedIndex !== targetIndex) {
                    this.reorderStep(draggedIndex, targetIndex);
                }

                item.classList.remove('drag-over');
            });
        });
    }

    // 重新排序步骤
    reorderStep(fromIndex, toIndex) {
        const steps = [...this.editorData.steps];
        const [movedItem] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, movedItem);
        this.editorData.steps = steps;
        this.renderEditorSteps();
    }

    // 更新保存按钮状态
    updateEditorSaveButton() {
        const hasName = this.editorName.value.trim().length > 0;
        const hasSteps = this.editorData.steps.length > 0;
        this.saveEditor.disabled = !(hasName && hasSteps);
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

    // ==================== 步骤计时器 ====================

    startStepTimer() {
        this.stopStepTimer();

        // 记录开始时间戳
        this.timerStartTime = Date.now();
        // 保存之前累积的时间
        this.timerAccumulatedSeconds = this.stepTimerSeconds;

        this.updateStepTimerDisplay();

        this.stepTimerInterval = setInterval(() => {
            if (!this.timerPaused) {
                // 基于时间戳计算，而不是简单累加
                const elapsed = Math.floor((Date.now() - this.timerStartTime) / 1000);
                this.stepTimerSeconds = this.timerAccumulatedSeconds + elapsed;
                this.updateStepTimerDisplay();
                this.updateTimerStyle();
            }
        }, 1000);
    }

    stopStepTimer() {
        if (this.stepTimerInterval) {
            clearInterval(this.stepTimerInterval);
            this.stepTimerInterval = null;
        }
    }

    toggleTimerPause() {
        this.timerPaused = !this.timerPaused;
        this.updatePauseButtonIcon();

        if (this.timerPaused) {
            // 暂停时：保存当前累积的秒数
            this.timerAccumulatedSeconds = this.stepTimerSeconds;
            this.stepTimerContainer.classList.add('paused');
            if (this.currentTask) {
                this.taskManager.saveCurrentStepTime(this.currentTask.id, this.stepTimerSeconds);
            }
        } else {
            // 恢复时：重新记录开始时间戳
            this.timerStartTime = Date.now();
            this.stepTimerContainer.classList.remove('paused');
        }
    }

    updatePauseButtonIcon() {
        const icon = this.pauseTimerBtn.querySelector('.pause-icon');
        icon.textContent = this.timerPaused ? '▶️' : '⏸️';
        this.pauseTimerBtn.title = this.timerPaused ? this.t('continue') : this.t('pause');
    }

    resetStepTimer() {
        this.stepTimerSeconds = 0;
        this.timerPaused = false;
        this.updateStepTimerDisplay();
        this.updateTimerStyle();
        this.updatePauseButtonIcon();
    }

    updateStepTimerDisplay() {
        const minutes = Math.floor(this.stepTimerSeconds / 60);
        const seconds = this.stepTimerSeconds % 60;
        this.stepTimerDisplay.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimerStyle() {
        // 移除所有状态类（保留 paused 类）
        this.stepTimerContainer.classList.remove('warning', 'urgent');

        // 超过3分钟显示紧急状态
        if (this.stepTimerSeconds >= 180) {
            this.stepTimerContainer.classList.add('urgent');
        }
        // 超过1分钟显示警告状态
        else if (this.stepTimerSeconds >= 60) {
            this.stepTimerContainer.classList.add('warning');
        }
    }

    // ==================== 连续天数显示区 ====================

    renderStreakDisplay() {
        const summary = this.usageStats.getStreakSummary();
        const todayStats = this.usageStats.getTodayStats();

        this.currentStreak.textContent = summary.current;
        this.longestStreak.textContent = summary.longest;
        this.todayTasks.textContent = todayStats.tasksCompleted;

        // 冻龄符显示
        this.freezeTokens.innerHTML = '';
        for (let i = 0; i < summary.freezeStreak; i++) {
            const token = document.createElement('span');
            token.className = 'freeze-token available';
            token.textContent = '❄️';
            token.title = '冻龄符 - 保护连续不中断';
            this.freezeTokens.appendChild(token);
        }

        // 冻结状态
        if (summary.isFrozen) {
            this.streakFlame.classList.add('frozen');
        } else {
            this.streakFlame.classList.remove('frozen');
        }
    }

    // ==================== 挑战系统 ====================

    initChallengeUI() {
        // 初始化图标选择器
        const icons = ['🎯', '📚', '💪', '🏃', '📖', '💻', '🎨', '🎵', '🌅', '💤', '🍎', '💧', '🧘', '✍️', '📝', '✅'];
        this.challengeIconGrid.innerHTML = icons.map(icon => `
            <div class="challenge-icon-option ${icon === this.selectedChallengeIcon ? 'selected' : ''}"
                 data-icon="${icon}">${icon}</div>
        `).join('');

        this.challengeIconGrid.querySelectorAll('.challenge-icon-option').forEach(el => {
            el.addEventListener('click', () => {
                this.challengeIconGrid.querySelectorAll('.challenge-icon-option').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                this.selectedChallengeIcon = el.dataset.icon;
            });
        });

        // 初始化颜色选择器
        const colors = ['#7c5cff', '#ff7eb3', '#ffa07a', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
        this.challengeColorGrid.innerHTML = colors.map(color => `
            <div class="challenge-color-option ${color === this.selectedChallengeColor ? 'selected' : ''}"
                 style="background: ${color}"
                 data-color="${color}"></div>
        `).join('');

        this.challengeColorGrid.querySelectorAll('.challenge-color-option').forEach(el => {
            el.addEventListener('click', () => {
                this.challengeColorGrid.querySelectorAll('.challenge-color-option').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                this.selectedChallengeColor = el.dataset.color;
            });
        });

        // 加载快捷模板
        this.renderChallengeTemplates();
    }

    renderChallengeTemplates() {
        const templates = this.challengeManager.getQuickTemplates();
        this.challengeTemplateGrid.innerHTML = templates.map(t => `
            <div class="challenge-template-card" data-template='${JSON.stringify(t)}'>
                <div class="challenge-template-icon">${t.icon}</div>
                <div class="challenge-template-name">${t.name}</div>
            </div>
        `).join('');

        this.challengeTemplateGrid.querySelectorAll('.challenge-template-card').forEach(el => {
            el.addEventListener('click', () => {
                this.challengeTemplateGrid.querySelectorAll('.challenge-template-card').forEach(e => e.classList.remove('selected'));
                el.classList.add('selected');
                this.selectedTemplate = JSON.parse(el.dataset.template);
                // 填充表单
                this.challengeNameInput.value = this.selectedTemplate.name;
                this.challengeTargetInput.value = this.selectedTemplate.target;
                this.challengeUnitSelect.value = this.selectedTemplate.unit;
                this.challengeCategorySelect.value = this.selectedTemplate.category;
                this.selectedChallengeIcon = this.selectedTemplate.icon;
                this.selectedChallengeColor = this.selectedTemplate.color;
                // 更新图标和颜色选择
                this.challengeIconGrid.querySelector(`[data-icon="${this.selectedChallengeIcon}"]`)?.click();
                this.challengeColorGrid.querySelector(`[data-color="${this.selectedChallengeColor}"]`)?.click();
            });
        });
    }

    renderChallenges() {
        const challenges = this.challengeManager.getTodayProgress();

        if (challenges.length === 0) {
            this.challengesList.innerHTML = '';
            this.challengesList.appendChild(this.challengesEmpty);
            this.challengesEmpty.style.display = 'block';
            return;
        }

        this.challengesEmpty.style.display = 'none';

        this.challengesList.innerHTML = challenges.map(c => {
            const progress = c.target > 0 ? (c.current / c.target) : 0;
            const unitLabels = { minutes: '分钟', tasks: '任务', steps: '步骤', times: '次', checkin: '打卡' };
            const unitLabel = unitLabels[c.unit] || c.unit;

            return `
                <div class="challenge-card ${c.completedToday ? 'completed' : ''}"
                     data-challenge-id="${c.id}"
                     style="--challenge-color: ${c.color}; --challenge-color-light: ${c.color}20">
                    <div class="challenge-header">
                        <div class="challenge-icon">${c.icon}</div>
                        <div class="challenge-info">
                            <div class="challenge-name">${c.name}</div>
                            <div class="challenge-meta">
                                <span class="challenge-category">${c.category}</span>
                                ${c.streak > 0 ? `<span class="challenge-streak">🔥 ${c.streak}天</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="challenge-progress">
                        <div class="challenge-progress-bar">
                            <div class="challenge-progress-fill" style="width: ${progress * 100}%"></div>
                        </div>
                        <div class="challenge-progress-text">
                            <span class="challenge-progress-current">${c.current}/${c.target}</span>
                            <span class="challenge-progress-target">${unitLabel}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 点击卡片显示详情（可选功能）
        this.challengesList.querySelectorAll('.challenge-card').forEach(el => {
            el.addEventListener('click', () => {
                const challengeId = el.dataset.challengeId;
                // 可以扩展为显示详情弹窗
            });
        });
    }

    selectChallengeType(type) {
        this.selectedChallengeType = type;
        this.challengeTypeSelector.querySelectorAll('.challenge-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        // 显示/隐藏自定义周期设置
        this.customPeriodGroup.style.display = type === 'custom' ? 'block' : 'none';
    }

    showCreateChallengeModal() {
        this.selectedTemplate = null;
        this.challengeNameInput.value = '';
        this.challengeTargetInput.value = '';
        this.selectedChallengeType = 'daily';
        this.selectedChallengeIcon = '🎯';
        this.selectedChallengeColor = '#7c5cff';

        // 重置UI
        this.challengeTypeSelector.querySelectorAll('.challenge-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'daily');
        });
        this.customPeriodGroup.style.display = 'none';
        this.challengeTemplateGrid.querySelectorAll('.challenge-template-card').forEach(e => e.classList.remove('selected'));
        this.challengeIconGrid.querySelector('[data-icon="🎯"]')?.click();
        this.challengeColorGrid.querySelector('[data-color="#7c5cff"]')?.click();

        this.createChallengeModal.classList.add('active');
    }

    hideCreateChallengeModal() {
        this.createChallengeModal.classList.remove('active');
    }

    createChallenge() {
        const name = this.challengeNameInput.value.trim();
        const target = parseInt(this.challengeTargetInput.value);

        if (!name) {
            alert('请输入挑战名称');
            return;
        }

        if (!target || target < 1) {
            alert('请输入有效的目标数值');
            return;
        }

        const challenge = this.challengeManager.createChallenge({
            type: this.selectedChallengeType,
            name: name,
            target: target,
            unit: this.challengeUnitSelect.value,
            category: this.challengeCategorySelect.value,
            icon: this.selectedChallengeIcon,
            color: this.selectedChallengeColor,
            resetPeriod: this.selectedChallengeType === 'custom' ? parseInt(this.challengePeriodInput.value) : null
        });

        this.hideCreateChallengeModal();
        this.renderChallenges();
    }

    // ==================== 日历视图 ====================

    showCalendarModal() {
        this.calendarCurrentDate = new Date();
        this.renderCalendar();
        this.calendarModal.classList.add('active');
    }

    hideCalendarModal() {
        this.calendarModal.classList.remove('active');
    }

    changeCalendarMonth(delta) {
        this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.calendarCurrentDate.getFullYear();
        const month = this.calendarCurrentDate.getMonth();

        this.calendarMonthTitle.textContent = `${year}年${month + 1}月`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const calendarData = this.usageStats.getCalendarData(year, month);

        let html = '';

        // 填充月初空白
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day inactive"></div>';
        }

        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayData = calendarData[day];
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            let classes = 'calendar-day';
            if (isToday) classes += ' today';

            if (dayData?.active) {
                const level = dayData.tasksCompleted >= 5 ? 3 : dayData.tasksCompleted >= 2 ? 2 : 1;
                classes += ` active-level-${level}`;
            }

            html += `<div class="${classes}">${day}</div>`;
        }

        this.calendarDaysGrid.innerHTML = html;
    }

    // ==================== 成就通知 ====================

    showAchievementNotification(achievement) {
        this.achievementIcon.textContent = achievement.icon;
        this.achievementName.textContent = achievement.name;

        this.achievementNotification.classList.add('show');

        setTimeout(() => {
            this.achievementNotification.classList.remove('show');
        }, 4000);
    }

    handleChallengeComplete(challenge) {
        // 可以在这里添加额外的完成处理逻辑
        this.renderChallenges();
    }

    // ==================== 活动记录集成 ====================

    recordTaskActivity() {
        const todayStats = this.usageStats.getTodayStats();
        const tasksCompleted = this.taskManager.getAllTasks().filter(t => t.status === 'completed').length - todayStats.tasksCompleted;

        if (tasksCompleted > 0) {
            this.usageStats.recordActivity({
                tasksCompleted: tasksCompleted,
                stepsCompleted: 0,
                timeSpent: 0
            });
            this.renderStreakDisplay();
        }
    }
}

// ==================== 应用初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
