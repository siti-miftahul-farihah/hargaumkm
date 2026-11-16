/* HargaUMKM — core calculator */
window.Views = window.Views || {};

(function () {
  let savingProduct = false;

  function normalizeMaterial(item) {
    const src = item || {};
    const legacy = src.purchaseQty == null && src.purchaseUnit == null &&
      src.usedQty == null && src.usageUnit == null && src.price != null;
    return {
      id: String(src.id || U.uid('m')),
      name: String(src.name || ''),
      purchaseQty: legacy ? '1' : String(src.purchaseQty == null ? '' : src.purchaseQty),
      purchaseUnit: legacy ? 'paket' : String(src.purchaseUnit || ''),
      purchasePrice: String(U.toMoney(src.purchasePrice != null ? src.purchasePrice : src.price)),
      usedQty: legacy ? '1' : String(src.usedQty == null ? '' : src.usedQty),
      usageUnit: legacy ? 'paket' : String(src.usageUnit || '')
    };
  }

  function normalizeMaterials(items) {
    return (Array.isArray(items) ? items : [])
      .map(normalizeMaterial)
      .filter(function (item) {
        return item.name || U.toMoney(item.purchasePrice) > 0 || U.toNum(item.purchaseQty) > 0 ||
          U.toNum(item.usedQty) > 0 || item.purchaseUnit || item.usageUnit;
      });
  }

  function materialMethod() {
    const d = App.ui.calc;
    return d && d.materialMethod === 'materials' ? 'materials' : 'manual';
  }

  function materialMethodText(method) {
    return method === 'materials' ? 'Dari rincian bahan' : 'Input manual';
  }

  function materialMethodHint(method) {
    return method === 'materials'
      ? 'Total diambil dari biaya bahan yang benar-benar terpakai untuk satu batch.'
      : 'Ketik total modal bahan jika Anda sudah mengetahui angkanya. Rincian bahan bersifat opsional.';
  }

  Views.blankDraft = function () {
    return {
      editId: null,
      name: '',
      modal: '',
      materialMethod: 'manual',
      productionQty: '',
      packaging: '',
      operational: '',
      shipping: '',
      targetProfitTotal: '',
      materials: []
    };
  };

  Views.draftFromProduct = function (p) {
    const product = p || {};
    const qty = product.productionQty == null || product.productionQty === ''
      ? 1
      : product.productionQty;
    const target = product.targetProfitTotal == null || product.targetProfitTotal === ''
      ? (product.profit == null ? '' : product.profit)
      : product.targetProfitTotal;
    const materials = normalizeMaterials(product.materials);
    const summary = Calc.materialSummary(materials);
    let method = product.materialMethod === 'materials' ? 'materials' : 'manual';

    /* Produk lama belum punya materialMethod. Pakai rincian hanya jika totalnya cocok. */
    if (!product.materialMethod && summary.activeCount > 0 &&
      Math.abs(summary.usedTotal - U.toMoney(product.modal)) <= 1) {
      method = 'materials';
    }
    if (method === 'materials' && summary.activeCount === 0) method = 'manual';

    return {
      editId: product.id,
      name: product.name || '',
      modal: String(method === 'materials' ? summary.usedTotal : U.toMoney(product.modal)),
      materialMethod: method,
      productionQty: String(qty),
      packaging: String(product.packaging == null ? '' : product.packaging),
      operational: String(product.operational == null ? '' : product.operational),
      shipping: String(product.shipping == null ? '' : product.shipping),
      targetProfitTotal: String(target == null ? '' : target),
      materials: materials
    };
  };

  function label(field, text, opts) {
    const o = opts || {};
    return '<label class="calc-label" for="calc-' + field + '">' + text +
      (o.required ? ' <span class="calc-required">*</span>' : '') +
      (o.optional ? ' <span class="calc-optional">(opsional)</span>' : '') +
      '</label>';
  }

  function hint(text) {
    return text ? '<p class="calc-hint">' + text + '</p>' : '';
  }

  function moneyField(field, text, value, opts) {
    const o = opts || {};
    const id = 'calc-' + field;
    const input =
      '<div class="calc-input-wrap">' +
        '<span class="calc-prefix">Rp</span>' +
        '<input id="' + id + '" class="calc-input calc-input-money" type="text" inputmode="numeric" ' +
          'autocomplete="off" data-calc-field="' + field + '" data-money-input ' +
          'value="' + U.esc(U.money(value)) + '" placeholder="0">' +
      '</div>';
    const labelBlock = o.badge
      ? '<div class="calc-label-line">' + label(field, text, o) + o.badge + '</div>'
      : label(field, text, o);

    return (
      '<div>' +
        labelBlock +
        (o.button
          ? '<div class="calc-money-row">' + input + o.button + '</div>'
          : input) +
        hint(o.hint) +
      '</div>'
    );
  }

  function resultTile(title, value, sub) {
    return (
      '<div class="calc-result-tile">' +
        '<p class="calc-tile-label">' + title + '</p>' +
        '<p class="calc-tile-value num">' + value + '</p>' +
        '<p class="calc-tile-sub">' + sub + '</p>' +
      '</div>'
    );
  }

  Views.calcResult = function () {
    const d = App.ui.calc || Views.blankDraft();
    const res = Calc.batch(d);
    const editing = !!d.editId;
    const qtyReady = res.hasQty;

    return (
      '<div class="calc-card calc-result-card">' +
        '<div class="calc-card-head">' +
          '<span class="calc-head-icon calc-head-icon-green">' + U.icon('gauge', 'w-5 h-5') + '</span>' +
          '<div>' +
            '<h2 class="calc-card-title">Hasil Perhitungan Presisi</h2>' +
            '<p class="calc-card-sub">Diperbarui otomatis saat Anda mengubah angka.</p>' +
          '</div>' +
        '</div>' +

        '<div class="calc-result-body">' +
          '<div class="calc-result-tiles">' +
            resultTile(
              'Total Biaya Modal',
              U.rupiah(res.totalCost),
              qtyReady ? 'HPP per satuan ' + U.rupiah(res.unitCost) : 'Isi jumlah produksi'
            ) +
            resultTile(
              'Harga Jual Total',
              U.rupiah(res.totalPrice),
              'Total biaya + target keuntungan'
            ) +
          '</div>' +

          '<div class="calc-green-panel">' +
            '<div class="calc-green-row">' +
              '<span class="calc-green-label">Harga Jual per Satuan</span>' +
              '<span id="calc-unit-price" class="calc-green-value num">' + (qtyReady ? U.rupiah(res.unitPrice) : '—') + '</span>' +
            '</div>' +
            '<div class="calc-green-divider"></div>' +
            '<div class="calc-green-row">' +
              '<span class="calc-green-label">Target Keuntungan Bersih</span>' +
              '<span id="calc-target-profit" class="calc-green-value num">' + U.rupiah(res.targetProfit) + '</span>' +
            '</div>' +
            (qtyReady ? '' : '<p class="calc-green-hint">Isi jumlah hasil produksi terlebih dahulu untuk melihat harga jual per satuan.</p>') +
          '</div>' +

          '<div class="calc-result-note">' +
            U.icon('info', 'w-4 h-4 shrink-0') +
            '<span>Semua biaya dihitung untuk satu batch. Target keuntungan juga untuk satu batch produksi.' +
              (res.materialMethod === 'materials' ? ' Modal bahan memakai total biaya bahan terpakai.' : '') +
            '</span>' +
          '</div>' +

          '<div class="calc-result-actions">' +
            '<button type="button" class="calc-save-btn" data-action="save-product">' +
              U.icon(editing ? 'save' : 'plus', 'w-4 h-4') +
              '<span>' + (editing ? 'Simpan Perubahan Produk' : 'Simpan Produk ke Daftar') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  };

  Views.calculator = function () {
    const editId = App.route.params[0] || null;
    const existing = editId ? App.data.products.find(function (p) { return p.id === editId; }) : null;

    if (!App.ui.calc || App.ui.calc.editId !== editId) {
      App.ui.calc = existing ? Views.draftFromProduct(existing) : Views.blankDraft();
    }
    App.ui.materialsDraft = null;

    const d = App.ui.calc;
    const editing = !!d.editId;
    const method = materialMethod();
    const premium = App.data.user.premium;
    const atLimit = !premium && !editing && App.data.products.length >= UI.LIMITS.products;

    const detailButton =
      '<button type="button" class="calc-mini-btn" data-action="open-materials">' +
        U.icon('list', 'w-3.5 h-3.5') +
        '<span>Rinci Bahan</span>' +
      '</button>';

    const methodBadge =
      '<span id="calc-material-method" class="calc-method-badge' +
        (method === 'materials' ? ' is-materials' : '') + '">' +
        materialMethodText(method) +
      '</span>';

    return (
      '<div class="calc-page">' +
        '<div class="calc-page-head">' +
          '<div>' +
            '<p class="calc-eyebrow">KALKULATOR HPP</p>' +
            '<h1 class="calc-title">Hitung Harga Jual</h1>' +
            '<p class="calc-desc">Kalkulasi HPP dan tentukan harga jual ideal.</p>' +
          '</div>' +
          '<div class="calc-head-actions">' +
            (editing
              ? '<span class="calc-edit-badge">' + U.icon('pencil', 'w-3.5 h-3.5') + 'Mode edit</span>'
              : '<a href="#/app/produk" class="calc-head-link">' + U.icon('package', 'w-4 h-4') + 'Produk Saya</a>') +
          '</div>' +
        '</div>' +

        (atLimit
          ? '<div class="calc-warning">' +
              '<span class="calc-warning-icon">' + U.icon('triangle-alert', 'w-4 h-4') + '</span>' +
              '<p>Anda sudah menyimpan ' + App.data.products.length + '/' + UI.LIMITS.products + ' produk di paket gratis. Upgrade untuk menyimpan produk baru tanpa batas.</p>' +
              '<button type="button" class="calc-warning-btn" data-action="open-upgrade">Upgrade</button>' +
            '</div>'
          : '') +

        '<div class="calc-grid">' +
          '<form data-form="calc" novalidate class="calc-card calc-form-card">' +
            '<div class="calc-card-head">' +
              '<span class="calc-head-icon">' + U.icon('calculator', 'w-5 h-5') + '</span>' +
              '<div>' +
                '<h2 class="calc-card-title">Form Kalkulator HPP</h2>' +
                '<p class="calc-card-sub">Lengkapi komponen biaya untuk satu batch produksi.</p>' +
              '</div>' +
            '</div>' +

            '<div class="calc-form-body">' +
              '<div>' +
                label('name', 'Nama Produk', { required: true }) +
                '<input id="calc-name" class="calc-input" type="text" data-calc-field="name" value="' + U.esc(d.name) + '" placeholder="Masukkan nama produk" autocomplete="off">' +
              '</div>' +

              moneyField('modal', 'Modal Bahan Total', d.modal, {
                required: true,
                button: detailButton,
                badge: methodBadge,
                hint: '<span id="calc-material-hint">' + materialMethodHint(method) + '</span>'
              }) +

              '<div>' +
                label('productionQty', 'Jumlah Hasil Produksi (Porsi/Biji/Unit)', { required: true }) +
                '<input id="calc-productionQty" class="calc-input no-spin" type="number" min="1" step="1" inputmode="numeric" data-calc-field="productionQty" value="' + U.esc(d.productionQty) + '" placeholder="Masukkan jumlah produk yang dihasilkan">' +
                hint('Berapa banyak produk yang dihasilkan dari modal bahan di atas?') +
              '</div>' +

              '<div class="calc-field-row">' +
                moneyField('operational', 'Biaya Operasional', d.operational, {
                  optional: true,
                  hint: 'Listrik, tenaga kerja, dan biaya produksi lainnya.'
                }) +
                moneyField('packaging', 'Biaya Kemasan', d.packaging, {
                  optional: true
                }) +
              '</div>' +

              moneyField('shipping', 'Biaya Ongkir / Lainnya', d.shipping, {
                optional: true,
                hint: 'Isi jika Anda menanggung ongkir atau biaya tambahan.'
              }) +

              moneyField('targetProfitTotal', 'Target Keuntungan Total', d.targetProfitTotal, {
                required: true,
                hint: 'Target keuntungan untuk satu kali proses produksi atau satu batch, bukan per unit.'
              }) +

              '<div class="calc-info-box">' +
                U.icon('info', 'w-4 h-4 shrink-0') +
                '<p>Semua biaya di atas dihitung untuk satu batch. Harga jual per satuan dihitung otomatis dari harga jual total dibagi jumlah hasil produksi.</p>' +
              '</div>' +
            '</div>' +
          '</form>' +

          '<div class="calc-result-wrap" id="calc-result">' + Views.calcResult() + '</div>' +
        '</div>' +
      '</div>'
    );
  };

  Views.calcUpdate = function () {
    const box = document.getElementById('calc-result');
    if (!box) return;
    box.innerHTML = Views.calcResult();
    U.refreshIcons();
  };

  Views.syncMaterialMethod = function () {
    const method = materialMethod();
    const badge = document.getElementById('calc-material-method');
    const note = document.getElementById('calc-material-hint');
    if (badge) {
      badge.textContent = materialMethodText(method);
      badge.classList.toggle('is-materials', method === 'materials');
    }
    if (note) note.textContent = materialMethodHint(method);
  };

  function materialRow(item, index) {
    const id = U.esc(item.id);
    const summary = Calc.materialSummary([item]).rows[0] || {};
    const warning = summary.error || '';
    return (
      '<div class="material-card' + (warning ? ' is-invalid' : '') + '" data-material-card="' + id + '">' +
        '<div class="material-card-head">' +
          '<span class="material-number">Bahan ' + (index + 1) + '</span>' +
          '<button type="button" class="material-del" data-action="remove-material" data-id="' + id + '" aria-label="Hapus bahan ' + (index + 1) + '">' +
            U.icon('trash-2', 'w-4 h-4') +
            '<span>Hapus</span>' +
          '</button>' +
        '</div>' +
        '<div class="material-fields">' +
          '<div class="material-field material-field-full">' +
            '<label class="material-label" for="material-name-' + id + '">Nama Bahan <span class="calc-required">*</span></label>' +
            '<input id="material-name-' + id + '" class="calc-input" type="text" data-material-field="name" data-material-id="' + id + '" ' +
              'value="' + U.esc(item.name) + '" placeholder="Contoh: Tepung Terigu" autocomplete="off">' +
          '</div>' +

          '<div class="material-field-row">' +
            '<div class="material-field">' +
              '<label class="material-label" for="material-purchase-qty-' + id + '">Jumlah Pembelian <span class="calc-required">*</span></label>' +
              '<input id="material-purchase-qty-' + id + '" class="calc-input" type="number" min="0" step="any" inputmode="decimal" ' +
                'data-material-field="purchaseQty" data-material-id="' + id + '" value="' + U.esc(item.purchaseQty) + '" placeholder="Contoh: 1">' +
            '</div>' +
            '<div class="material-field">' +
              '<label class="material-label" for="material-purchase-unit-' + id + '">Satuan Pembelian <span class="calc-required">*</span></label>' +
              '<input id="material-purchase-unit-' + id + '" class="calc-input" type="text" list="material-unit-options" ' +
                'data-material-field="purchaseUnit" data-material-id="' + id + '" value="' + U.esc(item.purchaseUnit) + '" ' +
                'placeholder="Contoh: kg" autocomplete="off">' +
            '</div>' +
          '</div>' +

          '<div class="material-field material-field-full">' +
            '<label class="material-label" for="material-purchase-price-' + id + '">Harga Pembelian Total (Rp) <span class="calc-required">*</span></label>' +
            '<div class="calc-input-wrap">' +
              '<span class="calc-prefix">Rp</span>' +
              '<input id="material-purchase-price-' + id + '" class="calc-input calc-input-money" type="text" inputmode="numeric" ' +
                'data-material-field="purchasePrice" data-material-money data-material-id="' + id + '" ' +
                'value="' + U.esc(U.money(item.purchasePrice)) + '" placeholder="Contoh: 18.000">' +
            '</div>' +
          '</div>' +

          '<div class="material-field-row">' +
            '<div class="material-field">' +
              '<label class="material-label" for="material-used-qty-' + id + '">Jumlah Digunakan <span class="calc-required">*</span></label>' +
              '<input id="material-used-qty-' + id + '" class="calc-input" type="number" min="0" step="any" inputmode="decimal" ' +
                'data-material-field="usedQty" data-material-id="' + id + '" value="' + U.esc(item.usedQty) + '" placeholder="Contoh: 200">' +
            '</div>' +
            '<div class="material-field">' +
              '<label class="material-label" for="material-usage-unit-' + id + '">Satuan Penggunaan <span class="calc-required">*</span></label>' +
              '<input id="material-usage-unit-' + id + '" class="calc-input" type="text" list="material-unit-options" ' +
                'data-material-field="usageUnit" data-material-id="' + id + '" value="' + U.esc(item.usageUnit) + '" ' +
                'placeholder="Contoh: gram" autocomplete="off">' +
            '</div>' +
          '</div>' +

          '<div class="material-cost">' +
            '<span class="material-cost-label">Biaya Bahan Terpakai</span>' +
            '<strong class="material-cost-value num" data-material-cost="' + id + '">' + U.rupiah(summary.usedCost || 0) + '</strong>' +
          '</div>' +
          '<p class="material-warning" data-material-warning="' + id + '"' + (warning ? '' : ' hidden') + '>' + U.esc(warning) + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function materialElement(attr, id) {
    const nodes = document.querySelectorAll('[' + attr + ']');
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].getAttribute(attr) === id) return nodes[i];
    }
    return null;
  }

  function materialSummaryHtml(items) {
    const summary = Calc.materialSummary(items);
    return (
      '<div class="material-summary">' +
        '<div class="material-summary-card material-summary-purchase">' +
          '<p class="material-summary-label">Total Harga Pembelian Bahan</p>' +
          '<p id="materials-purchase-total" class="material-summary-value num">' + U.rupiah(summary.purchaseTotal) + '</p>' +
          '<p class="material-summary-note">Nilai seluruh bahan yang dibeli. Bukan biaya untuk satu batch.</p>' +
        '</div>' +
        '<div class="material-summary-card material-summary-used">' +
          '<p class="material-summary-label">Total Biaya Bahan Terpakai</p>' +
          '<p id="materials-total" class="material-summary-value material-summary-value-lg num">' + U.rupiah(summary.usedTotal) + '</p>' +
          '<p class="material-summary-note">Dipakai untuk menghitung HPP satu batch produksi.</p>' +
        '</div>' +
      '</div>' +
      '<p id="materials-summary-warning" class="material-summary-warning"' + (summary.errors.length ? '' : ' hidden') + '>' +
        U.esc(summary.errors[0] || '') +
      '</p>' +
      '<p class="material-summary-apply-note">Tombol <strong>Gunakan Total Ini</strong> memakai Total Biaya Bahan Terpakai, bukan total harga pembelian.</p>'
    );
  }

  function materialsModalHtml() {
    const draft = App.ui.materialsDraft || { items: [] };
    const items = draft.items;

    return (
      '<div class="calc-modal">' +
        '<div class="calc-modal-head">' +
          '<div>' +
            '<p class="calc-modal-eyebrow">RINCIAN BAHAN</p>' +
            '<h2 class="calc-modal-title">Rincian Bahan Mentah / Resep</h2>' +
            '<p class="calc-modal-desc">Masukkan jumlah bahan yang dibeli dan yang benar-benar dipakai untuk satu batch. Cocok untuk makanan, pakaian, kerajinan, dan produk UMKM lainnya.</p>' +
          '</div>' +
          '<button type="button" class="calc-modal-close" data-action="cancel-materials" aria-label="Tutup">' +
            U.icon('x', 'w-4 h-4') +
          '</button>' +
        '</div>' +

        '<div class="calc-modal-body">' +
          '<div class="material-formula-note">' +
            U.icon('calculator', 'w-4 h-4 shrink-0') +
            '<p>Biaya bahan terpakai = (jumlah digunakan ÷ jumlah pembelian) × harga pembelian total. Satuan berat, volume, dan panjang dikonversi otomatis.</p>' +
          '</div>' +
          '<datalist id="material-unit-options">' +
            Calc.unitOptions.map(function (unit) {
              return '<option value="' + U.esc(unit) + '"></option>';
            }).join('') +
          '</datalist>' +
          '<div id="materials-list" class="material-list">' +
            (items.length
              ? items.map(materialRow).join('')
              : '<div class="material-empty">Belum ada bahan. Tambahkan bahan pertama Anda.</div>') +
          '</div>' +
          '<button type="button" class="calc-add-btn" data-action="add-material">' +
            U.icon('plus', 'w-4 h-4') + 'Tambah Bahan Lain' +
          '</button>' +

          materialSummaryHtml(items) +
        '</div>' +

        '<div class="calc-modal-foot">' +
          '<p class="calc-modal-foot-note">Batal tidak mengubah form utama.</p>' +
          '<div class="calc-modal-foot-actions">' +
            '<button type="button" class="calc-cancel-btn" data-action="cancel-materials">Batal</button>' +
            '<button type="button" class="calc-apply-btn" data-action="apply-materials">Gunakan Total Ini</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  Views.openMaterialsModal = function () {
    const d = App.ui.calc;
    if (!d) return;

    const items = normalizeMaterials(d.materials);
    if (!items.length) {
      items.push({
        id: U.uid('m'),
        name: '',
        purchaseQty: '',
        purchaseUnit: '',
        purchasePrice: '',
        usedQty: '',
        usageUnit: ''
      });
    }
    App.ui.materialsDraft = { items: items };

    U.openModal(materialsModalHtml(), {
      label: 'Rincian Bahan Mentah',
      size: 'max-w-3xl',
      className: 'calc-modal-panel'
    });
  };

  Views.renderMaterials = function () {
    const draft = App.ui.materialsDraft;
    const list = document.getElementById('materials-list');
    if (!draft || !list) return;

    list.innerHTML = draft.items.length
      ? draft.items.map(materialRow).join('')
      : '<div class="material-empty">Belum ada bahan. Tambahkan bahan pertama Anda.</div>';
    Views.materialsUpdateTotal();
    U.refreshIcons();
  };

  Views.materialsUpdateTotal = function () {
    const draft = App.ui.materialsDraft;
    if (!draft) return;
    const summary = Calc.materialSummary(draft.items);
    const purchaseEl = document.getElementById('materials-purchase-total');
    const usedEl = document.getElementById('materials-total');
    const warningEl = document.getElementById('materials-summary-warning');

    if (purchaseEl) purchaseEl.textContent = U.rupiah(summary.purchaseTotal);
    if (usedEl) usedEl.textContent = U.rupiah(summary.usedTotal);
    if (warningEl) {
      warningEl.hidden = summary.errors.length === 0;
      warningEl.textContent = summary.errors.length === 1
        ? summary.errors[0]
        : (summary.errors.length > 1 ? summary.errors.length + ' bahan perlu diperbaiki. ' + summary.errors[0] : '');
    }

    summary.rows.forEach(function (row) {
      const costEl = materialElement('data-material-cost', row.id);
      if (costEl) costEl.textContent = U.rupiah(row.usedCost);
      const rowWarning = materialElement('data-material-warning', row.id);
      if (rowWarning) {
        rowWarning.hidden = !row.error;
        rowWarning.textContent = row.error || '';
      }
      const card = materialElement('data-material-card', row.id);
      if (card) card.classList.toggle('is-invalid', Boolean(row.error));
    });
  };

  Views.addMaterial = function () {
    const draft = App.ui.materialsDraft;
    if (!draft) return;
    draft.items.push({
      id: U.uid('m'),
      name: '',
      purchaseQty: '',
      purchaseUnit: '',
      purchasePrice: '',
      usedQty: '',
      usageUnit: ''
    });
    Views.renderMaterials();

    const list = document.getElementById('materials-list');
    if (!list) return;
    const inputs = list.querySelectorAll('[data-material-field="name"]');
    const last = inputs[inputs.length - 1];
    if (last) {
      last.focus();
      last.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  Views.removeMaterial = function (id) {
    const draft = App.ui.materialsDraft;
    if (!draft) return;
    draft.items = draft.items.filter(function (item) { return item.id !== id; });
    Views.renderMaterials();
  };

  Views.materialInput = function (el) {
    const draft = App.ui.materialsDraft;
    if (!draft) return;

    const id = el.getAttribute('data-material-id');
    const field = el.getAttribute('data-material-field');
    const item = draft.items.find(function (row) { return row.id === id; });
    if (!item) return;

    const editable = ['name', 'purchaseQty', 'purchaseUnit', 'purchasePrice', 'usedQty', 'usageUnit'];
    if (editable.indexOf(field) === -1) return;

    if (field === 'purchasePrice') {
      const digits = String(el.value || '').replace(/\D/g, '');
      item.purchasePrice = digits;
      el.value = digits ? U.money(digits) : '';
    } else {
      item[field] = el.value;
    }
    Views.materialsUpdateTotal();
  };

  Views.applyMaterials = function () {
    const d = App.ui.calc;
    const draft = App.ui.materialsDraft;
    if (!d || !draft) return;

    const summary = Calc.materialSummary(draft.items);
    if (!summary.activeCount) {
      U.toast('Isi minimal satu bahan, atau gunakan input manual pada Modal Bahan Total.', 'error');
      return;
    }
    if (summary.errors.length) {
      U.toast(summary.errors[0], 'error');
      const firstRow = summary.rows.find(function (row) { return row.error; });
      const card = firstRow ? materialElement('data-material-card', firstRow.id) : null;
      if (card) {
        const firstInput = card.querySelector('input');
        if (firstInput) firstInput.focus();
        card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return;
    }

    const items = summary.rows.filter(function (row) { return row.active; }).map(function (row) {
      return {
        id: row.id,
        name: row.name,
        purchaseQty: row.purchaseQty,
        purchaseUnit: row.purchaseUnit,
        purchasePrice: row.purchasePrice,
        usedQty: row.usedQty,
        usageUnit: row.usageUnit,
        usedCost: row.usedCost
      };
    });

    d.materials = items;
    d.materialMethod = 'materials';
    d.modal = String(summary.usedTotal);

    const input = document.getElementById('calc-modal');
    if (input) input.value = U.money(d.modal);

    App.ui.materialsDraft = null;
    Views.syncMaterialMethod();
    Views.calcUpdate();
    U.closeModal();
    U.toast('Total biaya bahan terpakai diterapkan ke Modal Bahan Total.');
  };

  Views.cancelMaterials = function () {
    App.ui.materialsDraft = null;
    U.closeModal();
  };

  Views.saveProduct = async function () {
    const d = App.ui.calc;
    if (!d || savingProduct) return;

    if (!String(d.name || '').trim()) {
      U.toast('Nama produk wajib diisi.', 'error');
      const input = document.getElementById('calc-name');
      if (input) input.focus();
      return;
    }

    if (d.materialMethod === 'materials') {
      const materialCheck = Calc.materialSummary(d.materials);
      if (materialCheck.activeCount && materialCheck.errors.length) {
        U.toast(materialCheck.errors[0], 'error');
        return;
      }
    }

    const res = Calc.batch(d);
    if (res.modal <= 0) {
      U.toast('Modal bahan total wajib diisi lebih dari Rp 0.', 'error');
      const input = document.getElementById('calc-modal');
      if (input) input.focus();
      return;
    }

    if (!res.hasQty) {
      U.toast('Jumlah hasil produksi wajib diisi lebih dari 0.', 'error');
      const input = document.getElementById('calc-productionQty');
      if (input) input.focus();
      return;
    }

    if (String(d.targetProfitTotal == null ? '' : d.targetProfitTotal).trim() === '') {
      U.toast('Target keuntungan total wajib diisi.', 'error');
      const input = document.getElementById('calc-targetProfitTotal');
      if (input) input.focus();
      return;
    }

    const premium = App.data.user.premium;
    if (!d.editId && !premium && App.data.products.length >= UI.LIMITS.products) {
      UI.upgradeModal('Batas ' + UI.LIMITS.products + ' produk pada paket gratis sudah tercapai. Upgrade Premium untuk menyimpan produk baru tanpa batas.');
      return;
    }

    const materials = (res.materials || [])
      .filter(function (row) { return row.active && !row.error; })
      .map(function (row) {
        return {
          id: row.id,
          name: row.name,
          purchaseQty: row.purchaseQty,
          purchaseUnit: row.purchaseUnit,
          purchasePrice: row.purchasePrice,
          usedQty: row.usedQty,
          usageUnit: row.usageUnit,
          usedCost: row.usedCost
        };
      });

    const payload = {
      name: String(d.name).trim(),
      modal: res.modal,
      materialMethod: res.materialMethod,
      materialPurchaseTotal: res.materialPurchaseTotal,
      materialUsedTotal: res.materialUsedTotal,
      productionQty: res.productionQty,
      packaging: res.packaging,
      operational: res.operational,
      shipping: res.shipping,
      targetProfitTotal: res.targetProfit,
      materials: materials,
      commissionType: 'nominal',
      commissionValue: 0,
      targetType: 'nominal',
      targetValue: res.unitProfit,
      roundTo: 0,
      price: res.unitPrice,
      costBase: res.unitCost,
      commission: 0,
      totalCost: res.unitCost,
      profit: res.unitProfit,
      margin: res.margin
    };

    savingProduct = true;
    const idx = d.editId
      ? App.data.products.findIndex(function (p) { return p.id === d.editId; })
      : -1;
    const previousProduct = idx >= 0 ? App.data.products[idx] : null;
    let savedId = d.editId;
    let historyEntry = null;

    if (d.editId) {
      payload.id = d.editId;
      payload.createdAt = previousProduct ? previousProduct.createdAt : new Date().toISOString();
      if (idx >= 0) App.data.products[idx] = payload;
      else App.data.products.unshift(payload);
    } else {
      payload.id = U.uid('p');
      payload.createdAt = new Date().toISOString();
      App.data.products.unshift(payload);
      savedId = payload.id;
    }

    if (premium || App.data.history.length < UI.LIMITS.history) {
      historyEntry = {
        id: U.uid('h'),
        type: 'kalkulasi',
        productId: savedId,
        productName: payload.name,
        price: res.unitPrice,
        profit: res.unitProfit,
        margin: res.margin,
        discount: null,
        createdAt: new Date().toISOString()
      };
      App.data.history.unshift(historyEntry);
    }

    let saved = false;
    try {
      saved = await App.save();
    } finally {
      savingProduct = false;
    }

    if (!saved) {
      if (d.editId && previousProduct && idx >= 0) {
        App.data.products[idx] = previousProduct;
      } else {
        App.data.products = App.data.products.filter(function (p) { return p.id !== payload.id; });
      }
      if (historyEntry) {
        App.data.history = App.data.history.filter(function (h) { return h.id !== historyEntry.id; });
      }
      return;
    }

    App.ui.calc = null;
    App.ui.materialsDraft = null;
    U.toast(d.editId ? 'Perubahan produk berhasil disimpan.' : 'Produk berhasil disimpan.');
    if (location.hash === '#/app/produk') App.refresh();
    else location.hash = '#/app/produk';
  };
})();
