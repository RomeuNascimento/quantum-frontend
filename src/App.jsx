import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ingredientes from './pages/Ingredientes/index'
import IngredienteForm from './pages/Ingredientes/Form'
import Embalagens from './pages/Embalagens/index'
import EmbalagemForm from './pages/Embalagens/Form'
import Receitas from './pages/Receitas/index'
import ReceitaForm from './pages/Receitas/Form'
import ImportarReceitas from './pages/Receitas/Importar'
import ImportarNota from './pages/Ingredientes/ImportarNota'
import Produtos from './pages/Produtos/index'
import ProdutoForm from './pages/Produtos/Form'
import Precificacao from './pages/Precificacao/index'
import CustosFixos from './pages/CustosFixos/index'
import Planejamento from './pages/Planejamento/index'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <BrowserRouter>
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

        <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
        <Route path="/produtos/novo" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />
        <Route path="/produtos/:id" element={<PrivateRoute><ProdutoForm /></PrivateRoute>} />

        <Route path="/planejamento" element={<PrivateRoute><Planejamento /></PrivateRoute>} />
        <Route path="/precificacao" element={<PrivateRoute><Precificacao /></PrivateRoute>} />
        <Route path="/custos-fixos" element={<PrivateRoute><CustosFixos /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
