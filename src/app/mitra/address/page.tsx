"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
	ChevronLeft,
	MapPin,
	Plus,
	Save,
	Edit3,
	Crosshair,
	Phone,
	Home,
	Loader2,
	Trash2,
	Star,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import {
	Field,
	SelectInput,
	useSelectState,
	inputClass,
} from "@/components/mitra/FormFields";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/mitra/LeafletMap"), {
	ssr: false,
	loading: () => (
		<div className="flex aspect-[4/3] items-center justify-center rounded-sm border border-zinc-200 bg-zinc-50">
			<Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
		</div>
	),
});

interface AddressItem {
	id: string;
	label: string;
	recipient: string;
	phone: string;
	street: string;
	province: string;
	city: string;
	district: string;
	village: string | null;
	postalCode: string;
	lat: number | null;
	lng: number | null;
	notes: string | null;
	isPrimary: boolean;
}

interface AddressForm {
	label: string;
	recipient: string;
	phone: string;
	street: string;
	province: string;
	city: string;
	district: string;
	village: string;
	postalCode: string;
	notes: string;
	lat: number;
	lng: number;
}

interface RegionItem {
	id: string;
	name: string;
}

const EMPTY_FORM: AddressForm = {
	label: "Toko Utama",
	recipient: "",
	phone: "",
	street: "",
	province: "",
	city: "",
	district: "",
	village: "",
	postalCode: "",
	notes: "",
	lat: -6.2,
	lng: 106.8,
};

