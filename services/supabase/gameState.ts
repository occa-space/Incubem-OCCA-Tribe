import { GameState, PlayerProfile, Resources } from '../../types';
import { supabase } from './client';
import { DbAppState, DbBuilding, DbDailyEntry, DbFeedbackEntry, DbLearningTrack, DbMarketItem, DbPlayer, DbProfile, DbPurchaseRecord, DbResources, DbSquad, DbTask, mapBuildingRow, mapDailyRow, mapFeedbackRow, mapLearningTrackRow, mapMarketItemRow, mapPlayerRow, mapProfileRow, mapPurchaseRow, mapResourcesRow, mapSquadRow, mapTaskRow } from './mappers';
import { throwIfError } from './utils';

const DEFAULT_PLAYER: PlayerProfile = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  totalPA: 0,
  reputation: 3.0,
  streak: 0
};

const DEFAULT_RESOURCES: Resources = {
  coins: 0
};

const DEFAULT_APP_STATE = {
  sprint_cycle: 1,
  sprint_start_date: Date.now()
};

const ensureProfile = async (userId: string, nameFallback: string) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIfError(error);
  if (data) return data as DbProfile;

  const newProfile: DbProfile = {
    id: userId,
    name: nameFallback,
    color: '#94a3b8',
    avatar: null,
    squad_id: 'sq_osc',
    role: 'Executor'
  };
  const insertResult = await supabase.from('profiles').insert(newProfile).select('*').single();
  throwIfError(insertResult.error);
  return insertResult.data as DbProfile;
};

const ensurePlayer = async (userId: string) => {
  const { data, error } = await supabase.from('players').select('*').eq('user_id', userId).maybeSingle();
  throwIfError(error);
  if (data) return data as DbPlayer;
  const insertResult = await supabase.from('players').insert({
    user_id: userId,
    level: DEFAULT_PLAYER.level,
    current_xp: DEFAULT_PLAYER.currentXP,
    next_level_xp: DEFAULT_PLAYER.nextLevelXP,
    total_pa: DEFAULT_PLAYER.totalPA,
    reputation: DEFAULT_PLAYER.reputation,
    streak: DEFAULT_PLAYER.streak
  }).select('*').single();
  throwIfError(insertResult.error);
  return insertResult.data as DbPlayer;
};

const ensureResources = async (userId: string) => {
  const { data, error } = await supabase.from('resources').select('*').eq('user_id', userId).maybeSingle();
  throwIfError(error);
  if (data) return data as DbResources;
  const insertResult = await supabase.from('resources').insert({
    user_id: userId,
    coins: DEFAULT_RESOURCES.coins
  }).select('*').single();
  throwIfError(insertResult.error);
  return insertResult.data as DbResources;
};

const ensureAppState = async (isMaster: boolean) => {
  const { data, error } = await supabase.from('app_state').select('*').eq('id', 'global').maybeSingle();
  throwIfError(error);
  if (data) return data as DbAppState;
  if (!isMaster) {
    return {
      id: 'global',
      sprint_cycle: DEFAULT_APP_STATE.sprint_cycle,
      sprint_start_date: DEFAULT_APP_STATE.sprint_start_date
    } as DbAppState;
  }
  const insertResult = await supabase.from('app_state').insert({
    id: 'global',
    sprint_cycle: DEFAULT_APP_STATE.sprint_cycle,
    sprint_start_date: DEFAULT_APP_STATE.sprint_start_date
  }).select('*').single();
  throwIfError(insertResult.error);
  return insertResult.data as DbAppState;
};

export const loadGameState = async (userId: string): Promise<GameState> => {
  const authUser = await supabase.auth.getUser();
  const nameFallback = authUser.data.user?.user_metadata?.name || authUser.data.user?.email?.split('@')[0] || 'Usuario';

  const profileRow = await ensureProfile(userId, nameFallback);
  const isMaster = (profileRow as DbProfile).role === 'Master';
  const [playerRow, resourcesRow, appStateRow] = await Promise.all([
    ensurePlayer(userId),
    ensureResources(userId),
    ensureAppState(isMaster)
  ]);

  const [profilesResult, squadsResult, buildingsResult, tasksResult, dailiesResult, feedbacksResult, tracksResult, marketItemsResult, purchasesResult] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('squads').select('*'),
    supabase.from('buildings').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('daily_entries').select('*'),
    supabase.from('feedback_entries').select('*'),
    supabase.from('learning_tracks').select('*'),
    supabase.from('market_items').select('*'),
    supabase.from('purchase_records').select('*')
  ]);

  throwIfError(profilesResult.error);
  throwIfError(squadsResult.error);
  throwIfError(buildingsResult.error);
  throwIfError(tasksResult.error);
  throwIfError(dailiesResult.error);
  throwIfError(feedbacksResult.error);
  throwIfError(tracksResult.error);
  throwIfError(marketItemsResult.error);
  throwIfError(purchasesResult.error);

  const users = (profilesResult.data || []).map((row) => mapProfileRow(row as DbProfile));
  const squads = (squadsResult.data || []).map((row) => mapSquadRow(row as DbSquad));
  const buildings = (buildingsResult.data || []).map((row) => mapBuildingRow(row as DbBuilding));
  const tasksWithBuilding = (tasksResult.data || []).map((row) => ({
    buildingId: (row as DbTask).building_id,
    task: mapTaskRow(row as DbTask)
  }));
  const dailies = (dailiesResult.data || []).map((row) => mapDailyRow(row as DbDailyEntry));
  const feedbacks = (feedbacksResult.data || []).map((row) => mapFeedbackRow(row as DbFeedbackEntry));
  const academyTracks = (tracksResult.data || []).map((row) => mapLearningTrackRow(row as DbLearningTrack));
  const marketItems = (marketItemsResult.data || []).map((row) => mapMarketItemRow(row as DbMarketItem));
  const purchases = (purchasesResult.data || []).map((row) => mapPurchaseRow(row as DbPurchaseRecord));

  const buildingMap = new Map<string, typeof buildings[number]>();
  for (const building of buildings) {
    buildingMap.set(building.id, { ...building, tasks: [] });
  }

  for (const { buildingId, task } of tasksWithBuilding) {
    const target = buildingMap.get(buildingId);
    if (target) target.tasks.push(task);
  }

  const finalBuildings = Array.from(buildingMap.values());

  return {
    currentUser: mapProfileRow(profileRow as DbProfile),
    users,
    squads,
    player: mapPlayerRow(playerRow as DbPlayer),
    resources: mapResourcesRow(resourcesRow as DbResources),
    buildings: finalBuildings,
    selectedBuildingId: null,
    sprintCycle: appStateRow.sprint_cycle,
    sprintStartDate: appStateRow.sprint_start_date,
    dailies,
    feedbacks,
    academyTracks,
    marketItems,
    purchases
  };
};
