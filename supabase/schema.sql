-- HargaUMKM — skema database Supabase
-- Jalankan seluruh berkas ini di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang: tabel, kebijakan, fungsi, dan trigger dibuat ulang bila belum ada.

-- ---------------------------------------------------------------------------
-- Tabel lama (tetap dipertahankan untuk migrasi data versi sebelumnya)
-- ---------------------------------------------------------------------------
create table if not exists public.hargaumkm_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hargaumkm_data add column if not exists email text not null default '';
alter table public.hargaumkm_data add column if not exists payload jsonb not null default '{}'::jsonb;
alter table public.hargaumkm_data add column if not exists created_at timestamptz not null default now();
alter table public.hargaumkm_data add column if not exists updated_at timestamptz not null default now();

comment on table public.hargaumkm_data is
  'Data lama HargaUMKM. Dipakai untuk migrasi otomatis ke tabel terpisah saat pengguna masuk.';

-- ---------------------------------------------------------------------------
-- Profil pengguna
-- ---------------------------------------------------------------------------
create table if not exists public.hargaumkm_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  business_name text not null default '',
  business_type text not null default '',
  city text not null default '',
  premium boolean not null default false,
  premium_since timestamptz,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hargaumkm_profiles is
  'Satu baris per pengguna HargaUMKM: identitas dan status akun.';

-- ---------------------------------------------------------------------------
-- Pengaturan pengguna
-- ---------------------------------------------------------------------------
create table if not exists public.hargaumkm_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notif_email boolean not null default true,
  notif_promo boolean not null default true,
  notif_monthly boolean not null default true,
  language text not null default 'id',
  legacy_imported boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.hargaumkm_settings is
  'Satu baris per pengguna HargaUMKM: preferensi notifikasi dan bahasa.';

