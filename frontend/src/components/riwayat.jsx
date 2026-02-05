import "./riwayat.css";

function RiwayatPesanan() {
  const orders = [];

  return (
    <div className="riwayat-container">
      <div className="riwayat-header">
        <h2>Riwayat Pesanan</h2>
        <button className="btn-close">Tutup</button>
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>Belum ada pesanan</h3>
          <p>Riwayat pesanan Anda akan muncul di sini</p>
        </div>
      )}
    </div>
  );
}

export default RiwayatPesanan;
