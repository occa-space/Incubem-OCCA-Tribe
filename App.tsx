
import React, { useState, useEffect } from 'react';
import GameScene from './components/GameScene';
import { GameState, BuildingType, GridPosition } from './types';
import { BUILDING_METADATA } from './constants';
import MentorContainer from './components/mentor/MentorContainer';
import AcademyContainer from './components/academy/AcademyContainer';
import MarketContainer from './components/market/MarketContainer';
import WarehouseView from './components/base/WarehouseView';
import { INITIAL_BUILDINGS, INITIAL_RESOURCES, REAL_SQUADS, REAL_USERS } from './data/seed';
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
import { createLoginActions } from './services/auth/loginActions';
import { getSelectedBuildingMeta } from './services/buildings/selection';
import { useTaskModal } from './hooks/useTaskModal';

export default function App() {
  // Login State
  const [loginName, setLoginName] = useState('');
  const [loginCpf, setLoginCpf] = useState('');
  
  const [gameState, setGameState] = useState<GameState>({
    currentUser: null,
    users: REAL_USERS,
    squads: REAL_SQUADS, 
    player: {
      level: 1,
      currentXP: 0,
      nextLevelXP: 1000,
      totalPA: 0,
      reputation: 3.0,
      streak: 0
    },
    resources: INITIAL_RESOURCES,
    buildings: INITIAL_BUILDINGS,
    selectedBuildingId: null,
    sprintCycle: 1,
    sprintStartDate: Date.now()
  });
  
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

  // --- LOGIN FLOW ---
  const loginActions = createLoginActions({
    loginName,
    loginCpf,
    setGameState,
    showToast
  });

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
  const daysElapsed = Math.floor((Date.now() - gameState.sprintStartDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, SPRINT_DURATION_DAYS - daysElapsed);

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

  if (!gameState.currentUser) {
    return (
      <LoginScreen
        loginName={loginName}
        loginCpf={loginCpf}
        onNameChange={setLoginName}
        onCpfChange={setLoginCpf}
        onSubmit={loginActions.handleLoginSubmit}
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
        coins={gameState.resources.coins}
        showProfileMenu={showProfileMenu}
        onToggleProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        onOpenSquadSelector={() => { setShowSquadSelectorModal(true); setShowProfileMenu(false); }}
        onLogout={loginActions.handleLogout}
      />

      <FloatingMenu
        visible={!selectedBuilding && !buildMode && !moveModeId}
        isMainMenuOpen={isMainMenuOpen}
        onToggleMainMenu={() => setIsMainMenuOpen(!isMainMenuOpen)}
        onCreateTask={() => taskActions.handleOpenCreateTask(undefined)}
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
                    sprintCycle={gameState.sprintCycle}
                  />
              )}
              {activeTab === 'ACADEMY' && isTribalCenter && (
                   <AcademyContainer 
                        gameState={gameState}
                        currentUser={gameState.currentUser!}
                   />
              )}
              {activeTab === 'MARKET' && isTribalCenter && (
                   <MarketContainer 
                        currentUser={gameState.currentUser!}
                        userCoins={gameState.resources.coins}
                        onPurchaseSuccess={(cost) => {
                            setGameState(prev => ({
                                ...prev,
                                resources: { coins: prev.resources.coins - cost }
                            }));
                            showToast("Compra realizada! Vá ao armazém na sua base.", "success");
                        }}
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
          setEditingTask={setEditingTask}
          setIsCreatingTask={setIsCreatingTask}
          isMaster={isMaster}
        />
      )}
    </div>
  );
}