-- ---------------------------------------------------------------------------
-- Produk
-- ---------------------------------------------------------------------------
create table if not exists public.hargaumkm_products (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null default '',
  category text not null default '',
  modal numeric not null default 0,
  packaging numeric not null default 0,
  operational numeric not null default 0,
  shipping numeric not null default 0,
  commission_type text not null default 'percent',
  commission_value numeric not null default 0,
  target_type text not null default 'percent',
  target_value numeric not null default 30,
  round_to numeric not null default 500,
  price numeric not null default 0,
  cost_base numeric not null default 0,
  commission numeric not null default 0,
  total_cost numeric not null default 0,
  profit numeric not null default 0,
  margin numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

comment on table public.hargaumkm_products is
  'Satu baris per produk milik pengguna HargaUMKM.';

create index if not exists hargaumkm_products_user_idx
  on public.hargaumkm_products (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Riwayat simulasi
-- ---------------------------------------------------------------------------
create table if not exists public.hargaumkm_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  type text not null default 'kalkulasi',
  product_id text,
  product_name text not null default '',
  price numeric not null default 0,
  profit numeric not null default 0,
  margin numeric not null default 0,
  discount numeric,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

comment on table public.hargaumkm_history is
  'Satu baris per riwayat simulasi milik pengguna HargaUMKM.';

create index if not exists hargaumkm_history_user_idx
  on public.hargaumkm_history (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Hak akses
-- ---------------------------------------------------------------------------
revoke all on public.hargaumkm_data from anon;
revoke all on public.hargaumkm_profiles from anon;
revoke all on public.hargaumkm_settings from anon;
revoke all on public.hargaumkm_products from anon;
revoke all on public.hargaumkm_history from anon;

grant select, insert, update, delete on public.hargaumkm_data to authenticated;
grant select, insert, update, delete on public.hargaumkm_profiles to authenticated;
grant select, insert, update, delete on public.hargaumkm_settings to authenticated;
grant select, insert, update, delete on public.hargaumkm_products to authenticated;
grant select, insert, update, delete on public.hargaumkm_history to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.hargaumkm_data enable row level security;
alter table public.hargaumkm_profiles enable row level security;
alter table public.hargaumkm_settings enable row level security;
alter table public.hargaumkm_products enable row level security;
alter table public.hargaumkm_history enable row level security;

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

drop policy if exists "hargaumkm_profiles_owner" on public.hargaumkm_profiles;
create policy "hargaumkm_profiles_owner"
  on public.hargaumkm_profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hargaumkm_settings_owner" on public.hargaumkm_settings;
create policy "hargaumkm_settings_owner"
  on public.hargaumkm_settings
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hargaumkm_products_owner" on public.hargaumkm_products;
create policy "hargaumkm_products_owner"
  on public.hargaumkm_products
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "hargaumkm_history_owner" on public.hargaumkm_history;
create policy "hargaumkm_history_owner"
  on public.hargaumkm_history
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------------------
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
  for each row execute function public.hargaumkm_touch_updated_at();

drop trigger if exists hargaumkm_profiles_touch_updated_at on public.hargaumkm_profiles;
create trigger hargaumkm_profiles_touch_updated_at
  before update on public.hargaumkm_profiles
  for each row execute function public.hargaumkm_touch_updated_at();

drop trigger if exists hargaumkm_settings_touch_updated_at on public.hargaumkm_settings;
create trigger hargaumkm_settings_touch_updated_at
  before update on public.hargaumkm_settings
  for each row execute function public.hargaumkm_touch_updated_at();

drop trigger if exists hargaumkm_products_touch_updated_at on public.hargaumkm_products;
create trigger hargaumkm_products_touch_updated_at
  before update on public.hargaumkm_products
  for each row execute function public.hargaumkm_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Fungsi baca: mengembalikan seluruh data pengguna dalam bentuk JSON
-- ---------------------------------------------------------------------------
create or replace function public.get_hargaumkm_data()
returns jsonb
language sql
security invoker
stable
set search_path = public
as $$
  select case
    when not exists (
      select 1 from public.hargaumkm_profiles where user_id = auth.uid()
    ) then null
    else jsonb_build_object(
      'user', (
        select jsonb_build_object(
          'name', name,
          'email', email,
          'phone', phone,
          'businessName', business_name,
          'businessType', business_type,
          'city', city,
          'premium', premium,
          'premiumSince', premium_since,
          'phoneVerified', phone_verified,
          'createdAt', created_at
        )
        from public.hargaumkm_profiles
        where user_id = auth.uid()
      ),
      'settings', coalesce((
        select jsonb_build_object(
          'notifEmail', notif_email,
          'notifPromo', notif_promo,
          'notifMonthly', notif_monthly,
          'language', language,
          'legacyImported', legacy_imported
        )
        from public.hargaumkm_settings
        where user_id = auth.uid()
      ), '{}'::jsonb),
      'products', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'name', name,
          'category', category,
          'modal', modal,
          'packaging', packaging,
          'operational', operational,
          'shipping', shipping,
          'commissionType', commission_type,
          'commissionValue', commission_value,
          'targetType', target_type,
          'targetValue', target_value,
          'roundTo', round_to,
          'price', price,
          'costBase', cost_base,
          'commission', commission,
          'totalCost', total_cost,
          'profit', profit,
          'margin', margin,
          'createdAt', created_at
        ) order by created_at)
        from public.hargaumkm_products
        where user_id = auth.uid()
      ), '[]'::jsonb),
      'history', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', id,
          'type', type,
          'productId', product_id,
          'productName', product_name,
          'price', price,
          'profit', profit,
          'margin', margin,
          'discount', discount,
          'createdAt', created_at
        ) order by created_at)
        from public.hargaumkm_history
        where user_id = auth.uid()
      ), '[]'::jsonb)
    )
  end;
$$;

