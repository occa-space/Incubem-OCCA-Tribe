import { BuildingData, GridPosition, KanbanTask, PlayerProfile, Resources, Squad, User } from '../../types';
import { AcademyVideo, DailyEntry, FeedbackEntry, LearningTrack, MarketItem, PurchaseRecord } from '../../types';

export type DbProfile = {
  id: string;
  name: string | null;
  color: string | null;
  avatar: string | null;
  squad_id: string | null;
  role: string | null;
};

export type DbSquad = {
  id: string;
  name: string;
  color: string;
  description: string | null;
  xp: number | null;
  level: number | null;
};

export type DbBuilding = {
  id: string;
  owner_id: string;
  type: string;
  level: number;
  position: GridPosition | null;
  is_placed: boolean;
  last_collected: number | null;
  squad_id: string | null;
  description: string | null;
};

export type DbTask = {
  id: string;
  building_id: string;
  squad_id: string;
  creator_id: string;
  assignee_id: string | null;
  content: string;
  status: string;
  created_at: number;
  size: number;
  complexity: number;
  rule_multiplier: number;
  rule_label: string;
  rule_value: string;
  fixed_time_type: string | null;
  fixed_quantity: number | null;
  fixed_quantity_limit: number | null;
  fixed_quantity_count: number | null;
  fixed_deadline: number | null;
  history: any[] | null;
  description: string | null;
  participants: string[] | null;
  custom_pa_distribution: Record<string, number> | null;
  evidence_link: string | null;
  delivery_notes: string | null;
  reflections: string | null;
  aim: number | null;
  feedback: string | null;
  final_pa: number | null;
  final_xp: number | null;
  final_coins: number | null;
  sprint_history: string[] | null;
};

export type DbPlayer = {
  user_id: string;
  level: number;
  current_xp: number;
  next_level_xp: number;
  total_pa: number;
  reputation: number;
  streak: number;
};

export type DbResources = {
  user_id: string;
  coins: number;
};

export type DbAppState = {
  id: string;
  sprint_cycle: number;
  sprint_start_date: number;
};

export type DbDailyEntry = {
  id: string;
  user_id: string;
  squad_id: string;
  member_name: string;
  role: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  analysis: any | null;
  timestamp: number;
};

export type DbFeedbackEntry = {
  id: string;
  squad_id: string;
  source_user_id: string;
  target_user_id: string;
  sprint: number;
  relationship: string;
  q_comm: string | null;
  q_empathy: string | null;
  q_collab: string | null;
  q_conflict: string | null;
  q_strengths: string | null;
  q_weaknesses: string | null;
  q_impact: string | null;
  q_development: string | null;
  analysis: any | null;
  timestamp: number;
};

export type DbLearningTrack = {
  id: string;
  gap_id: string;
  title: string;
  description: string;
  urgency: string;
  videos: AcademyVideo[] | null;
  created_at: number;
  published_at: number | null;
  status: string;
  total_views: number;
  completions: number;
  impact_score: number | null;
};

export type DbMarketItem = {
  id: string;
  name: string;
  description: string;
  cost: number;
  stock: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
};

export type DbPurchaseRecord = {
  id: string;
  item_id: string;
  user_id: string;
  user_name: string;
  item_name: string;
  item_cost: number;
  timestamp: number;
  status: string;
};

export const mapProfileRow = (row: DbProfile): User => ({
  id: row.id,
  name: row.name || 'Usuario',
  color: row.color || '#94a3b8',
  avatar: row.avatar || undefined,
  squadId: row.squad_id || 'temp_pending',
  role: row.role || 'Executor'
});

export const toProfileRow = (user: User): DbProfile => ({
  id: user.id,
  name: user.name,
  color: user.color,
  avatar: user.avatar || null,
  squad_id: user.squadId,
  role: user.role || null
});

export const toProfileRowPartial = (updates: Partial<User>): Partial<DbProfile> => ({
  name: updates.name,
  color: updates.color,
  avatar: updates.avatar,
  squad_id: updates.squadId,
  role: updates.role
});

export const mapSquadRow = (row: DbSquad): Squad => ({
  id: row.id,
  name: row.name,
  color: row.color,
  description: row.description || undefined,
  xp: row.xp || undefined,
  level: row.level || undefined
});

export const toSquadRow = (squad: Squad): DbSquad => ({
  id: squad.id,
  name: squad.name,
  color: squad.color,
  description: squad.description || null,
  xp: squad.xp || null,
  level: squad.level || null
});

export const toSquadRowPartial = (updates: Partial<Squad>): Partial<DbSquad> => ({
  name: updates.name,
  color: updates.color,
  description: updates.description,
  xp: updates.xp,
  level: updates.level
});

export const mapBuildingRow = (row: DbBuilding): BuildingData => ({
  id: row.id,
  ownerId: row.owner_id,
  type: row.type as BuildingData['type'],
  level: row.level,
  position: row.position || { x: 0, z: 0 },
  isPlaced: row.is_placed,
  lastCollected: row.last_collected || undefined,
  tasks: [],
  squadId: row.squad_id || undefined,
  description: row.description || undefined
});

