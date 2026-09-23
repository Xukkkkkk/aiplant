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
import { useTranslation } from 'react-i18next'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

type SystemBrandProps = {
  defaultName?: string
  defaultVersion?: string
  /**
   * Visual layout:
   * - 'sidebar': stacked card style (used inside the sidebar header).
   * - 'inline': compact horizontal pill (used inside the top app bar).
   */
  variant?: 'sidebar' | 'inline'
}

/**
 * System brand component
 * Displays current system logo + name.
 * - inline: compact pill in the top app bar; clicking navigates to home (/)
 * - sidebar: stacked card in the sidebar header (display only)
 */
export function SystemBrand(props: SystemBrandProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { logo } = useSystemConfig()

  const variant = props.variant ?? 'sidebar'
  const name = status?.system_name || props.defaultName || 'Nebula Matrix AI'
  const version =
    status?.version || props.defaultVersion || t('Unknown version')

  const isCustomLogo = Boolean(logo && logo !== '/logo.png')

  const renderIcon = () => {
    if (isCustomLogo) {
      return (
        <img
          src={logo}
          alt={t('Logo')}
          className='size-full rounded-md object-cover'
        />
      )
    }
    return (
      <svg viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' className='size-full'>
        <defs>
          <linearGradient id='nb-icon-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#00f2fe' />
            <stop offset='50%' stopColor='#38bdf8' />
            <stop offset='100%' stopColor='#6366f1' />
          </linearGradient>
        </defs>
        <rect width='32' height='32' rx='7' fill='#090d16' />
        <path d='M16 4.5L26.5 10.5V21.5L16 27.5L5.5 21.5V10.5L16 4.5Z' stroke='url(#nb-icon-grad)' strokeWidth='1.8' strokeLinejoin='round' />
        <path d='M16 9L23 13.5V20.5L16 24L9 20.5V13.5L16 9Z' stroke='#38bdf8' strokeWidth='1' strokeDasharray='2 2' fill='url(#nb-icon-grad)' fillOpacity='0.25' />
        <circle cx='16' cy='16' r='3.2' fill='url(#nb-icon-grad)' />
        <circle cx='16' cy='16' r='1.4' fill='#ffffff' />
      </svg>
    )
  }

  if (variant === 'inline') {
    return (
      <Link
        to='/'
        aria-label={t('Go to home')}
        className={cn(
          'text-foreground inline-flex h-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-sm font-semibold tracking-tight transition-colors outline-none select-none',
          'hover:bg-accent focus-visible:ring-ring/40 focus-visible:ring-2'
        )}
      >
        <div className='flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md'>
          {renderIcon()}
        </div>
        <span className='max-w-[12rem] truncate font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text'>{name}</span>
      </Link>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='hover:text-sidebar-foreground active:text-sidebar-foreground cursor-default hover:bg-transparent active:bg-transparent'
          render={<div />}
        >
          <div className='flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg shadow-sm'>
            {renderIcon()}
          </div>
          <div className='grid flex-1 text-start text-sm leading-tight group-data-[collapsible=icon]:hidden'>
            <span className='truncate font-bold tracking-tight'>{name}</span>
            <span className='truncate text-[11px] text-muted-foreground/80 font-mono'>{version}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
