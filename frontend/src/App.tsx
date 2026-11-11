import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { HomePage } from './pages/HomePage';
import { ItemDiscussionPage } from './pages/ItemDiscussionPage';
import { ListingCreatePage } from './pages/ListingCreatePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { ListingEditPage } from './pages/ListingEditPage';
import { LoginPage } from './pages/LoginPage';
import { MarketDashboardPage } from './pages/MarketDashboardPage';
import { MyListingDetailPage } from './pages/MyListingDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';

interface AppProps {
  readonly basename?: string;
}

export const App: React.FC<AppProps> = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />
    <Route element={<AppLayout />}>
      <Route element={<HomePage />} index />
      <Route element={<SearchResultsPage />} path="/search" />
      <Route element={<ListingDetailPage />} path="/listings/:id" />
      <Route element={<MyListingDetailPage />} path="/my/listings/:id" />
      <Route element={<ListingEditPage />} path="/my/listings/:id/edit" />
      <Route element={<ListingCreatePage />} path="/sell" />
      <Route element={<MarketDashboardPage />} path="/market" />
      <Route element={<CommunityFeedPage />} path="/community" />
      <Route element={<ItemDiscussionPage />} path="/community/items/:id" />
      <Route element={<HomePage />} path="*" />
    </Route>
  </Routes>
);

export default App;
