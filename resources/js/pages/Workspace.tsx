import '../../css/kelolain.css';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import InventoryDialog from '../components/InventoryDialog';
import ProfilePanel from '../components/ProfilePanel';
import {
    dateLabel,
    money,
    remainingLabel,
    riskLabel,
    type DialogState,
    type Food,
    type InventoryOptions,
    type Owner,
    type Waste,
} from '../workspace';

const navigation = [
    { name: 'Dashboard', url: '/dashboard', icon: '▦' },
    { name: 'Bahan Saya', url: '/bahan', icon: '▤' },
    { name: 'Waste Tracker', url: '/waste', icon: '♧' },
    { name: 'Risk Ranking', url: '/risk', icon: '↗' },
    { name: 'Profil', url: '/profil', icon: '◉' },
] as const;

export type WorkspaceProps = InventoryOptions & {
    tab: (typeof navigation)[number]['name'];
    foods: Food[];
    wastes: Waste[];
    owner: Owner;
    riskOrder: number[];
    emailEnabled: boolean;
};

export default function Workspace({
    tab,
    foods,
    wastes,
    owner,
    riskOrder,
    emailEnabled,
    ...options
}: WorkspaceProps) {
    const [dialog, setDialog] = useState<DialogState | null>(null);
    const [notice, setNotice] = useState('');
    const [deleting, setDeleting] = useState(false);
    const flash = usePage<{ flash?: { message?: string } }>().props.flash;
    const avatar = owner.name.slice(0, 1).toUpperCase();
    const firstName = owner.name.split(' ')[0];
    const urgent = foods.filter(
        (food) => food.daysLeft >= 0 && food.daysLeft <= 2,
    ).length;
    const expired = foods.filter((food) => food.daysLeft < 0).length;
    const totalLoss = wastes.reduce((sum, waste) => sum + waste.loss, 0);
    const byId = new Map(foods.map((food) => [food.id, food]));
    const ranked = riskOrder.flatMap((id) => {
        const food = byId.get(id);
        return food ? [food] : [];
    });

    useEffect(() => {
        if (flash?.message) setNotice(flash.message);
    }, [flash]);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(''), 3500);
        return () => window.clearTimeout(timer);
    }, [notice]);

    function addFood() {
        setDialog({ kind: 'add' });
    }

    const actions: FoodActions = {
        onUse: (food) => setDialog({ kind: 'use', food }),
        onWaste: (food) => setDialog({ kind: 'waste', food }),
        onEdit: (food) => setDialog({ kind: 'edit', food }),
        onDelete: (food) => {
            if (
                deleting ||
                !window.confirm(`Hapus ${food.name} dari inventaris?`)
            )
                return;
            router.delete(`/ingredients/${food.id}`, {
                preserveScroll: true,
                onStart: () => setDeleting(true),
                onFinish: () => setDeleting(false),
            });
        },
    };

    return (
        <div className="app-shell kelolain-ui">
            <Head title={tab} />
            <aside className="sidebar">
                <Link className="brand" href="/dashboard">
                    <span className="brand-mark">K</span>
                    <span>
                        KELOLAIN<small>SMART FOOD INVENTORY</small>
                    </span>
                </Link>
                <div className="side-label">MENU UTAMA</div>
                <nav aria-label="Menu utama">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            className={
                                tab === item.name
                                    ? 'nav-item active'
                                    : 'nav-item'
                            }
                            href={item.url}
                            aria-current={
                                tab === item.name ? 'page' : undefined
                            }
                            aria-label={item.name}
                        >
                            <span className="nav-icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            {item.name}
                            {item.name === 'Bahan Saya' && (
                                <span className="nav-count">
                                    {foods.length}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-bottom">
                    <div className="eco-card">
                        <div className="eco-icon">✳</div>
                        <b>
                            Selamatkan makanan,
                            <br />
                            hemat pengeluaran.
                        </b>
                        <p>
                            Kelola stokmu dengan lebih bijak bersama KELOLAIN.
                        </p>
                    </div>
                    <Link href="/profil" className="side-user">
                        <div className="avatar">{avatar}</div>
                        <div>
                            <b>{firstName}</b>
                            <small>
                                {owner.isGuest
                                    ? 'Pengguna Tamu'
                                    : 'Akun KELOLAIN'}
                            </small>
                        </div>
                        <span className="dots" aria-hidden="true">
                            •••
                        </span>
                    </Link>
                </div>
            </aside>
            <main className="main">
                <header className="topbar">
                    <Link href="/dashboard" className="mobile-brand">
                        🥬 KELOLAIN
                    </Link>
                    <div className="crumb">
                        Workspace <span>/</span> <b>{tab}</b>
                    </div>
                    <div className="top-actions">
                        <button
                            type="button"
                            className="icon-button"
                            aria-label="Notifikasi"
                            onClick={() =>
                                setNotice(
                                    urgent
                                        ? `${urgent} bahan mendekati batas masa simpan.`
                                        : 'Tidak ada pengingat baru.',
                                )
                            }
                        >
                            ♧{urgent > 0 && <i />}
                        </button>
                        <Link
                            href="/profil"
                            className="top-profile"
                            aria-label="Buka profil"
                        >
                            <div className="avatar">{avatar}</div>
                            <div>
                                <b>{firstName}</b>
                                <small>
                                    {owner.isGuest ? 'Tamu' : 'Akun KELOLAIN'}
                                </small>
                            </div>
                            <span aria-hidden="true">⌄</span>
                        </Link>
                    </div>
                </header>
                <div className="content">
                    {tab === 'Dashboard' && (
                        <Dashboard
                            foods={foods}
                            wastes={wastes}
                            ranked={ranked}
                            urgent={urgent}
                            expired={expired}
                            totalLoss={totalLoss}
                            firstName={firstName}
                            today={options.today}
                            addFood={addFood}
                            actions={actions}
                        />
                    )}
                    {tab === 'Bahan Saya' && (
                        <Inventory
                            foods={foods}
                            ranked={ranked}
                            urgent={urgent}
                            expired={expired}
                            categories={options.categories}
                            addFood={addFood}
                            actions={actions}
                        />
                    )}
                    {tab === 'Waste Tracker' && (
                        <WasteTracker
                            wastes={wastes}
                            foods={foods}
                            totalLoss={totalLoss}
                            today={options.today}
                        />
                    )}
                    {tab === 'Risk Ranking' && (
                        <RiskRanking foods={ranked} onUse={actions.onUse} />
                    )}
                    {tab === 'Profil' && (
                        <ProfilePanel
                            owner={owner}
                            emailEnabled={emailEnabled}
                        />
                    )}
                </div>
                <footer className="footer">
                    © {options.today.slice(0, 4)} KELOLAIN{' '}
                    <span>Smart Food Inventory &amp; Waste Management</span>
                </footer>
            </main>
            {dialog && (
                <InventoryDialog
                    {...options}
                    dialog={dialog}
                    onClose={() => setDialog(null)}
                />
            )}
            {notice && (
                <div className="toast" role="status">
                    {notice}
                </div>
            )}
        </div>
    );
}

type FoodActions = {
    onUse: (food: Food) => void;
    onWaste: (food: Food) => void;
    onEdit: (food: Food) => void;
    onDelete: (food: Food) => void;
};

type StockStats = { foods: Food[]; urgent: number; expired: number };
type InventoryProps = StockStats & {
    ranked: Food[];
    categories: string[];
    addFood: () => void;
    actions: FoodActions;
};
type DashboardProps = StockStats & {
    wastes: Waste[];
    ranked: Food[];
    totalLoss: number;
    firstName: string;
    today: string;
    addFood: () => void;
    actions: FoodActions;
};

function Dashboard({
    foods,
    wastes,
    ranked,
    urgent,
    expired,
    totalLoss,
    firstName,
    today,
    addFood,
    actions,
}: DashboardProps) {
    const safe = foods.length - urgent - expired;
    const safePercent = foods.length ? (100 * safe) / foods.length : 0;
    const urgentEnd = foods.length ? (100 * (safe + urgent)) / foods.length : 0;
    const donut = foods.length
        ? `conic-gradient(#15966b 0 ${safePercent}%, #f3a34b ${safePercent}% ${urgentEnd}%, #ed6b72 ${urgentEnd}% 100%)`
        : '#edf4ef';

    return (
        <>
            <PageHeading
                eyebrow="RINGKASAN DAPUR"
                title="Dashboard Manajemen Bahan"
                description={`Halo, ${firstName}. Berikut ringkasan pengelolaan bahan makananmu.`}
            >
                <button className="primary" onClick={addFood}>
                    ＋ Tambah Bahan
                </button>
            </PageHeading>
            <div className="stats-grid">
                <Stat
                    title="Total Bahan"
                    value={foods.length}
                    sub="Jenis bahan tersimpan"
                    icon="▤"
                    tone="green"
                />
                <Stat
                    title="Mendekati Kedaluwarsa"
                    value={urgent}
                    sub="Perlu segera diperiksa"
                    icon="⚠"
                    tone="orange"
                />
                <Stat
                    title="Lewat Estimasi"
                    value={expired}
                    sub="Periksa kondisi bahan"
                    icon="♜"
                    tone="red"
                />
                <Stat
                    title="Total Kerugian"
                    value={money(totalLoss)}
                    sub="Dari bahan terbuang"
                    icon="◎"
                    tone="purple"
                />
            </div>
            <div className="dashboard-grid">
                <section className="panel priority-panel">
                    <PanelHeading
                        title="Prioritas Penggunaan"
                        description="Bahan yang perlu diperiksa lebih dulu"
                    >
                        <Link className="text-link" href="/risk">
                            Lihat Risk Ranking →
                        </Link>
                    </PanelHeading>
                    {ranked.slice(0, 4).map((food) => (
                        <div className="priority-row" key={food.id}>
                            <span className="food-emoji" aria-hidden="true">
                                {food.icon}
                            </span>
                            <div className="priority-info">
                                <b>{food.name}</b>
                                <small>
                                    {food.qty} {food.unit} · {food.storage}
                                </small>
                            </div>
                            <div className="priority-risk">
                                <b>{remainingLabel(food.daysLeft)}</b>
                                <small>{money(food.price)}</small>
                            </div>
                            <RiskPill food={food} />
                        </div>
                    ))}
                    {!ranked.length && (
                        <Empty text="Belum ada bahan. Tambahkan bahan pertamamu." />
                    )}
                </section>
                <section className="panel chart-panel">
                    <PanelHeading
                        title="Ringkasan Masa Simpan"
                        description="Status bahan di inventarismu"
                    >
                        <span className="soft-tag">Saat ini</span>
                    </PanelHeading>
                    <div className="donut-wrap">
                        <div className="donut" style={{ background: donut }}>
                            <div>
                                <b>{foods.length}</b>
                                <small>Total bahan</small>
                            </div>
                        </div>
                        <div className="legend">
                            <div>
                                <i className="dot green-dot" />
                                Lebih dari 2 hari <b>{safe}</b>
                            </div>
                            <div>
                                <i className="dot orange-dot" />
                                Mendekati <b>{urgent}</b>
                            </div>
                            <div>
                                <i className="dot red-dot" />
                                Lewat estimasi <b>{expired}</b>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="panel chart-panel trend-panel">
                    <PanelHeading
                        title="Aktivitas Bahan Terbuang"
                        description="Rekap kerugian 6 bulan terakhir"
                    >
                        <span className="soft-tag">6 bulan</span>
                    </PanelHeading>
                    <BarChart wastes={wastes} today={today} />
                </section>
                <section className="panel waste-highlight">
                    <div className="highlight-top">
                        <span className="highlight-icon">♧</span>
                        <span className="soft-tag">WASTE TRACKER</span>
                    </div>
                    <p>Total estimasi kerugian</p>
                    <h2>{money(totalLoss)}</h2>
                    <div className="highlight-foot">
                        <span>{wastes.length} catatan pembuangan</span>
                        <Link className="text-link" href="/waste">
                            Lihat analisis →
                        </Link>
                    </div>
                </section>
            </div>
            <section className="panel table-panel">
                <PanelHeading
                    title="Bahan Terbaru"
                    description="Pantau stok dan estimasi masa simpan bahan makananmu"
                >
                    <Link className="text-link" href="/bahan">
                        Lihat semua →
                    </Link>
                </PanelHeading>
                <FoodTable foods={foods.slice(0, 5)} {...actions} />
            </section>
        </>
    );
}

function Inventory({
    foods,
    ranked,
    urgent,
    expired,
    categories,
    addFood,
    actions,
}: InventoryProps) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('Semua');
    const [sortRisk, setSortRisk] = useState(false);
    const filtered = (sortRisk ? ranked : foods).filter(
        (food) =>
            (category === 'Semua' || food.category === category) &&
            food.name.toLowerCase().includes(query.trim().toLowerCase()),
    );

    return (
        <>
            <PageHeading
                eyebrow="INVENTORY MANAGEMENT"
                title="Inventaris Bahan"
                description="Kelola stok dan pantau masa simpan bahan makananmu."
            >
                <button className="primary" onClick={addFood}>
                    ＋ Tambah Bahan
                </button>
            </PageHeading>
            <div className="stats-grid compact-stats">
                <Stat
                    title="Bahan Tersedia"
                    value={foods.length}
                    sub="Jenis bahan"
                    icon="▤"
                    tone="green"
                />
                <Stat
                    title="Mendekati Kedaluwarsa"
                    value={urgent}
                    sub="≤ 2 hari"
                    icon="⚠"
                    tone="orange"
                />
                <Stat
                    title="Harus Diperiksa"
                    value={expired}
                    sub="Melewati estimasi"
                    icon="♜"
                    tone="red"
                />
            </div>
            <section className="panel inventory-panel">
                <div className="toolbar">
                    <div className="searchbox">
                        <span aria-hidden="true">⌕</span>
                        <input
                            aria-label="Cari bahan makanan"
                            placeholder="Cari bahan makanan..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    <button
                        className={
                            sortRisk ? 'filter-btn selected' : 'filter-btn'
                        }
                        aria-pressed={sortRisk}
                        onClick={() => setSortRisk(!sortRisk)}
                    >
                        ↕ Urutkan berdasarkan risiko
                    </button>
                </div>
                <div className="filter-row">
                    <span>Kategori</span>
                    {['Semua', ...categories].map((item) => (
                        <button
                            key={item}
                            className={
                                category === item ? 'chip selected' : 'chip'
                            }
                            aria-pressed={category === item}
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <FoodTable foods={filtered} {...actions} />
                <div className="table-footer">
                    Menampilkan {filtered.length} dari {foods.length} bahan
                </div>
            </section>
        </>
    );
}

function WasteTracker({
    foods,
    wastes,
    totalLoss,
    today,
}: {
    foods: Food[];
    wastes: Waste[];
    totalLoss: number;
    today: string;
}) {
    const categories = new Map<string, number>();
    for (const waste of wastes) {
        categories.set(
            waste.category,
            (categories.get(waste.category) ?? 0) + waste.loss,
        );
    }
    const ranked = [...categories.entries()].sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...ranked.map(([, loss]) => loss));
    const month = today.slice(0, 7);
    const dailyLoss = wastes
        .filter((waste) => waste.date === today)
        .reduce((sum, waste) => sum + waste.loss, 0);
    const monthLoss = wastes
        .filter((waste) => waste.date.startsWith(month))
        .reduce((sum, waste) => sum + waste.loss, 0);

    return (
        <>
            <PageHeading
                eyebrow="FOOD WASTE ANALYTICS"
                title="Analisis Bahan Terbuang"
                description="Pantau bahan terbuang dan taksir nilai kerugiannya."
            >
                <span className="soft-tag">Semua periode</span>
            </PageHeading>
            <div className="stats-grid">
                <Stat
                    title="Total Kerugian"
                    value={money(totalLoss)}
                    sub={`${wastes.length} catatan pembuangan`}
                    icon="♜"
                    tone="red"
                />
                <Stat
                    title="Kerugian Hari Ini"
                    value={money(dailyLoss)}
                    sub={dateLabel(today)}
                    icon="▤"
                    tone="orange"
                />
                <Stat
                    title="Kerugian Bulan Ini"
                    value={money(monthLoss)}
                    sub="Berdasarkan tanggal pembuangan"
                    icon="↗"
                    tone="purple"
                />
                <Stat
                    title="Potensi Penghematan"
                    value={money(
                        foods.reduce((sum, food) => sum + food.price, 0),
                    )}
                    sub="Nilai stok yang masih tersimpan"
                    icon="◎"
                    tone="green"
                />
            </div>
            <div className="dashboard-grid waste-grid">
                <section className="panel">
                    <PanelHeading
                        title="Kerugian per Kategori"
                        description="Distribusi nilai bahan terbuang"
                    />
                    <div className="category-bars">
                        {ranked.map(([category, loss]) => (
                            <div className="category-bar" key={category}>
                                <div>
                                    <b>{category}</b>
                                    <strong>{money(loss)}</strong>
                                </div>
                                <i aria-hidden="true">
                                    <span
                                        style={{
                                            width: `${(100 * loss) / max}%`,
                                        }}
                                    />
                                </i>
                            </div>
                        ))}
                    </div>
                    {!ranked.length && (
                        <Empty text="Belum ada data kategori." />
                    )}
                </section>
                <section className="panel">
                    <PanelHeading
                        title="Ringkasan Kerugian"
                        description="Kategori dengan kerugian terbesar"
                    />
                    {ranked.slice(0, 5).map(([category, loss], index) => (
                        <div className="loss-row" key={category}>
                            <span className="rank">{index + 1}</span>
                            <b>{category}</b>
                            <div className="loss-track" aria-hidden="true">
                                <i
                                    style={{
                                        width: `${totalLoss ? (100 * loss) / totalLoss : 0}%`,
                                    }}
                                />
                            </div>
                            <strong>{money(loss)}</strong>
                        </div>
                    ))}
                    {!wastes.length && (
                        <Empty text="Belum ada catatan bahan terbuang." />
                    )}
                </section>
            </div>
            <section className="panel table-panel">
                <PanelHeading
                    title="Riwayat Bahan Terbuang"
                    description="Catatan pembuangan dan estimasi kerugian finansial"
                />
                <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Nama Bahan</th>
                                <th>Kategori</th>
                                <th>Tanggal Dibuang</th>
                                <th>Jumlah</th>
                                <th>Alasan</th>
                                <th>Kerugian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wastes.map((waste) => (
                                <tr key={waste.id}>
                                    <td>
                                        <b>{waste.name}</b>
                                    </td>
                                    <td>{waste.category}</td>
                                    <td>{dateLabel(waste.date)}</td>
                                    <td>
                                        {waste.qty} {waste.unit}
                                    </td>
                                    <td>
                                        <span className="pill danger">
                                            {waste.reason}
                                        </span>
                                    </td>
                                    <td className="loss-value">
                                        {money(waste.loss)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!wastes.length && (
                    <Empty text="Belum ada bahan yang dicatat terbuang." />
                )}
            </section>
        </>
    );
}

function RiskRanking({
    foods,
    onUse,
}: {
    foods: Food[];
    onUse: FoodActions['onUse'];
}) {
    return (
        <>
            <PageHeading
                eyebrow="SMART PRIORITIZATION"
                title="Risk Ranking Panel"
                description="Prioritas penggunaan berdasarkan sisa masa simpan dan nilai ekonominya."
            >
                <span className="soft-tag">Diurutkan otomatis</span>
            </PageHeading>
            <section className="panel risk-intro">
                <div className="risk-badge" aria-hidden="true">
                    ↗
                </div>
                <div>
                    <h3>Periksa bahan dengan risiko tertinggi lebih dulu</h3>
                    <p>
                        Peringkat mempertimbangkan sisa estimasi masa simpan dan
                        nilai stok yang masih tersimpan.
                    </p>
                </div>
            </section>
            <section className="panel table-panel">
                <PanelHeading
                    title="Daftar Prioritas Bahan"
                    description={`${foods.length} bahan diurutkan dari risiko tertinggi`}
                />
                {foods.map((food, index) => (
                    <div className="risk-item" key={food.id}>
                        <div className="risk-number">
                            {String(index + 1).padStart(2, '0')}
                        </div>
                        <span className="food-emoji big" aria-hidden="true">
                            {food.icon}
                        </span>
                        <div className="risk-name">
                            <b>{food.name}</b>
                            <small>
                                {food.qty} {food.unit} · {food.storage} · Dibeli{' '}
                                {dateLabel(food.buyDate)}
                            </small>
                        </div>
                        <div className="risk-days">
                            <b>{remainingLabel(food.daysLeft)}</b>
                            <small>Estimasi sisa masa simpan</small>
                        </div>
                        <div className="risk-price">
                            <b>{money(food.price)}</b>
                            <small>Nilai stok</small>
                        </div>
                        <RiskPill food={food} />
                        <button
                            className="small outline"
                            onClick={() => onUse(food)}
                        >
                            Gunakan
                        </button>
                    </div>
                ))}
                {!foods.length && (
                    <Empty text="Tambahkan bahan untuk melihat prioritas penggunaan." />
                )}
            </section>
        </>
    );
}

function FoodTable({
    foods,
    onUse,
    onWaste,
    onEdit,
    onDelete,
}: { foods: Food[] } & FoodActions) {
    return (
        <div className="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Nama Bahan</th>
                        <th>Tanggal Beli</th>
                        <th>Estimasi Kedaluwarsa</th>
                        <th>Nilai Stok</th>
                        <th>Lokasi</th>
                        <th>Risk Score</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {foods.map((food) => {
                        const tone =
                            food.daysLeft < 0
                                ? 'danger'
                                : food.daysLeft <= 2
                                  ? 'warning'
                                  : 'safe';
                        return (
                            <tr key={food.id}>
                                <td>
                                    <div className="food-cell">
                                        <span
                                            className="food-emoji"
                                            aria-hidden="true"
                                        >
                                            {food.icon}
                                        </span>
                                        <div>
                                            <b>{food.name}</b>
                                            <small>
                                                {food.category} · {food.qty}{' '}
                                                {food.unit}
                                            </small>
                                        </div>
                                    </div>
                                </td>
                                <td>{dateLabel(food.buyDate)}</td>
                                <td>
                                    <span
                                        className={`pill ${tone}`}
                                        title={dateLabel(food.expiryDate)}
                                    >
                                        {remainingLabel(food.daysLeft)}
                                    </span>
                                </td>
                                <td>{money(food.price)}</td>
                                <td>{food.storage}</td>
                                <td>
                                    <div
                                        className={`risk-score risk-${food.urgency}`}
                                    >
                                        <i aria-hidden="true">
                                            <span />
                                        </i>
                                        <small>
                                            {money(food.riskScore)}/hari
                                        </small>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="small outline"
                                            onClick={() => onUse(food)}
                                        >
                                            Gunakan
                                        </button>
                                        <button
                                            className="more"
                                            title="Catat terbuang"
                                            aria-label={`Catat ${food.name} terbuang`}
                                            onClick={() => onWaste(food)}
                                        >
                                            ♜
                                        </button>
                                        <button
                                            className="more"
                                            title="Edit"
                                            aria-label={`Edit ${food.name}`}
                                            onClick={() => onEdit(food)}
                                        >
                                            ✎
                                        </button>
                                        <button
                                            className="more"
                                            title="Hapus"
                                            aria-label={`Hapus ${food.name}`}
                                            onClick={() => onDelete(food)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {!foods.length && (
                <Empty text="Tidak ada bahan untuk ditampilkan." />
            )}
        </div>
    );
}

function BarChart({ wastes, today }: { wastes: Waste[]; today: string }) {
    const [year, month] = today.split('-').map(Number);
    const monthFormatter = new Intl.DateTimeFormat('id-ID', {
        month: 'short',
        timeZone: 'UTC',
    });
    const lossByMonth = new Map<string, number>();
    for (const waste of wastes) {
        const key = waste.date.slice(0, 7);
        lossByMonth.set(key, (lossByMonth.get(key) ?? 0) + waste.loss);
    }
    const months = Array.from({ length: 6 }, (_, index) => {
        const monthDate = new Date(Date.UTC(year, month - 6 + index, 1));
        const key = monthDate.toISOString().slice(0, 7);
        return {
            key,
            label: monthFormatter.format(monthDate),
            loss: lossByMonth.get(key) ?? 0,
        };
    });
    const max = Math.max(1, ...months.map((item) => item.loss));
    const compact = new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        maximumFractionDigits: 1,
    });

    return (
        <div className="bar-chart">
            {months.map((item) => (
                <div
                    className="bar-col"
                    key={item.key}
                    title={`${item.label} · ${money(item.loss)}`}
                >
                    <div className="bar-value">
                        {item.loss ? compact.format(item.loss) : ''}
                    </div>
                    <div className="bar-track">
                        <i
                            style={{
                                height: `${item.loss ? Math.max(4, (100 * item.loss) / max) : 0}%`,
                            }}
                        />
                    </div>
                    <small>{item.label}</small>
                </div>
            ))}
        </div>
    );
}

function RiskPill({ food }: { food: Food }) {
    const { label, tone } = riskLabel(food.urgency);
    return <span className={`pill ${tone}`}>{label}</span>;
}

function PageHeading({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <div className="page-heading">
            <div>
                <div className="eyebrow">{eyebrow}</div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {children}
        </div>
    );
}

function PanelHeading({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children?: ReactNode;
}) {
    return (
        <div className="panel-head">
            <div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            {children}
        </div>
    );
}

function Stat({
    title,
    value,
    sub,
    icon,
    tone,
}: {
    title: string;
    value: string | number;
    sub: string;
    icon: string;
    tone: string;
}) {
    return (
        <div className={`stat-card ${tone}`}>
            <div className="stat-top">
                <span>{title}</span>
                <i aria-hidden="true">{icon}</i>
            </div>
            <strong>{value}</strong>
            <small>{sub}</small>
        </div>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <div className="empty">
            <span aria-hidden="true">🥬</span>
            <p>{text}</p>
        </div>
    );
}
