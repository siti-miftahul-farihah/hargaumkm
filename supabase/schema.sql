-- HargaUMKM — skema database Supabase
-- Jalankan seluruh berkas ini di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang: tabel, kebijakan, dan trigger dibuat ulang bila belum ada.

create table if not exists public.hargaumkm_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pastikan kolom tambahan tersedia bila tabel sudah pernah dibuat sebagian.
alter table public.hargaumkm_data add column if not exists email text not null default '';
alter table public.hargaumkm_data add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.hargaumkm_data add column if not exists created_at timestamptz not null default now();
alter table public.hargaumkm_data add column if not exists updated_at timestamptz not null default now();

comment on table public.hargaumkm_data is
  'Satu baris per pengguna HargaUMKM. payload berisi profil, produk, riwayat, dan pengaturan.';

-- Setiap pengguna hanya boleh membaca dan mengubah barisnya sendiri.
alter table public.hargaumkm_data enable row level security;

revoke all on public.hargaumkm_data from anon;
grant select, insert, update, delete on public.hargaumkm_data to authenticated;

drop policy if exists "hargaumkm_data_select_own" on public.hargaumkm_data;
create policy "hargaumkm_data_select_own"
  on public.hargaumkm_data
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "hargaumkm_data_insert_own" on public.hargaumkm_data;
create policy "hargaumkm_data_insert_own"
  on public.hargaumkm_data
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "hargaumkm_data_update_own" on public.hargaumkm_data;
create policy "hargaumkm_data_update_own"
  on public.hargaumkm_data
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hargaumkm_data_delete_own" on public.hargaumkm_data;
create policy "hargaumkm_data_delete_own"
  on public.hargaumkm_data
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Perbarui kolom updated_at secara otomatis setiap kali data disimpan.
create or replace function public.hargaumkm_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hargaumkm_touch_updated_at on public.hargaumkm_data;
create trigger hargaumkm_touch_updated_at
  before update on public.hargaumkm_data
  for each row
  execute function public.hargaumkm_touch_updated_at();
