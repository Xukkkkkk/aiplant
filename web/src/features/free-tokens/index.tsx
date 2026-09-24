import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Coins,
  ExternalLink,
  Flame,
  Key,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'

import { SectionPageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  getFreeTokenOverview,
  setFreeModelsZeroRatio,
  syncFreeTokenChannel,
  testFreeTokenModel,
} from './api'
import type { FreeTokenModel } from './types'

export function FreeTokensPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('distribution')
  const [testingModel, setTestingModel] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<
    Record<string, { latency_ms: number; reply: string; success: boolean }>
  >({})

  const {
    data: overview,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['free-token-overview'],
    queryFn: getFreeTokenOverview,
    refetchInterval: 30000,
  })

  const zeroRatioMutation = useMutation({
    mutationFn: setFreeModelsZeroRatio,
    onSuccess: (res) => {
      toast.success(res.message || '已成功将所有免费模型倍率设为 0')
      queryClient.invalidateQueries({ queryKey: ['free-token-overview'] })
    },
    onError: (err: any) => {
      toast.error('设置失败: ' + (err.message || '未知错误'))
    },
  })

  const syncChannelMutation = useMutation({
    mutationFn: syncFreeTokenChannel,
    onSuccess: (res) => {
      toast.success(res.message || '渠道已成功同步并激活')
      queryClient.invalidateQueries({ queryKey: ['free-token-overview'] })
    },
    onError: (err: any) => {
      toast.error('同步失败: ' + (err.message || '未知错误'))
    },
  })

  const handleTestModel = async (modelId: string) => {
    setTestingModel(modelId)
    try {
      const res = await testFreeTokenModel(modelId)
      if (res.success) {
        setTestResults((prev) => ({
          ...prev,
          [modelId]: {
            latency_ms: res.latency_ms,
            reply: res.reply,
            success: true,
          },
        }))
        toast.success(`${modelId} 测速成功 (${res.latency_ms}ms)`)
      } else {
        setTestResults((prev) => ({
          ...prev,
          [modelId]: {
            latency_ms: res.latency_ms || 0,
            reply: res.message || '请求失败',
            success: false,
          },
        }))
        toast.error(`${modelId} 测试失败: ${res.message || '未知错误'}`)
      }
    } catch (err: any) {
      toast.error('测速错误: ' + (err.message || '网络超时'))
    } finally {
      setTestingModel(null)
    }
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>
        <div className='flex flex-wrap items-center justify-between gap-4 w-full'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-primary/10 text-primary'>
              <Sparkles className='h-6 w-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-xl font-bold tracking-tight'>
                  免费额度聚合池 (Free AI Quota Hub)
                </h1>
                <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/30'>
                  中转已联动
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground mt-0.5'>
                零成本逆向免Key通道 + 官方免费额度Key池，支持一键分发与配额管理
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1.5 ${isRefetching ? 'animate-spin' : ''}`}
              />
              刷新状态
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => syncChannelMutation.mutate()}
              disabled={syncChannelMutation.isPending}
            >
              <Layers className='h-4 w-4 mr-1.5' />
              同步渠道
            </Button>
            <Button
              size='sm'
              asChild
            >
              <a
                href='http://82.156.148.182:28899'
                target='_blank'
                rel='noreferrer'
              >
                <ExternalLink className='h-4 w-4 mr-1.5' />
                打开独立控制台
              </a>
            </Button>
          </div>
        </div>
      </SectionPageLayout.Title>

      <SectionPageLayout.Content>
        <div className='space-y-6'>
          {/* Top 4 Stat Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {/* Card 1: Service Status */}
            <Card className='border-border/60 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  额度池服务状态
                </CardTitle>
                <Activity className='h-4 w-4 text-emerald-500' />
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <div className='relative flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
                  </div>
                  <div className='text-2xl font-bold'>
                    {overview?.service.online ? '运行正常' : '检测中...'}
                  </div>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  端口: {overview?.service.port || 28899} | 内部直连 172.17.0.1
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Relay Channel */}
            <Card className='border-border/60 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  中转接入渠道
                </CardTitle>
                <Zap className='h-4 w-4 text-amber-500' />
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <div className='text-2xl font-bold'>
                    {overview?.channel.found ? `渠道 #${overview.channel.id}` : '未绑定'}
                  </div>
                  {overview?.channel.status === 1 && (
                    <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 text-xs'>
                      已启用
                    </Badge>
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-1 truncate'>
                  分组: {overview?.channel.group || 'default'} | 权重: {overview?.channel.weight || 100}
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Free Models Count */}
            <Card className='border-border/60 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  聚合免费模型
                </CardTitle>
                <Bot className='h-4 w-4 text-blue-500' />
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <div className='text-2xl font-bold'>
                    {overview?.models.length || 8} 个
                  </div>
                  <Badge variant='outline' className='bg-blue-500/10 text-blue-600 text-xs'>
                    逆向免Key+Key池
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  GPT-4o, Mini, Qwen Coder, Mistral 等
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Quota Allocation Mode */}
            <Card className='border-border/60 shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  额度分发模式
                </CardTitle>
                <Coins className='h-4 w-4 text-purple-500' />
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-2'>
                  <div className='text-2xl font-bold'>
                    0 倍率 / 配额
                  </div>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  支持完全免费或按用户扣减额度
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='grid grid-cols-3 w-full max-w-md'>
              <TabsTrigger value='distribution' className='flex items-center gap-1.5'>
                <Coins className='h-4 w-4' />
                额度分配控制台
              </TabsTrigger>
              <TabsTrigger value='models' className='flex items-center gap-1.5'>
                <Bot className='h-4 w-4' />
                免费模型与测速
              </TabsTrigger>
              <TabsTrigger value='management' className='flex items-center gap-1.5'>
                <ExternalLink className='h-4 w-4' />
                聚合池控制台
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Quota Allocation & Distribution (额度分配控制台) */}
            <TabsContent value='distribution' className='space-y-6 pt-4'>
              <Card className='border-primary/20 bg-primary/5'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Sparkles className='h-5 w-5 text-primary' />
                    <CardTitle className='text-base font-semibold'>
                      如何为中转站用户分配免费模型的额度？
                    </CardTitle>
                  </div>
                  <CardDescription>
                    中转站管理员可以通过以下 4 种经典模式灵活分配这些免费模型的额度，满足完全免费、体验送额度或付费分区等多种场景。
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className='grid gap-6 md:grid-cols-2'>
                {/* Method 1: Zero Ratio Mode */}
                <Card className='flex flex-col justify-between border-border/80 hover:border-primary/40 transition-colors shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <Badge className='bg-emerald-500 text-white hover:bg-emerald-600'>
                        模式一：完全免费畅享
                      </Badge>
                      <Flame className='h-4 w-4 text-emerald-500' />
                    </div>
                    <CardTitle className='text-base mt-2'>
                      0 倍率全员免额度模式
                    </CardTitle>
                    <CardDescription className='text-sm leading-relaxed'>
                      在中转站设置中将所有免费模型的计费倍率直接设为 <strong>0.00x</strong>。
                      此时中转站用户或持有令牌调用这些模型时，<strong>绝对不扣减任何账户额度</strong>，完全免费使用！
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className='pt-2'>
                    <Button
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white'
                      onClick={() => zeroRatioMutation.mutate()}
                      disabled={zeroRatioMutation.isPending}
                    >
                      {zeroRatioMutation.isPending && (
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      )}
                      一键将免费模型倍率设为 0 (全免模式)
                    </Button>
                  </CardFooter>
                </Card>

                {/* Method 2: User Quota Distribution */}
                <Card className='flex flex-col justify-between border-border/80 hover:border-primary/40 transition-colors shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <Badge className='bg-blue-500 text-white hover:bg-blue-600'>
                        模式二：按量额度分发
                      </Badge>
                      <Users className='h-4 w-4 text-blue-500' />
                    </div>
                    <CardTitle className='text-base mt-2'>
                      按账户赠送/分配固定额度
                    </CardTitle>
                    <CardDescription className='text-sm leading-relaxed'>
                      管理员可为普通用户或 VIP 用户在用户管理中充值/赠送额度（例如每位注册用户赠送 500,000 配额 = $1）。
                      用户在额度耗尽前可调用免费模型，用尽后需管理员重新分配或充值。
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className='pt-2'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/users'>
                        <Users className='h-4 w-4 mr-2' />
                        前往用户管理分配额度
                        <ArrowUpRight className='h-3.5 w-3.5 ml-1' />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Method 3: Token Whitelist Restriction */}
                <Card className='flex flex-col justify-between border-border/80 hover:border-primary/40 transition-colors shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <Badge className='bg-purple-500 text-white hover:bg-purple-600'>
                        模式三：专用令牌白名单
                      </Badge>
                      <Key className='h-4 w-4 text-purple-500' />
                    </div>
                    <CardTitle className='text-base mt-2'>
                      生成免费模型受限 API Key
                    </CardTitle>
                    <CardDescription className='text-sm leading-relaxed'>
                      在令牌管理中生成一个专用 Key，在「模型范围」中<strong>只勾选免费模型</strong>（如 gpt-4o-free, qwen-coder-free）。
                      这样分发给用户的 Key 只能调用免费模型，绝对不会盗刷你的其他付费官方渠道。
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className='pt-2'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/keys'>
                        <Key className='h-4 w-4 mr-2' />
                        前往令牌管理添加专属 Key
                        <ArrowUpRight className='h-3.5 w-3.5 ml-1' />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>

                {/* Method 4: Group Isolation */}
                <Card className='flex flex-col justify-between border-border/80 hover:border-primary/40 transition-colors shadow-sm'>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <Badge className='bg-amber-500 text-white hover:bg-amber-600'>
                        模式四：分组权限隔离
                      </Badge>
                      <ShieldCheck className='h-4 w-4 text-amber-500' />
                    </div>
                    <CardTitle className='text-base mt-2'>
                      用户分组专属绑定
                    </CardTitle>
                    <CardDescription className='text-sm leading-relaxed'>
                      将该免费渠道的分组设置为 <code>default</code> 或专门的 <code>free</code> 分组。
                      只有属于该分组的用户或令牌才拥有访问权，有效隔离付费用户与免费用户的使用通道。
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className='pt-2'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/channels'>
                        <Layers className='h-4 w-4 mr-2' />
                        前往渠道管理调整分组
                        <ArrowUpRight className='h-3.5 w-3.5 ml-1' />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: Free Models & Live Ping Test (免费模型池与测速) */}
            <TabsContent value='models' className='space-y-4 pt-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-base'>
                        已挂载的免费大模型列表
                      </CardTitle>
                      <CardDescription>
                        通过中转站 Channel #2 统一分发，点击测速可实时测试响应速度
                      </CardDescription>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        overview?.models.forEach((m) => handleTestModel(m.id))
                      }}
                      disabled={testingModel !== null}
                    >
                      <Play className='h-3.5 w-3.5 mr-1 text-emerald-500' />
                      一键全面测速
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模型名称 (ID)</TableHead>
                        <TableHead>通道类型</TableHead>
                        <TableHead>通道特性</TableHead>
                        <TableHead>当前计费倍率</TableHead>
                        <TableHead>实时延迟 / 测试</TableHead>
                        <TableHead className='text-right'>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview?.models.map((m: FreeTokenModel) => {
                        const testInfo = testResults[m.id]
                        return (
                          <TableRow key={m.id}>
                            <TableCell className='font-mono font-medium text-sm'>
                              <div className='flex items-center gap-2'>
                                <Bot className='h-4 w-4 text-muted-foreground' />
                                <span>{m.id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {m.type === 'reverse_free' ? (
                                <Badge variant='outline' className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20'>
                                  逆向免Key通道
                                </Badge>
                              ) : (
                                <Badge variant='outline' className='bg-blue-500/10 text-blue-600 border-blue-500/20'>
                                  官方Key池
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className='text-xs text-muted-foreground max-w-xs truncate'>
                              {m.description}
                            </TableCell>
                            <TableCell>
                              {m.is_zero_ratio || m.ratio === 0 ? (
                                <Badge className='bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border-0'>
                                  0.00x (免费)
                                </Badge>
                              ) : (
                                <span className='text-xs font-mono text-muted-foreground'>
                                  {m.ratio}x
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {testInfo ? (
                                testInfo.success ? (
                                  <div className='flex items-center gap-1.5 text-xs text-emerald-600'>
                                    <CheckCircle2 className='h-3.5 w-3.5' />
                                    <span>{testInfo.latency_ms}ms</span>
                                    <span className='text-muted-foreground truncate max-w-[120px]'>
                                      ({testInfo.reply})
                                    </span>
                                  </div>
                                ) : (
                                  <span className='text-xs text-destructive'>
                                    测试失败
                                  </span>
                                )
                              ) : (
                                <span className='text-xs text-muted-foreground'>未测试</span>
                              )}
                            </TableCell>
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleTestModel(m.id)}
                                disabled={testingModel === m.id}
                              >
                                {testingModel === m.id ? (
                                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                ) : (
                                  <Play className='h-3.5 w-3.5 text-emerald-600 mr-1' />
                                )}
                                测速
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Embedded Hub Management (聚合池控制台) */}
            <TabsContent value='management' className='space-y-4 pt-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-base'>
                        聚合平台管理面板 (Free AI Quota Hub)
                      </CardTitle>
                      <CardDescription>
                        添加官方 Key、配置逆向通道与密钥轮询池
                      </CardDescription>
                    </div>
                    <Button variant='outline' size='sm' asChild>
                      <a
                        href='http://82.156.148.182:28899'
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ExternalLink className='h-3.5 w-3.5 mr-1.5' />
                        新标签页独立窗口
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='p-0 overflow-hidden rounded-b-lg border-t'>
                  <iframe
                    src='/free-token-proxy/'
                    className='w-full h-[750px] border-0'
                    title='Free AI Quota Hub Dashboard'
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
