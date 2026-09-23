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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

// Stylized three-dots indicator representing "More"
const MoreIcon = () => (
  <svg
    className='text-muted-foreground/60 group-hover:text-foreground size-6 shrink-0 transition-colors'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='6' cy='12' r='2' fill='currentColor' />
    <circle cx='12' cy='12' r='2' fill='currentColor' />
    <circle cx='18' cy='12' r='2' fill='currentColor' />
  </svg>
)

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const docsUrl =
    (status?.docs_link as string | undefined) || '/pricing'

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium transition-all'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-cyan-500 size-4 transition-colors duration-200' />
          <span>{t('接入指南')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium transition-all'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-cyan-500 size-4 transition-colors duration-200' />
        <span>{t('接入指南')}</span>
      </Button>
    )
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28'>
      {/* Cybernetic ambient glow background */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-35 dark:opacity-20'
        style={{
          background: [
            'radial-gradient(ellipse 65% 50% at 15% 15%, oklch(0.7 0.22 210 / 85%) 0%, transparent 65%)',
            'radial-gradient(ellipse 55% 45% at 85% 20%, oklch(0.65 0.25 310 / 70%) 0%, transparent 65%)',
            'radial-gradient(ellipse 45% 40% at 50% 85%, oklch(0.75 0.20 160 / 50%) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      {/* Digital Grid Pattern */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.08)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black_30%,transparent_100%)] bg-[size:3.5rem_3.5rem]'
      />

      <div className='mx-auto grid max-w-6xl grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8'>
        {/* Left Column: Title, description, action buttons and application support */}
        <div className='flex flex-col items-start text-left lg:col-span-6'>
          {/* Futuristic Cyber Badge */}
          <div
            className='landing-animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-cyan-500 dark:text-cyan-300 opacity-0 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md'
            style={{ animationDelay: '0ms' }}
          >
            <span className='relative flex size-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75' />
              <span className='relative inline-flex size-2 rounded-full bg-cyan-500' />
            </span>
            <span>⚡ NEBULA MATRIX CORE · 企业级智能模型调度矩阵</span>
          </div>

          <h1
            className='landing-animate-fade-up text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.18] font-extrabold tracking-tight'
            style={{ animationDelay: '60ms' }}
          >
            突破算力边界 · 聚合
            <br />
            <span className='bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent'>
              全球尖端 AI 大模型
            </span>
          </h1>
          <p
            className='landing-animate-fade-up text-muted-foreground/90 mt-5 max-w-xl text-base leading-relaxed opacity-0 md:text-[15px]'
            style={{ animationDelay: '120ms' }}
          >
            专为现代应用与企业工作流设计的下一代智能算力网关。毫秒级故障转移容灾、硬件级安全隔离与全链路协议自适应，赋能高可靠的 AI 生产力。
          </p>

          {/* Real-time Performance Indicator Chips */}
          <div
            className='landing-animate-fade-up mt-6 flex flex-wrap gap-2.5 opacity-0'
            style={{ animationDelay: '150ms' }}
          >
            <div className='flex items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-xs'>
              <span className='size-1.5 rounded-full bg-emerald-500' />
              <span>核心路由时延: ~8ms</span>
            </div>
            <div className='flex items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-xs'>
              <span className='size-1.5 rounded-full bg-blue-500' />
              <span>全量密钥隔离鉴权</span>
            </div>
            <div className='flex items-center gap-1.5 rounded-md border border-border/50 bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-xs'>
              <span className='size-1.5 rounded-full bg-purple-500' />
              <span>99.99% 可用性保障</span>
            </div>
          </div>

          <div
            className='landing-animate-fade-up mt-8 flex flex-wrap items-center gap-3 opacity-0'
            style={{ animationDelay: '180ms' }}
          >
            {props.isAuthenticated ? (
              <>
                <Button
                  className='group h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all'
                  render={<Link to='/dashboard' />}
                >
                  {t('进入开发者控制台')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                {renderDocsButton()}
              </>
            ) : (
              <>
                <Button
                  className='group h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all'
                  render={<Link to='/sign-up' />}
                >
                  {t('立即开通使用')}
                  <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
                </Button>
                <Button
                  variant='outline'
                  className='border-border/60 hover:border-cyan-500/50 hover:bg-muted/40 h-11 rounded-lg px-5 text-sm font-medium'
                  render={<Link to='/pricing' />}
                >
                  {t('探索模型广场')}
                </Button>
                {renderDocsButton()}
              </>
            )}
          </div>

          {/* Supported Ecosystem & Protocols */}
          <div
            className='landing-animate-fade-up mt-10 w-full max-w-xl opacity-0'
            style={{ animationDelay: '240ms' }}
          >
            <div className='mb-3 flex flex-col gap-1'>
              <span className='text-muted-foreground/60 text-[10px] font-bold tracking-[0.18em] uppercase'>
                ECOSYSTEM & PROTOCOL COMPATIBILITY
              </span>
              <p className='text-muted-foreground/70 text-xs leading-relaxed'>
                支持标准 OpenAI / Anthropic / Gemini 协议客户端即插即用
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {['OpenAI SDK', 'Claude Code', 'Cursor', 'LangChain', 'LobeChat', 'Cherry Studio', 'Dify', 'NextChat'].map(
                (client) => (
                  <div
                    key={client}
                    className='group border-border/40 bg-muted/20 hover:border-cyan-500/40 hover:bg-cyan-500/5 text-foreground/80 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-xs transition-all duration-300'
                  >
                    <span className='size-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform' />
                    <span>{client}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Hero Terminal API Demo */}
        <div
          className='landing-animate-fade-up flex w-full justify-center opacity-0 lg:col-span-6'
          style={{ animationDelay: '320ms' }}
        >
          <HeroTerminalDemo className='mt-8 lg:mt-0' />
        </div>
      </div>
    </section>
  )
}
