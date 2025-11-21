// Extracted JS from original file (app.js)
// Config and SDK Setup
const defaultConfig = {
  judul_utama: "Finance Class",
  subjudul: "Laporan Keuangan",
  nama_sekolah: "SMA Negeri Mojoagung",
  nama_kelas: "XI-3",
  wali_kelas: "Fajar Indra Kurniawan M.Kom",
  label_tanggal: "Tanggal",
  label_kategori: "Kategori",
  label_deskripsi: "Deskripsi",
  label_jumlah: "Jumlah",
  tombol_tambah: "Tambah Transaksi"
};

let allTransactions = [];
let chartInstance = null;

// Toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="text-2xl">${type === 'success' ? '✅' : '⚠️'}</span>
      <span class="text-gray-800 font-medium">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Format currency
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

// Update summary
function updateSummary(transactions) {
  const pemasukan = transactions
    .filter(t => t.tipe === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const pengeluaran = transactions
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const saldo = pemasukan - pengeluaran;

  document.getElementById('total-pemasukan').textContent = formatRupiah(pemasukan);
  document.getElementById('total-pengeluaran').textContent = formatRupiah(pengeluaran);
  document.getElementById('saldo').textContent = formatRupiah(saldo);
}

// Update chart
function updateChart(transactions) {
  const ctx = document.getElementById('chart-keuangan');

  const pemasukan = transactions
    .filter(t => t.tipe === 'pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const pengeluaran = transactions
    .filter(t => t.tipe === 'pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [{
        data: [pemasukan, pengeluaran],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(255, 255, 255, 0.8)',
          'rgba(255, 255, 255, 0.8)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'white',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 15
          }
        }
      }
    }
  });
}

// Render transaction list
function renderTransactions(transactions) {
  const container = document.getElementById('list-transaksi');

  if (transactions.length === 0) {
    container.innerHTML = '<p class="text-white text-center opacity-70 py-8">Belum ada transaksi. Mulai tambahkan transaksi pertama Anda!</p>';
    return;
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  container.innerHTML = sorted.map(t => `
    <div class="bg-white bg-opacity-10 rounded-xl p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition" data-id="${t.__backendId}">
      <div class="flex justify-between items-start mb-2">
        <div class="flex-1">
          <div class="flex items-center space-x-2 mb-1">
            <span class="text-2xl">${t.tipe === 'pemasukan' ? '💰' : '💸'}</span>
            <h4 class="text-white font-semibold text-lg">${t.deskripsi}</h4>
          </div>
          <p class="text-white opacity-70 text-sm">${t.kategori}</p>
          <p class="text-white opacity-60 text-xs mt-1">${new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="text-right">
          <p class="text-white font-bold text-xl ${t.tipe === 'pemasukan' ? 'text-green-300' : 'text-red-300'}">${formatRupiah(t.jumlah)}</p>
          <button onclick="deleteTransaction('${t.__backendId}')" class="mt-2 text-white opacity-60 hover:opacity-100 text-sm transition">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Delete transaction
async function deleteTransaction(backendId) {
  const transaction = allTransactions.find(t => t.__backendId === backendId);
  if (!transaction) return;

  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  const result = await window.dataSdk.delete(transaction);

  if (result.isOk) {
    showToast('Transaksi berhasil dihapus', 'success');
  } else {
    showToast('Gagal menghapus transaksi', 'error');
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Form submission
document.getElementById('form-transaksi').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (allTransactions.length >= 999) {
    showToast('Maksimal 999 transaksi tercapai. Hapus beberapa transaksi terlebih dahulu.', 'error');
    return;
  }

  const btn = document.getElementById('btn-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner"></span> <span>Menyimpan...</span>';
  btn.disabled = true;

  const formData = {
    id: Date.now().toString(),
    tanggal: document.getElementById('tanggal').value,
    tipe: document.getElementById('tipe').value,
    kategori: document.getElementById('kategori').value,
    deskripsi: document.getElementById('deskripsi').value,
    jumlah: parseFloat(document.getElementById('jumlah').value),
    createdAt: new Date().toISOString()
  };

  const result = await window.dataSdk.create(formData);

  if (result.isOk) {
    showToast('Transaksi berhasil ditambahkan!', 'success');
    e.target.reset();
    document.getElementById('tanggal').valueAsDate = new Date();
  } else {
    showToast('Gagal menambahkan transaksi', 'error');
  }

  btn.innerHTML = originalText;
  btn.disabled = false;
});

// Data handler
const dataHandler = {
  onDataChanged(data) {
    allTransactions = data;
    updateSummary(data);
    updateChart(data);
    renderTransactions(data);
  }
};

// Element SDK
async function onConfigChange(config) {
  document.getElementById('judul-utama').textContent = config.judul_utama || defaultConfig.judul_utama;
  document.getElementById('subjudul').textContent = config.subjudul || defaultConfig.subjudul;
  document.getElementById('nama-sekolah').textContent = config.nama_sekolah || defaultConfig.nama_sekolah;
  document.getElementById('nama-kelas').textContent = config.nama_kelas || defaultConfig.nama_kelas;
  document.getElementById('wali-kelas').textContent = config.wali_kelas || defaultConfig.wali_kelas;
  document.getElementById('label-tanggal').textContent = config.label_tanggal || defaultConfig.label_tanggal;
  document.getElementById('label-kategori').textContent = config.label_kategori || defaultConfig.label_kategori;
  document.getElementById('label-deskripsi').textContent = config.label_deskripsi || defaultConfig.label_deskripsi;
  document.getElementById('label-jumlah').textContent = config.label_jumlah || defaultConfig.label_jumlah;
  document.getElementById('tombol-tambah').textContent = config.tombol_tambah || defaultConfig.tombol_tambah;
}

// Initialize
(async () => {
  // Set default date
  document.getElementById('tanggal').valueAsDate = new Date();

  // Initialize Data SDK
  if (window.dataSdk) {
    const initResult = await window.dataSdk.init(dataHandler);
    if (!initResult.isOk) {
      console.error('Failed to initialize Data SDK');
    }
  }

  // Initialize Element SDK
  if (window.elementSdk) {
    await window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities: (config) => ({
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      }),
      mapToEditPanelValues: (config) => new Map([
        ["judul_utama", config.judul_utama || defaultConfig.judul_utama],
        ["subjudul", config.subjudul || defaultConfig.subjudul],
        ["nama_sekolah", config.nama_sekolah || defaultConfig.nama_sekolah],
        ["nama_kelas", config.nama_kelas || defaultConfig.nama_kelas],
        ["wali_kelas", config.wali_kelas || defaultConfig.wali_kelas],
        ["label_tanggal", config.label_tanggal || defaultConfig.label_tanggal],
        ["label_kategori", config.label_kategori || defaultConfig.label_kategori],
        ["label_deskripsi", config.label_deskripsi || defaultConfig.label_deskripsi],
        ["label_jumlah", config.label_jumlah || defaultConfig.label_jumlah],
        ["tombol_tambah", config.tombol_tambah || defaultConfig.tombol_tambah]
      ])
    });
  }
})();
