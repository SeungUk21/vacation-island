/**
 * 스테이지 데이터 관리 클래스
 * 스테이지의 목표, 보상, 장애물, 진행도 등을 관리
 */
class Stage {
    constructor(world, level, objectives, rewards, ticketCost = 1) {
        if (!world || !level) throw new Error('Stage: world, level은 필수입니다.');
        this.world = world;
        this.level = level;
        this.objectives = objectives || [];
        this.rewards = rewards || [];
        this.ticketCost = ticketCost;
        this.completed = false;
        this.progress = {};
        this.clearCondition = 'target';
        this.obstacles = [];
        this.boardSize = this.getBoardSize(level);
        this.startTime = Date.now();
        this.isCompleted = false;
        if (world === 1 && level >= 1 && level <= 5) {
            this.clearCondition = 'obstacles';
            this.initializeObstacles();
        }
    }

    /**
     * 스테이지별 보드 크기 반환
     */
    getBoardSize(level) {
        if (level === 1) return 5;
        if (level === 2 || level === 3) return 6;
        if (level === 4 || level === 5) return 7;
        return 5;
    }

    /**
     * 장애물 초기화
     */
    initializeObstacles() {
        const obstaclesByLevel = {
            1: [{ type: 'garbage', maxHp: 60, x: 2, y: 2 }],
            2: [
                { type: 'garbage', maxHp: 80, x: 2, y: 2 },
                { type: 'recycling', maxHp: 60, x: 3, y: 3 }
            ],
            3: [
                { type: 'big_garbage', maxHp: 120, x: 2, y: 1 },
                { type: 'garbage', maxHp: 80, x: 1, y: 3 },
                { type: 'compost', maxHp: 50, x: 4, y: 4 }
            ],
            4: [
                { type: 'toxic_garbage', maxHp: 150, x: 3, y: 3 },
                { type: 'big_garbage', maxHp: 120, x: 1, y: 1 },
                { type: 'big_garbage', maxHp: 120, x: 5, y: 5 },
                { type: 'garbage', maxHp: 80, x: 1, y: 5 }
            ],
            5: [
                { type: 'big_garbage', maxHp: 250, x: 3, y: 3 },
                { type: 'toxic_garbage', maxHp: 180, x: 1, y: 1 },
                { type: 'toxic_garbage', maxHp: 180, x: 5, y: 1 },
                { type: 'big_garbage', maxHp: 150, x: 1, y: 5 },
                { type: 'big_garbage', maxHp: 150, x: 5, y: 5 }
            ]
        };
        this.obstacles = obstaclesByLevel[this.level] || [];
    }

    /**
     * 목표 달성 여부 확인
     */
    checkCompletion() {
        if (this.clearCondition === 'obstacles') {
            return window.game && window.game.trashObstacles.length === 0;
        }
        return this.objectives.every(obj => {
            const key = `${obj.type}_${obj.resourceType}_${obj.resourceLevel}`;
            return (this.progress[key] || 0) >= obj.amount;
        });
    }

    /**
     * 진행도 업데이트
     */
    updateProgress(type, resourceType, resourceLevel, amount = 1) {
        if (!type || !resourceType || typeof resourceLevel !== 'number') return;
        const key = `${type}_${resourceType}_${resourceLevel}`;
        this.progress[key] = (this.progress[key] || 0) + amount;
    }

    /**
     * 스테이지 설명 반환
     */
    getDescription() {
        return (this.objectives || []).map(obj => {
            const resource = new Resource(obj.resourceType, obj.resourceLevel);
            return `${resource.getName()} ${obj.amount}개 생성`;
        }).join(', ');
    }

    /**
     * 스테이지 난이도 반환
     */
    getDifficulty() {
        return (this.level || 1) * (this.world || 1);
    }

    /**
     * 스테이지 보상 요약
     */
    getRewardSummary() {
        return (this.rewards || []).map(reward => {
            const icon = reward.type === 'coins' ? '💰' : reward.type === 'gems' ? '💎' : reward.type === 'experience' ? '⭐' : '🎁';
            return `${icon} ${reward.amount}`;
        }).join(' ');
    }

    /**
     * 스테이지 완료 처리
     */
    complete() {
        this.completed = true;
        this.isCompleted = true;
        this.completionTime = Date.now();
    }

    /**
     * 스테이지 재시작
     */
    reset() {
        this.completed = false;
        this.isCompleted = false;
        this.progress = {};
        this.startTime = Date.now();
        delete this.completionTime;
    }
}

// 전역으로 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Stage;
} else {
    window.Stage = Stage;
}