export default function MitraAddressPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [addresses, setAddresses] = useState<AddressItem[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null); // null = not editing, "new" = creating
	const [form, setForm] = useState<AddressForm>(EMPTY_FORM);

	const [provinces, setProvinces] = useState<RegionItem[]>([]);
	const [cities, setCities] = useState<RegionItem[]>([]);
	const [districts, setDistricts] = useState<RegionItem[]>([]);
	const [villages, setVillages] = useState<RegionItem[]>([]);

	const [loadingCities, setLoadingCities] = useState(false);
	const [loadingDistricts, setLoadingDistricts] = useState(false);
	const [loadingVillages, setLoadingVillages] = useState(false);

	const provinceSelect = useSelectState(false);
	const citySelect = useSelectState(false);
	const districtSelect = useSelectState(false);
	const villageSelect = useSelectState(false);

	const loadAddresses = useCallback(async () => {
		try {
			const data = await api.get("/mitra/addresses");
			setAddresses(data || []);
		} catch {
			// might be empty
		}
	}, []);

	// Fetch provinces and addresses on mount
	useEffect(() => {
		async function init() {
			try {
				const [provincesData] = await Promise.all([
					api.get("/regions/provinces"),
					loadAddresses(),
				]);
				setProvinces(provincesData || []);
			} catch (e) {
				console.error("Failed to load data", e);
			} finally {
				setLoading(false);
			}
		}
		init();
	}, [loadAddresses]);

	// ── Cascading dropdowns ──
	useEffect(() => {
		if (!form.province) {
			setCities([]);
			setDistricts([]);
			setVillages([]);
			return;
		}
		const province = provinces.find(
			(p) => p.id === form.province || p.name === form.province,
		);
		if (!province) return;
		setLoadingCities(true);
		api
			.get(`/regions/provinces/${province.id}/cities`)
			.then((data) => setCities(data || []))
			.catch(() => toast.error("Gagal memuat kota"))
			.finally(() => setLoadingCities(false));
	}, [form.province]);

	useEffect(() => {
		if (!form.city) {
			setDistricts([]);
			setVillages([]);
			return;
		}
		const city = cities.find((c) => c.id === form.city || c.name === form.city);
		if (!city) return;
		setLoadingDistricts(true);
		api
			.get(`/regions/cities/${city.id}/districts`)
			.then((data) => setDistricts(data || []))
			.catch(() => toast.error("Gagal memuat kecamatan"))
			.finally(() => setLoadingDistricts(false));
	}, [form.city]);

	useEffect(() => {
		if (!form.district) {
			setVillages([]);
			return;
		}
		const district = districts.find(
			(d) => d.id === form.district || d.name === form.district,
		);
		if (!district) return;
		setLoadingVillages(true);
		api
			.get(`/regions/districts/${district.id}/villages`)
			.then((data) => setVillages(data || []))
			.catch(() => toast.error("Gagal memuat desa"))
			.finally(() => setLoadingVillages(false));
	}, [form.district]);

	const update = (field: keyof AddressForm, value: any) => {
		setForm((f) => {
			const next = { ...f, [field]: value };
			if (field === "province") {
				next.city = "";
				next.district = "";
				next.village = "";
			}
			if (field === "city") {
				next.district = "";
				next.village = "";
			}
			if (field === "district") next.village = "";
			return next;
		});
	};

	const startEdit = (address?: AddressItem) => {
		if (address) {
			setForm({
				label: address.label,
				recipient: address.recipient,
				phone: address.phone,
				street: address.street,
				province: address.province,
				city: address.city,
				district: address.district,
				village: address.village || "",
				postalCode: address.postalCode,
				notes: address.notes || "",
				lat: address.lat ?? -6.2,
				lng: address.lng ?? 106.8,
			});
			setEditingId(address.id);
		} else {
			setForm({ ...EMPTY_FORM });
			setEditingId("new");
		}
	};

	const cancelEdit = () => {
		setEditingId(null);
		setForm(EMPTY_FORM);
	};

	const handleSave = async () => {
		if (!form.recipient || !form.phone || !form.street || !form.province) {
			toast.error("Mohon lengkapi field wajib.");
			return;
		}

		const payload = {
			label: form.label,
			recipient: form.recipient,
			phone: form.phone,
			street: form.street,
			province: form.province,
			city: form.city,
			district: form.district,
			village: form.village || undefined,
			postalCode: form.postalCode,
			lat: form.lat,
			lng: form.lng,
			notes: form.notes || undefined,
		};

		try {
			if (editingId === "new") {
				await api.post("/mitra/addresses", payload);
				toast.success("Alamat baru berhasil ditambahkan!");
			} else {
				await api.put(`/mitra/addresses/${editingId}`, payload);
				toast.success("Alamat berhasil diperbarui!");
			}
			await loadAddresses();
			cancelEdit();
		} catch (e: any) {
			toast.error(e.message || "Gagal menyimpan alamat.");
		}
	};

	const handleDelete = async (address: AddressItem) => {
		if (!confirm(`Hapus alamat "${address.label}"?`)) return;
		try {
			await api.delete(`/mitra/addresses/${address.id}`);
			toast.success("Alamat berhasil dihapus");
			await loadAddresses();
		} catch (e: any) {
			toast.error(e.message || "Gagal menghapus alamat");
		}
	};

	const handleSetPrimary = async (address: AddressItem) => {
		if (address.isPrimary) return;
		try {
			await api.put(`/mitra/addresses/${address.id}`, { isPrimary: true });
			toast.success("Alamat utama berhasil diubah");
			await loadAddresses();
		} catch (e: any) {
			toast.error(e.message || "Gagal mengubah alamat utama");
		}
	};

	const handleUseCurrentLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Browser tidak mendukung geolokasi.");
			return;
		}
		toast.info("Mendapatkan lokasi...");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setForm((f) => ({
					...f,
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				}));
				toast.success("Lokasi diperbarui!");
			},
			() => toast.error("Gagal mendapatkan lokasi. Periksa izin GPS."),
			{ enableHighAccuracy: true, timeout: 10000 },
		);
	};

	const handleMapClick = (lat: number, lng: number) => {
		setForm((f) => ({ ...f, lat, lng }));
	};

	const getRegionName = (list: RegionItem[], idOrName: string) =>
		list.find((r) => r.id === idOrName || r.name === idOrName)?.name ||
		idOrName;

	if (loading) {
		return (
			<MitraShell>
				<div className="flex items-center justify-center py-20">
					<Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
				</div>
			</MitraShell>
		);
	}

	const isEditing = editingId !== null;

	return (
		<MitraShell>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
				<MitraSidebar active="address" />

				<div className="space-y-4">
					<button
						onClick={() => router.push("/mitra")}
						className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
					>
						<ChevronLeft className="h-4 w-4" strokeWidth={2} />
						Kembali ke Dasbor
					</button>

					<div>
						<h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
							Alamat Toko
						</h1>
						<p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
							Kelola alamat toko untuk pengiriman pesanan
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
						{/* ─── Left: Address List / Form ─── */}
						<div className="space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<h2 className="text-base font-semibold text-zinc-900">
									Daftar Alamat ({addresses.length})
								</h2>
								{!isEditing && (
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.97 }}
										onClick={() => startEdit()}
										className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
									>
										<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
										Tambah Alamat
									</motion.button>
								)}
							</div>

							{/* ── Read mode: list addresses ── */}
							{!isEditing && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="space-y-3"
								>
									{addresses.length === 0 && (
										<div className="rounded-sm border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
											<MapPin
												className="mx-auto h-8 w-8 text-zinc-300"
												strokeWidth={1.5}
											/>
											<p className="mt-3 text-sm text-zinc-500">
												Belum ada alamat toko. Tambahkan alamat pertama Anda.
											</p>
											<button
												type="button"
												onClick={() => startEdit()}
												className="mt-3 inline-flex items-center gap-1.5 bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
											>
												<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
												Tambah Alamat
											</button>
										</div>
									)}

									{addresses.map((addr) => (
										<div
											key={addr.id}
											className="rounded-sm border border-zinc-200 bg-white p-5 hover:border-zinc-300"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-start gap-3">
													<div
														className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${
															addr.isPrimary
																? "bg-emerald-50 text-emerald-700"
																: "bg-zinc-100 text-zinc-500"
														}`}
													>
														<Home className="h-4 w-4" strokeWidth={2} />
													</div>
													<div>
														<div className="flex items-center gap-2">
															<p className="text-sm font-semibold text-zinc-900">
																{addr.label}
															</p>
															{addr.isPrimary && (
																<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
																	<Star
																		className="h-2.5 w-2.5"
																		fill="currentColor"
																		strokeWidth={1}
																	/>
																	Utama
																</span>
															)}
														</div>
														<p className="mt-1 text-sm font-medium text-zinc-800">
															{addr.recipient} • {addr.phone}
														</p>
														<p className="mt-0.5 text-sm text-zinc-600">
															{addr.street}
														</p>
														<p className="text-sm text-zinc-600">
															{addr.village &&
																`${getRegionName(villages, addr.village)}, `}
															{getRegionName(districts, addr.district)},{" "}
															{getRegionName(cities, addr.city)},{" "}
															{getRegionName(provinces, addr.province)}{" "}
															{addr.postalCode}
														</p>
														{addr.notes && (
															<p className="mt-2 border-t border-zinc-100 pt-2 text-xs italic text-zinc-500">
																Catatan: {addr.notes}
															</p>
														)}
													</div>
												</div>

												<div className="flex shrink-0 items-center gap-1">
													{!addr.isPrimary && (
														<button
															type="button"
															onClick={() => handleSetPrimary(addr)}
															className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
															title="Jadikan utama"
														>
															<Star className="h-3.5 w-3.5" strokeWidth={1.5} />
														</button>
													)}
													<button
														type="button"
														onClick={() => startEdit(addr)}
														className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
														title="Edit alamat"
													>
														<Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
													</button>
													{addresses.length > 1 && (
														<button
															type="button"
															onClick={() => handleDelete(addr)}
															className="rounded p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
															title="Hapus alamat"
														>
															<Trash2
																className="h-3.5 w-3.5"
																strokeWidth={1.5}
															/>
														</button>
													)}
												</div>
											</div>
										</div>
									))}
								</motion.div>
							)}

							{/* ── Edit Form ── */}
							{isEditing && (
								<motion.form
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									onSubmit={(e) => {
										e.preventDefault();
										handleSave();
									}}
									className="rounded-sm border border-zinc-200 bg-white"
								>
									<div className="border-b border-zinc-200 px-5 py-4">
										<h3 className="text-sm font-semibold text-zinc-900">
											{editingId === "new"
												? "Tambah Alamat Baru"
												: "Edit Alamat"}
										</h3>
										<p className="mt-0.5 text-xs text-zinc-500">
											{editingId === "new"
												? "Tambahkan alamat toko baru."
												: "Perbarui informasi alamat."}
										</p>
									</div>

									<div className="space-y-4 p-5">
										<Field label="Label Alamat" required>
											<input
												type="text"
												required
												value={form.label}
												onChange={(e) => update("label", e.target.value)}
												placeholder="Contoh: Toko Utama, Gudang, Cabang"
												className={inputClass}
											/>
										</Field>

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<Field label="Nama Penerima" required>
												<input
													type="text"
													required
													value={form.recipient}
													onChange={(e) => update("recipient", e.target.value)}
													placeholder="Nama penerima"
													className={inputClass}
												/>
											</Field>
											<Field label="Nomor Telepon" required>
												<input
													type="tel"
													required
													value={form.phone}
													onChange={(e) => update("phone", e.target.value)}
													placeholder="0812 1234 5678"
													className={inputClass}
												/>
											</Field>
										</div>

										<Field label="Alamat Lengkap" required>
											<textarea
												required
												rows={3}
												value={form.street}
												onChange={(e) => update("street", e.target.value)}
												placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
												className={`${inputClass} resize-y`}
											/>
										</Field>

										<Field label="Provinsi" required>
											<SelectInput
												value={getRegionName(provinces, form.province)}
												placeholder="Pilih Provinsi"
												options={provinces.map((p) => p.name)}
												open={provinceSelect.open}
												onToggle={provinceSelect.toggle}
												onSelect={(v) => {
													const p = provinces.find((x) => x.name === v);
													update("province", p?.id || v);
													provinceSelect.close();
												}}
											/>
										</Field>

										<Field label="Kota / Kabupaten" required>
											<SelectInput
												value={getRegionName(cities, form.city)}
												placeholder="Pilih Kota"
												options={cities.map((c) => c.name)}
												disabled={!form.province}
												loading={loadingCities}
												open={citySelect.open}
												onToggle={citySelect.toggle}
												onSelect={(v) => {
													const c = cities.find((x) => x.name === v);
													update("city", c?.id || v);
													citySelect.close();
												}}
											/>
										</Field>

										<Field label="Kecamatan">
											<SelectInput
												value={getRegionName(districts, form.district)}
												placeholder="Pilih Kecamatan"
												options={districts.map((d) => d.name)}
												disabled={!form.city}
												loading={loadingDistricts}
												open={districtSelect.open}
												onToggle={districtSelect.toggle}
												onSelect={(v) => {
													const d = districts.find((x) => x.name === v);
													update("district", d?.id || v);
													districtSelect.close();
												}}
											/>
										</Field>

										<Field label="Desa / Kelurahan">
											<SelectInput
												value={getRegionName(villages, form.village)}
												placeholder="Pilih Desa / Kelurahan"
												options={villages.map((v) => v.name)}
												disabled={!form.district}
												loading={loadingVillages}
												open={villageSelect.open}
												onToggle={villageSelect.toggle}
												onSelect={(v) => {
													const vl = villages.find((x) => x.name === v);
													update("village", vl?.id || v);
													villageSelect.close();
												}}
											/>
										</Field>

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<Field label="Kode Pos" required>
												<input
													type="text"
													required
													inputMode="numeric"
													value={form.postalCode}
													onChange={(e) => update("postalCode", e.target.value)}
													placeholder="13540"
													className={inputClass}
												/>
											</Field>
											<Field label="Catatan Alamat (Opsional)">
												<input
													type="text"
													value={form.notes}
													onChange={(e) => update("notes", e.target.value)}
													placeholder="Patokan untuk kurir"
													className={inputClass}
												/>
											</Field>
										</div>
									</div>

									<div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
										<button
											type="button"
											onClick={cancelEdit}
											className="border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
										>
											Batal
										</button>
										<button
											type="submit"
											className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
										>
											<Save className="h-3.5 w-3.5" strokeWidth={2.5} />
											{editingId === "new"
												? "Tambah Alamat"
												: "Simpan Perubahan"}
										</button>
									</div>
								</motion.form>
							)}
						</div>

						{/* ─── Right: Map ─── */}
						<motion.aside
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							className="space-y-4"
						>
							<h2 className="text-base font-semibold text-zinc-900">
								Titik Lokasi di Peta
							</h2>

							{isEditing ? (
								<>
									<LeafletMap
										lat={form.lat}
										lng={form.lng}
										onMapClick={handleMapClick}
									/>
									<button
										type="button"
										onClick={handleUseCurrentLocation}
										className="flex w-full items-center justify-center gap-2 rounded-sm border border-zinc-300 bg-white px-4 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-700 hover:text-zinc-900"
									>
										<Crosshair className="h-3.5 w-3.5" strokeWidth={2} />
										Gunakan Lokasi Saat Ini
									</button>
								</>
							) : (
								<div className="flex aspect-[4/3] items-center justify-center rounded-sm border border-dashed border-zinc-300 bg-zinc-50">
									<div className="text-center text-zinc-400">
										<MapPin className="mx-auto h-8 w-8" strokeWidth={1.5} />
										<p className="mt-2 text-xs">
											Pilih alamat atau klik "Tambah Alamat" untuk melihat peta
										</p>
									</div>
								</div>
							)}

							{isEditing && (
								<div className="rounded-sm border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
									<p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
										Pratinjau Alamat
									</p>
									<p className="mt-1 text-sm text-zinc-900">{form.street}</p>
									<p className="text-sm text-zinc-900">
										{form.village &&
											`${getRegionName(villages, form.village)}, `}
										{getRegionName(districts, form.district)},{" "}
										{getRegionName(cities, form.city)},{" "}
										{getRegionName(provinces, form.province)} {form.postalCode}
									</p>
									{form.phone && (
										<div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-zinc-500">
											<Phone className="h-3 w-3" strokeWidth={2} />
											<span>{form.phone}</span>
										</div>
									)}
									<div className="mt-1 flex items-center gap-2 text-zinc-400">
										<MapPin className="h-3 w-3" strokeWidth={2} />
										<span className="font-mono">
											{form.lat.toFixed(4)}, {form.lng.toFixed(4)}
										</span>
									</div>
								</div>
							)}

							<p className="text-[10px] leading-relaxed text-zinc-500">
								<span className="font-semibold">Catatan:</span> Klik pada peta
								untuk menandai posisi toko. Kurir akan menggunakan titik ini
								sebagai acuan penjemputan.
							</p>
						</motion.aside>
					</div>
				</div>
			</div>
		</MitraShell>
	);
}
