package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/gin-gonic/gin"
)

const (
	RegisterShortRateLimitMark    = "REG_SHORT"
	RegisterDailyReqRateLimitMark = "REG_DAILY_REQ"
	RegisterDailySuccessMark      = "REG_SUCCESS_DAILY"
)

var (
	memoryDailySuccessMap  = make(map[string]int)
	memoryDailySuccessTime = make(map[string]time.Time)
	memoryDailySuccessLock sync.Mutex
)

// RecordIPRegistration 在用户注册成功后记录该 IP 的注册计数
func RecordIPRegistration(clientIP string) {
	if clientIP == "" {
		return
	}
	if common.RedisEnabled && common.RDB != nil {
		key := redisIPRateLimitKey(RegisterDailySuccessMark, clientIP)
		ctx := context.Background()
		count, err := common.RDB.Incr(ctx, key).Result()
		if err == nil && count == 1 {
			common.RDB.Expire(ctx, key, time.Duration(common.RegisterIPDailyDuration)*time.Second)
		}
	} else {
		memoryDailySuccessLock.Lock()
		defer memoryDailySuccessLock.Unlock()
		now := time.Now()
		if t, ok := memoryDailySuccessTime[clientIP]; ok && now.Sub(t) > time.Duration(common.RegisterIPDailyDuration)*time.Second {
			memoryDailySuccessMap[clientIP] = 0
		}
		memoryDailySuccessMap[clientIP]++
		memoryDailySuccessTime[clientIP] = now
	}
}

// getIPDailySuccessCount 获取该 IP 在每日窗口期内已成功注册的账号数量
func getIPDailySuccessCount(ctx context.Context, clientIP string) int {
	if clientIP == "" {
		return 0
	}
	if common.RedisEnabled && common.RDB != nil {
		key := redisIPRateLimitKey(RegisterDailySuccessMark, clientIP)
		val, err := common.RDB.Get(ctx, key).Int()
		if err != nil {
			return 0
		}
		return val
	}
	memoryDailySuccessLock.Lock()
	defer memoryDailySuccessLock.Unlock()
	now := time.Now()
	if t, ok := memoryDailySuccessTime[clientIP]; ok {
		if now.Sub(t) > time.Duration(common.RegisterIPDailyDuration)*time.Second {
			delete(memoryDailySuccessMap, clientIP)
			delete(memoryDailySuccessTime, clientIP)
			return 0
		}
		return memoryDailySuccessMap[clientIP]
	}
	return 0
}

func redisRegisterRateLimiter(c *gin.Context) {
	clientIP := c.ClientIP()
	ctx := c.Request.Context()

	// 1. 检查每日成功注册账号数限制
	dailySuccessCount := getIPDailySuccessCount(ctx, clientIP)
	if dailySuccessCount >= common.RegisterIPDailyLimit {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("该 IP 今日注册账号数量已达上限（每天最多 %d 个），请明天再试", common.RegisterIPDailyLimit),
		})
		c.Abort()
		return
	}

	// 2. 检查短时间频次限制（如60秒内最多2次）
	shortAllowed, _, shortTTL, err := redisFixedWindowTake(
		ctx,
		redisIPRateLimitKey(RegisterShortRateLimitMark, clientIP),
		common.RegisterIPShortLimit,
		common.RegisterIPShortDuration,
	)
	if err != nil {
		logger.LogError(ctx, fmt.Sprintf("register short rate limit error: %v", err))
		memoryRegisterRateLimiter(c)
		return
	}
	if !shortAllowed {
		waitSeconds := common.RegisterIPShortDuration
		if shortTTL > 0 {
			waitSeconds = shortTTL
		}
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("注册请求过于频繁，请等待 %d 秒后再试", waitSeconds),
		})
		c.Abort()
		return
	}

	// 3. 检查单日总请求次数（防止暴力破解/试探，最多20次）
	dailyAttemptsLimit := common.RegisterIPDailyLimit * 4
	if dailyAttemptsLimit < 20 {
		dailyAttemptsLimit = 20
	}
	dailyReqAllowed, _, _, err := redisFixedWindowTake(
		ctx,
		redisIPRateLimitKey(RegisterDailyReqRateLimitMark, clientIP),
		dailyAttemptsLimit,
		common.RegisterIPDailyDuration,
	)
	if err == nil && !dailyReqAllowed {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": "该 IP 今日注册尝试次数已达上限，请明天再试",
		})
		c.Abort()
		return
	}

	c.Next()
}

func memoryRegisterRateLimiter(c *gin.Context) {
	clientIP := c.ClientIP()

	// 1. 检查每日成功注册数
	dailySuccessCount := getIPDailySuccessCount(c.Request.Context(), clientIP)
	if dailySuccessCount >= common.RegisterIPDailyLimit {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("该 IP 今日注册账号数量已达上限（每天最多 %d 个），请明天再试", common.RegisterIPDailyLimit),
		})
		c.Abort()
		return
	}

	// 2. 短时间频次限制
	shortKey := RegisterShortRateLimitMark + ":" + clientIP
	if !inMemoryRateLimiter.Request(shortKey, common.RegisterIPShortLimit, common.RegisterIPShortDuration) {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("注册请求过于频繁，请等待 %d 秒后再试", common.RegisterIPShortDuration),
		})
		c.Abort()
		return
	}

	c.Next()
}

func RegisterRateLimit() gin.HandlerFunc {
	inMemoryRateLimiter.Init(common.RateLimitKeyExpirationDuration)
	return func(c *gin.Context) {
		if common.RedisEnabled {
			redisRegisterRateLimiter(c)
		} else {
			memoryRegisterRateLimiter(c)
		}
	}
}