export const toBuildingRow = (building: BuildingData): DbBuilding => ({
  id: building.id,
  owner_id: building.ownerId,
  type: building.type,
  level: building.level,
  position: building.position,
  is_placed: building.isPlaced,
  last_collected: building.lastCollected || null,
  squad_id: building.squadId || null,
  description: building.description || null
});

export const toBuildingRowPartial = (updates: Partial<BuildingData>): Partial<DbBuilding> => ({
  owner_id: updates.ownerId,
  type: updates.type,
  level: updates.level,
  position: updates.position,
  is_placed: updates.isPlaced,
  last_collected: updates.lastCollected,
  squad_id: updates.squadId,
  description: updates.description
});

export const mapTaskRow = (row: DbTask): KanbanTask => ({
  id: row.id,
  content: row.content,
  status: row.status as KanbanTask['status'],
  createdAt: row.created_at,
  creatorId: row.creator_id,
  assigneeId: row.assignee_id || undefined,
  squadId: row.squad_id,
  size: row.size as KanbanTask['size'],
  complexity: row.complexity as KanbanTask['complexity'],
  ruleMultiplier: Number(row.rule_multiplier),
  ruleLabel: row.rule_label,
  ruleValue: row.rule_value,
  fixedTimeType: (row.fixed_time_type || undefined) as KanbanTask['fixedTimeType'],
  fixedQuantity: row.fixed_quantity || undefined,
  fixedQuantityLimit: row.fixed_quantity_limit || undefined,
  fixedQuantityCount: row.fixed_quantity_count || undefined,
  fixedDeadline: row.fixed_deadline || undefined,
  history: row.history || undefined,
  description: row.description || undefined,
  participants: row.participants || undefined,
  customPaDistribution: row.custom_pa_distribution || undefined,
  evidenceLink: row.evidence_link || undefined,
  deliveryNotes: row.delivery_notes || undefined,
  reflections: row.reflections || undefined,
  aim: row.aim || undefined,
  feedback: row.feedback || undefined,
  finalPA: row.final_pa || undefined,
  finalXP: row.final_xp || undefined,
  finalCoins: row.final_coins || undefined,
  sprintHistory: row.sprint_history || undefined
});

export const toTaskRow = (task: KanbanTask & { buildingId: string }): DbTask => ({
  id: task.id,
  building_id: task.buildingId,
  squad_id: task.squadId,
  creator_id: task.creatorId,
  assignee_id: task.assigneeId || null,
  content: task.content,
  status: task.status,
  created_at: task.createdAt,
  size: task.size,
  complexity: task.complexity,
  rule_multiplier: task.ruleMultiplier,
  rule_label: task.ruleLabel,
  rule_value: task.ruleValue,
  fixed_time_type: task.fixedTimeType || null,
  fixed_quantity: task.fixedQuantity || null,
  fixed_quantity_limit: task.fixedQuantityLimit || null,
  fixed_quantity_count: task.fixedQuantityCount || null,
  fixed_deadline: task.fixedDeadline || null,
  history: task.history || null,
  description: task.description || null,
  participants: task.participants || null,
  custom_pa_distribution: task.customPaDistribution || null,
  evidence_link: task.evidenceLink || null,
  delivery_notes: task.deliveryNotes || null,
  reflections: task.reflections || null,
  aim: task.aim || null,
  feedback: task.feedback || null,
  final_pa: task.finalPA || null,
  final_xp: task.finalXP || null,
  final_coins: task.finalCoins || null,
  sprint_history: task.sprintHistory || null
});

export const toTaskRowPartial = (updates: Partial<KanbanTask>): Partial<DbTask> => ({
  content: updates.content,
  status: updates.status,
  assignee_id: updates.assigneeId,
  squad_id: updates.squadId,
  size: updates.size,
  complexity: updates.complexity,
  rule_multiplier: updates.ruleMultiplier,
  rule_label: updates.ruleLabel,
  rule_value: updates.ruleValue,
  fixed_time_type: updates.fixedTimeType,
  fixed_quantity: updates.fixedQuantity,
  fixed_quantity_limit: updates.fixedQuantityLimit,
  fixed_quantity_count: updates.fixedQuantityCount,
  fixed_deadline: updates.fixedDeadline,
  history: updates.history,
  description: updates.description,
  participants: updates.participants,
  custom_pa_distribution: updates.customPaDistribution,
  evidence_link: updates.evidenceLink,
  delivery_notes: updates.deliveryNotes,
  reflections: updates.reflections,
  aim: updates.aim,
  feedback: updates.feedback,
  final_pa: updates.finalPA,
  final_xp: updates.finalXP,
  final_coins: updates.finalCoins,
  sprint_history: updates.sprintHistory
});

export const mapPlayerRow = (row: DbPlayer): PlayerProfile => ({
  level: row.level,
  currentXP: row.current_xp,
  nextLevelXP: row.next_level_xp,
  totalPA: row.total_pa,
  reputation: Number(row.reputation),
  streak: row.streak
});

