
import React, { useState, useEffect, useRef } from 'react';
import GameScene from './components/GameScene';
import { GameState, BuildingType, GridPosition, MarketItem, PurchaseRecord } from './types';
import { BUILDING_METADATA } from './constants';
import MentorContainer from './components/mentor/MentorContainer';
import AcademyContainer from './components/academy/AcademyContainer';
import MarketContainer from './components/market/MarketContainer';
import WarehouseView from './components/base/WarehouseView';
import LoginScreen from './components/app/LoginScreen';
import ToastNotification from './components/overlays/ToastNotification';
import RenewalPromptModal, { RenewalPromptData } from './components/modals/RenewalPromptModal';
import ZoomControls from './components/app/ZoomControls';
import MoveModeBanner from './components/app/MoveModeBanner';
import BuildModeBanner from './components/app/BuildModeBanner';
import SquadSelectorModal from './components/modals/SquadSelectorModal';
import NewSquadModal from './components/modals/NewSquadModal';
import BuildingSelectModal from './components/modals/BuildingSelectModal';
import BuildingModalHeader from './components/modals/BuildingModalHeader';
import BuildingModalTabs from './components/modals/BuildingModalTabs';
import OverviewTab from './components/app/OverviewTab';
import KanbanTab from './components/app/KanbanTab';
import TaskDetailModal from './components/modals/TaskDetailModal';
import { KANBAN_COLUMNS, SWIMLANES, SQUAD_COLORS, SPRINT_DURATION_DAYS } from './components/app/config/appConfig';
import { calculateTaskPA } from './services/tasks/taskUtils';
import { renderSprintChart } from './components/app/ui/renderSprintChart';
import LocalTrophyIcon from './components/icons/LocalTrophyIcon';
import { getDisplayTasks } from './services/tasks/taskDisplay';
import { createBuildingActions } from './services/buildings/buildingActions';
import { createTaskActions } from './services/tasks/taskActions';
import Hud from './components/app/Hud';
import FloatingMenu from './components/app/FloatingMenu';
import { getTaskStats } from './services/stats/taskStats';
import { getSquadStats } from './services/stats/squadStats';
import { useToast } from './hooks/useToast';
import { getSelectedBuildingMeta } from './services/buildings/selection';
import { useTaskModal } from './hooks/useTaskModal';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { loadGameState } from './services/supabase/gameState';
import { supabase } from './services/supabase/client';
import { ensureInitialData } from './services/supabase/bootstrap';
import { subscribeToGameData } from './services/supabase/realtime';
import { updateProfile } from './services/supabase/repositories/profiles';
import { updateAppState } from './services/supabase/repositories/appState';
import { insertPurchase, upsertMarketItem } from './services/supabase/repositories/market';
import { upsertResources } from './services/supabase/repositories/resources';
import { upsertDaily } from './services/supabase/repositories/dailies';
import { upsertFeedback } from './services/supabase/repositories/feedbacks';
import { upsertLearningTrack } from './services/supabase/repositories/academy';

