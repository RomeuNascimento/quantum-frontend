import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import PaywallGate from './components/PaywallGate'
import OfflineBanner from './components/OfflineBanner'
import UpdatePrompt from './components/UpdatePrompt'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ingredientes from './pages/Ingredientes/index'
import IngredienteForm from './pages/Ingredientes/Form'
import Embalagens from './pages/Embalagens/index'
import EmbalagemForm from './pages/Embalagens/Form'
import Receitas from './pages/Receitas/index'
import ReceitaForm from './pages/Receitas/Form'
import ReceitaFicha from './pages/Receitas/Ficha'
import ImportarReceitas from './pages/Receitas/Importar'
import ImportarNota from './pages/Ingredientes/ImportarNota'
import Produtos from './pages/Produtos/index'
import ProdutoForm from './pages/Produtos/Form'
import ProdutoFicha from './pages/Produtos/Ficha'
import Precificacao from './pages/Precificacao/index'
import Relatorio from './pages/Relatorio/index'
import CustosFixos from './pages/CustosFixos/index'
import Planejamento from './pages/Planejamento/index'
import Assinatura from './pages/Assinatura/index'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <PaywallGate>{children}</PaywallGate>
}

function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <OfflineBanner />
      <UpdatePrompt />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        <Route path="/ingredientes" element={<PrivateRoute><Ingredientes /></PrivateRoute>} />
        <Route path="/ingredientes/importar-nota" element={<PrivateRoute><ImportarNota /></PrivateRoute>} />
        <Route path="/ingredientes/novo" element={<PrivateRoute><IngredienteForm /></PrivateRoute>} />
        <Route path="/ingredientes/:id" element={<PrivateRoute><IngredienteForm /></PrivateRoute>} />

        <Route path="/embalagens" element={<PrivateRoute><Embalagens /></PrivateRoute>} />
        <Route path="/embalagens/novo" element={<PrivateRoute><EmbalagemForm /></PrivateRoute>} />
        <Route path="/embalagens/:id" element={<PrivateRoute><EmbalagemForm /></PrivateRoute>} />

        <Route path="/receitas" element={<PrivateRoute><Receitas /></PrivateRoute>} />
        <Route path="/receitas/importar" element={<PrivateRoute><ImportarReceitas /></PrivateRoute>} />
        <Route path="/receitas/novo" element={<PrivateRoute><ReceitaForm /></PrivateRoute>} />
        <Route path="/receitas/:id" element={<PrivateRoute><ReceitaForm /></PrivateRoute>} />
        <Route path="/receitas/:id/ficha" element={<PrivateRoute><ReceitaFicha /></PrivateRoute>} />

        <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
        <Route path="/produtos/novo" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
        <Route path="/produtos/:id" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
        <Route path="/produtos/:id/ficha" element={<PrivateRoute><ProdutoFicha /></PrivateRoute>} />

        <Route path="/planejamento" element={<PrivateRoute><Planejamento /></PrivateRoute>} />
        <Route path="/precificacao" element={<PrivateRoute><Precificacao /></PrivateRoute>} />
        <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
        <Route path="/custos-fixos" element={<PrivateRoute><CustosFixos /></PrivateRoute>} />
        <Route path="/assinatura" element={<PrivateRoute><Assinatura /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  )
}