-- ---------------------------------------------------------------------------
-- Fungsi simpan: menulis profil, pengaturan, produk, dan riwayat sekaligus
-- ---------------------------------------------------------------------------
create or replace function public.save_hargaumkm_data(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  doc jsonb := coalesce(payload, '{}'::jsonb);
begin
  if uid is null then
    raise exception 'Pengguna belum masuk.';
  end if;

  insert into public.hargaumkm_profiles (
    user_id, name, email, phone, business_name, business_type, city,
    premium, premium_since, phone_verified, created_at
  )
  values (
    uid,
    coalesce(doc->'user'->>'name', ''),
    coalesce(doc->'user'->>'email', ''),
    coalesce(doc->'user'->>'phone', ''),
    coalesce(doc->'user'->>'businessName', ''),
    coalesce(doc->'user'->>'businessType', ''),
    coalesce(doc->'user'->>'city', ''),
    coalesce((doc->'user'->>'premium')::boolean, false),
    nullif(doc->'user'->>'premiumSince', '')::timestamptz,
    coalesce((doc->'user'->>'phoneVerified')::boolean, false),
    coalesce(nullif(doc->'user'->>'createdAt', '')::timestamptz, now())
  )
  on conflict (user_id) do update set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    business_name = excluded.business_name,
    business_type = excluded.business_type,
    city = excluded.city,
    premium = excluded.premium,
    premium_since = excluded.premium_since,
    phone_verified = excluded.phone_verified,
    updated_at = now();

  insert into public.hargaumkm_settings (
    user_id, notif_email, notif_promo, notif_monthly, language, legacy_imported
  )
  values (
    uid,
    coalesce((doc->'settings'->>'notifEmail')::boolean, true),
    coalesce((doc->'settings'->>'notifPromo')::boolean, true),
    coalesce((doc->'settings'->>'notifMonthly')::boolean, true),
    coalesce(doc->'settings'->>'language', 'id'),
    coalesce((doc->'settings'->>'legacyImported')::boolean, false)
  )
  on conflict (user_id) do update set
    notif_email = excluded.notif_email,
    notif_promo = excluded.notif_promo,
    notif_monthly = excluded.notif_monthly,
    language = excluded.language,
    legacy_imported = excluded.legacy_imported,
    updated_at = now();

  delete from public.hargaumkm_products where user_id = uid;
  insert into public.hargaumkm_products (
    user_id, id, name, category, modal, packaging, operational, shipping,
    commission_type, commission_value, target_type, target_value, round_to,
    price, cost_base, commission, total_cost, profit, margin, created_at
  )
  select
    uid,
    coalesce(nullif(prod.id, ''), 'p_' || gen_random_uuid()::text),
    coalesce(prod.name, ''),
    coalesce(prod.category, ''),
    coalesce(prod.modal, 0),
    coalesce(prod.packaging, 0),
    coalesce(prod.operational, 0),
    coalesce(prod.shipping, 0),
    coalesce(prod."commissionType", 'percent'),
    coalesce(prod."commissionValue", 0),
    coalesce(prod."targetType", 'percent'),
    coalesce(prod."targetValue", 30),
    coalesce(prod."roundTo", 500),
    coalesce(prod.price, 0),
    coalesce(prod."costBase", 0),
    coalesce(prod.commission, 0),
    coalesce(prod."totalCost", 0),
    coalesce(prod.profit, 0),
    coalesce(prod.margin, 0),
    coalesce(nullif(prod."createdAt", '')::timestamptz, now())
  from jsonb_to_recordset(coalesce(doc->'products', '[]'::jsonb)) as prod(
    id text,
    name text,
    category text,
    modal numeric,
    packaging numeric,
    operational numeric,
    shipping numeric,
    "commissionType" text,
    "commissionValue" numeric,
    "targetType" text,
    "targetValue" numeric,
    "roundTo" numeric,
    price numeric,
    "costBase" numeric,
    commission numeric,
    "totalCost" numeric,
    profit numeric,
    margin numeric,
    "createdAt" text
  );

  delete from public.hargaumkm_history where user_id = uid;
  insert into public.hargaumkm_history (
    user_id, id, type, product_id, product_name, price, profit, margin, discount, created_at
  )
  select
    uid,
    coalesce(nullif(hist.id, ''), 'h_' || gen_random_uuid()::text),
    coalesce(hist.type, 'kalkulasi'),
    hist."productId",
    coalesce(hist."productName", ''),
    coalesce(hist.price, 0),
    coalesce(hist.profit, 0),
    coalesce(hist.margin, 0),
    hist.discount,
    coalesce(nullif(hist."createdAt", '')::timestamptz, now())
  from jsonb_to_recordset(coalesce(doc->'history', '[]'::jsonb)) as hist(
    id text,
    type text,
    "productId" text,
    "productName" text,
    price numeric,
    profit numeric,
    margin numeric,
    discount numeric,
    "createdAt" text
  );
end;
$$;

revoke all on function public.get_hargaumkm_data() from public;
revoke all on function public.save_hargaumkm_data(jsonb) from public;
grant execute on function public.get_hargaumkm_data() to authenticated;
grant execute on function public.save_hargaumkm_data(jsonb) to authenticated;
