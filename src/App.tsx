import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { GameHub } from '@/components/GameHub';
import { GamePage } from '@/components/GamePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GameHub />} />
        <Route path="/play/:gameId" element={<GamePage />} />
      </Routes>
    </Layout>
  );
}
