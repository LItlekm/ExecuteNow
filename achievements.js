// 成就系统配置

const ACHIEVEMENTS_CONFIG = {
    // 连续使用成就
    streak: {
        'streak_3': {
            id: 'streak_3',
            name: '初出茅庐',
            icon: '🌱',
            description: '连续使用3天',
            category: '连续',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'streak_7': {
            id: 'streak_7',
            name: '周常选手',
            icon: '⭐',
            description: '连续使用7天',
            category: '连续',
            rarity: 'common',
            reward: { type: 'freeze', count: 1 }
        },
        'streak_14': {
            id: 'streak_14',
            name: '双周达人',
            icon: '✨',
            description: '连续使用14天',
            category: '连续',
            rarity: 'rare',
            reward: { type: 'freeze', count: 1 }
        },
        'streak_30': {
            id: 'streak_30',
            name: '月度达人',
            icon: '🏆',
            description: '连续使用30天',
            category: '连续',
            rarity: 'epic',
            reward: { type: 'freeze', count: 2 }
        },
        'streak_60': {
            id: 'streak_60',
            name: '两月坚持',
            icon: '💪',
            description: '连续使用60天',
            category: '连续',
            rarity: 'epic',
            reward: { type: 'freeze', count: 3 }
        },
        'streak_100': {
            id: 'streak_100',
            name: '百日坚持',
            icon: '💎',
            description: '连续使用100天',
            category: '连续',
            rarity: 'legendary',
            reward: { type: 'freeze', count: 5 }
        },
        'streak_365': {
            id: 'streak_365',
            name: '年度传奇',
            icon: '👑',
            description: '连续使用365天',
            category: '连续',
            rarity: 'legendary',
            reward: { type: 'freeze', count: 10 }
        }
    },

    // 任务完成成就
    tasks: {
        'tasks_10': {
            id: 'tasks_10',
            name: '任务新手',
            icon: '📝',
            description: '完成10个任务',
            category: '任务',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'tasks_50': {
            id: 'tasks_50',
            name: '任务能手',
            icon: '📋',
            description: '完成50个任务',
            category: '任务',
            rarity: 'rare',
            reward: { type: 'freeze', count: 1 }
        },
        'tasks_100': {
            id: 'tasks_100',
            name: '任务专家',
            icon: '📚',
            description: '完成100个任务',
            category: '任务',
            rarity: 'epic',
            reward: { type: 'freeze', count: 2 }
        },
        'tasks_500': {
            id: 'tasks_500',
            name: '任务大师',
            icon: '🎓',
            description: '完成500个任务',
            category: '任务',
            rarity: 'legendary',
            reward: { type: 'freeze', count: 5 }
        }
    },

    // 挑战成就
    challenges: {
        'first_challenge': {
            id: 'first_challenge',
            name: '挑战发起者',
            icon: '🎯',
            description: '创建第一个挑战',
            category: '挑战',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'week_warrior': {
            id: 'week_warrior',
            name: '七日战士',
            icon: '🔥',
            description: '连续7天完成挑战',
            category: '挑战',
            rarity: 'rare',
            reward: { type: 'freeze', count: 2 }
        },
        'month_master': {
            id: 'month_master',
            name: '月度冠军',
            icon: '🏅',
            description: '连续30天完成挑战',
            category: '挑战',
            rarity: 'epic',
            reward: { type: 'freeze', count: 3 }
        },
        'five_challenges': {
            id: 'five_challenges',
            name: '挑战达人',
            icon: '🎪',
            description: '同时进行5个挑战',
            category: '挑战',
            rarity: 'rare',
            reward: { type: 'freeze', count: 1 }
        }
    },

    // 特殊成就
    special: {
        'perfect_day': {
            id: 'perfect_day',
            name: '完美一天',
            icon: '⭐',
            description: '单日完成所有挑战',
            category: '特殊',
            rarity: 'rare',
            reward: { type: 'freeze', count: 1 }
        },
        'night_owl': {
            id: 'night_owl',
            name: '夜猫子',
            icon: '🦉',
            description: '在晚上11点后完成任务',
            category: '特殊',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'early_bird': {
            id: 'early_bird',
            name: '早起鸟',
            icon: '🐦',
            description: '在早上6点前完成任务',
            category: '特殊',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'freeze_saver': {
            id: 'freeze_saver',
            name: '守护者',
            icon: '❄️',
            description: '使用冻龄符保护连续天数',
            category: '特殊',
            rarity: 'common',
            reward: { type: 'none' }
        },
        'comeback': {
            id: 'comeback',
            name: '王者归来',
            icon: '🔄',
            description: '中断后重新开始并达到7天连续',
            category: '特殊',
            rarity: 'rare',
            reward: { type: 'freeze', count: 1 }
        }
    }
};

// 成就稀有度配置
const ACHIEVEMENT_RARITY = {
    common: {
        name: '普通',
        color: '#9ca3af',
        bgColor: 'rgba(156, 163, 175, 0.1)'
    },
    rare: {
        name: '稀有',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    epic: {
        name: '史诗',
        color: '#a855f7',
        bgColor: 'rgba(168, 85, 247, 0.1)'
    },
    legendary: {
        name: '传说',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)'
    }
};

// 获取所有成就列表
function getAllAchievements() {
    const all = [];
    Object.values(ACHIEVEMENTS_CONFIG).forEach(category => {
        Object.values(category).forEach(achievement => {
            all.push(achievement);
        });
    });
    return all;
}

// 按类别获取成就
function getAchievementsByCategory(category) {
    return ACHIEVEMENTS_CONFIG[category] || {};
}

// 根据ID获取成就
function getAchievementById(id) {
    for (const category of Object.values(ACHIEVEMENTS_CONFIG)) {
        if (category[id]) {
            return category[id];
        }
    }
    return null;
}

// 获取成就稀有度信息
function getRarityInfo(rarity) {
    return ACHIEVEMENT_RARITY[rarity] || ACHIEVEMENT_RARITY.common;
}

// 计算成就进度（用于显示进度条）
function getAchievementProgress(achievementId, currentValue) {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return null;

    // 从描述中提取目标值
    const match = achievement.description.match(/(\d+)/);
    if (!match) return { current: currentValue, target: 1, progress: 1 };

    const target = parseInt(match[1]);
    return {
        current: currentValue,
        target: target,
        progress: Math.min(currentValue / target, 1)
    };
}
