import { AppShell } from '../../components/layout/AppShell'
import { EditorLayout } from '../../features/editor'

export function HomePage() {
  return (
    <AppShell
      title="Mon Petit Matos"
      subtitle="Structure principale de l'application de personnalisation textile, pensee pour rester lisible, modulaire et evolutive."
    >
      <EditorLayout />
    </AppShell>
  )
}
