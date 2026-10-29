/* HargaUMKM — local data store (demo, localStorage) */
window.Store = (function () {
  const USERS_KEY = 'hargaumkm.users.v1';
  const SESSION_KEY = 'hargaumkm.session.v1';
  const DATA_PREFIX = 'hargaumkm.data.v1.';
  const DAY = 86400000;

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn('Gagal membaca data lokal', err);
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Gagal menyimpan data lokal', err);
      U.toast('Penyimpanan browser penuh. Hapus beberapa data lama.', 'error');
    }
  };

  const normalize = (email) => String(email || '').trim().toLowerCase();
  const digits = (value) => String(value || '').replace(/\D/g, '');
  const dataKey = (email) => DATA_PREFIX + normalize(email);

  const getUsers = () => read(USERS_KEY, {});
  const saveUsers = (users) => write(USERS_KEY, users);

  const nowIso = () => new Date().toISOString();
  const daysAgo = (n) => new Date(Date.now() - n * DAY).toISOString();

  function blank(email, meta) {
    const m = meta || {};
    return {
      user: {
        name: m.name || '',
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
    const d = data || {};
    d.user = Object.assign(blank(email).user, d.user || {});
    d.products = Array.isArray(d.products) ? d.products : [];
    d.history = Array.isArray(d.history) ? d.history : [];
    d.settings = Object.assign(blank(email).settings, d.settings || {});
    return d;
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

  function ensureDemo() {
    const users = getUsers();
    if (!users['demo@hargaumkm.id']) {
      users['demo@hargaumkm.id'] = {
        name: 'Rina Kusuma',
        email: 'demo@hargaumkm.id',
        phone: '081234567890',
        password: 'demo123',
        createdAt: daysAgo(120)
      };
      saveUsers(users);
    }

    if (!localStorage.getItem(dataKey('demo@hargaumkm.id'))) {
      const data = blank('demo@hargaumkm.id');
      seed(data);
      write(dataKey('demo@hargaumkm.id'), data);
    }
  }

  function login(identifier, password) {
    const users = getUsers();
    const key = normalize(identifier);
    let foundKey = null;

    if (users[key]) {
      foundKey = key;
    } else {
      const phone = digits(identifier);
      if (phone) {
        Object.keys(users).forEach((k) => {
          if (!foundKey && digits(users[k].phone) === phone) foundKey = k;
        });
      }
    }

    if (!foundKey) return { ok: false, error: 'Akun tidak ditemukan. Periksa email atau nomor HP Anda.' };
    if (users[foundKey].password !== password) return { ok: false, error: 'Kata sandi salah. Silakan coba lagi.' };
    return { ok: true, email: foundKey, user: users[foundKey] };
  }

  function register(payload) {
    const users = getUsers();
    const email = normalize(payload.email);
    const phone = digits(payload.phone);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: 'Format email belum benar.' };
    }
    if (users[email]) return { ok: false, error: 'Email ini sudah terdaftar. Silakan masuk.' };
    if (!phone || phone.length < 9) return { ok: false, error: 'Nomor HP minimal 9 digit.' };
    const phoneTaken = Object.keys(users).some((k) => digits(users[k].phone) === phone);
    if (phoneTaken) return { ok: false, error: 'Nomor HP ini sudah digunakan akun lain.' };
    if (String(payload.password || '').length < 6) {
      return { ok: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    users[email] = {
      name: String(payload.name || '').trim(),
      email,
      phone: payload.phone,
      password: payload.password,
      createdAt: nowIso()
    };
    saveUsers(users);

    const data = blank(email, { name: users[email].name, phone: users[email].phone });
    write(dataKey(email), data);

    return { ok: true, email, data };
  }

  function load(email) {
    const key = normalize(email);
    let data = read(dataKey(key), null);
    if (!data) {
      data = blank(key);
      write(dataKey(key), data);
    }
    return hydrate(data, key);
  }

  function save(data) {
    if (!data || !data.user || !data.user.email) return;
    write(dataKey(data.user.email), data);
  }

  function session() {
    return localStorage.getItem(SESSION_KEY) || '';
  }

  function setSession(email) {
    localStorage.setItem(SESSION_KEY, normalize(email));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function verifyPassword(email, password) {
    const users = getUsers();
    return users[normalize(email)] && users[normalize(email)].password === password;
  }

  function setPassword(email, password) {
    const users = getUsers();
    const key = normalize(email);
    if (!users[key]) return false;
    users[key].password = password;
    saveUsers(users);
    return true;
  }

  function updateUserRecord(email, patch) {
    const users = getUsers();
    const key = normalize(email);
    if (!users[key]) return false;
    users[key] = Object.assign({}, users[key], patch);
    saveUsers(users);
    return true;
  }

  return {
    ensureDemo, login, register, load, save, session, setSession, logout,
    verifyPassword, setPassword, updateUserRecord, getUsers
  };
})();
