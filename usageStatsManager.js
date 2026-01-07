// 使用统计管理器 - 连续天数统计功能

class UsageStatsManager {
    constructor() {
        this.storageKey = 'plancoach_usage_stats';
        this.stats = this.loadFromStorage();
        this.notificationManager = new NotificationManager();
    }

    // 从 localStorage 加载数据
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('加载使用统计数据失败:', e);
        }
        return this.getDefaultStats();
    }

    // 获取默认统计数据
    getDefaultStats() {
        return {
            lastActiveDate: null,
            currentStreak: 0,
            longestStreak: 0,
            totalActiveDays: 0,
            dailyRecord: {},
            streakFrozen: false,
            freezeStreak: 0
        };
    }

    // 保存到 localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
        } catch (e) {
            console.error('保存使用统计数据失败:', e);
        }
    }

    // 获取日期字符串 (YYYY-MM-DD)
    getDateKey(timestamp = Date.now()) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 记录活动
    recordActivity(activityData) {
        const today = this.getDateKey();
        const isNewDay = this.stats.lastActiveDate !== today;

        if (isNewDay) {
            this._updateStreak(today);
        }

        this._updateDailyRecord(today, activityData);
        this.saveToStorage();

        // 检查成就
        this._checkStreakAchievements();

        return {
            isNewDay,
            currentStreak: this.stats.currentStreak,
            longestStreak: this.stats.longestStreak
        };
    }

    // 更新连续天数
    _updateStreak(today) {
        const yesterday = this.getDateKey(Date.now() - 86400000);
        const todayTimestamp = Date.now();
        const yesterdayTimestamp = todayTimestamp - 86400000;

        // 检查是否使用了冻龄符
        if (this.stats.streakFrozen) {
            this.stats.currentStreak++;
            this.stats.streakFrozen = false;
            this.stats.lastActiveDate = today;
            return;
        }

        // 检查是否是连续的
        if (this.stats.lastActiveDate === yesterday) {
            // 连续
            this.stats.currentStreak++;

            // 检查是否获得冻龄符奖励（每7天）
            if (this.stats.currentStreak > 0 && this.stats.currentStreak % 7 === 0) {
                this.stats.freezeStreak++;
                this._showFreezeReward();
            }
        } else if (this.stats.lastActiveDate === null) {
            // 第一次使用
            this.stats.currentStreak = 1;
        } else {
            // 连续中断
            this.stats.currentStreak = 1;
        }

        // 更新最高连续天数
        if (this.stats.currentStreak > this.stats.longestStreak) {
            this.stats.longestStreak = this.stats.currentStreak;
        }

        // 更新总活跃天数
        if (!this.stats.dailyRecord[today]) {
            this.stats.totalActiveDays++;
        }

        this.stats.lastActiveDate = today;
    }

    // 更新每日记录
    _updateDailyRecord(today, activityData) {
        if (!this.stats.dailyRecord[today]) {
            this.stats.dailyRecord[today] = {
                tasksCompleted: 0,
                stepsCompleted: 0,
                timeSpent: 0,
                checkinsCompleted: 0
            };
        }

        const record = this.stats.dailyRecord[today];
        if (activityData.tasksCompleted) {
            record.tasksCompleted += activityData.tasksCompleted;
        }
        if (activityData.stepsCompleted) {
            record.stepsCompleted += activityData.stepsCompleted;
        }
        if (activityData.timeSpent) {
            record.timeSpent += activityData.timeSpent;
        }
        if (activityData.checkinsCompleted !== undefined) {
            record.checkinsCompleted += activityData.checkinsCompleted;
        }
    }

    // 检查连续成就
    _checkStreakAchievements() {
        const streak = this.stats.currentStreak;
        const achievementKey = `streak_${streak}`;

        // 检查是否需要解锁成就
        if ([3, 7, 30, 100].includes(streak)) {
            this._unlockAchievement(achievementKey, streak);
        }
    }

    // 解锁成就
    _unlockAchievement(key, streak) {
        const unlockedKey = `unlocked_${key}`;
        if (this.stats[unlockedKey]) return; // 已解锁

        this.stats[unlockedKey] = true;
        this.saveToStorage();

        const achievements = {
            3: { name: '初出茅庐', icon: '🌱', description: '连续使用3天' },
            7: { name: '周常选手', icon: '⭐', description: '连续使用7天' },
            30: { name: '月度达人', icon: '🏆', description: '连续使用30天' },
            100: { name: '百日坚持', icon: '💎', description: '连续使用100天' }
        };

        const achievement = achievements[streak];
        if (achievement) {
            this._showAchievementNotification(achievement);
        }
    }

    // 显示成就通知
    _showAchievementNotification(achievement) {
        this.notificationManager.showAchievement(achievement);
    }

    // 显示冻龄符奖励通知
    _showFreezeReward() {
        this.notificationManager.showFreezeReward();
    }

    // 冻结连续（使用冻龄符）
    freezeStreak() {
        if (this.stats.freezeStreak > 0 && !this.stats.streakFrozen) {
            this.stats.streakFrozen = true;
            this.stats.freezeStreak--;
            this.saveToStorage();
            return { success: true, remaining: this.stats.freezeStreak };
        }
        return { success: false, message: this.stats.streakFrozen ? '已使用冻龄符' : '没有可用的冻龄符' };
    }

    // 检查是否即将中断连续（今日尚未活跃）
    isStreakAtRisk() {
        const today = this.getDateKey();
        return this.stats.lastActiveDate !== today &&
               this.stats.lastActiveDate !== null &&
               this.stats.currentStreak > 0;
    }

    // 获取今日统计
    getTodayStats() {
        const today = this.getDateKey();
        const record = this.stats.dailyRecord[today] || {
            tasksCompleted: 0,
            stepsCompleted: 0,
            timeSpent: 0,
            checkinsCompleted: 0
        };

        return {
            ...record,
            isActive: this.stats.lastActiveDate === today
        };
    }

    // 获取本周统计
    getWeekStats() {
        const stats = {
            tasksCompleted: 0,
            stepsCompleted: 0,
            timeSpent: 0,
            activeDays: 0
        };

        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        for (let d = new Date(weekAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateKey = this.getDateKey(d.getTime());
            const record = this.stats.dailyRecord[dateKey];
            if (record) {
                stats.tasksCompleted += record.tasksCompleted;
                stats.stepsCompleted += record.stepsCompleted;
                stats.timeSpent += record.timeSpent;
                stats.activeDays++;
            }
        }

        return stats;
    }

    // 获取连续天数摘要
    getStreakSummary() {
        return {
            current: this.stats.currentStreak,
            longest: this.stats.longestStreak,
            total: this.stats.totalActiveDays,
            freezeStreak: this.stats.freezeStreak,
            isFrozen: this.stats.streakFrozen,
            atRisk: this.isStreakAtRisk()
        };
    }

    // 获取日历数据（用于日历视图）
    getCalendarData(year, month) {
        const calendarData = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = this.stats.dailyRecord[dateKey];

            calendarData[day] = record ? {
                active: true,
                tasksCompleted: record.tasksCompleted,
                stepsCompleted: record.stepsCompleted
            } : {
                active: false
            };
        }

        return calendarData;
    }
}