export const toPlayerRow = (userId: string, player: PlayerProfile): DbPlayer => ({
  user_id: userId,
  level: player.level,
  current_xp: player.currentXP,
  next_level_xp: player.nextLevelXP,
  total_pa: player.totalPA,
  reputation: player.reputation,
  streak: player.streak
});

export const mapResourcesRow = (row: DbResources): Resources => ({
  coins: row.coins
});

export const toResourcesRow = (userId: string, resources: Resources): DbResources => ({
  user_id: userId,
  coins: resources.coins
});

export const mapDailyRow = (row: DbDailyEntry): DailyEntry => ({
  id: row.id,
  userId: row.user_id,
  squadId: row.squad_id,
  memberName: row.member_name,
  role: row.role,
  date: row.date,
  yesterday: row.yesterday,
  today: row.today,
  blockers: row.blockers,
  analysis: row.analysis || undefined,
  timestamp: row.timestamp
});

export const toDailyRow = (entry: DailyEntry): DbDailyEntry => ({
  id: entry.id,
  user_id: entry.userId,
  squad_id: entry.squadId,
  member_name: entry.memberName,
  role: entry.role,
  date: entry.date,
  yesterday: entry.yesterday,
  today: entry.today,
  blockers: entry.blockers,
  analysis: entry.analysis || null,
  timestamp: entry.timestamp
});

export const mapFeedbackRow = (row: DbFeedbackEntry): FeedbackEntry => ({
  id: row.id,
  squadId: row.squad_id,
  sourceUserId: row.source_user_id,
  targetUserId: row.target_user_id,
  sprint: row.sprint,
  relationship: row.relationship as FeedbackEntry['relationship'],
  q_comm: row.q_comm || undefined,
  q_empathy: row.q_empathy || undefined,
  q_collab: row.q_collab || undefined,
  q_conflict: row.q_conflict || undefined,
  q_strengths: row.q_strengths || undefined,
  q_weaknesses: row.q_weaknesses || undefined,
  q_impact: row.q_impact || undefined,
  q_development: row.q_development || undefined,
  analysis: row.analysis || undefined,
  timestamp: row.timestamp
});

export const toFeedbackRow = (entry: FeedbackEntry): DbFeedbackEntry => ({
  id: entry.id,
  squad_id: entry.squadId,
  source_user_id: entry.sourceUserId,
  target_user_id: entry.targetUserId,
  sprint: entry.sprint,
  relationship: entry.relationship,
  q_comm: entry.q_comm || null,
  q_empathy: entry.q_empathy || null,
  q_collab: entry.q_collab || null,
  q_conflict: entry.q_conflict || null,
  q_strengths: entry.q_strengths || null,
  q_weaknesses: entry.q_weaknesses || null,
  q_impact: entry.q_impact || null,
  q_development: entry.q_development || null,
  analysis: entry.analysis || null,
  timestamp: entry.timestamp
});

export const mapLearningTrackRow = (row: DbLearningTrack): LearningTrack => ({
  id: row.id,
  gapId: row.gap_id,
  title: row.title,
  description: row.description,
  urgency: row.urgency as LearningTrack['urgency'],
  videos: row.videos || [],
  createdAt: row.created_at,
  publishedAt: row.published_at || undefined,
  status: row.status as LearningTrack['status'],
  totalViews: row.total_views,
  completions: row.completions,
  impactScore: row.impact_score || undefined
});

export const toLearningTrackRow = (track: LearningTrack): DbLearningTrack => ({
  id: track.id,
  gap_id: track.gapId,
  title: track.title,
  description: track.description,
  urgency: track.urgency,
  videos: track.videos || [],
  created_at: track.createdAt,
  published_at: track.publishedAt || null,
  status: track.status,
  total_views: track.totalViews,
  completions: track.completions,
  impact_score: track.impactScore || null
});

export const mapMarketItemRow = (row: DbMarketItem): MarketItem => ({
  id: row.id,
  name: row.name,
  description: row.description,
  cost: row.cost,
  stock: row.stock,
  category: row.category,
  imageUrl: row.image_url || undefined,
  isActive: row.is_active
});

export const toMarketItemRow = (item: MarketItem): DbMarketItem => ({
  id: item.id,
  name: item.name,
  description: item.description,
  cost: item.cost,
  stock: item.stock,
  category: item.category,
  image_url: item.imageUrl || null,
  is_active: item.isActive
});

export const mapPurchaseRow = (row: DbPurchaseRecord): PurchaseRecord => ({
  id: row.id,
  itemId: row.item_id,
  userId: row.user_id,
  userName: row.user_name,
  itemName: row.item_name,
  itemCost: row.item_cost,
  timestamp: row.timestamp,
  status: row.status as PurchaseRecord['status']
});

export const toPurchaseRow = (purchase: PurchaseRecord): DbPurchaseRecord => ({
  id: purchase.id,
  item_id: purchase.itemId,
  user_id: purchase.userId,
  user_name: purchase.userName,
  item_name: purchase.itemName,
  item_cost: purchase.itemCost,
  timestamp: purchase.timestamp,
  status: purchase.status
});
