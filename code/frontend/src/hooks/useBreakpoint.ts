import { useEffect, useState } from 'react'

/* 响应式断点，与 10_UI设计文档.md 5.2 及 styles/global.css 的媒体查询同源：
   | 手机 | 375-767px  | 单列布局，底部 Tab |
   | 平板 | 768-1023px | 双列布局，可折叠侧边栏 |
   | 桌面 | 1024-1439px| 标准侧边栏 + 内容区 |
   | 大屏 | ≥1440px    | 宽内容区，更多列展示 |

   CSS 媒体查询负责样式，这个 hook 负责需要「用 JS 变值」的场景
   （例如 ECharts 的半径/字号必须在 option 里给数值，无法用 CSS 覆盖）。 */

export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
  desktop: 1439,
} as const

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    /* Safari < 14 只支持 addListener */
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)
    setMatches(mql.matches)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [query])

  return matches
}

/* 手机（≤767px）：底部 Tab + 单列布局 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.mobile}px)`)
}

/* 平板及以下（≤1023px）：侧栏可折叠 */
export function useIsTabletOrBelow(): boolean {
  return useMediaQuery(`(max-width: ${BREAKPOINTS.tablet}px)`)
}

/* 窄屏（≤767px）：图表需要缩放 */
export function useIsNarrow(): boolean {
  return useIsMobile()
}
