'use client'

import { Slot } from '@radix-ui/react-slot'
import React, { JSX, useEffect, useMemo, useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

export type TabContentProps = {
  disableTabs: boolean
  setDisableTabs: React.Dispatch<React.SetStateAction<boolean>>
}

export type TabType = {
  label: string | JSX.Element
  content?: (props: TabContentProps) => JSX.Element
  disabled?: boolean
  asChild?: boolean
}

export default function Tabs({
  tabs,
  defaultActiveTab = 0,
  activeTab,
  onTabChange = () => {},
}: {
  tabs: TabType[]
  defaultActiveTab?: number
  activeTab?: number
  onTabChange?: (index: number) => void
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(defaultActiveTab)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' })
  const [disableTabs, setDisableTabs] = useState(false)
  const tabRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex]

      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }
  }, [hoveredIndex])

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex]

    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement

      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [activeIndex])

  useEffect(() => {
    if (activeTab) {
      setActiveIndex(activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    requestAnimationFrame(() => {
      const overviewElement = tabRefs.current[defaultActiveTab]

      if (overviewElement) {
        const { offsetLeft, offsetWidth } = overviewElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    })
  }, [])

  const TabContent = useMemo(() => {
    const ContentComponent = tabs[activeIndex]?.content
    return ContentComponent ? (
      <div className='mt-4'>
        <ContentComponent
          disableTabs={disableTabs}
          setDisableTabs={setDisableTabs}
        />
      </div>
    ) : null
  }, [activeIndex, tabs, disableTabs, setDisableTabs, activeTab])

  return (
    <Card className='flex w-full items-center rounded-none border-none bg-transparent shadow-none hover:bg-transparent'>
      <CardContent className='w-full p-0'>
        <div className='relative min-h-9'>
          {/* Hover Highlight */}
          <div
            className='absolute flex h-[30px] items-center rounded bg-muted-foreground/10 transition-all duration-300 ease-out'
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          <div className='absolute bottom-0 h-[1px] w-full bg-border' />

          {/* Active Indicator */}
          <div
            className='absolute bottom-0 h-[2px] rounded-full bg-foreground transition-all duration-300 ease-out'
            style={activeStyle}
          />

          {/* Tabs */}
          <div className='relative flex items-center space-x-[6px]'>
            {tabs.map(({ label, disabled = false, asChild }, index) => {
              const Component = asChild ? Slot : 'button'

              return (
                <Component
                  key={index}
                  ref={el => {
                    tabRefs.current[index] = el
                  }}
                  className={`h-[30px] ${(disableTabs && activeIndex !== index) || disabled ? 'cursor-not-allowed' : ''} flex items-center justify-center whitespace-nowrap px-3 py-2 text-sm leading-5 transition-colors duration-300 ${
                    index === activeIndex
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    if (disableTabs || disabled) {
                      return
                    }

                    onTabChange(index)
                    setActiveIndex(index)
                  }}>
                  {label}
                </Component>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {TabContent}
      </CardContent>
    </Card>
  )
}
