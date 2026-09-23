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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 py-24 md:py-32'>
      {/* Gradient mesh background */}
      <div
        aria-hidden
        className='absolute inset-0 -z-10 opacity-20 dark:opacity-[0.08]'
        style={{
          background: [
            'radial-gradient(ellipse 50% 50% at 30% 50%, oklch(0.7 0.15 250 / 70%) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 40% at 70% 40%, oklch(0.65 0.12 200 / 50%) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      <AnimateInView
        className='mx-auto max-w-2xl text-center'
        animation='scale-in'
      >
        <h2 className='text-2xl leading-tight font-extrabold tracking-tight md:text-4xl'>
          准备好体验下一代
          <br />
          <span className='bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent'>
            企业级 AI 智能算力中枢了吗？
          </span>
        </h2>
        <p className='text-muted-foreground/90 mx-auto mt-5 max-w-md text-sm leading-relaxed md:text-base'>
          即刻开启接入，尊享超高可用 SLA 保障、毫秒级智能容灾调度与全生命周期开发支持。
        </p>
        <div className='mt-8 flex items-center justify-center gap-3'>
          <Button className='group h-11 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all' render={<Link to='/sign-up' />}>
            立即开通使用
            <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
          </Button>
          <Button
            variant='outline'
            className='border-border/60 hover:border-cyan-500/50 hover:bg-muted/40 h-11 rounded-lg px-5 text-sm font-medium'
            render={<Link to='/pricing' />}
          >
            探索模型与价格
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
