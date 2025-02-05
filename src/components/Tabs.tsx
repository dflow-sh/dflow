'use client'

import React, { JSX, useEffect, useMemo, useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

export type TabContentProps = {
  disableTabs: boolean
  setDisableTabs: React.Dispatch<React.SetStateAction<boolean>>
}

type TabType = {
  label: string | JSX.Element
  content: (props: TabContentProps) => JSX.Element
}

export default function Tabs({
  tabs,
  defaultActiveTab = 0,
}: {
  tabs: TabType[]
  defaultActiveTab?: number
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' })
  const [disableTabs, setDisableTabs] = useState(false)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

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
    requestAnimationFrame(() => {
      const overviewElement = tabRefs.current[0]
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
      <ContentComponent
        disableTabs={disableTabs}
        setDisableTabs={setDisableTabs}
      />
    ) : null
  }, [activeIndex, tabs, disableTabs, setDisableTabs])

  return (
    <Card
      className={`relative flex w-full items-center border-none shadow-none`}>
      <CardContent className='w-full p-0'>
        <div className='relative'>
          {/* Hover Highlight */}
          <div
            className='absolute flex h-[30px] items-center rounded-[6px] bg-muted-foreground/10 transition-all duration-300 ease-out'
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator */}
          <div
            className='absolute bottom-[-6px] h-[2px] bg-foreground transition-all duration-300 ease-out'
            style={activeStyle}
          />

          {/* Tabs */}
          <div className='relative flex items-center space-x-[6px]'>
            {tabs.map(({ label }, index) => (
              <button
                key={index}
                ref={el => {
                  tabRefs.current[index] = el
                }}
                className={`h-[30px] cursor-pointer px-3 py-2 transition-colors duration-300 ${
                  index === activeIndex
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onFocus={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setActiveIndex(index)}>
                <div className='flex h-full items-center justify-center whitespace-nowrap leading-5'>
                  {label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className='mt-6'>{TabContent}</div>
      </CardContent>
    </Card>
  )
}
