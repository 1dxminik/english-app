import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CharactersPage } from './pages/CharactersPage';
import { ConversationPage } from './pages/ConversationPage';
import { HistoryPage } from './pages/HistoryPage';
import { ConversationDetailPage } from './pages/ConversationDetailPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CharactersPage />} />
          <Route path="conversation/:characterId" element={<ConversationPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="history/:conversationId" element={<ConversationDetailPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
