import { MarketItem, PurchaseRecord } from '../../../types';
import { supabase } from '../client';
import { toMarketItemRow, toPurchaseRow } from '../mappers';
import { throwIfError } from '../utils';

export const upsertMarketItem = async (item: MarketItem) => {
  const { error } = await supabase.from('market_items').upsert(toMarketItemRow(item));
  throwIfError(error);
};

export const insertPurchase = async (purchase: PurchaseRecord) => {
  const { error } = await supabase.from('purchase_records').insert(toPurchaseRow(purchase));
  throwIfError(error);
};
