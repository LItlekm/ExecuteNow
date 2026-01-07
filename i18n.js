// i18n - 国际化语言系统

const TRANSLATIONS = {
    zh: {
        // 应用标题
        app_title: '任务拆解助手',
        app_slogan: '把大任务拆成小步骤',

        // 主界面
        create_new_task: '创建新任务',
        use_template: '使用模板',
        my_tasks: '我的任务',
        tasks_count: '{count} 个任务',

        // 空状态
        empty_state_title: '还没有任务',
        empty_state_hint: '点击"创建新任务"开始吧',
        empty_state_created: '创建于',
        empty_state_completed: '已完成',

        // 任务状态
        status_in_progress: '进行中',
        status_completed: '已完成',
        status_shelved: '已搁置',

        // 任务卡片操作
        continue: '继续',
        view: '查看',
        delete: '删除',

        // 创建任务弹窗
        create_task_title: '创建任务',
        task_name_placeholder: '例如：读完一本书',
        task_name_hint: '任务名称',
        add_step: '添加步骤',
        step_placeholder: '例如：翻开第一页',
        steps_list: '步骤列表',
        steps_empty: '还没有添加步骤，按回车快速添加',
        at_least_one_step: '至少需要一个步骤',
        enter_task_name: '请输入任务名称',

        // 模板选择
        template_title: '选择模板',
        template_categories: {
            all: '全部',
            daily: '日常',
            work: '工作',
            study: '学习',
            health: '健康'
        },
        use_template: '使用模板',
        preview_template: '模板预览',
        cancel_use: '取消',
        confirm_use: '使用此模板',

        // 专注模式
        focus_step: '当前步骤',
        focus_step_num: '第 {current}/{total} 步',
        complete_step: '完成这一步',
        skip_step: '跳过这一步',
        shelve_task: '搁置任务',
        exit_focus: '退出',
        step_timer: '本步骤用时',
        total_time: '总用时',
        steps_completed: '已完成',

        // 搁置弹窗
        shelve_title: '搁置任务',
        shelve_reason_placeholder: '为什么要搁置这个任务？',
        shelve_hint: '搁置原因（可选）',
        cancel_shelve: '取消',
        confirm_shelve: '确认搁置',

        // 删除确认
        delete_confirm_title: '确认删除',
        delete_confirm_message: '删除后无法恢复',
        cancel_delete: '取消',
        confirm_delete: '确认删除',

        // 任务完成
        task_completed_title: '任务完成！',
        task_completed_message: '太棒了！你已经完成了所有步骤',
        total_time_spent: '总用时',
        back_to_home: '返回首页',
        create_another: '再创建一个',

        // 设置
        settings: '设置',
        default_coach: '默认教练',
        default_coach_hint: '创建任务时的默认教练',
        language: '语言',
        language_hint: '选择界面语言',
        language_zh: '中文',
        language_en: 'English',
        vibration: '完成震动反馈',
        vibration_hint: '完成步骤时震动提示',
        clear_data: '清除所有数据',
        clear_data_hint: '删除所有任务和设置',
        confirm_clear: '确认清除',

        // 教练名称
        coach_gentle: '温柔姐姐',
        coach_direct: '直接教练',
        coach_energetic: '元气少年',
        coach_calm: '冷静导师',

        // 连续天数显示
        streak_days: '连续使用',
        today_completed: '今日完成',
        longest_record: '最高记录',
        days: '天',
        freeze_token_hint: '冻龄符 - 保护连续不中断',

        // 挑战系统
        challenges_title: '今日挑战',
        create_challenge: '创建挑战',
        no_challenges: '还没有挑战',
        no_challenges_hint: '创建一个挑战，养成好习惯',

        // 挑战类型
        challenge_type_daily: '每日挑战',
        challenge_type_weekly: '每周挑战',
        challenge_type_custom: '自定义',

        // 挑战分类
        category_daily: '日常',
        category_study: '学习',
        category_work: '工作',
        category_health: '健康',
        category_sports: '运动',

        // 挑战单位
        unit_minutes: '分钟',
        unit_tasks: '任务',
        unit_steps: '步骤',
        unit_times: '次',
        unit_checkin: '打卡',
        count_unit_times: '次数',
        count_unit_minutes: '时间',

        // 创建挑战弹窗
        create_challenge_title: '创建挑战',
        challenge_type: '挑战类型',
        quick_template: '快捷模板',
        challenge_name: '挑战名称',
        challenge_name_placeholder: '例如：每日学习30分钟',
        target_value: '目标数值',
        target_placeholder: '30',
        category: '分类',
        select_icon: '选择图标',
        theme_color: '主题色',
        reset_period: '重置周期（天）',
        reset_period_hint: '设置每N天重置一次挑战进度',
        cancel: '取消',
        confirm: '创建挑战',

        // 挑战任务关联
        challenge_task_match: '任务关联',
        challenge_match_all: '全部任务',
        challenge_match_all_desc: '所有任务都计入此挑战',
        challenge_match_category: '按分类',
        challenge_match_category_desc: '只有指定分类的任务计入',
        challenge_match_specific: '指定模板',
        challenge_match_specific_desc: '只有选中的模板任务计入',
        select_categories: '选择分类（可多选）',
        select_templates: '选择模板',

        // 日历视图
        calendar_title: '连续记录',
        calendar_legend_low: '低活跃',
        calendar_legend_medium: '中活跃',
        calendar_legend_high: '高活跃',

        // 成就通知
        achievement_unlocked: '成就解锁！',

        // 成就展示
        achievements_title: '我的成就',
        achievements_unlocked: '已解锁',
        achievements_progress: '完成度',
        rarest_achievement: '最稀有',
        filter_by: '筛选：',
        filter_all: '全部',
        filter_unlocked: '已解锁',
        filter_locked: '未解锁',
        sort_by: '排序：',
        sort_category: '按类别',
        sort_rarity: '按稀有度',
        sort_time: '按解锁时间',
        no_achievements: '还没有解锁任何成就',
        no_achievements_hint: '继续使用应用来解锁成就吧！',

        // 通用
        confirm: '确认',
        cancel: '取消',
        resume: '恢复',
        pause: '暂停',
        next_step: '下一步',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        close: '关闭',

        // 便签功能
        add_note: '添加便签',
        note_title: '便签',
        note_placeholder: '记录你的想法...',
        notes_list_title: '步骤便签',
        notes_suffix: '条便签',
        no_notes: '还没有便签',
        just_now: '刚刚',
        minutes_ago: '分钟前',
        hours_ago: '小时前',

        // 表单验证
        required_field: '此字段为必填',
        invalid_value: '请输入有效的数值',

        // 自定义模板
        custom_templates: '自定义模板',
        preset_templates: '预设模板',
        my_templates: '我的模板',
        create_custom: '创建模板',
        import_template: '导入模板',
        template_name: '模板名称',
        template_icon: '图标',
        template_category: '分类',
        template_tags: '标签',
        template_description: '描述',
        template_steps: '模板步骤',
        add_tag: '添加标签',
        tag_placeholder: '标签名',
        no_custom_templates: '还没有自定义模板',
        no_custom_hint: '创建自己的模板或导入他人分享的模板',
        import_hint: '支持导入.json格式的模板文件',
        export_template: '导出模板',
        delete_template: '删除模板',
        confirm_delete_template: '确认删除此模板？',

        // 通知
        notification_permission_title: '启用通知',
        notification_permission_hint: '接收挑战提醒和连续天数警告',
        enable_notification: '启用通知',

        // 教练消息
        coach_messages: {
            gentle: {
                name: '温柔姐姐',
                description: '温暖鼓励，像姐姐一样关心你',
                messages: {
                    start: ['准备好了吗？我们一起开始吧~', '深呼吸，我们慢慢来~', '今天也要加油哦，我陪着你~'],
                    progress: ['做得很棒，继续保持~', '你很努力呢，再往前一步~', '就是这样，一步一步来~', '相信自己，你可以的~'],
                    complete: ['太棒了！这一步完成啦~', '好厉害！又前进了一步~', '完成得很好呢~', '真不错，继续加油~'],
                    finish: ['恭喜你完成了所有步骤！太厉害了~', '全部完成啦！你真的很棒~', '辛苦了，好好休息一下吧~'],
                    skip: ['没关系，跳过这一步也可以~', '有时候跳过也是一种选择~'],
                    shelve: ['好的，先放一放也没关系~', '休息一下，等准备好了再继续~']
                }
            },
            direct: {
                name: '直接教练',
                description: '简洁干脆，不废话',
                messages: {
                    start: ['开始。', '准备好了，开始吧。', '行动。'],
                    progress: ['继续。', '下一步。', '保持。', '往前走。'],
                    complete: ['完成。', '搞定。', '下一个。', 'OK。'],
                    finish: ['全部完成。做得不错。', '任务结束。', '完成了。'],
                    skip: ['跳过。', '略过这步。'],
                    shelve: ['暂停。', '先放着。']
                }
            },
            energetic: {
                name: '元气少年',
                description: '热血激励，充满能量',
                messages: {
                    start: ['冲冲冲！我们开始啦！', '准备好了吗？出发！', '今天也要元气满满！GO！'],
                    progress: ['太强了！继续冲！', '就是这样！超级棒！', '哇！你太厉害了！', '冲啊！马上就完成了！'],
                    complete: ['耶！搞定这一步！', '太帅了！完美！', '哦耶！又完成一个！', 'Nice！继续冲！'],
                    finish: ['太强了！！全部完成！你是最棒的！', '哇塞！完美通关！给你点赞！', '超级厉害！今天的目标达成！'],
                    skip: ['没事没事！跳过就跳过！', '战略性跳过！'],
                    shelve: ['休息一下也行！等会继续冲！', '好的！养精蓄锐！']
                }
            },
            calm: {
                name: '冷静导师',
                description: '理性分析，沉稳指导',
                messages: {
                    start: ['让我们专注于当下，开始第一步。', '一步一步来，不必着急。', '集中注意力，我们开始。'],
                    progress: ['保持专注，继续前进。', '很好，节奏很稳。', '专注当下这一步。', '不要想太多，做好眼前的事。'],
                    complete: ['这一步完成了，进入下一步。', '稳步推进，很好。', '完成，继续。', '进展顺利。'],
                    finish: ['全部完成。你做到了。', '任务完成。这是你专注的结果。', '很好，今天的目标已经达成。'],
                    skip: ['有时跳过也是明智的选择。', '可以。继续下一步。'],
                    shelve: ['暂时搁置，适当的休息也很重要。', '可以。准备好了再继续。']
                }
            }
        }
    },

    en: {
        // App Title
        app_title: 'Task Breakdown Coach',
        app_slogan: 'Break big tasks into small steps',

        // Main Interface
        create_new_task: 'Create New Task',
        use_template: 'Use Template',
        my_tasks: 'My Tasks',
        tasks_count: '{count} tasks',

        // Empty State
        empty_state_title: 'No tasks yet',
        empty_state_hint: 'Click "Create New Task" to start',
        empty_state_created: 'Created',
        empty_state_completed: 'Completed',

        // Task Status
        status_in_progress: 'In Progress',
        status_completed: 'Completed',
        status_shelved: 'Shelved',

        // Task Card Actions
        continue: 'Continue',
        view: 'View',
        delete: 'Delete',

        // Create Task Modal
        create_task_title: 'Create Task',
        task_name_placeholder: 'e.g., Read a book',
        task_name_hint: 'Task name',
        add_step: 'Add Step',
        step_placeholder: 'e.g., Open to the first page',
        steps_list: 'Steps',
        steps_empty: 'No steps yet. Press Enter to add quickly',
        at_least_one_step: 'At least one step is required',
        enter_task_name: 'Please enter a task name',

        // Template Selection
        template_title: 'Select Template',
        template_categories: {
            all: 'All',
            daily: 'Daily',
            work: 'Work',
            study: 'Study',
            health: 'Health'
        },
        use_template: 'Use Template',
        preview_template: 'Template Preview',
        cancel_use: 'Cancel',
        confirm_use: 'Use This Template',

        // Focus Mode
        focus_step: 'Current Step',
        focus_step_num: 'Step {current}/{total}',
        complete_step: 'Complete Step',
        skip_step: 'Skip Step',
        shelve_task: 'Shelve Task',
        exit_focus: 'Exit',
        step_timer: 'Step Time',
        total_time: 'Total Time',
        steps_completed: 'Completed',

        // Shelve Modal
        shelve_title: 'Shelve Task',
        shelve_reason_placeholder: 'Why are you shelving this task?',
        shelve_hint: 'Reason (optional)',
        cancel_shelve: 'Cancel',
        confirm_shelve: 'Confirm Shelve',

        // Delete Confirmation
        delete_confirm_title: 'Confirm Delete',
        delete_confirm_message: 'This action cannot be undone',
        cancel_delete: 'Cancel',
        confirm_delete: 'Confirm Delete',

        // Task Completion
        task_completed_title: 'Task Completed!',
        task_completed_message: 'Amazing! You have completed all steps',
        total_time_spent: 'Total Time',
        back_to_home: 'Back Home',
        create_another: 'Create Another',

        // Settings
        settings: 'Settings',
        default_coach: 'Default Coach',
        default_coach_hint: 'Default coach for new tasks',
        language: 'Language',
        language_hint: 'Select interface language',
        language_zh: '中文',
        language_en: 'English',
        vibration: 'Vibration',
        vibration_hint: 'Vibrate when completing steps',
        clear_data: 'Clear All Data',
        clear_data_hint: 'Delete all tasks and settings',
        confirm_clear: 'Confirm Clear',

        // Coach Names
        coach_gentle: 'Gentle Sister',
        coach_direct: 'Direct Coach',
        coach_energetic: 'Energetic Youth',
        coach_calm: 'Calm Mentor',

        // Streak Display
        streak_days: 'Streak',
        today_completed: 'Today',
        longest_record: 'Best',
        days: 'days',
        freeze_token_hint: 'Freeze Token - Protect your streak',

        // Challenges
        challenges_title: "Today's Challenges",
        create_challenge: 'Create Challenge',
        no_challenges: 'No challenges yet',
        no_challenges_hint: 'Create a challenge to build habits',

        // Challenge Types
        challenge_type_daily: 'Daily',
        challenge_type_weekly: 'Weekly',
        challenge_type_custom: 'Custom',

        // Challenge Categories
        category_daily: 'Daily',
        category_study: 'Study',
        category_work: 'Work',
        category_health: 'Health',
        category_sports: 'Sports',

        // Challenge Units
        unit_minutes: 'minutes',
        unit_tasks: 'tasks',
        unit_steps: 'steps',
        unit_times: 'times',
        unit_checkin: 'check-in',
        count_unit_times: 'times',
        count_unit_minutes: 'time',

        // Create Challenge Modal
        create_challenge_title: 'Create Challenge',
        challenge_type: 'Challenge Type',
        quick_template: 'Quick Template',
        challenge_name: 'Challenge Name',
        challenge_name_placeholder: 'e.g., Study 30 min daily',
        target_value: 'Target Value',
        target_placeholder: '30',
        category: 'Category',
        select_icon: 'Select Icon',
        theme_color: 'Theme Color',
        reset_period: 'Reset Period (days)',
        reset_period_hint: 'Reset challenge every N days',
        cancel: 'Cancel',
        confirm: 'Create',

        // Challenge Task Matching
        challenge_task_match: 'Task Matching',
        challenge_match_all: 'All Tasks',
        challenge_match_all_desc: 'All tasks count towards this challenge',
        challenge_match_category: 'By Category',
        challenge_match_category_desc: 'Only tasks in selected categories count',
        challenge_match_specific: 'Specific Templates',
        challenge_match_specific_desc: 'Only tasks from selected templates count',
        select_categories: 'Select Categories (multiple)',
        select_templates: 'Select Templates',

        // Calendar View
        calendar_title: 'Activity Calendar',
        calendar_legend_low: 'Low',
        calendar_legend_medium: 'Medium',
        calendar_legend_high: 'High',

        // Achievement Notification
        achievement_unlocked: 'Achievement Unlocked!',

        // Achievements Display
        achievements_title: 'My Achievements',
        achievements_unlocked: 'Unlocked',
        achievements_progress: 'Progress',
        rarest_achievement: 'Rarest',
        filter_by: 'Filter:',
        filter_all: 'All',
        filter_unlocked: 'Unlocked',
        filter_locked: 'Locked',
        sort_by: 'Sort:',
        sort_category: 'By Category',
        sort_rarity: 'By Rarity',
        sort_time: 'By Time',
        no_achievements: 'No achievements unlocked yet',
        no_achievements_hint: 'Keep using the app to unlock achievements!',

        // Common
        confirm: 'Confirm',
        cancel: 'Cancel',
        resume: 'Resume',
        pause: 'Pause',
        next_step: 'Next Step',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',

        // Notes Feature
        add_note: 'Add Note',
        note_title: 'Note',
        note_placeholder: 'Write your thoughts...',
        notes_list_title: 'Step Notes',
        notes_suffix: 'notes',
        no_notes: 'No notes yet',
        just_now: 'Just now',
        minutes_ago: 'min ago',
        hours_ago: 'h ago',

        // Form Validation
        required_field: 'This field is required',
        invalid_value: 'Please enter a valid value',

        // Custom Templates
        custom_templates: 'Custom Templates',
        preset_templates: 'Preset Templates',
        my_templates: 'My Templates',
        create_custom: 'Create Template',
        import_template: 'Import',
        template_name: 'Template Name',
        template_icon: 'Icon',
        template_category: 'Category',
        template_tags: 'Tags',
        template_description: 'Description',
        template_steps: 'Template Steps',
        add_tag: 'Add Tag',
        tag_placeholder: 'Tag name',
        no_custom_templates: 'No custom templates yet',
        no_custom_hint: 'Create your own template or import shared ones',
        import_hint: 'Support importing .json format template files',
        export_template: 'Export',
        delete_template: 'Delete',
        confirm_delete_template: 'Confirm delete this template?',

        // Notifications
        notification_permission_title: 'Enable Notifications',
        notification_permission_hint: 'Receive challenge reminders and streak warnings',
        enable_notification: 'Enable',

        // Coach Messages
        coach_messages: {
            gentle: {
                name: 'Gentle Sister',
                description: 'Warm encouragement, caring like a sister',
                messages: {
                    start: ['Ready? Let us begin together~', 'Take a deep breath, let us take it slow~', 'Let us do our best today, I am with you~'],
                    progress: ['Great job, keep it up~', 'You are working hard, take one more step~', 'That is it, step by step~', 'Believe in yourself, you can do it~'],
                    complete: ['Awesome! This step is done~', 'Great! Another step forward~', 'Well done~', 'Nice one, keep going~'],
                    finish: ['Congratulations! You completed all steps! Amazing~', 'All done! You are awesome~', 'Good job, take a nice rest~'],
                    skip: ['It is okay, skipping this step is fine~', 'Sometimes skipping is also a choice~'],
                    shelve: ['Okay, it is fine to put it aside for now~', 'Take a rest, continue when you are ready~']
                }
            },
            direct: {
                name: 'Direct Coach',
                description: 'Simple and straightforward',
                messages: {
                    start: ['Start.', 'Ready, begin.', 'Action.'],
                    progress: ['Continue.', 'Next step.', 'Keep going.', 'Move forward.'],
                    complete: ['Done.', 'Got it.', 'Next.', 'OK.'],
                    finish: ['All complete. Well done.', 'Task finished.', 'Completed.'],
                    skip: ['Skip.', 'Skip this step.'],
                    shelve: ['Pause.', 'Set aside.']
                }
            },
            energetic: {
                name: 'Energetic Youth',
                description: 'Passionate motivation, full of energy',
                messages: {
                    start: ['Let us go! Starting now!', 'Ready? Go!', 'Full energy today! GO!'],
                    progress: ['Too strong! Keep going!', 'That is it! Super awesome!', 'Wow! You are amazing!', 'Go! Almost done!'],
                    complete: ['Yeah! Got this step!', 'So cool! Perfect!', 'Yay! Another one done!', 'Nice! Keep going!'],
                    finish: ['Too strong!! All complete! You are the best!', 'Wow! Perfect clear! Giving you a like!', 'Super amazing! Today is goal achieved!'],
                    skip: ['It is okay! Just skip!', 'Strategic skip!'],
                    shelve: ['Taking a rest is fine too! Continue later!', 'Okay! Recharge!']
                }
            },
            calm: {
                name: 'Calm Mentor',
                description: 'Rational analysis, steady guidance',
                messages: {
                    start: ['Let us focus on the present, start step one.', 'Step by step, no need to rush.', 'Focus, we begin.'],
                    progress: ['Stay focused, keep moving.', 'Very good, steady pace.', 'Focus on this step.', 'Do not overthink, do what is in front of you.'],
                    complete: ['This step done, moving to next.', 'Steady progress, very good.', 'Done, continue.', 'Going smoothly.'],
                    finish: ['All complete. You did it.', 'Task finished. This is the result of your focus.', 'Very good, today is goal achieved.'],
                    skip: ['Sometimes skipping is also a wise choice.', 'OK. Continue to next step.'],
                    shelve: ['Temporarily shelve, proper rest is also important.', 'OK. Continue when ready.']
                }
            }
        }
    }
};

