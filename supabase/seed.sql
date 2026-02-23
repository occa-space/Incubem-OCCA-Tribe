insert into public.squads (id, name, color, description)
values
  ('sq_board', 'Board', '#ffffff', 'Alta Gestão'),
  ('sq_osc', 'OCCA Social Club', '#ef4444', 'Bem-vindos ao OSC'),
  ('sq_academy', 'OCCA Academy', '#3b82f6', 'vamos juntos construir novos futuros com o aprendizado'),
  ('sq_occasulo', 'OCCAsulo', '#d946ef', 'Transformando iniciativas')
on conflict (id) do nothing;
