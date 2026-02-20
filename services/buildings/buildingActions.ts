import { Dispatch, SetStateAction } from 'react';
import { BuildingData, BuildingType, GameState, GridPosition, Squad } from '../../types';
import { BUILD_COSTS, getBuildingSize, getUpgradeCost } from '../../constants';
import { isAreaOccupied as isAreaOccupiedFn } from './area';

interface BuildingActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  buildMode: BuildingType | null;
  setBuildMode: Dispatch<SetStateAction<BuildingType | null>>;
  targetBuildSquadId: string | null;
  setTargetBuildSquadId: Dispatch<SetStateAction<string | null>>;
  moveModeId: string | null;
  setMoveModeId: Dispatch<SetStateAction<string | null>>;
  setPendingSquadPosition: Dispatch<SetStateAction<GridPosition | null>>;
  pendingSquadPosition: GridPosition | null;
  newSquadName: string;
  setNewSquadName: Dispatch<SetStateAction<string>>;
  newSquadColor: string;
  setNewSquadColor: Dispatch<SetStateAction<string>>;
  isMaster: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setActiveTab: Dispatch<SetStateAction<'OVERVIEW' | 'KANBAN' | 'MENTOR' | 'ACADEMY' | 'MARKET' | 'WAREHOUSE'>>;
}

