/* HargaUMKM — pricing engine */
window.Calc = (function () {
  const N = (v) => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

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

  return { price, discount, maxDiscount, N };
})();