// 通知管理器
class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.checkPermission();
    }

    // 检查通知权限
    async checkPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.permission = 'granted';
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                this.permission = permission;
            }
        }
    }

    // 请求通知权限
    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }
        return false;
    }

    // 显示成就通知
    showAchievement(achievement) {
        // 浏览器通知
        if (this.permission === 'granted') {
            new Notification('🏆 成就解锁！', {
                body: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
            });
        }

        // 应用内通知（通过事件）
        this.dispatchEvent('achievement', achievement);
    }

    // 显示冻龄符奖励通知
    showFreezeReward() {
        if (this.permission === 'granted') {
            new Notification('❄️ 冻龄符获取！', {
                body: '恭喜！你获得了一个冻龄符\n可以保护你的连续天数不中断',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">❄️</text></svg>'
            });
        }

        this.dispatchEvent('freeze-reward', { count: 1 });
    }

    // 显示连续中断警告
    showStreakWarning(currentStreak) {
        if (this.permission === 'granted') {
            new Notification('⚠️ 连续即将中断！', {
                body: `你已连续使用 ${currentStreak} 天\n快来完成一个任务保持连续吧！`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔥</text></svg>',
                tag: 'streak-warning'
            });
        }

        this.dispatchEvent('streak-warning', { currentStreak });
    }

    // 显示每日打卡提醒
    showDailyReminder() {
        if (this.permission === 'granted') {
            new Notification('📅 每日打卡提醒', {
                body: '今天还没有完成任何任务哦\n快来开始你的第一个任务吧！',
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📅</text></svg>',
                tag: 'daily-reminder'
            });
        }

        this.dispatchEvent('daily-reminder', {});
    }

    // 显示挑战完成通知
    showChallengeComplete(challengeName, streak) {
        if (this.permission === 'granted') {
            new Notification('🎉 挑战完成！', {
                body: `${challengeName}\n连续完成 ${streak} 天！`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎉</text></svg>'
            });
        }

        this.dispatchEvent('challenge-complete', { name: challengeName, streak });
    }

    // 派发应用内事件
    dispatchEvent(type, data) {
        const event = new CustomEvent(`app:${type}`, { detail: data });
        window.dispatchEvent(event);
    }
}