export const createBuildingActions = ({
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
}: BuildingActionsParams) => {
  const isAreaOccupied = (startPos: GridPosition, size: number, excludeBuildingId?: string) =>
    isAreaOccupiedFn(gameState.buildings, startPos, size, excludeBuildingId);

  const handleTileClick = (pos: GridPosition) => {
    if (!gameState.currentUser) return;

    // MOVE MODE
    if (moveModeId) {
      const building = gameState.buildings.find((b) => b.id === moveModeId);
      if (!building) {
        setMoveModeId(null);
        return;
      }
      const size = getBuildingSize(building.level, building.type);
      if (isAreaOccupied(pos, size, moveModeId)) {
        showToast('Espaço ocupado! Não é possível mover para cá.', 'error');
        return;
      }
      setGameState((prev) => ({
        ...prev,
        buildings: prev.buildings.map((b) => (b.id === moveModeId ? { ...b, position: pos } : b)),
        selectedBuildingId: null
      }));
      setMoveModeId(null);
      showToast('Construção movida com sucesso!', 'success');
      return;
    }

    // BUILD MODE
    if (buildMode) {
      const myHouse = gameState.buildings.find(
        (b) => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id
      );
      const isFirstHouse = buildMode === BuildingType.RESIDENTIAL && !myHouse;
      const cost = isFirstHouse || isMaster ? { coins: 0 } : BUILD_COSTS[buildMode];

      if (buildMode === BuildingType.RESIDENTIAL && myHouse && !isFirstHouse && !isMaster) {
        showToast('Você só pode ter uma Casa (HQ)!', 'error');
        setBuildMode(null);
        return;
      }

      if (buildMode === BuildingType.SQUAD_HQ) {
        if (isAreaOccupied(pos, 2)) {
          showToast('Espaço ocupado!', 'error');
          return;
        }
        const isFree = gameState.currentUser.squadId === 'temp_pending';
        if (!isFree && !isMaster && gameState.resources.coins < cost.coins) {
          showToast('Moedas insuficientes!', 'error');
          return;
        }
        setPendingSquadPosition(pos);
        setBuildMode(null);
        return;
      }

      const squadId = targetBuildSquadId || gameState.currentUser.squadId;

      // Check if squad already has this organizational building type
      if (buildMode !== BuildingType.RESIDENTIAL && buildMode !== BuildingType.DECORATION) {
        const existingBuilding = gameState.buildings.find((b) => b.type === buildMode && b.squadId === squadId);
        if (existingBuilding && !isMaster) {
          showToast('Sua Squad já possui esta construção! Apenas uma por tipo é permitida.', 'error');
          setBuildMode(null);
          return;
        }
      }

      if (gameState.resources.coins >= cost.coins) {
        if (isAreaOccupied(pos, 1)) {
          showToast('Espaço ocupado!', 'error');
          return;
        }

        const newBuilding: BuildingData = {
          id: Math.random().toString(36).substr(2, 9),
          ownerId: gameState.currentUser.id,
          type: buildMode,
          level: 1,
          position: pos,
          isPlaced: true,
          lastCollected: Date.now(),
          tasks: [],
          squadId
        };
        setGameState((prev) => ({
          ...prev,
          resources: { coins: prev.resources.coins - cost.coins },
          buildings: [...prev.buildings, newBuilding],
          selectedBuildingId: null
        }));
        setBuildMode(null);
        setTargetBuildSquadId(null);
        showToast('Construção realizada com sucesso!', 'success');
      } else {
        showToast('Moedas insuficientes!', 'error');
        setBuildMode(null);
      }
    } else {
      setGameState((prev) => ({ ...prev, selectedBuildingId: null }));
    }
  };

  const confirmCreateSquad = () => {
    if (!newSquadName.trim() || !pendingSquadPosition || !gameState.currentUser) return;

    const isOnboarding = gameState.currentUser.squadId === 'temp_pending';
    const cost = isOnboarding || isMaster ? 0 : BUILD_COSTS[BuildingType.SQUAD_HQ].coins;

    if (gameState.resources.coins < cost) return;

    const newSquadId = 'sq_' + Date.now();
    const newSquad: Squad = {
      id: newSquadId,
      name: newSquadName,
      color: newSquadColor
    };

    const newBuilding: BuildingData = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      ownerId: gameState.currentUser.id,
      type: BuildingType.SQUAD_HQ,
      level: 1,
      position: pendingSquadPosition,
      isPlaced: true,
      lastCollected: Date.now(),
      tasks: [],
      squadId: newSquadId
    };

    setGameState((prev) => {
      const updatedUser = isOnboarding ? { ...prev.currentUser!, squadId: newSquadId } : prev.currentUser!;

      return {
        ...prev,
        currentUser: updatedUser,
        resources: { coins: prev.resources.coins - cost },
        buildings: [...prev.buildings, newBuilding],
        squads: [...prev.squads, newSquad],
        selectedBuildingId: null
      };
    });

    setPendingSquadPosition(null);
    setNewSquadName('');
    showToast(`Squad ${newSquadName} fundada com sucesso!`, 'success');
  };

  const cancelCreateSquad = () => {
    setPendingSquadPosition(null);
    setNewSquadName('');
  };

  const updateSquad = (squadId: string, updates: Partial<Squad>) => {
    setGameState((prev) => ({
      ...prev,
      squads: prev.squads.map((s) => (s.id === squadId ? { ...s, ...updates } : s))
    }));
  };

  const updateBuilding = (id: string, updates: Partial<BuildingData>) => {
    setGameState((prev) => ({
      ...prev,
      buildings: prev.buildings.map((b) => (b.id === id ? { ...b, ...updates } : b))
    }));
  };

  const handleBuildingClick = (id: string) => {
    if (buildMode || moveModeId) return;
    setGameState((prev) => ({ ...prev, selectedBuildingId: id }));
    setActiveTab('OVERVIEW');
  };

  const upgradeSelected = () => {
    const b = gameState.buildings.find((bld) => bld.id === gameState.selectedBuildingId);
    if (!b) return;
    if (b.ownerId !== gameState.currentUser?.id && !isMaster) return;

    const nextSize = getBuildingSize(b.level + 1, b.type);
    if (nextSize > getBuildingSize(b.level, b.type)) {
      if (isAreaOccupied(b.position, nextSize, b.id)) {
        showToast('Sem espaço para expansão!', 'error');
        return;
      }
    }
    const cost = getUpgradeCost(b.level, b.type);
    if (gameState.resources.coins >= cost.coins || isMaster) {
      setGameState((prev) => ({
        ...prev,
        resources: { coins: prev.resources.coins - (isMaster ? 0 : cost.coins) },
        buildings: prev.buildings.map((building) =>
          building.id === b.id ? { ...building, level: building.level + 1 } : building
        )
      }));
      showToast('Construção evoluída!', 'success');
    } else {
      showToast('Moedas insuficientes!', 'error');
    }
  };

  const deleteSelected = () => {
    const b = gameState.buildings.find((bld) => bld.id === gameState.selectedBuildingId);
    if (!b) return;
    if (b.ownerId !== gameState.currentUser?.id && !isMaster) return;

    if (b.type === BuildingType.RESIDENTIAL && !isMaster) {
      showToast('Você não pode demolir sua base principal!', 'error');
      return;
    }
    if (!window.confirm('Tem certeza? Você receberá 50% das moedas investidas.')) return;
    const baseCost = BUILD_COSTS[b.type];
    setGameState((prev) => ({
      ...prev,
      resources: { coins: prev.resources.coins + Math.floor(baseCost.coins * 0.5) },
      buildings: prev.buildings.filter((build) => build.id !== b.id),
      selectedBuildingId: null
    }));
    showToast('Construção demolida.', 'info');
  };

  const handleGoToBase = () => {
    if (!gameState.currentUser) return;
    const myBase = gameState.buildings.find(
      (b) => b.type === BuildingType.RESIDENTIAL && b.ownerId === gameState.currentUser?.id
    );
    if (myBase) {
      setGameState((prev) => ({ ...prev, selectedBuildingId: myBase.id }));
      setActiveTab('OVERVIEW');
    } else {
      showToast('Você ainda não tem uma base!', 'error');
    }
  };

  const handleGoToSquad = () => {
    if (!gameState.currentUser) return;
    const mySquadHQ = gameState.buildings.find(
      (b) => b.type === BuildingType.SQUAD_HQ && b.squadId === gameState.currentUser?.squadId
    );
    if (mySquadHQ) {
      setGameState((prev) => ({ ...prev, selectedBuildingId: mySquadHQ.id }));
      setActiveTab('OVERVIEW');
    } else {
      showToast('Sua Squad ainda não tem um QG construído!', 'error');
    }
  };

  return {
    handleTileClick,
    confirmCreateSquad,
    cancelCreateSquad,
    updateSquad,
    updateBuilding,
    handleBuildingClick,
    upgradeSelected,
    deleteSelected,
    handleGoToBase,
    handleGoToSquad
  };
};
