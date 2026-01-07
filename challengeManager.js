// 挑战管理器 - 打卡挑战功能

class ChallengeManager {
    constructor() {
        this.storageKey = 'plancoach_challenges';
        this.data = this.loadFromStorage();
        this.notificationManager = window.usageStats?.notificationManager || null;
    }

    // 从 localStorage 加载数据
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                // 检查并重置需要重置的挑战
                this._checkAndResetChallenges(parsed);
                return parsed;
            }
        } catch (e) {
            console.error('加载挑战数据失败:', e);
        }
        return this.getDefaultData();
    }

    // 获取默认数据
    getDefaultData() {
        return {
            active: [],
            completed: [],
            achievements: [],
            totalCreated: 0
        };
    }

    // 保存到 localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('保存挑战数据失败:', e);
        }
    }

    // 获取日期字符串
    getDateKey(timestamp = Date.now()) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 检查并重置挑战
    _checkAndResetChallenges(data) {
        const today = this.getDateKey();
        const yesterday = this.getDateKey(Date.now() - 86400000);

        data.active.forEach(challenge => {
            const lastReset = challenge.lastReset || today;

            // 检查是否需要重置
            let needsReset = false;

            if (challenge.type === 'daily' && lastReset !== today) {
                needsReset = true;
            } else if (challenge.type === 'weekly') {
                // 检查是否是新的一周（周一）
                const lastDate = new Date(lastReset);
                const currentDate = new Date(today);
                const lastDay = lastDate.getDay();
                const currentDay = currentDate.getDay();

                // 如果上次重置不是今天，且今天是周一
                if (lastReset !== today && currentDay === 1) {
                    needsReset = true;
                }
            } else if (challenge.type === 'custom' && challenge.resetPeriod) {
                // 自定义周期
                const daysDiff = Math.floor((new Date(today) - new Date(lastReset)) / (1000 * 60 * 60 * 24));
                if (daysDiff >= challenge.resetPeriod) {
                    needsReset = true;
                }
            }

            if (needsReset) {
                // 如果昨天没完成，重置连续天数
                if (!challenge.completedToday && lastReset !== today) {
                    challenge.streak = 0;
                }
                challenge.current = 0;
                challenge.completedToday = false;
                challenge.lastReset = today;
            }
        });
    }

    // 获取快捷挑战模板
    getQuickTemplates() {
        return [
            {
                type: 'daily',
                name: '每日学习',
                target: 30,
                unit: 'minutes',
                category: '学习',
                icon: '📚',
                color: '#7c5cff',
                description: '每天学习30分钟'
            },
            {
                type: 'daily',
                name: '每日任务',
                target: 3,
                unit: 'tasks',
                category: '工作',
                icon: '✅',
                color: '#10b981',
                description: '每天完成3个任务'
            },
            {
                type: 'weekly',
                name: '每周运动',
                target: 3,
                unit: 'times',
                category: '健康',
                icon: '🏃',
                color: '#f59e0b',
                description: '每周运动3次'
            },
            {
                type: 'daily',
                name: '早起打卡',
                target: 1,
                unit: 'checkin',
                category: '日常',
                icon: '🌅',
                color: '#ff7eb3',
                description: '每天早上8点前打卡'
            }
        ];
    }

    // 创建挑战
    createChallenge(config) {
        const challenge = {
            id: generateId(),
            type: config.type || 'daily',
            name: config.name,
            target: config.target,
            current: 0,
            unit: config.unit, // minutes, tasks, steps, times, checkin
            category: config.category || '日常',
            startDate: Date.now(),
            endDate: config.endDate || null,
            resetPeriod: config.resetPeriod || null, // 自定义周期（天）
            completedToday: false,
            streak: 0,
            icon: config.icon || '🎯',
            color: config.color || '#7c5cff',
            reminders: config.reminders || [],
            lastReset: this.getDateKey(),
            createdAt: Date.now(),
            // 任务关联字段
            matchMode: config.matchMode || 'all', // all, category, specific
            matchCategories: config.matchCategories || [], // category模式：匹配的分类列表
            matchTaskIds: config.matchTaskIds || [], // specific模式：匹配的任务ID
            matchTemplateIds: config.matchTemplateIds || [] // specific模式：匹配的模板ID
        };

        this.data.active.push(challenge);
        this.data.totalCreated++;
        this.saveToStorage();

        // 检查成就
        this._checkCreateAchievement();

        return challenge;
    }

    // 检查任务是否匹配挑战条件
    matchesTask(challenge, task) {
        // 单位不匹配直接返回 false
        if (challenge.unit !== 'tasks' && challenge.unit !== 'steps') {
            return false;
        }

        const matchMode = challenge.matchMode || 'all';

        switch (matchMode) {
            case 'all':
                // 全局匹配：所有任务都匹配
                return true;

            case 'category':
                // 分类匹配
                if (!challenge.matchCategories || challenge.matchCategories.length === 0) {
                    return true; // 空数组视为匹配所有
                }
                return task.category && challenge.matchCategories.includes(task.category);

            case 'specific':
                // 特定任务匹配
                const matchTaskIds = challenge.matchTaskIds || [];
                const matchTemplateIds = challenge.matchTemplateIds || [];

                if (matchTaskIds.length === 0 && matchTemplateIds.length === 0) {
                    return true; // 空配置视为匹配所有
                }

                // 检查任务ID或模板ID
                if (matchTaskIds.includes(task.id)) return true;
                if (task.templateId && matchTemplateIds.includes(task.templateId)) return true;

                return false;

            default:
                return true;
        }
    }

    // 获取匹配指定任务的挑战列表
    getMatchingChallenges(task, unit) {
        return this.data.active.filter(c =>
            c.unit === unit && this.matchesTask(c, task)
        );
    }

    // 更新挑战进度
    updateProgress(challengeId, increment = 1) {
        const challenge = this.data.active.find(c => c.id === challengeId);
        if (!challenge) {
            return { success: false, message: '挑战不存在' };
        }

        // 如果今天已完成，不再累加
        if (challenge.completedToday) {
            return {
                success: true,
                alreadyCompleted: true,
                challenge
            };
        }

        challenge.current = Math.min(challenge.current + increment, challenge.target);

        // 检查是否完成
        if (challenge.current >= challenge.target && !challenge.completedToday) {
            challenge.completedToday = true;
            challenge.streak++;

            // 发送完成通知
            this._notifyChallengeComplete(challenge);

            // 检查成就
            this._checkStreakAchievement(challenge.streak);

            this.saveToStorage();
            return {
                success: true,
                completed: true,
                challenge
            };
        }

        this.saveToStorage();
        return {
            success: true,
            completed: false,
            challenge
        };
    }

    // 手动打卡（用于早起打卡等）
    checkin(challengeId) {
        return this.updateProgress(challengeId, 1);
    }

    // 删除挑战
    deleteChallenge(challengeId) {
        const index = this.data.active.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            const challenge = this.data.active[index];
            this.data.active.splice(index, 1);

            // 移到已完成列表（带标记）
            this.data.completed.push({
                ...challenge,
                deletedAt: Date.now(),
                deleteReason: 'user_deleted'
            });

            this.saveToStorage();
            return { success: true };
        }
        return { success: false, message: '挑战不存在' };
    }

    // 编辑挑战
    updateChallenge(challengeId, updates) {
        const challenge = this.data.active.find(c => c.id === challengeId);
        if (!challenge) {
            return { success: false, message: '挑战不存在' };
        }

        // 只允许更新部分字段
        const allowedFields = ['name', 'target', 'icon', 'color', 'reminders', 'endDate', 'matchMode', 'matchCategories', 'matchTaskIds', 'matchTemplateIds'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                challenge[field] = updates[field];
            }
        });

        challenge.updatedAt = Date.now();
        this.saveToStorage();
        return { success: true, challenge };
    }

    // 获取活跃挑战
    getActiveChallenges() {
        return this.data.active;
    }

    // 获取今日挑战进度
    getTodayProgress() {
        const today = this.getDateKey();
        return this.data.active.map(challenge => ({
            ...challenge,
            progress: challenge.target > 0 ? (challenge.current / challenge.target) : 0,
            isCompleted: challenge.completedToday,
            needsReset: challenge.lastReset !== today
        }));
    }

    // 获取挑战统计
    getStats() {
        const activeCount = this.data.active.length;
        const completedToday = this.data.active.filter(c => c.completedToday).length;
        const longestStreak = Math.max(0, ...this.data.active.map(c => c.streak));

        return {
            activeCount,
            completedToday,
            totalCreated: this.data.totalCreated,
            longestStreak,
            achievementsUnlocked: this.data.achievements.length
        };
    }

    // 获取挑战历史
    getHistory() {
        return this.data.completed;
    }

    // 获取成就
    getAchievements() {
        return this.data.achievements;
    }

    // 通知挑战完成
    _notifyChallengeComplete(challenge) {
        if (this.notificationManager) {
            this.notificationManager.showChallengeComplete(challenge.name, challenge.streak);
        }

        // 应用内事件
        window.dispatchEvent(new CustomEvent('app:challenge-complete', {
            detail: { challenge }
        }));
    }

    // 检查创建成就
    _checkCreateAchievement() {
        if (this.data.totalCreated === 1 && !this._hasAchievement('first_challenge')) {
            this._unlockAchievement({
                id: 'first_challenge',
                name: '挑战发起者',
                icon: '🎯',
                description: '创建了第一个挑战'
            });
        }
    }

    // 检查连续成就
    _checkStreakAchievement(streak) {
        if (streak === 7 && !this._hasAchievement('week_warrior')) {
            this._unlockAchievement({
                id: 'week_warrior',
                name: '七日战士',
                icon: '🔥',
                description: '连续7天完成挑战'
            });
        }
    }

    // 检查是否已解锁成就
    _hasAchievement(achievementId) {
        return this.data.achievements.some(a => a.id === achievementId);
    }

    // 解锁���就
    _unlockAchievement(achievement) {
        this.data.achievements.push({
            ...achievement,
            unlockedAt: Date.now()
        });
        this.saveToStorage();

        // 应用内事件
        window.dispatchEvent(new CustomEvent('app:achievement-unlock', {
            detail: { achievement }
        }));
    }

    // 重置今日挑战状态（用于测试或特殊场景）
    resetTodayChallenges() {
        const today = this.getDateKey();
        this.data.active.forEach(challenge => {
            challenge.current = 0;
            challenge.completedToday = false;
            challenge.lastReset = today;
        });
        this.saveToStorage();
    }
}
