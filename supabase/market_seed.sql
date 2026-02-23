insert into public.market_items (id, name, description, cost, stock, category, is_active)
values
  ('item_notebook', 'Caderno', 'Caderno de anotações da tribo', 50, 25, 'Office', true),
  ('item_hoodie', 'Moletom OCCA', 'Moletom oficial da OCCA', 250, 10, 'Merch', true),
  ('item_book', 'Livro de Produto', 'Leitura recomendada para squads', 120, 15, 'Academy', true),
  ('item_coffee', 'Café Especial', 'Recompensa para foco e produtividade', 30, 40, 'Consumable', true)
on conflict (id) do nothing;
