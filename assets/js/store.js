/* HargaUMKM — Supabase data & auth store */
window.Store = (function () {
  const TABLE = 'hargaumkm_data';
  const DAY = 86400000;
  const cfg = window.HARGAUMKM_CONFIG || {};
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const LEGACY_DATA_PREFIX = 'hargaumkm.data.v1.';
  const LEGACY_USERS_KEY = 'hargaumkm.users.v1';

  let client = null;
  let currentUser = null;
  let recoveryCallback = null;
  let recoveryPending = false;
  let saveChain = Promise.resolve();

  const normalize = (email) => String(email || '').trim().toLowerCase();
  const digits = (value) => String(value || '').replace(/\D/g, '');
  const nowIso = () => new Date().toISOString();
  const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();
  const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

  function init() {
    if (client) return client;

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Pustaka Supabase gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.');
    }
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
      throw new Error('Konfigurasi Supabase belum lengkap. Periksa assets/js/config.js.');
    }

    client = window.supabase.createClient(
      String(cfg.supabaseUrl).replace(/\/+$/, ''),
      cfg.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'hargaumkm.auth.v2'
        }
      }
    );

    client.auth.onAuthStateChange((event, session) => {
      if (session && session.user) currentUser = session.user;
      if (event === 'SIGNED_OUT') currentUser = null;

      if (event === 'PASSWORD_RECOVERY') {
        recoveryPending = true;
        if (recoveryCallback) {
          recoveryPending = false;
          recoveryCallback();
        }
      }
    });

    // Berguna untuk debugging di konsol browser.
    window.SupabaseClient = client;
    return client;
  }

  function friendlyError(err) {
    const message = String((err && (err.message || err.error_description)) || '');
    const code = String((err && err.code) || '');

    if (code === 'PGRST205' || /could not find the table|schema cache/i.test(message)) {
      return 'Tabel database HargaUMKM belum tersedia. Jalankan berkas supabase/schema.sql di SQL Editor Supabase.';
    }
    if (code === '42501' || /row-level security|permission denied/i.test(message)) {
      return 'Akses data ditolak. Pastikan kebijakan RLS pada tabel hargaumkm_data sudah dibuat.';
    }
    if (/invalid login credentials/i.test(message)) {
      return 'Email atau kata sandi salah.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Email belum dikonfirmasi. Buka tautan verifikasi di kotak masuk Anda.';
    }
    if (/user already registered|already been registered/i.test(message)) {
      return 'Email ini sudah terdaftar. Silakan masuk.';
    }
    if (/password should be at least|password.*at least 6/i.test(message)) {
      return 'Kata sandi minimal 6 karakter.';
    }
    if (/unable to validate email|invalid email/i.test(message)) {
      return 'Format email belum benar.';
    }
    if (/rate limit|too many requests|over_email_send_rate_limit/i.test(message)) {
      return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
    }
    if (/failed to fetch|networkerror|network request failed|load failed/i.test(message)) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    }
    if (/signups not allowed|signup.*disabled/i.test(message)) {
      return 'Pendaftaran sedang dinonaktifkan di server.';
    }
    if (/database error saving new user/i.test(message)) {
      return 'Akun gagal dibuat karena masalah database. Hubungi admin.';
    }

    return message || 'Terjadi kesalahan. Silakan coba lagi.';
  }

  function blank(email, meta) {
    const m = meta || {};
    return {
      user: {
        name: m.name || m.full_name || '',
        email: normalize(email),
        phone: m.phone || '',
        businessName: '',
        businessType: '',
        city: '',
        premium: false,
        premiumSince: null,
        phoneVerified: false,
        createdAt: nowIso()
      },
      products: [],
      history: [],
      settings: {
        notifEmail: true,
        notifPromo: true,
        notifMonthly: true,
        language: 'id'
      }
    };
  }

  function hydrate(data, email) {
    const d = isObject(data) ? data : {};
    d.user = Object.assign(blank(email).user, isObject(d.user) ? d.user : {});
    d.user.email = normalize(email || d.user.email);
    d.products = Array.isArray(d.products) ? d.products : [];
    d.history = Array.isArray(d.history) ? d.history : [];
    d.settings = Object.assign(blank(email).settings, isObject(d.settings) ? d.settings : {});
    return d;
  }

  function readLegacy(email) {
    try {
      const raw = localStorage.getItem(LEGACY_DATA_PREFIX + normalize(email));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!isObject(parsed)) return null;
      const data = hydrate(parsed, email);
      return data.products.length || data.history.length ? data : null;
    } catch (err) {
      console.warn('Gagal membaca data lokal lama', err);
      return null;
    }
  }

  function clearLegacy(email) {
    const key = normalize(email);
    try {
      localStorage.removeItem(LEGACY_DATA_PREFIX + key);
      const raw = localStorage.getItem(LEGACY_USERS_KEY);
      if (!raw) return;
      const users = JSON.parse(raw);
      if (!isObject(users) || !users[key]) return;
      delete users[key];
      localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('Gagal membersihkan data lokal lama', err);
    }
  }

  function importLegacy(appData, legacy, fallbackName, fallbackPhone) {
    const mergedUser = Object.assign({}, legacy.user, {
      email: appData.user.email,
      name: legacy.user.name || fallbackName || '',
      phone: legacy.user.phone || fallbackPhone || '',
      premium: Boolean(appData.user.premium || legacy.user.premium),
      premiumSince: appData.user.premiumSince || legacy.user.premiumSince
    });

    appData.user = mergedUser;
    appData.products = legacy.products;
    appData.history = legacy.history;
    appData.settings = Object.assign({}, legacy.settings, { legacyImported: true });
    return appData;
  }

  function makeProduct(def, id, createdAt) {
    const calc = Calc.price(def);
    return Object.assign({}, def, {
      id,
      createdAt,
      price: calc.price,
      costBase: calc.costBase,
      commission: calc.commission,
      totalCost: calc.totalCost,
      profit: calc.profit,
      margin: calc.margin
    });
  }

  function seed(d) {
    const products = [
      makeProduct({
        name: 'Kaos Polos Premium', category: 'Fashion',
        modal: 42000, packaging: 2500, operational: 4000, shipping: 0,
        commissionType: 'percent', commissionValue: 8,
        targetType: 'percent', targetValue: 35, roundTo: 500
      }, 'p_kaos', daysAgo(1)),
      makeProduct({
        name: 'Kopi Arabika 250g', category: 'Makanan & Minuman',
        modal: 38000, packaging: 3500, operational: 3000, shipping: 12000,
        commissionType: 'percent', commissionValue: 10,
        targetType: 'percent', targetValue: 30, roundTo: 500
      }, 'p_kopi', daysAgo(3)),
      makeProduct({
        name: 'Tas Kanvas Handmade', category: 'Kriya',
        modal: 65000, packaging: 5000, operational: 6000, shipping: 15000,
        commissionType: 'percent', commissionValue: 5,
        targetType: 'nominal', targetValue: 25000, roundTo: 1000
      }, 'p_tas', daysAgo(6)),
      makeProduct({
        name: 'Sambal Bawang 200ml', category: 'Makanan & Minuman',
        modal: 18000, packaging: 2500, operational: 2500, shipping: 10000,
        commissionType: 'percent', commissionValue: 10,
        targetType: 'percent', targetValue: 25, roundTo: 1000
      }, 'p_sambal', daysAgo(9)),
      makeProduct({
        name: 'Hijab Voal Motif', category: 'Fashion',
        modal: 28000, packaging: 2000, operational: 3000, shipping: 0,
        commissionType: 'percent', commissionValue: 8,
        targetType: 'percent', targetValue: 40, roundTo: 500
      }, 'p_hijab', daysAgo(14))
    ];

    const byId = (id) => products.find((p) => p.id === id);
    const promoKaos = Calc.discount(byId('p_kaos'), 10);
    const promoSambal = Calc.discount(byId('p_sambal'), 20);

    d.products = products;
    d.history = [
      {
        id: 'h_' + Math.random().toString(36).slice(2, 9),
        type: 'promo', productId: 'p_kaos', productName: 'Kaos Polos Premium',
        price: promoKaos.newPrice, profit: promoKaos.profit, margin: promoKaos.margin,
        discount: 10, createdAt: daysAgo(0.4)
      },
      {
        id: 'h_' + Math.random().toString(36).slice(2, 9),
        type: 'kalkulasi', productId: 'p_kopi', productName: 'Kopi Arabika 250g',
        price: 94500, profit: 28550, margin: 30.21,
        discount: null, createdAt: daysAgo(2)
      },
      {
        id: 'h_' + Math.random().toString(36).slice(2, 9),
        type: 'promo', productId: 'p_sambal', productName: 'Sambal Bawang 200ml',
        price: promoSambal.newPrice, profit: promoSambal.profit, margin: promoSambal.margin,
        discount: 20, createdAt: daysAgo(4)
      },
      {
        id: 'h_' + Math.random().toString(36).slice(2, 9),
        type: 'kalkulasi', productId: 'p_tas', productName: 'Tas Kanvas Handmade',
        price: 117000, profit: 25150, margin: 21.5,
        discount: null, createdAt: daysAgo(7)
      }
    ];

    d.user.name = 'Rina Kusuma';
    d.user.phone = '081234567890';
    d.user.businessName = 'Dapur Rina';
    d.user.businessType = 'Makanan & Minuman';
    d.user.city = 'Bandung';
    d.user.premium = true;
    d.user.premiumSince = daysAgo(40);
    d.user.phoneVerified = true;
    d.user.createdAt = daysAgo(120);
  }

  async function getUser() {
    init();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    currentUser = data.session ? data.session.user : null;
    return currentUser;
  }

  async function writeRow(user, data) {
    const { error } = await client.from(TABLE).upsert(
      {
        user_id: user.id,
        email: user.email || '',
        payload: data
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  }

  async function fetchPayload(user) {
    const { data, error } = await client
      .from(TABLE)
      .select('payload')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    const isDemo = normalize(user.email) === normalize(cfg.demoEmail || 'demo@hargaumkm.id');
    const meta = user.user_metadata || {};
    const legacy = readLegacy(user.email);

    if (data && isObject(data.payload) && Object.keys(data.payload).length) {
      const appData = hydrate(data.payload, user.email);

      if (legacy && !appData.settings.legacyImported && !appData.products.length && !appData.history.length) {
        importLegacy(appData, legacy, meta.full_name || meta.name, meta.phone);
        await writeRow(user, appData);
        clearLegacy(user.email);
        return appData;
      }

      if (isDemo && !appData.products.length) {
        seed(appData);
        await writeRow(user, appData);
      }
      return appData;
    }

    if (legacy) {
      importLegacy(legacy, legacy, meta.full_name || meta.name, meta.phone);
      await writeRow(user, legacy);
      clearLegacy(user.email);
      return legacy;
    }

    const fresh = blank(user.email, {
      name: meta.full_name || meta.name || '',
      phone: meta.phone || ''
    });
    fresh.user.createdAt = user.created_at || fresh.user.createdAt;
    if (isDemo) seed(fresh);
    await writeRow(user, fresh);
    return fresh;
  }

  async function login(identifier, password) {
    init();
    const email = normalize(identifier);

    if (!email || !EMAIL_RE.test(email)) {
      return { ok: false, error: 'Masuk menggunakan alamat email yang valid.' };
    }
    if (!password) {
      return { ok: false, error: 'Masukkan kata sandi.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;

      currentUser = data.user;
      const appData = await fetchPayload(data.user);
      return { ok: true, email: data.user.email || email, data: appData, user: appData.user };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function register(payload) {
    init();
    const data = payload || {};
    const email = normalize(data.email);
    const phone = digits(data.phone);
    const name = String(data.name || '').trim();
    const password = String(data.password || '');

    if (!name) return { ok: false, error: 'Nama lengkap wajib diisi.' };
    if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'Format email belum benar.' };
    if (phone.length < 9) return { ok: false, error: 'Nomor HP minimal 9 digit.' };
    if (password.length < 6) return { ok: false, error: 'Kata sandi minimal 6 karakter.' };

    try {
      const { data: authData, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: String(data.phone || '').trim()
          }
        }
      });
      if (error) throw error;

      const user = authData.user;
      if (!user) throw new Error('Pendaftaran tidak mengembalikan data akun.');

      if (Array.isArray(user.identities) && user.identities.length === 0) {
        return { ok: false, error: 'Email ini sudah terdaftar. Silakan masuk.' };
      }

      if (!authData.session) {
        return { ok: true, needsConfirmation: true, email };
      }

      currentUser = user;
      const legacy = readLegacy(email);
      const appData = legacy
        ? importLegacy(blank(email, { name, phone: data.phone }), legacy, name, data.phone)
        : blank(email, { name, phone: data.phone });

      appData.user.createdAt = user.created_at || appData.user.createdAt;
      await writeRow(user, appData);
      if (legacy) clearLegacy(email);

      return { ok: true, email, data: appData, user: appData.user };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function demoLogin() {
    init();
    const email = cfg.demoEmail || 'demo@hargaumkm.id';
    const password = cfg.demoPassword || 'demo123';

    try {
      let { data, error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        const signup = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: 'Rina Kusuma',
              phone: '081234567890'
            }
          }
        });

        if (signup.error) {
          if (/already registered|already been registered/i.test(signup.error.message || '')) {
            return { ok: false, error: 'Akun demo tidak dapat diakses. Hubungi admin HargaUMKM.' };
          }
          throw signup.error;
        }

        if (!signup.data.session) {
          return {
            ok: false,
            error: 'Akun demo belum aktif. Pastikan konfirmasi email dimatikan di Supabase.'
          };
        }

        data = signup.data;
      }

      const user = data.user || (data.session && data.session.user);
      if (!user) throw new Error('Akun demo tidak tersedia.');

      currentUser = user;
      const appData = await fetchPayload(user);

      if (!appData.products.length) {
        seed(appData);
        await writeRow(user, appData);
      }

      return { ok: true, email: user.email || email, data: appData, user: appData.user };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function load() {
    const user = await getUser();
    if (!user) throw new Error('Sesi tidak ditemukan. Silakan masuk kembali.');
    return fetchPayload(user);
  }

  function save(data) {
    if (!isObject(data)) return Promise.reject(new Error('Data tidak valid.'));

    saveChain = saveChain.catch(() => {}).then(async () => {
      const user = await getUser();
      if (!user) throw new Error('Sesi berakhir. Silakan masuk kembali.');

      const snapshot = JSON.parse(JSON.stringify(data));
      snapshot.user = isObject(snapshot.user) ? snapshot.user : {};
      snapshot.user.email = user.email || snapshot.user.email;
      await writeRow(user, snapshot);
    });

    return saveChain;
  }

  async function logout() {
    if (!client) {
      currentUser = null;
      return;
    }
    const { error } = await client.auth.signOut();
    if (error) throw error;
    currentUser = null;
  }

  async function forgotPassword(email) {
    init();
    const clean = normalize(email);
    if (!clean || !EMAIL_RE.test(clean)) {
      return { ok: false, error: 'Format email belum benar.' };
    }

    try {
      const redirectTo = location.protocol === 'file:' ? undefined : location.origin + location.pathname;
      const { error } = await client.auth.resetPasswordForEmail(
        clean,
        redirectTo ? { redirectTo } : undefined
      );
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  async function verifyPassword(password) {
    const user = await getUser();
    if (!user || !user.email) return false;
    const { error } = await client.auth.signInWithPassword({
      email: user.email,
      password
    });
    return !error;
  }

  async function setPassword(password) {
    init();
    try {
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: friendlyError(err) };
    }
  }

  function onPasswordRecovery(callback) {
    recoveryCallback = typeof callback === 'function' ? callback : null;
    if (recoveryCallback && recoveryPending) {
      recoveryPending = false;
      setTimeout(recoveryCallback, 0);
    }
  }

  return {
    init,
    getUser,
    load,
    login,
    register,
    demoLogin,
    save,
    logout,
    forgotPassword,
    verifyPassword,
    setPassword,
    onPasswordRecovery,
    friendlyError
  };
})();
