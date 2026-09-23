/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import {
  Zap,
  Shield,
  Globe,
  Code,
  Gauge,
  DollarSign,
  Users,
  HeartHandshake,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

interface FeaturesProps {
  className?: string
}

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()

  const features = [
    {
      id: 'fast',
      num: '01',
      title: '毫秒级多路智能路由',
      desc: '自研智能心跳探测与多集群热备调度，上游抖动无感秒级切换，保障核心业务连续性',
      span: 'md:col-span-2',
      icon: <Zap className='size-4 text-cyan-400' />,
      visual: (
        <div className='mt-4 grid grid-cols-3 gap-2'>
          {['OpenAI', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'].map(
            (name) => (
              <div
                key={name}
                className='border-cyan-500/20 bg-cyan-500/5 text-foreground flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/15'
              >
                {name}
              </div>
            )
          )}
        </div>
      ),
    },
    {
      id: 'secure',
      num: '02',
      title: '军工级密钥隔离',
      desc: '多租户访问鉴权、动态 IP 白名单与非对称物理安全隔离',
      span: 'md:col-span-1',
      icon: <Shield className='size-4 text-emerald-400' />,
      visual: (
        <div className='mt-4 flex items-center justify-center'>
          <div className='relative'>
            <div className='flex size-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'>
              <Shield
                className='size-7 text-emerald-400'
                strokeWidth={1.8}
              />
            </div>
            <div className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500'>
              <svg
                className='size-2.5 text-white'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={3}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m4.5 12.75 6 6 9-13.5'
                />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'global',
      num: '03',
      title: '高并发集群调度',
      desc: '云原生高并发引擎与内存级分发机制，轻量承载数十万级 QPS',
      span: 'md:col-span-1',
      icon: <Globe className='size-4 text-indigo-400' />,
      visual: (
        <div className='mt-4 space-y-2'>
          {['分布式负载均衡', '细粒度频次限流', '多节点就近路由'].map(
            (step, i) => (
              <div key={step} className='flex items-center gap-2'>
                <div
                  className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0
                      ? 'border border-cyan-500/40 bg-cyan-500/20 text-cyan-400'
                      : 'border-border/40 bg-muted text-muted-foreground border'
                  }`}
                >
                  {i + 1}
                </div>
                <div className='bg-border/40 h-px flex-1' />
                <span className='text-muted-foreground text-xs font-medium'>{step}</span>
              </div>
            )
          )}
        </div>
      ),
    },
    {
      id: 'developer',
      num: '04',
      title: '全生态协议无缝自适应',
      desc: '100% 兼容 OpenAI 标准 API 规范，主流 AI 框架与应用客户端一键接入',
      span: 'md:col-span-2',
      icon: <Code className='size-4 text-amber-400' />,
      visual: (
        <div className='mt-4 flex items-center gap-3'>
          <div className='flex -space-x-2'>
            {['REST', 'STREAM', 'WS', 'SDK'].map((n) => (
              <div
                key={n}
                className='border-background from-cyan-950/40 to-slate-900 text-cyan-300 flex size-8 items-center justify-center rounded-full border-2 bg-gradient-to-br text-[9px] font-bold shadow-sm'
              >
                {n}
              </div>
            ))}
          </div>
          <div className='text-muted-foreground flex items-center gap-1.5 text-xs font-medium'>
            <Code className='size-3.5 text-cyan-400' />
            跨协议实时数据流转换
          </div>
        </div>
      ),
    },
  ]

  const additionalFeatures = [
    {
      icon: <Gauge className='size-5 text-cyan-400' strokeWidth={1.8} />,
      title: '超低时延架构',
      desc: '内存级令牌校验与极速通道分发，平均网关时延低于 10ms',
    },
    {
      icon: <DollarSign className='size-5 text-emerald-400' strokeWidth={1.8} />,
      title: '精准计量与对账',
      desc: 'Token 级实时消耗计量，灵活分组倍率与自动化账单分析',
    },
    {
      icon: <Users className='size-5 text-indigo-400' strokeWidth={1.8} />,
      title: '多租户团队协作',
      desc: '多成员权限隔离、用量配额分配与完整企业级操作审计日志',
    },
    {
      icon: <Shield className='size-5 text-purple-400' strokeWidth={1.8} />,
      title: '高等级安全隔离',
      desc: '请求全程脱敏不落盘，全链路防越权探测与异常流量拦截',
    },
  ]

  return (
    <section className='relative z-10 px-6 py-24 md:py-32'>
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-16 max-w-xl'>
          <p className='text-cyan-500 dark:text-cyan-400 mb-3 text-xs font-bold tracking-widest uppercase'>
            ENTERPRISE ARCHITECTURE · 核心能力
          </p>
          <h2 className='text-2xl leading-tight font-extrabold tracking-tight md:text-3xl'>
            为高要求业务而生
            <br />
            <span className='bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent'>
              企业级 AI 算力中枢基础设施
            </span>
          </h2>
        </AnimateInView>

        {/* Bento grid */}
        <div className='border-border/50 bg-border/30 grid gap-px overflow-hidden rounded-2xl border md:grid-cols-3 shadow-sm backdrop-blur-xs'>
          {features.map((f, i) => (
            <AnimateInView
              key={f.id}
              delay={i * 100}
              animation='scale-in'
              className={`bg-background/95 hover:bg-muted/30 p-7 transition-colors duration-300 md:p-8 ${f.span}`}
            >
              <div className='mb-3 flex items-center gap-3'>
                <span className='border-cyan-500/30 bg-cyan-500/10 text-cyan-500 dark:text-cyan-300 flex size-7 items-center justify-center rounded-lg border text-[11px] font-bold tabular-nums'>
                  {f.num}
                </span>
                <h3 className='text-sm font-bold'>{f.title}</h3>
              </div>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                {f.desc}
              </p>
              {f.visual}
            </AnimateInView>
          ))}
        </div>

        {/* Additional features row */}
        <div className='mt-14 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
          {additionalFeatures.map((f, i) => (
            <AnimateInView
              key={f.title}
              delay={i * 100}
              animation='fade-up'
              className='flex flex-col items-center text-center'
            >
              <div className='border-border/60 bg-muted/30 mb-3 flex size-12 items-center justify-center rounded-2xl border shadow-xs transition-transform duration-200 hover:scale-110'>
                {f.icon}
              </div>
              <h3 className='mb-1.5 text-sm font-bold'>{f.title}</h3>
              <p className='text-muted-foreground max-w-[200px] text-xs leading-relaxed'>
                {f.desc}
              </p>
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