// i18n 类
class I18n {
    constructor() {
        this.currentLang = 'zh';
        this.storageKey = 'plancoach_language';
        this.listeners = [];
        this.load();
    }

    // 从 localStorage 加载
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved && (saved === 'zh' || saved === 'en')) {
                this.currentLang = saved;
            }
        } catch (e) {
            console.error('Failed to load language setting:', e);
        }
    }

    // 保存到 localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, this.currentLang);
        } catch (e) {
            console.error('Failed to save language setting:', e);
        }
    }

    // 设置语言
    set(lang) {
        if (TRANSLATIONS[lang]) {
            this.currentLang = lang;
            this.save();
            this.notifyListeners();
        }
    }

    // 获取当前语言
    get() {
        return this.currentLang;
    }

    // 获取翻译文本
    t(key, params = {}) {
        const keys = key.split('.');
        let value = TRANSLATIONS[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                value = key;
                break;
            }
        }

        if (typeof value !== 'string') {
            return key;
        }

        // 替换参数
        if (params) {
            for (const [param, replacement] of Object.entries(params)) {
                value = value.replace(`{${param}}`, replacement);
            }
        }

        return value;
    }

    // 获取翻译（别名方法）
    translate(key, params) {
        return this.t(key, params);
    }

    // 检查是否为英文
    isEnglish() {
        return this.currentLang === 'en';
    }

    // 检查是否为中文
    isChinese() {
        return this.currentLang === 'zh';
    }

    // 添加语言变化监听器
    onChange(callback) {
        this.listeners.push(callback);
    }

    // 通知所有监听器
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentLang));
    }

    // 获取教练翻译数据
    getCoachData(coachId) {
        const coachKey = `coach_messages.${coachId}`;
        return {
            name: this.t(`${coachKey}.name`),
            description: this.t(`${coachKey}.description`),
            messages: TRANSLATIONS[this.currentLang].coach_messages[coachId].messages
        };
    }

    // 获取模板分类翻译
    getCategoryTranslation(category) {
        const key = `template_categories.${category.toLowerCase()}`;
        const result = this.t(key);
        // 如果翻译和key相同，说明没有找到翻译，返回原始值
        return result === key ? category : result;
    }

    // 获取所有教练数据（带翻译）
    getAllCoaches() {
        const coaches = ['gentle', 'direct', 'energetic', 'calm'];
        return coaches.map(id => ({
            id,
            ...this.getCoachData(id)
        }));
    }
}

// 创建全局实例
const i18n = new I18n();

// Expose i18n for browser (classic <script> usage)
if (typeof window !== 'undefined') {
    window.i18n = i18n;
    window.TRANSLATIONS = TRANSLATIONS;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, i18n, TRANSLATIONS };
}
