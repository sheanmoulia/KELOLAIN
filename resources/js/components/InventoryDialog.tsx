import { useForm } from '@inertiajs/react';
import { useEffect, useRef, type FormEvent } from 'react';
import {
    dateLabel,
    estimateExpiry,
    money,
    type DialogState,
    type InventoryOptions,
} from '../workspace';

type Props = InventoryOptions & { dialog: DialogState; onClose: () => void };

const heading = {
    add: 'Tambah Bahan Baru',
    edit: 'Ubah Data Bahan',
    use: 'Gunakan bahan',
    waste: 'Catat bahan terbuang',
};

export default function InventoryDialog({
    dialog,
    onClose,
    today,
    shelf,
    categories,
    storageOptions,
    units,
    reasons,
}: Props) {
    const title = heading[dialog.kind];
    const food = 'food' in dialog ? dialog.food : undefined;
    const editing = dialog.kind === 'edit';
    const inventoryForm = editing || dialog.kind === 'add';
    const wasting = dialog.kind === 'waste';
    const clip = useRef<HTMLDialogElement>(null);
    const form = useForm({
        name: food?.name ?? '',
        category: food?.category ?? categories[0],
        qty: String(food?.qty ?? 1),
        unit: food?.unit ?? units[0],
        price: food ? String(food.price) : '',
        buyDate: food?.buyDate ?? today,
        storage: food?.storage ?? storageOptions[1],
        reason: reasons[0],
        date: today,
        version: food?.version ?? 0,
    });

    const categoryOptions = [
        ...new Set([...(food ? [food.category] : []), ...categories]),
    ];
    const unitOptions = [...new Set([...units, ...(food ? [food.unit] : [])])];
    const shelfDays =
        shelf[form.data.name.trim()]?.[form.data.storage] ??
        shelf[form.data.category]?.[form.data.storage] ??
        5;

    const errors = [...new Set(Object.values(form.errors))];
    const quantity = Number(form.data.qty);

    useEffect(() => {
        clip.current?.showModal();
    }, []);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onClose() };
        if (dialog.kind === 'add') {
            form.post('/ingredients', options);
        } else if (dialog.kind === 'edit') {
            form.patch(`/ingredients/${dialog.food.id}`, options);
        } else {
            const action = wasting ? 'buang' : 'gunakan';
            form.post(`/ingredients/${dialog.food.id}/${action}`, options);
        }
    }

    return (
        <dialog
            ref={clip}
            className="modal inventory-dialog"
            aria-labelledby="dialog-heading"
            onCancel={(event) => {
                event.preventDefault();
                if (!form.processing) onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget && !form.processing)
                    onClose();
            }}
        >
            <form onSubmit={submit}>
                <div className="modal-head">
                    <div>
                        <div className="eyebrow">INVENTORY MANAGEMENT</div>
                        <h2 id="dialog-heading">{title}</h2>
                    </div>
                    <button
                        className="close"
                        type="button"
                        aria-label="Tutup"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                {inventoryForm ? (
                    <>
                        <div className="form-grid">
                            <label className="full">
                                Nama Bahan
                                <input
                                    required
                                    maxLength={120}
                                    value={form.data.name}
                                    placeholder="Contoh: Daging ayam"
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                            </label>
                            <label>
                                Kategori
                                <select
                                    value={form.data.category}
                                    onChange={(event) =>
                                        form.setData(
                                            'category',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {categoryOptions.map((category) => (
                                        <option key={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Jumlah
                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    max="99999999.99"
                                    step="0.01"
                                    value={form.data.qty}
                                    onChange={(event) =>
                                        form.setData('qty', event.target.value)
                                    }
                                />
                            </label>
                            <label>
                                Satuan
                                <select
                                    value={form.data.unit}
                                    onChange={(event) =>
                                        form.setData('unit', event.target.value)
                                    }
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit}>{unit}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                {editing
                                    ? 'Nilai Stok (Rp)'
                                    : 'Harga Pembelian (Rp)'}
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max="9999999999.99"
                                    step="0.01"
                                    placeholder="0"
                                    value={form.data.price}
                                    onChange={(event) =>
                                        form.setData(
                                            'price',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label>
                                Tanggal Pembelian
                                <input
                                    required
                                    type="date"
                                    max={today}
                                    value={form.data.buyDate}
                                    onChange={(event) =>
                                        form.setData(
                                            'buyDate',
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>
                            <label>
                                Lokasi Penyimpanan
                                <select
                                    value={form.data.storage}
                                    onChange={(event) =>
                                        form.setData(
                                            'storage',
                                            event.target.value,
                                        )
                                    }
                                >
                                    {storageOptions.map((storage) => (
                                        <option key={storage}>{storage}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {shelfDays && form.data.buyDate && (
                            <div className="estimate-note">
                                ✳ Estimasi masa simpan <b>{shelfDays} hari</b> ·
                                Perkiraan kedaluwarsa{' '}
                                <b>
                                    {dateLabel(
                                        estimateExpiry(
                                            form.data.buyDate,
                                            shelfDays,
                                        ),
                                    )}
                                </b>
                            </div>
                        )}
                    </>
                ) : (
                    food && (
                        <>
                            <div className="action-food">
                                <span
                                    className="food-emoji big"
                                    aria-hidden="true"
                                >
                                    {food.icon}
                                </span>
                                <div>
                                    <b>{food.name}</b>
                                    <small>
                                        Stok tersedia {food.qty} {food.unit}
                                    </small>
                                </div>
                            </div>
                            <label className="field-label">
                                Berapa jumlah yang{' '}
                                {wasting ? 'dibuang' : 'digunakan'}?
                                <div className="quantity-input">
                                    <input
                                        required
                                        type="number"
                                        min="0.01"
                                        max={food.qty}
                                        step="0.01"
                                        value={form.data.qty}
                                        onChange={(event) =>
                                            form.setData(
                                                'qty',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <span>{food.unit}</span>
                                </div>
                            </label>
                            {wasting && (
                                <>
                                    <label className="field-label">
                                        Tanggal pembuangan
                                        <input
                                            required
                                            type="date"
                                            min={food.buyDate}
                                            max={today}
                                            value={form.data.date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'date',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                    <label className="field-label">
                                        Alasan pembuangan
                                        <select
                                            value={form.data.reason}
                                            onChange={(event) =>
                                                form.setData(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {reasons.map((reason) => (
                                                <option key={reason}>
                                                    {reason}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}
                            <div className="estimate-note">
                                {wasting
                                    ? 'Estimasi kerugian'
                                    : 'Sisa stok setelah digunakan'}{' '}
                                <b>
                                    {wasting
                                        ? money(
                                              (food.price *
                                                  Math.max(
                                                      0,
                                                      Math.min(
                                                          food.qty,
                                                          quantity,
                                                      ),
                                                  )) /
                                                  food.qty,
                                          )
                                        : `${Math.max(0, food.qty - quantity).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${food.unit}`}
                                </b>
                            </div>
                        </>
                    )
                )}
                {errors.length > 0 && (
                    <ul className="form-errors" role="alert">
                        {errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}
                <button
                    className={
                        wasting ? 'danger-btn full-btn' : 'primary full-btn'
                    }
                    type="submit"
                    disabled={form.processing}
                >
                    {inventoryForm
                        ? editing
                            ? 'Simpan Perubahan'
                            : 'Simpan Bahan'
                        : wasting
                          ? 'Catat Pembuangan'
                          : 'Konfirmasi Penggunaan'}
                </button>
            </form>
        </dialog>
    );
}
