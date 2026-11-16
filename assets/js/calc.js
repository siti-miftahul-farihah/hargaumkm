/* HargaUMKM — pricing engine */
window.Calc = (function () {
  const N = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const money = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
    const digits = String(v == null ? '' : v).replace(/\D/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const UNIT_OPTIONS = [
    'gram', 'kg', 'mililiter', 'liter', 'sentimeter', 'meter',
    'pcs', 'buah', 'lusin', 'lembar', 'roll', 'bungkus', 'pak', 'set', 'kotak'
  ];

  const UNIT_DEFS = [
    { keys: ['gram', 'g', 'gr'], family: 'mass', factor: 1, label: 'gram' },
    { keys: ['kilogram', 'kg', 'kilo'], family: 'mass', factor: 1000, label: 'kg' },
    { keys: ['mililiter', 'milliliter', 'ml', 'cc'], family: 'volume', factor: 1, label: 'ml' },
    { keys: ['liter', 'litre', 'l'], family: 'volume', factor: 1000, label: 'liter' },
    { keys: ['sentimeter', 'centimeter', 'cm'], family: 'length', factor: 1, label: 'cm' },
    { keys: ['meter', 'metre', 'm'], family: 'length', factor: 100, label: 'meter' },
    { keys: ['pcs', 'pc', 'buah', 'biji', 'unit'], family: 'count', factor: 1, label: 'pcs' },
    { keys: ['lusin', 'dozen', 'dusin'], family: 'count', factor: 12, label: 'lusin' },
    { keys: ['lembar', 'sheet'], family: 'sheet', factor: 1, label: 'lembar' },
    { keys: ['roll', 'gulung'], family: 'roll', factor: 1, label: 'roll' },
    { keys: ['bungkus', 'pack', 'paket'], family: 'bungkus', factor: 1, label: 'bungkus' },
    { keys: ['pak'], family: 'pak', factor: 1, label: 'pak' },
    { keys: ['set'], family: 'set', factor: 1, label: 'set' },
    { keys: ['kotak', 'box'], family: 'kotak', factor: 1, label: 'kotak' }
  ];

  function normalizeUnit(value) {
    const raw = String(value == null ? '' : value).trim().toLowerCase();
    if (!raw) return null;
    const def = UNIT_DEFS.find((unit) => unit.keys.indexOf(raw) !== -1);
    if (def) {
      return { key: def.keys[0], family: def.family, factor: def.factor, label: def.label };
    }
    return { key: raw, family: 'custom:' + raw, factor: 1, label: raw };
  }

  function friendlyNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(n);
  }

  function materialSummary(items) {
    const rows = (Array.isArray(items) ? items : []).map(function (item, index) {
      const src = item && typeof item === 'object' ? item : {};
      const legacy = src.purchaseQty == null && src.purchaseUnit == null &&
        src.usedQty == null && src.usageUnit == null && src.price != null;
      const id = String(src.id || 'material-' + index);
      const name = String(src.name || '').trim();
      const purchaseQty = legacy ? 1 : N(src.purchaseQty);
      const purchaseUnitRaw = legacy ? 'paket' : String(src.purchaseUnit || '').trim();
      const purchasePrice = money(src.purchasePrice != null ? src.purchasePrice : src.price);
      const usedQty = legacy ? purchaseQty : N(src.usedQty);
      const usageUnitRaw = legacy ? purchaseUnitRaw : String(src.usageUnit || '').trim();
      const purchaseUnit = normalizeUnit(purchaseUnitRaw);
      const usageUnit = normalizeUnit(usageUnitRaw);
      const active = Boolean(
        name || purchaseQty || purchasePrice || usedQty || purchaseUnitRaw || usageUnitRaw
      );
      let error = '';
      let compatible = false;
      let allowedQty = 0;
      let cost = 0;

      if (active) {
        if (!name) {
          error = 'Nama bahan wajib diisi.';
        } else if (!purchaseUnit) {
          error = 'Pilih satuan pembelian terlebih dahulu.';
        } else if (purchaseQty <= 0) {
          error = 'Jumlah pembelian harus lebih dari 0.';
        } else if (!usageUnit) {
          error = 'Pilih satuan penggunaan terlebih dahulu.';
        } else if (usedQty < 0) {
          error = 'Jumlah penggunaan tidak boleh negatif.';
        } else if (purchaseUnit.family !== usageUnit.family) {
          error = 'Satuan pembelian dan penggunaan tidak sejenis. Pilih satuan yang bisa dikonversi atau gunakan satuan yang sama.';
        } else {
          compatible = true;
          allowedQty = purchaseQty * (purchaseUnit.factor / usageUnit.factor);
          if (usedQty > allowedQty + 0.000001) {
            error = 'Jumlah digunakan melebihi jumlah pembelian (setara ' +
              friendlyNumber(allowedQty) + ' ' + usageUnit.label + ').';
          } else {
            cost = (usedQty * usageUnit.factor) / (purchaseQty * purchaseUnit.factor) * purchasePrice;
          }
        }
      }

      return {
        id,
        index,
        name,
        purchaseQty,
        purchaseUnit: purchaseUnitRaw,
        purchasePrice,
        usedQty,
        usageUnit: usageUnitRaw,
        usedCost: Math.round(cost),
        purchaseTotal: purchasePrice,
        allowedQty,
        compatible,
        valid: active && !error,
        active,
        empty: !active,
        error
      };
    });

    const activeRows = rows.filter(function (row) { return row.active; });
    const validRows = rows.filter(function (row) { return row.valid; });
    return {
      rows,
      activeCount: activeRows.length,
      validCount: validRows.length,
      purchaseTotal: activeRows.reduce(function (sum, row) { return sum + row.purchaseTotal; }, 0),
      usedTotal: validRows.reduce(function (sum, row) { return sum + row.usedCost; }, 0),
      errors: activeRows.filter(function (row) { return row.error; }).map(function (row) {
        return row.name ? row.name + ': ' + row.error : row.error;
      })
    };
  }

  /**
   * Menghitung harga jual ideal.
   * Modal + kemasan + operasional + ongkir = biaya tetap.
   * Komisi marketplace bisa nominal atau persen dari harga jual.
   * Target bisa nominal atau margin persen dari harga jual.
   */
  function price(input) {
    const src = input || {};
    const costBase =
      Math.max(0, N(src.modal)) +
      Math.max(0, N(src.packaging)) +
      Math.max(0, N(src.operational)) +
      Math.max(0, N(src.shipping));

    const cType = src.commissionType === 'nominal' ? 'nominal' : 'percent';
    const cVal = Math.max(0, N(src.commissionValue));
    const tType = src.targetType === 'nominal' ? 'nominal' : 'percent';
    const tVal = Math.max(0, N(src.targetValue));
    const allowedRounding = [0, 500, 1000, 5000];
    const roundTo = allowedRounding.includes(Number(src.roundTo)) ? Number(src.roundTo) : 500;

    if (costBase <= 0) {
      return { error: 'Isi minimal modal produk untuk mulai menghitung.' };
    }

    let raw = 0;

    if (cType === 'percent') {
      const c = cVal / 100;
      if (c >= 0.95) {
        return { error: 'Komisi terlalu besar. Pastikan persentase komisi di bawah 95%.' };
      }
      if (tType === 'percent') {
        const m = tVal / 100;
        if (c + m >= 0.95) {
          return { error: 'Total komisi dan target margin terlalu besar. Kurangi salah satunya (maksimal 95%).' };
        }
        raw = costBase / (1 - c - m);
      } else {
        raw = (costBase + tVal) / (1 - c);
      }
    } else {
      if (tType === 'percent') {
        const m = tVal / 100;
        if (m >= 0.95) {
          return { error: 'Target margin terlalu besar. Gunakan nilai di bawah 95%.' };
        }
        raw = (costBase + cVal) / (1 - m);
      } else {
        raw = costBase + cVal + tVal;
      }
    }

    if (!Number.isFinite(raw) || raw <= 0) {
      return { error: 'Perhitungan tidak valid. Periksa kembali angka yang Anda masukkan.' };
    }

    const priceVal = roundTo > 0 ? Math.ceil(raw / roundTo) * roundTo : Math.ceil(raw);
    const commission = cType === 'percent' ? (priceVal * cVal) / 100 : cVal;
    const totalCost = costBase + commission;
    const profit = priceVal - totalCost;
    const margin = priceVal > 0 ? (profit / priceVal) * 100 : 0;
    const achieved = tType === 'percent' ? margin >= tVal - 0.05 : profit >= tVal - 0.5;

    return {
      ok: true,
      costBase,
      rawPrice: raw,
      price: priceVal,
      commission,
      totalCost,
      profit,
      margin,
      achieved,
      commissionType: cType,
      commissionValue: cVal,
      targetType: tType,
      targetValue: tVal,
      roundTo
    };
  }

  /**
   * Kalkulator batch sederhana untuk halaman Hitung Harga Jual.
   * Semua komponen biaya adalah total satu kali produksi (satu batch).
   * Rumus: total biaya = modal + kemasan + operasional + ongkir.
   * Harga jual total = total biaya + target keuntungan total.
   */
  function batch(input) {
    const src = input || {};
    const materials = materialSummary(src.materials);
    const materialMethod = src.materialMethod === 'materials' && materials.activeCount > 0
      ? 'materials'
      : 'manual';
    const modal = materialMethod === 'materials' ? materials.usedTotal : money(src.modal);
    const packaging = money(src.packaging);
    const operational = money(src.operational);
    const shipping = money(src.shipping);
    const targetProfit = money(src.targetProfitTotal);
    const productionQty = Math.max(0, N(src.productionQty));
    const totalCost = modal + packaging + operational + shipping;
    const totalPrice = totalCost + targetProfit;
    const hasQty = productionQty > 0;
    const unitCost = hasQty ? totalCost / productionQty : 0;
    const unitPrice = hasQty ? totalPrice / productionQty : 0;
    const unitProfit = hasQty ? targetProfit / productionQty : 0;
    const margin = totalPrice > 0 ? (targetProfit / totalPrice) * 100 : 0;

    return {
      ok: true,
      modal,
      materialMethod,
      materialPurchaseTotal: materials.purchaseTotal,
      materialUsedTotal: materials.usedTotal,
      materials: materials.rows,
      packaging,
      operational,
      shipping,
      productionQty,
      targetProfit,
      totalCost,
      totalPrice,
      unitCost,
      unitPrice,
      unitProfit,
      hpp: unitCost,
      hasQty,
      margin
    };
  }

  /** Simulasi harga setelah diskon. */
  function discount(product, pctValue) {
    const d = Math.min(100, Math.max(0, N(pctValue)));
    const basePrice = Math.max(0, N(product.price));
    const costBase = Math.max(0, N(product.costBase));
    const cType = product.commissionType === 'nominal' ? 'nominal' : 'percent';
    const cVal = Math.max(0, N(product.commissionValue));

    const newPrice = Math.max(0, Math.round((basePrice * (1 - d / 100)) / 100) * 100);
    const commission = cType === 'percent' ? (newPrice * cVal) / 100 : cVal;
    const totalCost = costBase + commission;
    const profit = newPrice - totalCost;
    const margin = newPrice > 0 ? (profit / newPrice) * 100 : 0;

    return {
      discount: d,
      oldPrice: basePrice,
      newPrice,
      discountAmount: basePrice - newPrice,
      commission,
      totalCost,
      profit,
      margin,
      marginDelta: margin - N(product.margin)
    };
  }

  /**
   * Batas diskon maksimal agar keuntungan tidak turun di bawah minimum.
   * minType: 'percent' (margin minimum) atau 'nominal' (laba minimum).
   */
  function maxDiscount(product, minType, minValue) {
    const priceVal = Math.max(0, N(product.price));
    const costBase = Math.max(0, N(product.costBase));
    const cType = product.commissionType === 'nominal' ? 'nominal' : 'percent';
    const cVal = Math.max(0, N(product.commissionValue));
    const mType = minType === 'nominal' ? 'nominal' : 'percent';
    const mVal = Math.max(0, N(minValue));

    let minPrice = 0;

    if (cType === 'percent') {
      const c = cVal / 100;
      if (c >= 0.95) return { pct: 0, minPrice: priceVal, impossible: true };
      if (mType === 'percent') {
        const m = mVal / 100;
        if (c + m >= 0.95) return { pct: 0, minPrice: priceVal, impossible: true };
        minPrice = costBase / (1 - c - m);
      } else {
        minPrice = (costBase + mVal) / (1 - c);
      }
    } else {
      if (mType === 'percent') {
        const m = mVal / 100;
        if (m >= 0.95) return { pct: 0, minPrice: priceVal, impossible: true };
        minPrice = (costBase + cVal) / (1 - m);
      } else {
        minPrice = costBase + cVal + mVal;
      }
    }

    const pctValue = priceVal > 0 ? Math.max(0, (1 - minPrice / priceVal) * 100) : 0;

    return {
      pct: Math.min(100, pctValue),
      minPrice,
      impossible: minPrice > priceVal
    };
  }

  return {
    price,
    batch,
    discount,
    maxDiscount,
    materialSummary,
    normalizeUnit,
    unitOptions: UNIT_OPTIONS,
    N
  };
})();
