alter table public.categories
add column if not exists is_featured boolean not null default false;

update public.categories
set is_featured = true
where display_order <= 4;
