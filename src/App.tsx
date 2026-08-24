import { useState } from 'react'
import './game.css'
import TopBar from './components/TopBar'
import WorldMap from './components/WorldMap'
import SophiaPanel from './components/SophiaPanel'
import MissionPanel from './components/MissionPanel'
import BottomNav, { type PanelKind } from './components/BottomNav'
import ToastStack from './components/ToastStack'
import InventoryPanel from './components/panels/InventoryPanel'
import AchievementsPanel from './components/panels/AchievementsPanel'
import LeaderboardPanel from './components/panels/LeaderboardPanel'
import CalendarPanel from './components/panels/CalendarPanel'
import MessagesPanel from './components/panels/MessagesPanel'

function App() {
  const [openPanel, setOpenPanel] = useState<PanelKind | null>(null)

  return (
    <div className="game-root">
      <TopBar />

      <div className="game-body">
        <WorldMap />

        <aside className="side-column">
          <SophiaPanel />
          <MissionPanel />
        </aside>
      </div>

      <BottomNav onOpen={setOpenPanel} />
      <ToastStack />

      {openPanel === 'inventory' && <InventoryPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'achievements' && <AchievementsPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'leaderboard' && <LeaderboardPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'calendar' && <CalendarPanel onClose={() => setOpenPanel(null)} />}
      {openPanel === 'messages' && <MessagesPanel onClose={() => setOpenPanel(null)} />}
    </div>
  )
}

export default App
