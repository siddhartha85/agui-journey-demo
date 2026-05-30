/**
 * ComponentRenderer — AG-UI event → React component
 * ---------------------------------------------------
 * Routes each CUSTOM_COMPONENT event to the correct layout variant.
 * Default layout = generic components.
 * Journey-specific layouts = fully custom look & feel.
 */

import {
  WelcomeScreen, ProgressBar, JourneyForm, SummaryCard,
  DecisionScreen, Confirmation, InfoCard, ComparisonTable, OptionsButtons
} from '../components'

import { CardPreviewLayout }  from '../layouts/CardPreview'
import { FinancialLayout }    from '../layouts/Financial'
import { OnboardingLayout }   from '../layouts/Onboarding'
import { DocumentLayout }     from '../layouts/Document'

import type {
  CustomComponentEvent,
  WelcomeData, ProgressData, FormData, SummaryData,
  DecisionData, ConfirmationData, CardData, TableData, OptionsData
} from './types'

type OnUserAction = (message: string) => void

interface Props {
  event:        CustomComponentEvent
  layout?:      string
  onUserAction: OnUserAction
}

// ── Default component map ────────────────────────────────────────────────────
const DEFAULT_MAP: Record<string, React.FC<{ data: Record<string, unknown>; onUserAction: OnUserAction }>> = {
  welcome: ({ data, onUserAction }) => (
    <WelcomeScreen {...(data as unknown as WelcomeData)} onStart={(l) => onUserAction(l)} />
  ),
  progress: ({ data }) => (
    <ProgressBar {...(data as unknown as ProgressData)} />
  ),
  form: ({ data, onUserAction }) => (
    <JourneyForm {...(data as unknown as FormData)} onSubmit={(d) => onUserAction(d)} />
  ),
  summary: ({ data }) => (
    <SummaryCard {...(data as unknown as SummaryData)} />
  ),
  decision: ({ data }) => (
    <DecisionScreen {...(data as unknown as DecisionData)} />
  ),
  confirmation: ({ data }) => (
    <Confirmation {...(data as unknown as ConfirmationData)} />
  ),
  card: ({ data }) => (
    <InfoCard {...(data as unknown as CardData)} />
  ),
  table: ({ data }) => (
    <ComparisonTable {...(data as unknown as TableData)} />
  ),
  options: ({ data, onUserAction }) => (
    <OptionsButtons {...(data as unknown as OptionsData)} onChoice={(o) => onUserAction(o)} />
  ),
}

// ── Layout router ────────────────────────────────────────────────────────────
export function ComponentRenderer({ event, layout, onUserAction }: Props) {
  const componentName = event.component

  // Try layout-specific component first, fall back to default
  let Renderer: React.FC<{ data: Record<string, unknown>; onUserAction: OnUserAction }> | undefined

  if (layout === 'card_preview')  Renderer = CardPreviewLayout[componentName]
  if (layout === 'financial')     Renderer = FinancialLayout[componentName]
  if (layout === 'onboarding')    Renderer = OnboardingLayout[componentName]
  if (layout === 'document')      Renderer = DocumentLayout[componentName]

  // Fall back to default if no layout-specific component
  Renderer = Renderer ?? DEFAULT_MAP[componentName]

  if (!Renderer) {
    console.warn(`[AG-UI] Unknown component: "${componentName}"`)
    return null
  }

  return <Renderer data={event.data} onUserAction={onUserAction} />
}
