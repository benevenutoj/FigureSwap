-- supabase/seeds/002_packs_seed.sql

-- Inserindo os pacotes descritos na regra de negócios
INSERT INTO public.affiliate_links (pack_size, label, price_text, url) VALUES
(21, '21 Figurinhas', 'A partir de R$ 14,90', 'https://mercadolivre.com.br/placeholder-21'),
(49, '49 Figurinhas', 'A partir de R$ 34,90', 'https://mercadolivre.com.br/placeholder-49'),
(105, '105 Figurinhas', 'A partir de R$ 69,90', 'https://mercadolivre.com.br/placeholder-105'),
(210, '210 Figurinhas', 'A partir de R$ 139,90', 'https://mercadolivre.com.br/placeholder-210'),
(350, '350 Figurinhas', 'A partir de R$ 229,90', 'https://mercadolivre.com.br/placeholder-350');
