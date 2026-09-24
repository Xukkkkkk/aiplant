package middleware

import (
	"fmt"
	"net/http"

	"github.com/QuantumNous/new-api/common"

	"github.com/gin-gonic/gin"
)

const (
	EmailVerificationRateLimitMark      = "EV"
	EmailVerificationMaxRequests        = 2     // 60秒内最多2次
	EmailVerificationDuration           = 60    // 60秒时间窗口
	EmailVerificationDailyRateLimitMark = "EV_DAILY"
	EmailVerificationDailyMaxRequests   = 10    // 24小时内最多10次
	EmailVerificationDailyDuration      = 86400 // 24小时时间窗口
)

func redisEmailVerificationRateLimiter(c *gin.Context) {
	ctx := c.Request.Context()
	clientIP := c.ClientIP()

	// 1. 检查每日验证码发送次数上限
	dailyAllowed, _, _, err := redisFixedWindowTake(
		ctx,
		redisIPRateLimitKey(EmailVerificationDailyRateLimitMark, clientIP),
		EmailVerificationDailyMaxRequests,
		EmailVerificationDailyDuration,
	)
	if err == nil && !dailyAllowed {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("该 IP 今日获取验证码次数已达上限（每天最多 %d 次），请明天再试", EmailVerificationDailyMaxRequests),
		})
		c.Abort()
		return
	}

	// 2. 检查短时间频次限制（60秒内最多2次）
	allowed, _, ttlSeconds, err := redisFixedWindowTake(
		ctx,
		redisIPRateLimitKey(EmailVerificationRateLimitMark, clientIP),
		EmailVerificationMaxRequests,
		EmailVerificationDuration,
	)
	if err != nil {
		memoryEmailVerificationRateLimiter(c)
		return
	}
	if allowed {
		c.Next()
		return
	}

	waitSeconds := int64(EmailVerificationDuration)
	if ttlSeconds > 0 {
		waitSeconds = ttlSeconds
	}

	c.JSON(http.StatusTooManyRequests, gin.H{
		"success": false,
		"message": fmt.Sprintf("发送过于频繁，请等待 %d 秒后再试", waitSeconds),
	})
	c.Abort()
}

func memoryEmailVerificationRateLimiter(c *gin.Context) {
	clientIP := c.ClientIP()

	// 每日限制
	dailyKey := EmailVerificationDailyRateLimitMark + ":" + clientIP
	if !inMemoryRateLimiter.Request(dailyKey, EmailVerificationDailyMaxRequests, EmailVerificationDailyDuration) {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("该 IP 今日获取验证码次数已达上限（每天最多 %d 次），请明天再试", EmailVerificationDailyMaxRequests),
		})
		c.Abort()
		return
	}

	// 短时间频次
	key := EmailVerificationRateLimitMark + ":" + clientIP
	if !inMemoryRateLimiter.Request(key, EmailVerificationMaxRequests, EmailVerificationDuration) {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"message": fmt.Sprintf("发送过于频繁，请等待 %d 秒后再试", EmailVerificationDuration),
		})
		c.Abort()
		return
	}

	c.Next()
}

func EmailVerificationRateLimit() gin.HandlerFunc {
	inMemoryRateLimiter.Init(common.RateLimitKeyExpirationDuration)
	return func(c *gin.Context) {
		if common.RedisEnabled {
			redisEmailVerificationRateLimiter(c)
		} else {
			memoryEmailVerificationRateLimiter(c)
		}
	}
}
