/**
 * ComponentRenderer — AG-UI event → React component
 * ---------------------------------------------------
 * This is the ONE file a frontend developer edits to register components.
 *
 * To add a new component:
 *   1. Build your React component in /components/
 *   2. Add one line to COMPONENT_MAP below
 *   That's it. The renderer handles the rest.
 */

import {
  WelcomeScreen, ProgressBar, JourneyForm, SummaryCard,
  DecisionScreen, Confirmation, InfoCard, ComparisonTable, OptionsButtons
} from '../components'

import type {
  CustomComponentEvent,
  WelcomeData, ProgressData, FormData, SummaryData,
  DecisionData, ConfirmationData, CardData, TableData, OptionsData
} from './types'

/** Called when the user interacts with a component (clicks a button, submits a form) */
type OnUserAction = (message: string) => void

interface Props {
  event:        CustomComponentEvent
  onUserAction: OnUserAction
}

// ── Component map ─────────────────────────────────────────────────────────────
// To register a new component: add one entry here.
// Key   = component name sent by the agent in the CUSTOM_COMPONENT event
// Value = the React component to render

const COMPONENT_MAP: Record<string, React.FC<{ data: Record<string, unknown>; onUserAction: OnUserAction }>> = {

  welcome: ({ data, onUserAction }) => (
    <WelcomeScreen
      {...(data as unknown as WelcomeData)}
      onStart={(label) => onUserAction(label)}
    />
  ),

  progress: ({ data }) => (
    <ProgressBar {...(data as unknown as ProgressData)} />
  ),

  form: ({ data, onUserAction }) => (
    <JourneyForm
      {...(data as unknown as FormData)}
      onSubmit={(formData) => onUserAction(formData)}
    />
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
    <OptionsButtons
      {...(data as unknown as OptionsData)}
      onChoice={(opt) => onUserAction(opt)}
    />
  ),
}

// ── Renderer ──────────────────────────────────────────────────────────────────

export function ComponentRenderer({ event, onUserAction }: Props) {
  const Renderer = COMPONENT_MAP[event.component]

  if (!Renderer) {
    console.warn(`[AG-UI] Unknown component: "${event.component}". Register it in ComponentRenderer.tsx`)
    return null
  }

  return <Renderer data={event.data} onUserAction={onUserAction} />
}
