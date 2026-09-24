package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/gin-gonic/gin"
)

const DefaultFreeTokenHubURL = "http://172.17.0.1:28899"

type FreeTokenModelInfo struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`        // "reverse_free" or "key_pool"
	Description string  `json:"description"` // e.g. "免Key逆向通道 (无需任何Key)"
	Ratio       float64 `json:"ratio"`
	IsZeroRatio bool    `json:"is_zero_ratio"`
	Status      string  `json:"status"` // "online"
}

func GetFreeTokenOverview(c *gin.Context) {
	hubURL := DefaultFreeTokenHubURL

	// 1. Probe Free Token Hub
	client := http.Client{Timeout: 2 * time.Second}
	start := time.Now()
	resp, err := client.Get(hubURL + "/v1/models")
	latencyMs := int64(0)
	isOnline := false
	if err == nil && resp != nil {
		latencyMs = time.Since(start).Milliseconds()
		if resp.StatusCode == http.StatusOK {
			isOnline = true
		}
		resp.Body.Close()
	}

	// 2. Query channel in New API
	var channel model.Channel
	channelFound := false
	if err := model.DB.Where("base_url LIKE ? OR name LIKE ?", "%28899%", "%Free AI Quota%").First(&channel).Error; err == nil {
		channelFound = true
	}

	baseURLStr := ""
	if channel.BaseURL != nil {
		baseURLStr = *channel.BaseURL
	}
	weightVal := uint(0)
	if channel.Weight != nil {
		weightVal = *channel.Weight
	}

	// 3. Collect models info and ratios
	ratioMap := ratio_setting.GetModelRatioCopy()

	allFreeModels := []string{
		"gpt-4o",
		"gpt-4o-free",
		"gpt-4o-mini",
		"gpt-4o-mini-free",
		"qwen-coder-free",
		"mistral-free",
		"glm-4-flash",
		"gemini-1.5-flash",
	}

	var modelList []FreeTokenModelInfo
	for _, m := range allFreeModels {
		ratio, exists := ratioMap[m]
		if !exists {
			ratio, _, _ = ratio_setting.GetModelRatio(m)
		}

		mType := "reverse_free"
		desc := "免Key高可用逆向通道 (无需任何Key，无限制)"
		if strings.HasPrefix(m, "glm") {
			mType = "key_pool"
			desc = "智谱官方 GLM 免费额度池 (官方API)"
		} else if strings.HasPrefix(m, "gemini") {
			mType = "key_pool"
			desc = "Google AI Studio Gemini 免费额度池"
		}

		modelList = append(modelList, FreeTokenModelInfo{
			ID:          m,
			Name:        m,
			Type:        mType,
			Description: desc,
			Ratio:       ratio,
			IsZeroRatio: ratio == 0,
			Status:      "online",
		})
	}

	// 4. User stats for quota allocation
	var totalUsers int64
	model.DB.Model(&model.User{}).Count(&totalUsers)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"service": gin.H{
				"online":       isOnline,
				"url":          hubURL,
				"port":         28899,
				"latency_ms":   latencyMs,
				"service_name": "Free AI Quota Hub (免费额度聚合平台)",
			},
			"channel": gin.H{
				"found":    channelFound,
				"id":       channel.Id,
				"name":     channel.Name,
				"base_url": baseURLStr,
				"models":   channel.Models,
				"group":    channel.Group,
				"status":   channel.Status,
				"weight":   weightVal,
			},
			"models":       modelList,
			"model_ratios": ratioMap,
			"stats": gin.H{
				"total_users":       totalUsers,
				"total_free_models": len(modelList),
			},
		},
	})
}

type TestModelReq struct {
	Model string `json:"model"`
}

func TestFreeTokenModel(c *gin.Context) {
	var req TestModelReq
	if err := c.ShouldBindJSON(&req); err != nil || req.Model == "" {
		req.Model = "gpt-4o-mini-free"
	}

	hubURL := DefaultFreeTokenHubURL + "/v1/chat/completions"
	bodyMap := map[string]any{
		"model": req.Model,
		"messages": []map[string]string{
			{"role": "user", "content": "Hi! Say hello in exactly 5 words."},
		},
		"max_tokens": 30,
	}

	bodyBytes, _ := json.Marshal(bodyMap)
	client := http.Client{Timeout: 15 * time.Second}
	httpReq, err := http.NewRequest("POST", hubURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer sk-free-ai-pool-master")

	start := time.Now()
	resp, err := client.Do(httpReq)
	latency := time.Since(start).Milliseconds()

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success":    false,
			"latency_ms": latency,
			"message":    fmt.Sprintf("Request failed: %v", err),
		})
		return
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusOK, gin.H{
			"success":    false,
			"latency_ms": latency,
			"message":    fmt.Sprintf("Status %d: %s", resp.StatusCode, string(respBytes)),
		})
		return
	}

	var jsonResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	_ = json.Unmarshal(respBytes, &jsonResp)

	reply := ""
	if len(jsonResp.Choices) > 0 {
		reply = jsonResp.Choices[0].Message.Content
	} else {
		reply = string(respBytes)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"latency_ms": latency,
		"reply":      strings.TrimSpace(reply),
		"model":      req.Model,
	})
}

func SetFreeModelsZeroRatio(c *gin.Context) {
	// Retrieve current model ratios
	ratioMap := ratio_setting.GetModelRatioCopy()
	if ratioMap == nil {
		ratioMap = make(map[string]float64)
	}

	freeModels := []string{
		"gpt-4o",
		"gpt-4o-free",
		"gpt-4o-mini",
		"gpt-4o-mini-free",
		"qwen-coder-free",
		"mistral-free",
		"glm-4-flash",
		"gemini-1.5-flash",
	}

	for _, m := range freeModels {
		ratioMap[m] = 0.0
	}

	jsonBytes, err := json.Marshal(ratioMap)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	jsonStr := string(jsonBytes)
	if err := ratio_setting.UpdateModelRatioByJSONString(jsonStr); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}

	if err := model.UpdateOption("ModelRatio", jsonStr); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
		return
	}
	common.OptionMap["ModelRatio"] = jsonStr

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "所有免费模型倍率已成功设置为 0 (全员免额度畅享模式)",
	})
}

func SyncFreeTokenChannel(c *gin.Context) {
	allModels := "gpt-4o,gpt-4o-free,gpt-4o-mini,gpt-4o-mini-free,mistral-free,qwen-coder-free,glm-4-flash,gemini-1.5-flash"
	channelName := "Free AI Quota Hub (本地免费额度池)"
	hubURL := DefaultFreeTokenHubURL

	weightVal := uint(100)
	priorityVal := int64(10)
	baseURLVal := hubURL
	testModelVal := "gpt-4o-mini-free"

	var existing model.Channel
	err := model.DB.Where("base_url LIKE ? OR name LIKE ?", "%28899%", "%Free AI Quota%").First(&existing).Error
	if err == nil {
		// Update existing
		existing.Models = allModels
		existing.Status = 1
		existing.Weight = &weightVal
		existing.BaseURL = &baseURLVal
		if err := model.DB.Save(&existing).Error; err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
			return
		}
	} else {
		// Create new
		newCh := model.Channel{
			Type:        1, // OpenAI standard
			Name:        channelName,
			Key:         "sk-free-ai-pool-master",
			BaseURL:     &baseURLVal,
			Models:      allModels,
			Status:      1,
			Weight:      &weightVal,
			CreatedTime: time.Now().Unix(),
			TestModel:   &testModelVal,
			Group:       "default",
			Priority:    &priorityVal,
		}
		if err := model.DB.Create(&newCh).Error; err != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "渠道已成功同步并激活！",
	})
}

func ProxyFreeTokenHub(c *gin.Context) {
	target, _ := url.Parse(DefaultFreeTokenHubURL)
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.Director = func(req *http.Request) {
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		for _, prefix := range []string{"/api/free-token/hub", "/api/free-token-proxy", "/free-token-proxy"} {
			if strings.HasPrefix(req.URL.Path, prefix) {
				req.URL.Path = strings.TrimPrefix(req.URL.Path, prefix)
				break
			}
		}
		if req.URL.Path == "" {
			req.URL.Path = "/"
		}
		req.Host = target.Host
	}
	proxy.ServeHTTP(c.Writer, c.Request)
}