export default function App() {
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const { session, loading: authLoading } = useSupabaseSession();
  
  const [gameState, setGameState] = useState<GameState>({
    currentUser: null,
    users: [],
    squads: [], 
    player: {
      level: 1,
      currentXP: 0,
      nextLevelXP: 1000,
      totalPA: 0,
      reputation: 3.0,
      streak: 0
    },
    resources: { coins: 0 },
    buildings: [],
    selectedBuildingId: null,
    sprintCycle: 1,
    sprintStartDate: Date.now()
  });

  const [isGameLoading, setIsGameLoading] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  
  const [buildMode, setBuildMode] = useState<BuildingType | null>(null);
  const [targetBuildSquadId, setTargetBuildSquadId] = useState<string | null>(null); 
  
  const [moveModeId, setMoveModeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'KANBAN' | 'MENTOR' | 'ACADEMY' | 'MARKET' | 'WAREHOUSE'>('OVERVIEW');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [showBuildingSelectModal, setShowBuildingSelectModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSquadSelectorModal, setShowSquadSelectorModal] = useState(false); 

  const [dashboardTimeFilter, setDashboardTimeFilter] = useState<'ALL' | number>('ALL');

  // Unified Task Modal State
  const {
    editingTask,
    setEditingTask,
    isCreatingTask,
    setIsCreatingTask,
    taskModalTab,
    setTaskModalTab
  } = useTaskModal();

  // Limit Renewal Logic
  const [renewalPrompt, setRenewalPrompt] = useState<RenewalPromptData | null>(null);

  const [pendingSquadPosition, setPendingSquadPosition] = useState<GridPosition | null>(null);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadColor, setNewSquadColor] = useState(SQUAD_COLORS[0]);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Notifications
  const { notification, showToast } = useToast();

  const isMaster = gameState.currentUser?.role === 'Master';

  // --- LOGIC: FIRST TIME HOME PLACEMENT ---
  useEffect(() => {
    if (gameState.currentUser && !isMaster) {
      const myHouse = gameState.buildings.find(
        b => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id
      );
      if (!myHouse && !buildMode && !gameState.selectedBuildingId && !pendingSquadPosition) {
        setBuildMode(BuildingType.RESIDENTIAL);
      }
    }
  }, [gameState.currentUser, gameState.buildings, buildMode, pendingSquadPosition, isMaster]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Preencha email e senha.');
      return;
    }

    if (authMode === 'SIGN_UP' && !authName.trim()) {
      setAuthError('Informe seu nome.');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      if (authMode === 'SIGN_IN') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { name: authName.trim() }
          }
        });
        if (error) throw error;
        if (!data.session) {
          showToast('Conta criada. Verifique seu email para confirmar o acesso.', 'info');
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    let ignore = false;
    if (!session?.user?.id) return;

    setIsGameLoading(true);
    loadGameState(session.user.id)
      .then(async (loaded) => {
        if (ignore) return;
        setGameState(loaded);
        const changed = await ensureInitialData(session.user.id, loaded.currentUser?.role === 'Master');
        if (changed) {
          const refreshed = await loadGameState(session.user.id);
          if (!ignore) setGameState(refreshed);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Erro ao carregar dados do Supabase.', 'error');
      })
      .finally(() => {
        if (!ignore) setIsGameLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [session?.user?.id, showToast]);

  useEffect(() => {
    if (!session?.user?.id || !gameState.currentUser) return;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = window.setTimeout(async () => {
        refreshTimerRef.current = null;
        try {
          const refreshed = await loadGameState(session.user.id);
          setGameState(refreshed);
        } catch (err) {
          console.error(err);
        }
      }, 400);
    };

    const channel = subscribeToGameData({
      squadId: gameState.currentUser.squadId,
      isMaster: gameState.currentUser.role === 'Master',
      onChange: scheduleRefresh
    });

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, gameState.currentUser?.squadId, gameState.currentUser?.role]);

  useEffect(() => {
    if (!gameState.currentUser) return;
    if (gameState.currentUser.role !== 'Master') return;

    const checkSprint = async () => {
      if (gameState.sprintStartDate <= 0) return;
      const sprintStartMs = gameState.sprintStartDate < 10_000_000_000 ? gameState.sprintStartDate * 1000 : gameState.sprintStartDate;
      const elapsedDays = Math.floor((Date.now() - sprintStartMs) / (1000 * 60 * 60 * 24));
      if (elapsedDays < SPRINT_DURATION_DAYS) return;

      const cyclesPassed = Math.floor(elapsedDays / SPRINT_DURATION_DAYS);
      const nextSprintCycle = gameState.sprintCycle + cyclesPassed;
      const nextStartDate = sprintStartMs + cyclesPassed * SPRINT_DURATION_DAYS * 24 * 60 * 60 * 1000;

      setGameState((prev) => ({
        ...prev,
        sprintCycle: nextSprintCycle,
        sprintStartDate: nextStartDate
      }));

      try {
        await updateAppState({
          sprint_cycle: nextSprintCycle,
          sprint_start_date: nextStartDate
        });
      } catch (err) {
        console.error(err);
        showToast('Erro ao atualizar sprint no Supabase.', 'error');
      }
    };

    const interval = window.setInterval(checkSprint, 60 * 1000);
    void checkSprint();

    return () => window.clearInterval(interval);
  }, [gameState.currentUser, gameState.sprintCycle, gameState.sprintStartDate, showToast]);

  const startNewSprint = async () => {
    if (!isMaster) return;
    const nextSprintCycle = gameState.sprintCycle + 1;
    const nextStartDate = Date.now();
    setGameState((prev) => ({
      ...prev,
      sprintCycle: nextSprintCycle,
      sprintStartDate: nextStartDate
    }));
    try {
      await updateAppState({
        sprint_cycle: nextSprintCycle,
        sprint_start_date: nextStartDate
      });
      showToast('Novo sprint iniciado.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao iniciar novo sprint.', 'error');
    }
  };

  const resetSprint = async () => {
    if (!isMaster) return;
    if (!window.confirm('Resetar sprint para 0? Isso reinicia o ciclo para todos.')) return;
    const nextSprintCycle = 0;
    const nextStartDate = 0;
    setGameState((prev) => ({
      ...prev,
      sprintCycle: nextSprintCycle,
      sprintStartDate: nextStartDate
    }));
    try {
      await updateAppState({
        sprint_cycle: nextSprintCycle,
        sprint_start_date: nextStartDate
      });
      showToast('Sprint resetado para 0.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao resetar sprint.', 'error');
    }
  };

  const buildingActions = createBuildingActions({
    gameState,
    setGameState,
    buildMode,
    setBuildMode,
    targetBuildSquadId,
    setTargetBuildSquadId,
    moveModeId,
    setMoveModeId,
    setPendingSquadPosition,
    pendingSquadPosition,
    newSquadName,
    setNewSquadName,
    newSquadColor,
    setNewSquadColor,
    isMaster,
    showToast,
    setActiveTab
  });

  const taskActions = createTaskActions({
    gameState,
    setGameState,
    editingTask,
    setEditingTask,
    isCreatingTask,
    setIsCreatingTask,
    setTaskModalTab,
    setIsMainMenuOpen,
    setDraggedTaskId,
    setRenewalPrompt,
    renewalPrompt,
    showToast
  });

  const selectedBuilding = gameState.buildings.find(b => b.id === gameState.selectedBuildingId);
  const { isOwner, isMyHouse, isSquadHQ, isTribalCenter, buildingSquad } = getSelectedBuildingMeta({
    gameState,
    selectedBuilding
  });

  // Calculate days remaining
  const sprintStartMs = gameState.sprintStartDate > 0
    ? (gameState.sprintStartDate < 10_000_000_000 ? gameState.sprintStartDate * 1000 : gameState.sprintStartDate)
    : 0;
  const daysElapsed = sprintStartMs > 0 ? Math.floor((Date.now() - sprintStartMs) / (1000 * 60 * 60 * 24)) : 0;
  const daysRemaining = sprintStartMs > 0 ? Math.max(0, SPRINT_DURATION_DAYS - daysElapsed) : 0;

  const displayTasks = getDisplayTasks({
      gameState,
      selectedBuilding,
      isMyHouse,
      isSquadHQ
  });
  const statsTasks = (isMyHouse || isSquadHQ) ? displayTasks : (selectedBuilding?.tasks || []);
  
  const { plannedPA, concludedPA, paLimit, concludedPercent } = getTaskStats({
    statsTasks,
    selectedBuilding
  });

  const squadStats = isSquadHQ && selectedBuilding.squadId
    ? getSquadStats({ displayTasks, dashboardTimeFilter, concludedPA })
    : {
        plannedPA: 0,
        completedPA: 0,
        totalXP: 0,
        reputation: 0,
        level: 1,
        currentXPInLevel: 0,
        nextLevelThreshold: 1000,
        xpProgress: 0
  };

  const handlePurchase = async (item: MarketItem) => {
    if (!gameState.currentUser) return;
    if (gameState.resources.coins < item.cost) {
      showToast('Moedas insuficientes.', 'error');
      return;
    }
    if (item.stock <= 0) {
      showToast('Sem estoque disponível.', 'error');
      return;
    }

    const purchase: PurchaseRecord = {
      id: crypto.randomUUID(),
      itemId: item.id,
      userId: gameState.currentUser.id,
      userName: gameState.currentUser.name,
      itemName: item.name,
      itemCost: item.cost,
      timestamp: Date.now(),
      status: 'PENDING'
    };

    const nextCoins = gameState.resources.coins - item.cost;
    const nextStock = item.stock - 1;

    setGameState((prev) => ({
      ...prev,
      resources: { coins: nextCoins },
      marketItems: prev.marketItems?.map((i) => (i.id === item.id ? { ...i, stock: nextStock } : i)),
      purchases: [...(prev.purchases || []), purchase]
    }));

    try {
      await insertPurchase(purchase);
      await upsertMarketItem({ ...item, stock: nextStock });
      await upsertResources(gameState.currentUser.id, { coins: nextCoins });
      showToast('Compra registrada.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao registrar compra.', 'error');
    }
  };

  const handleCreateDaily = async () => {
    if (!gameState.currentUser) return;
    const yesterday = window.prompt('Ontem, eu...') || '';
    const today = window.prompt('Hoje, vou...') || '';
    const blockers = window.prompt('Impedimentos?') || '';
    if (!yesterday.trim() || !today.trim()) {
      showToast('Daily precisa de ontem e hoje.', 'error');
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      userId: gameState.currentUser.id,
      squadId: gameState.currentUser.squadId,
      memberName: gameState.currentUser.name,
      role: gameState.currentUser.role || 'Executor',
      date: new Date().toISOString().slice(0, 10),
      yesterday,
      today,
      blockers,
      timestamp: Date.now()
    };

    setGameState((prev) => ({
      ...prev,
      dailies: [...(prev.dailies || []), entry]
    }));

    try {
      await upsertDaily(entry);
      showToast('Daily registrada.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar daily.', 'error');
    }
  };

  const handleCreateFeedback = async () => {
    if (!gameState.currentUser) return;
    const targetName = window.prompt('Para quem é o feedback? (nome)') || '';
    const target = gameState.users.find((u) => u.name.toLowerCase() === targetName.trim().toLowerCase());
    if (!target) {
      showToast('Usuário não encontrado.', 'error');
      return;
    }
    if (target.id === gameState.currentUser.id) {
      showToast('Você não pode enviar feedback para si mesmo.', 'error');
      return;
    }
    const qComm = window.prompt('Feedback comunicação:') || '';
    const qImpact = window.prompt('Impacto percebido:') || '';

    const existingEntry = (gameState.feedbacks || []).find(
      (f) =>
        f.sourceUserId === gameState.currentUser!.id &&
        f.targetUserId === target.id &&
        f.sprint === gameState.sprintCycle
    );

    const entry = {
      id: existingEntry?.id || crypto.randomUUID(),
      squadId: gameState.currentUser.squadId,
      sourceUserId: gameState.currentUser.id,
      targetUserId: target.id,
      sprint: gameState.sprintCycle,
      relationship: 'MENTOR_TO_EXECUTOR' as const,
      q_comm: qComm || undefined,
      q_impact: qImpact || undefined,
      timestamp: Date.now()
    };

    setGameState((prev) => ({
      ...prev,
      feedbacks: existingEntry
        ? (prev.feedbacks || []).map((f) => (f.id === existingEntry.id ? entry : f))
        : [...(prev.feedbacks || []), entry]
    }));

    try {
      await upsertFeedback(entry);
      showToast(existingEntry ? 'Feedback atualizado.' : 'Feedback registrado.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar feedback.', 'error');
    }
  };

  const handleCreateTrack = async () => {
    if (!gameState.currentUser) return;
    const title = window.prompt('Título da trilha:') || '';
    const description = window.prompt('Descrição:') || '';
    if (!title.trim()) {
      showToast('Título obrigatório.', 'error');
      return;
    }
    const track = {
      id: crypto.randomUUID(),
      gapId: 'gap_' + Date.now(),
      title,
      description: description || '',
      urgency: 'MÉDIO' as const,
      videos: [],
      createdAt: Date.now(),
      status: 'DRAFT' as const,
      totalViews: 0,
      completions: 0
    };

    setGameState((prev) => ({
      ...prev,
      academyTracks: [...(prev.academyTracks || []), track]
    }));

    try {
      await upsertLearningTrack(track);
      showToast('Trilha criada.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar trilha.', 'error');
    }
  };

  if (authLoading || isGameLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900 text-slate-200">
        Carregando...
      </div>
    );
  }

  if (!session || !gameState.currentUser) {
    return (
      <LoginScreen
        mode={authMode}
        name={authName}
        email={authEmail}
        password={authPassword}
        onNameChange={setAuthName}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => {
          setAuthMode((prev) => (prev === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN'));
          setAuthError(null);
        }}
        isLoading={isAuthSubmitting}
        errorMessage={authError}
      />
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900 overflow-hidden text-slate-200 font-sans">
      <div className="absolute inset-0 z-0">
        <GameScene 
            gameState={gameState} 
            zoomLevel={zoomLevel}
            onTileClick={buildingActions.handleTileClick} 
            onBuildingClick={buildingActions.handleBuildingClick} 
        />
      </div>

      {notification && <ToastNotification notification={notification} />}

      {/* RENEWAL PROMPT MODAL */}
      {renewalPrompt && <RenewalPromptModal renewalPrompt={renewalPrompt} onRenew={taskActions.handleRenewal} />}

      {/* ZOOM CONTROLS */}
      <ZoomControls
        onZoomIn={() => setZoomLevel((z) => Math.min(2, z + 0.1))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
      />

      {/* MOVE MODE BANNER */}
      <MoveModeBanner visible={Boolean(moveModeId)} />

      {/* BUILD MODE BANNER */}
      {!moveModeId && <BuildModeBanner buildMode={buildMode} />}

      <Hud
        currentUser={gameState.currentUser}
        playerLevel={gameState.player.level}
        sprintCycle={gameState.sprintCycle}
        daysRemaining={daysRemaining}
        daysElapsed={daysElapsed}
        sprintStartDate={gameState.sprintStartDate}
        coins={gameState.resources.coins}
        showProfileMenu={showProfileMenu}
        onToggleProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        onOpenSquadSelector={() => { setShowSquadSelectorModal(true); setShowProfileMenu(false); }}
        onStartNewSprint={isMaster ? startNewSprint : undefined}
        onResetSprint={isMaster ? resetSprint : undefined}
        onLogout={handleLogout}
      />

      <FloatingMenu
        visible={!selectedBuilding && !buildMode && !moveModeId}
        isMainMenuOpen={isMainMenuOpen}
        isMaster={isMaster}
        onToggleMainMenu={() => setIsMainMenuOpen(!isMainMenuOpen)}
        onCreateTask={() => taskActions.handleOpenCreateTask(undefined)}
        onCreateBase={() => {
          setBuildMode(BuildingType.RESIDENTIAL);
          setIsMainMenuOpen(false);
          showToast('Modo de Construção de Base Ativo: Clique no mapa para iniciar.', 'info');
        }}
        onCreateProject={() => {
          setShowBuildingSelectModal(true);
          setIsMainMenuOpen(false);
        }}
        onCreateSquad={() => { 
          setBuildMode(BuildingType.SQUAD_HQ); 
          setIsMainMenuOpen(false); 
          showToast("Modo de Fundação de Squad Ativo: Clique no mapa para iniciar o QG.", "info");
        }}
        onGoToBase={buildingActions.handleGoToBase}
        onGoToSquad={buildingActions.handleGoToSquad}
      />

      {showSquadSelectorModal && gameState.currentUser && (
        <SquadSelectorModal
          squads={gameState.squads}
          currentUser={gameState.currentUser}
          onSelectSquad={(squad) => {
            setGameState((prev) => ({
              ...prev,
              currentUser: prev.currentUser ? { ...prev.currentUser, squadId: squad.id } : prev.currentUser,
              users: prev.users.map((u) => (u.id === prev.currentUser?.id ? { ...u, squadId: squad.id } : u))
            }));
            setShowSquadSelectorModal(false);
            void updateProfile(gameState.currentUser!.id, { squadId: squad.id }).catch(() => {
              showToast('Erro ao atualizar sua squad.', 'error');
            });
            showToast(`Squad alterada para ${squad.name}.`, 'success');
          }}
          onClose={() => setShowSquadSelectorModal(false)}
        />
      )}

      {pendingSquadPosition && (
        <NewSquadModal
          newSquadName={newSquadName}
          newSquadColor={newSquadColor}
          squadColors={SQUAD_COLORS}
          currentUser={gameState.currentUser}
          onNameChange={setNewSquadName}
          onColorChange={setNewSquadColor}
          onCancel={buildingActions.cancelCreateSquad}
          onConfirm={buildingActions.confirmCreateSquad}
        />
      )}

      {/* BUILDING MODAL - Z-INDEX 50 */}
      {selectedBuilding && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
          <div className="bg-slate-800 border-2 border-slate-600 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            <BuildingModalHeader
              selectedBuilding={selectedBuilding}
              buildingSquad={buildingSquad}
              isMyHouse={isMyHouse}
              isSquadHQ={isSquadHQ}
              isTribalCenter={isTribalCenter}
              plannedPA={plannedPA}
              concludedPA={concludedPA}
              concludedPercent={concludedPercent}
              paLimit={paLimit}
              onClose={() => setGameState((prev) => ({ ...prev, selectedBuildingId: null }))}
            />

            <BuildingModalTabs
              activeTab={activeTab}
              isTribalCenter={isTribalCenter}
              isMyHouse={isMyHouse}
              onTabChange={setActiveTab}
            />
            <div className="flex-1 overflow-hidden relative bg-slate-900/50">
              {activeTab === 'OVERVIEW' && (
                <OverviewTab
                  isTribalCenter={isTribalCenter}
                  selectedBuilding={selectedBuilding}
                  gameState={gameState}
                  displayTasks={displayTasks}
                  dashboardTimeFilter={dashboardTimeFilter}
                  onDashboardTimeFilterChange={(value) => setDashboardTimeFilter(value)}
                  renderSprintChart={renderSprintChart}
                  LocalTrophyIcon={LocalTrophyIcon}
                  updateBuilding={buildingActions.updateBuilding}
                  isOwner={isOwner}
                  isMaster={isMaster}
                  upgradeSelected={buildingActions.upgradeSelected}
                  onMoveSelected={() => {
                    setMoveModeId(selectedBuilding.id);
                    setGameState((prev) => ({ ...prev, selectedBuildingId: null }));
                  }}
                  onDeleteSelected={buildingActions.deleteSelected}
                  calculateTaskPA={calculateTaskPA}
                />
              )}
              {activeTab === 'MENTOR' && isTribalCenter && (
                  <MentorContainer 
                    currentUser={gameState.currentUser!}
                    users={gameState.users}
                    squads={gameState.squads}
                    feedbacks={gameState.feedbacks || []}
                    sprintCycle={gameState.sprintCycle}
                    onCreateDaily={handleCreateDaily}
                    onCreateFeedback={handleCreateFeedback}
                  />
              )}
              {activeTab === 'ACADEMY' && isTribalCenter && (
                   <AcademyContainer 
                        gameState={gameState}
                        currentUser={gameState.currentUser!}
                        onCreateTrack={handleCreateTrack}
                   />
              )}
              {activeTab === 'MARKET' && isTribalCenter && (
                   <MarketContainer 
                        currentUser={gameState.currentUser!}
                        userCoins={gameState.resources.coins}
                        items={gameState.marketItems || []}
                        onPurchase={handlePurchase}
                   />
              )}
              {activeTab === 'WAREHOUSE' && isMyHouse && (
                   <WarehouseView currentUser={gameState.currentUser!} />
              )}
              {activeTab === 'KANBAN' && (
                <KanbanTab
                  isMyHouse={isMyHouse}
                  isSquadHQ={isSquadHQ}
                  selectedBuilding={selectedBuilding}
                  displayTasks={displayTasks}
                  kanbanColumns={KANBAN_COLUMNS}
                  swimlanes={SWIMLANES}
                  calculateTaskPA={calculateTaskPA}
                  onOpenCreateTask={taskActions.handleOpenCreateTask}
                  onDragOver={taskActions.handleDragOver}
                  onDrop={taskActions.handleDrop}
                  onDragStart={taskActions.handleDragStart}
                  onSelectTask={(buildingId, task) => {
                    setIsCreatingTask(false);
                    setEditingTask({ buildingId, task });
                    setTaskModalTab(1);
                  }}
                  draggedTaskId={draggedTaskId}
                  gameState={gameState}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showBuildingSelectModal && (
        <BuildingSelectModal
          buildings={gameState.buildings}
          squads={gameState.squads}
          currentUser={gameState.currentUser}
          targetBuildSquadId={targetBuildSquadId}
          isMaster={isMaster}
          onClose={() => setShowBuildingSelectModal(false)}
          onSelectType={(type) => {
            const meta = BUILDING_METADATA[type];
            const targetSquad = targetBuildSquadId || gameState.currentUser?.squadId;
            const isBuilt = gameState.buildings.some((b) => b.type === type && b.squadId === targetSquad);
            if (isBuilt && !isMaster) return;
            setBuildMode(type);
            setMoveModeId(null);
            setGameState((prev) => ({ ...prev, selectedBuildingId: null }));
            setShowBuildingSelectModal(false);
            showToast(`Modo de Construção: ${meta.title}. Clique no mapa para iniciar.`, 'info');
          }}
        />
      )}

      {/* TASK DETAIL MODAL */}
      {editingTask && (
        <TaskDetailModal
          editingTask={editingTask}
          isCreatingTask={isCreatingTask}
          taskModalTab={taskModalTab}
          setTaskModalTab={setTaskModalTab}
          gameState={gameState}
          updateTask={taskActions.updateTask}
          handleTaskFieldUpdate={taskActions.handleTaskFieldUpdate}
          handleSaveNewTask={taskActions.handleSaveNewTask}
          confirmGrading={taskActions.confirmGrading}
          calculateTaskPA={calculateTaskPA}
          deleteTask={taskActions.deleteTask}
          setEditingTask={setEditingTask}
          setIsCreatingTask={setIsCreatingTask}
          isMaster={isMaster}
        />
      )}
    </div>
  );
}
