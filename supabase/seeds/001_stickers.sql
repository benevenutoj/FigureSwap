-- supabase/seeds/001_stickers.sql

-- Inserindo seleções como exemplos
insert into public.stickers (code, name, category) values
('BRA-1', 'Alisson', 'Brasil'),
('BRA-2', 'Ederson', 'Brasil'),
('BRA-3', 'Danilo', 'Brasil'),
('BRA-4', 'Thiago Silva', 'Brasil'),
('BRA-5', 'Marquinhos', 'Brasil'),
('BRA-6', 'Éder Militão', 'Brasil'),
('BRA-7', 'Alex Sandro', 'Brasil'),
('BRA-8', 'Casemiro', 'Brasil'),
('BRA-9', 'Fred', 'Brasil'),
('BRA-10', 'Lucas Paquetá', 'Brasil'),
('BRA-11', 'Neymar Jr', 'Brasil'),
('BRA-12', 'Vinícius Jr', 'Brasil'),
('BRA-13', 'Richarlison', 'Brasil'),
('BRA-14', 'Raphinha', 'Brasil'),
('BRA-15', 'Antony', 'Brasil'),

('ARG-1', 'Emiliano Martínez', 'Argentina'),
('ARG-2', 'Franco Armani', 'Argentina'),
('ARG-3', 'Nahuel Molina', 'Argentina'),
('ARG-4', 'Cristian Romero', 'Argentina'),
('ARG-5', 'Nicolás Otamendi', 'Argentina'),
('ARG-6', 'Lisandro Martínez', 'Argentina'),
('ARG-7', 'Rodrigo De Paul', 'Argentina'),
('ARG-8', 'Leandro Paredes', 'Argentina'),
('ARG-9', 'Enzo Fernández', 'Argentina'),
('ARG-10', 'Lionel Messi', 'Argentina'),
('ARG-11', 'Ángel Di María', 'Argentina'),
('ARG-12', 'Lautaro Martínez', 'Argentina'),
('ARG-13', 'Julián Álvarez', 'Argentina'),

('FWC-1', 'Taça da Copa do Mundo', 'Especiais'),
('FWC-2', 'Mascote', 'Especiais'),
('FWC-3', 'Logo Oficial', 'Especiais')
on conflict (code) do nothing;
