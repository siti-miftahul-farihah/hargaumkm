/* HargaUMKM — core calculator */
window.Views = window.Views || {};

(function () {
  let savingProduct = false;

  function normalizeMaterials(items) {
    return (Array.isArray(items) ? items : [])
      .map(function (item) {
        const src = item || {};
        return {
          id: String(src.id || U.uid('m')),
          name: String(src.name || ''),
          price: String(U.toMoney(src.price))
        };
      })
      .filter(function (item) {
        return item.name || U.toMoney(item.price) > 0;
      });
  }

  function materialTotal(items) {
    return (Array.isArray(items) ? items : []).reduce(function (sum, item) {
      return sum + U.toMoney(item && item.price);
    }, 0);
  }

  Views.blankDraft = function () {
    return {
      editId: null,
      name: '',
      modal: '',
      productionQty: '',
      packaging: '',
      operational: '',
      shipping: '',
      targetProfitTotal: '',
      materials: [{ id: U.uid('m'), name: 'Garam', price: '2000' }]
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

    return {
      editId: product.id,
      name: product.name || '',
      modal: String(product.modal == null ? '' : product.modal),
      productionQty: String(qty),
      packaging: String(product.packaging == null ? '' : product.packaging),
      operational: String(product.operational == null ? '' : product.operational),
      shipping: String(product.shipping == null ? '' : product.shipping),
      targetProfitTotal: String(target == null ? '' : target),
      materials: normalizeMaterials(product.materials)
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

    return (
      '<div>' +
        label(field, text, o) +
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
            '<span>Semua biaya dihitung untuk satu batch. Target keuntungan juga untuk satu batch produksi.</span>' +
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
    const premium = App.data.user.premium;
    const atLimit = !premium && !editing && App.data.products.length >= UI.LIMITS.products;

    const detailButton =
      '<button type="button" class="calc-mini-btn" data-action="open-materials">' +
        U.icon('list', 'w-3.5 h-3.5') +
        '<span>Rinci Bahan</span>' +
      '</button>';

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
                hint: 'Klik Rinci Bahan untuk menjumlahkan harga bahan baku secara otomatis.'
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

  function materialRow(item) {
    const id = U.esc(item.id);
    return (
      '<div class="material-row" data-material-row="' + id + '">' +
        '<input class="calc-input material-name" type="text" data-material-field="name" data-material-id="' + id + '" ' +
          'value="' + U.esc(item.name) + '" placeholder="Nama bahan" autocomplete="off" aria-label="Nama bahan">' +
        '<div class="calc-input-wrap">' +
          '<span class="calc-prefix">Rp</span>' +
          '<input class="calc-input material-price" type="text" inputmode="numeric" data-material-field="price" ' +
            'data-material-money data-material-id="' + id + '" value="' + U.esc(U.money(item.price)) + '" ' +
            'placeholder="0" aria-label="Harga bahan">' +
        '</div>' +
        '<button type="button" class="material-del" data-action="remove-material" data-id="' + id + '" aria-label="Hapus bahan">' +
          U.icon('trash-2', 'w-4 h-4') +
        '</button>' +
      '</div>'
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
            '<p class="calc-modal-desc">Jabarkan komponen bahan baku secara rinci untuk HPP.</p>' +
          '</div>' +
          '<button type="button" class="calc-modal-close" data-action="cancel-materials" aria-label="Tutup">' +
            U.icon('x', 'w-4 h-4') +
          '</button>' +
        '</div>' +

        '<div class="calc-modal-body">' +
          '<div class="material-head">' +
            '<span>Nama Bahan</span>' +
            '<span>Harga Bahan (Rp)</span>' +
            '<span></span>' +
          '</div>' +
          '<div id="materials-list">' +
            (items.length
              ? items.map(materialRow).join('')
              : '<div class="material-empty">Belum ada bahan. Tambahkan bahan pertama Anda.</div>') +
          '</div>' +
          '<button type="button" class="calc-add-btn" data-action="add-material">' +
            U.icon('plus', 'w-4 h-4') + 'Tambah Bahan Lain' +
          '</button>' +

          '<div class="calc-material-total">' +
            '<div>' +
              '<p class="calc-material-total-label">Total Modal Bahan</p>' +
              '<p class="calc-material-total-note">Otomatis dari seluruh harga bahan di atas.</p>' +
            '</div>' +
            '<p id="materials-total" class="calc-material-total-value num">' + U.rupiah(materialTotal(items)) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="calc-modal-foot">' +
          '<button type="button" class="calc-cancel-btn" data-action="cancel-materials">Batal</button>' +
          '<button type="button" class="calc-apply-btn" data-action="apply-materials">Gunakan Total Ini</button>' +
        '</div>' +
      '</div>'
    );
  }

  Views.openMaterialsModal = function () {
    const d = App.ui.calc;
    if (!d) return;

    const items = normalizeMaterials(d.materials);
    if (!items.length) {
      items.push({ id: U.uid('m'), name: '', price: '' });
    }
    App.ui.materialsDraft = { items: items };

    U.openModal(materialsModalHtml(), {
      label: 'Rincian Bahan Mentah',
      size: 'max-w-2xl',
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
    const el = document.getElementById('materials-total');
    if (!draft || !el) return;
    el.textContent = U.rupiah(materialTotal(draft.items));
  };

  Views.addMaterial = function () {
    const draft = App.ui.materialsDraft;
    if (!draft) return;
    draft.items.push({ id: U.uid('m'), name: '', price: '' });
    Views.renderMaterials();

    const list = document.getElementById('materials-list');
    if (!list) return;
    const inputs = list.querySelectorAll('[data-material-field="name"]');
    const last = inputs[inputs.length - 1];
    if (last) last.focus();
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

    if (field === 'price') {
      const digits = String(el.value || '').replace(/\D/g, '');
      item.price = digits;
      el.value = digits ? U.money(digits) : '';
      Views.materialsUpdateTotal();
    } else {
      item.name = el.value;
    }
  };

  Views.applyMaterials = function () {
    const d = App.ui.calc;
    const draft = App.ui.materialsDraft;
    if (!d || !draft) return;

    const items = draft.items
      .map(function (item) {
        return {
          id: item.id || U.uid('m'),
          name: String(item.name || '').trim(),
          price: U.toMoney(item.price)
        };
      })
      .filter(function (item) { return item.name || item.price > 0; });

    const total = materialTotal(items);
    d.materials = items;
    d.modal = items.length ? String(total) : '';

    const input = document.getElementById('calc-modal');
    if (input) input.value = U.money(d.modal);

    U.closeModal();
    App.ui.materialsDraft = null;
    Views.calcUpdate();
    U.toast('Total modal bahan berhasil diterapkan.');
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

    if (U.toMoney(d.modal) <= 0) {
      U.toast('Modal bahan total wajib diisi lebih dari Rp 0.', 'error');
      const input = document.getElementById('calc-modal');
      if (input) input.focus();
      return;
    }

    const res = Calc.batch(d);
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

    const materials = normalizeMaterials(d.materials).map(function (item) {
      return { id: item.id, name: item.name, price: U.toMoney(item.price) };
    });

    const payload = {
      name: String(d.name).trim(),
      modal: res.modal,
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
