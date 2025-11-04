const allRentalProducts = [
  {
    id: 1, name: 'Sepeda Gunung XC Pro Series', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Outdoor',
    description: 'Sepeda Cross-Country (XC) performa tinggi dengan suspensi penuh. Cocok untuk trek gunung teknis dan balapan jarak jauh. Dilengkapi rem hidrolik dan grupset Shimano Deore 1x12. Ukuran tersedia: M dan L.',
    image: 'gunung-jaya-bikes-1.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 342, trending: true, price: 'Rp 50.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 5, name: 'Helm Sepeda XC Aerodinamis', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Helm ringan dengan ventilasi maksimal untuk menjaga kepala tetap dingin. Dilengkapi sistem MIPS untuk keamanan superior dan penyesuaian dial fit yang mudah. Warna: Matte Black. Ukuran: L (58-62cm).',
    image: 'gunung-jaya-bikes-2.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 150, trending: false, price: 'Rp 15.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1011, name: 'Sepeda Lipat Urban Commuter', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Kendaraan',
    description: 'Sepeda lipat 20 inci yang praktis dan ringkas, ideal untuk komuting harian dan perjalanan multimodal (gabung dengan KRL/Bus). 7 Kecepatan Shimano Tourney dan frame aluminium ringan.',
    image: 'gunung-jaya-bikes-3.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 95, trending: false, price: 'Rp 45.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1012, name: 'Lampu Sepeda Depan (800 Lumen)', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Lampu LED isi ulang (USB) dengan output 800 Lumen, memastikan visibilitas maksimal di malam hari. Tahan air (IPX6) dengan 4 mode pencahayaan. Termasuk bracket pemasangan cepat.',
    image: 'gunung-jaya-bikes-4.jpeg', // Path disesuaikan
    rating: 4.5, reviews: 112, trending: false, price: 'Rp 10.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1013, name: 'Kunci Sepeda Spiral Kualitas Tinggi', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Kunci kabel spiral 10mm dengan lapisan pelindung PVC. Panjang 1.5 meter, cukup untuk mengunci roda depan dan frame. Dilengkapi mekanisme kunci empat digit kombinasi yang aman.',
    image: 'gunung-jaya-bikes-5.jpeg', // Path disesuaikan
    rating: 4.4, reviews: 88, trending: false, price: 'Rp 8.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1014, name: 'Pompa Tangan Portabel High Volume', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Pompa mini aluminium yang ringan (hanya 120g). Kompatibel dengan katup Presta dan Schrader. Mampu memompa hingga 120 PSI. Ideal untuk perbaikan ban mendadak di jalan.',
    image: 'gunung-jaya-bikes-6.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 130, trending: false, price: 'Rp 12.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1015, name: 'Tas Sadel Sepeda Anti Air', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Tas sadel kompak dengan kapasitas 1.5 Liter, terbuat dari bahan 600D Polyester anti air. Sempurna untuk menyimpan kunci, toolkit, dan ponsel. Pemasangan mudah dengan strap Velcro.',
    image: 'gunung-jaya-bikes-7.jpeg', // Path disesuaikan
    rating: 4.5, reviews: 75, trending: false, price: 'Rp 9.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1016, name: 'Botol Minum Sepeda Insulated', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Botol air sepeda berkapasitas 750ml, dengan lapisan insulasi termal ganda yang menjaga minuman tetap dingin hingga 4 jam. 100% Bebas BPA dan *leak-proof*.',
    image: 'gunung-jaya-bikes-8.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 210, trending: true, price: 'Rp 5.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1017, name: 'Standar Paddock Sepeda Lipat', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Perlengkapan',
    description: 'Standar paddock lipat yang stabil, ideal untuk membersihkan, memperbaiki, atau memajang sepeda. Cocok untuk semua jenis sepeda (MTB, Road, Lipat) dengan ukuran ban 20"-29".',
    image: 'gunung-jaya-bikes-9.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 90, trending: false, price: 'Rp 20.000', period: '/hari', location: 'Jakarta Selatan',
  },
  {
    id: 1018, name: 'Sepeda Anak Roda 3 Multifungsi', seller: { id: 101, name: 'Gunung-Jaya Bikes', avatar: 'https://i.pravatar.cc/150?u=gunungjaya', bio: 'Menyediakan sepeda berkualitas...', rating: 4.9, itemsRented: 780 }, category: 'Kendaraan',
    description: 'Sepeda roda tiga yang dapat dikonversi menjadi sepeda keseimbangan. Dilengkapi keranjang depan dan pelindung anti-jatuh. Direkomendasikan untuk usia 1.5 - 4 tahun.',
    image: 'gunung-jaya-bikes-10.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 180, trending: true, price: 'Rp 30.000', period: '/hari', location: 'Jakarta Selatan',
  },

  // --- DSLR World Rent (ID 102) ---
  {
    id: 2, name: 'Kamera DSLR Canon EOS 80D Kit', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Elektronik',
    description: 'Kamera DSLR *mid-range* profesional dengan sensor 24.2MP dan kemampuan video Full HD 60fps. Cocok untuk pemula hingga *videographer* amatir. Sudah termasuk lensa kit 18-55mm.',
    image: 'dslr-world-rent-1.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 521, trending: true, price: 'Rp 150.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 6, name: 'Lensa Telephoto Canon EF 70-200mm f/2.8L', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Elektronik',
    description: 'Lensa *zoom telephoto* premium dengan aperture konstan f/2.8. Ideal untuk fotografi potret, acara olahraga, dan satwa liar. Dilengkapi Image Stabilizer (IS) dan elemen *low-dispersion*.',
    image: 'dslr-world-rent-2.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 310, trending: true, price: 'Rp 100.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1021, name: 'Tripod Kamera Manfrotto BeFree Advanced', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Perlengkapan',
    description: 'Tripod aluminium ringan dan ringkas. Tinggi maksimum 150cm dengan kapasitas beban hingga 8kg. Kepala *ball head* yang cepat dan stabil, ideal untuk perjalanan dan fotografi *landscape*.',
    image: 'dslr-world-rent-3.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 250, trending: true, price: 'Rp 35.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1022, name: 'Flash Eksternal Godox V860II TTL', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Elektronik',
    description: 'Flash *speedlite* dengan baterai Lithium-Ion berkapasitas tinggi. Mendukung fungsi TTL (Through-The-Lens) otomatis dan HSS (High-Speed Sync) hingga 1/8000 detik. Kompatibel dengan Canon/Nikon/Sony.',
    image: 'dslr-world-rent-4.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 180, trending: false, price: 'Rp 40.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1023, name: 'Lensa Wide Angle Canon EF 16-35mm f/4L', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Elektronik',
    description: 'Lensa *ultra wide-angle* seri L dengan kualitas optik superior. Sangat cocok untuk memotret *landscape* yang luas, interior arsitektur, atau video *vlogging* dinamis. Aperture konstan f/4.',
    image: 'dslr-world-rent-5.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 280, trending: true, price: 'Rp 90.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1024, name: 'Memory Card SDXC Sandisk Extreme 128GB', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Perlengkapan',
    description: 'Kartu memori SDXC berkecepatan tinggi (Read 170MB/s, Write 90MB/s). Klasifikasi V30/U3, memastikan perekaman video 4K yang stabil dan *burst shooting* RAW cepat. Wajib untuk kamera modern.',
    image: 'dslr-world-rent-6.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 400, trending: true, price: 'Rp 20.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1025, name: 'Tas Kamera Backpack Lowepro ProTactic 450 AW', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Perlengkapan',
    description: 'Tas ransel kamera taktis dengan akses cepat dari 4 sisi. Muat 2 bodi kamera dan 5-6 lensa. Dilengkapi *all-weather cover* dan kompartemen laptop 15 inci. Nyaman untuk membawa banyak *gear*.',
    image: 'dslr-world-rent-7.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 190, trending: false, price: 'Rp 50.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1026, name: 'Reflector Fotografi 5-in-1 (110cm)', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Perlengkapan',
    description: 'Reflektor lipat 110cm yang mencakup 5 warna (Emas, Perak, Putih, Hitam, Difuser). Alat wajib untuk mengatur kontras dan mengisi bayangan pada pemotretan potret dan produk di luar ruangan.',
    image: 'dslr-world-rent-8.jpeg', // Path disesuaikan
    rating: 4.5, reviews: 110, trending: false, price: 'Rp 15.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1027, name: 'Kamera Mirrorless Sony A7III', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Elektronik',
    description: 'Kamera *mirrorless full-frame* terbaik untuk foto dan video. Sensor 24.2MP, stabilisasi 5-axis, dan fokus otomatis *Eye AF* yang legendaris. Cocok untuk proyek video profesional dan *low light* photography.',
    image: 'dslr-world-rent-9.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 610, trending: true, price: 'Rp 250.000', period: '/hari', location: 'Jakarta Pusat',
  },
  {
    id: 1028, name: 'Baterai Kamera Cadangan NP-FZ100 (Original)', seller: { id: 102, name: 'DSLR World Rent', avatar: 'https://i.pravatar.cc/150?u=dslrworld', bio: 'Pusat sewa kamera...', rating: 4.8, itemsRented: 1240 }, category: 'Perlengkapan',
    description: 'Baterai lithium-ion cadangan original Sony NP-FZ100. Daya tahan tinggi, wajib dibawa untuk sesi pemotretan atau perekaman video yang panjang. Kompatibel dengan Sony seri A7, A9, dan A6600.',
    image: 'dslr-world-rent-10.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 350, trending: false, price: 'Rp 25.000', period: '/hari', location: 'Jakarta Pusat',
  },

  // --- TendaCamping-Shop (ID 103) ---
  {
    id: 3, name: 'Tenda Dome 4 Orang Anti Badai', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Outdoor',
    description: 'Tenda dome kapasitas 4 orang dengan *double layer* dan ketahanan air PU3000mm. Dilengkapi ventilasi besar dan kantong penyimpanan internal. Ideal untuk pendakian gunung atau camping keluarga.',
    image: 'tendacamping-shop-1.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 189, trending: false, price: 'Rp 75.000', period: '/malam', location: 'Bogor',
  },
  {
    id: 1031, name: 'Sleeping Bag Mummy Extreme', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Kantung tidur model *mummy* dengan batas suhu nyaman hingga 0°C. Isian *hollow fiber* yang tebal namun ringan. Cocok untuk berkemah di dataran tinggi atau gunung.',
    image: 'tendacamping-shop-2.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 120, trending: true, price: 'Rp 25.000', period: '/malam', location: 'Bogor',
  },
  {
    id: 1032, name: 'Kompor Camping Portable Ultralight', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Kompor gas mini *ultralight* yang ringkas, hanya 100g. Menggunakan bahan bakar tabung gas *canister*. Cocok untuk pendaki solo atau yang mengutamakan keringkasan saat membawa peralatan.',
    image: 'tendacamping-shop-3.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 210, trending: true, price: 'Rp 20.000', period: '/hari', location: 'Bogor',
  },
  {
    id: 1033, name: 'Matras Camping Gulung EVA Foam', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Matras gulung tebal 10mm dari busa EVA yang memberikan isolasi suhu dan bantalan yang baik. Tahan air dan mudah dibersihkan. Ukuran 180cm x 60cm.',
    image: 'tendacamping-shop-4.jpeg', // Path disesuaikan
    rating: 4.5, reviews: 160, trending: false, price: 'Rp 10.000', period: '/malam', location: 'Bogor',
  },
  {
    id: 1034, name: 'Lampu Tenda LED Magnetik', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Lampu LED gantung dengan kait dan magnet di bagian belakang. Memiliki 3 mode terang dan daya tahan baterai hingga 8 jam. Ideal untuk penerangan di dalam tenda atau area masak.',
    image: 'tendacamping-shop-5.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 140, trending: true, price: 'Rp 12.000', period: '/malam', location: 'Bogor',
  },
  {
    id: 1035, name: 'Kursi Lipat Camping Portabel', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Kursi lipat mini dengan rangka aluminium yang kuat. Berat hanya 1.2kg dan mudah dibawa dalam tas carrier. Kapasitas beban maksimum 100kg. Sempurna untuk bersantai di *basecamp*.',
    image: 'tendacamping-shop-6.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 195, trending: false, price: 'Rp 15.000', period: '/hari', location: 'Bogor',
  },
  {
    id: 1036, name: 'Carrier/Ransel Gunung Eiger 60L', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Outdoor',
    description: 'Ransel gunung 60 liter dengan sistem *back-system* yang ergonomis. Terdapat kompartemen sepatu, kantong botol, dan *rain cover* terintegrasi. Ideal untuk pendakian 3-5 hari.',
    image: 'tendacamping-shop-7.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 220, trending: true, price: 'Rp 50.000', period: '/hari', location: 'Bogor',
  },
  {
    id: 1037, name: 'Hammock Gantung Dual Layer', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Outdoor',
    description: 'Hammock bahan nylon parasut *dual layer* yang kuat dan nyaman. Termasuk webbing strap 2.5 meter untuk pemasangan mudah di pohon. Kapasitas beban hingga 200kg.',
    image: 'tendacamping-shop-8.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 115, trending: false, price: 'Rp 18.000', period: '/hari', location: 'Bogor',
  },
  {
    id: 1038, name: 'Headlamp Petzl Aktik Core 450 Lumen', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Headlamp *hybrid* dengan output maksimal 450 Lumen. Dapat menggunakan baterai AAA atau baterai isi ulang CORE (sudah termasuk). Ringan, tahan air, dan memiliki mode cahaya merah untuk malam hari.',
    image: 'tendacamping-shop-9.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 280, trending: true, price: 'Rp 15.000', period: '/malam', location: 'Bogor',
  },
  {
    id: 1039, name: 'Set Alat Masak Camping Ultralight (2-3 Orang)', seller: { id: 103, name: 'TendaCamping-Shop', avatar: 'https://i.pravatar.cc/150?u=tendacamping', bio: 'Sewa tenda...', rating: 4.7, itemsRented: 450 }, category: 'Perlengkapan',
    description: 'Set nesting dari aluminium anodized keras, berisi 2 panci, 1 wajan mini, dan 3 mangkuk. Ringkas, anti lengket, dan mudah dibawa. Cocok untuk kebutuhan masak ringan di kemah.',
    image: 'tendacamping-shop-10.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 170, trending: false, price: 'Rp 22.000', period: '/hari', location: 'Bogor',
  },

  // --- Gamer Gear ID (ID 104) ---
  {
    id: 4, name: 'Laptop Gaming ASUS ROG RTX 4060', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Laptop gaming kelas atas dengan prosesor Intel i7 dan kartu grafis NVIDIA RTX 4060. Layar 15.6" 144Hz. Ideal untuk turnamen e-sports, rendering 3D, atau *video editing* berat. Disertakan *charger* 240W.',
    image: 'gamer-gear-id-1.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 215, trending: true, price: 'Rp 200.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1041, name: 'Mouse Gaming Wireless Logitech G Pro X Superlight', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Mouse *wireless* ultraringan (hanya 63g) dengan sensor HERO 25K untuk akurasi *pixel-perfect*. Respons 1ms. Pilihan terbaik untuk game FPS kompetitif. Sudah termasuk kabel charging.',
    image: 'gamer-gear-id-2.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 180, trending: true, price: 'Rp 30.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1042, name: 'Keyboard Mechanical TKL Razer BlackWidow', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Keyboard mekanikal Tenkeyless (TKL) dengan *switch* Razer Green (clicky) taktil. Dilengkapi *backlighting* RGB kustomisasi penuh dan *wrist rest* magnetik yang nyaman.',
    image: 'gamer-gear-id-3.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 155, trending: false, price: 'Rp 40.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1043, name: 'Headset Gaming HyperX Cloud II 7.1 Surround', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Headset gaming premium dengan suara surround virtual 7.1. Busa memori yang nyaman dan rangka aluminium yang kokoh. Mic *noise-cancelling* yang dapat dilepas (detachable). Plug USB/3.5mm.',
    image: 'gamer-gear-id-4.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 205, trending: true, price: 'Rp 50.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1044, name: 'Monitor Gaming 24" BenQ 144Hz IPS', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Monitor 24 inci dengan *refresh rate* 144Hz dan panel IPS 1ms. Memberikan gerakan super mulus untuk game FPS. Mendukung G-Sync/FreeSync. Sudah termasuk kabel HDMI dan DisplayPort.',
    image: 'gamer-gear-id-5.jpeg', // Path disesuaikan
    rating: 4.7, reviews: 190, trending: false, price: 'Rp 80.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1045, name: 'Webcam Logitech C922 Pro Stream', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Webcam HD 1080p pada 30fps atau 720p pada 60fps. Ideal untuk *streaming* dan video konferensi. Dilengkapi fokus otomatis dan koreksi cahaya rendah yang baik. Tripod mini disertakan.',
    image: 'gamer-gear-id-6.jpeg', // Path disesuaikan
    rating: 4.6, reviews: 140, trending: false, price: 'Rp 35.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1046, name: 'Controller Xbox Series X/S Wireless', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Controller nirkabel resmi Xbox Series X/S. Koneksi Bluetooth stabil, kompatibel dengan PC, Laptop, dan konsol. Dilengkapi D-Pad hibrid dan tekstur grip anti-slip.',
    image: 'gamer-gear-id-7.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 250, trending: true, price: 'Rp 45.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1047, name: 'Kursi Gaming Ergonomis REXUS D-1000', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Perlengkapan',
    description: 'Kursi gaming premium dengan sandaran punggung tinggi, bantalan leher dan pinggang yang dapat diatur. Bahan kulit PU berkualitas dan sandaran tangan 4D. Nyaman untuk sesi gaming atau kerja yang panjang.',
    image: 'gamer-gear-id-8.jpeg', // Path disesuaikan
    rating: 4.8, reviews: 160, trending: false, price: 'Rp 70.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1048, name: 'Cooling Pad Laptop 17 Inch (Dual Fan)', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Perlengkapan',
    description: 'Cooling pad dengan dua kipas besar dan kecepatan yang dapat disesuaikan. Membantu menjaga suhu laptop gaming tetap dingin, mencegah *throttling* performa. Cocok hingga laptop 17 inci.',
    image: 'gamer-gear-id-9.jpeg', // Path disesuaikan
    rating: 4.5, reviews: 110, trending: false, price: 'Rp 15.000', period: '/hari', location: 'Jakarta Timur',
  },
  {
    id: 1049, name: 'Microphone USB Blue Yeti Studio Quality', seller: { id: 104, name: 'Gamer Gear ID', avatar: 'https://i.pravatar.cc/150?u=gamergear', bio: 'Rental laptop gaming...', rating: 4.9, itemsRented: 620 }, category: 'Elektronik',
    description: 'Mikrofon kondenser USB kualitas studio dengan 4 pola pengambilan suara (Cardioid, Stereo, Omnidirectional, Bidirectional). Ideal untuk *podcast*, *streaming*, atau perekaman vokal di rumah. Plug-and-play.',
    image: 'gamer-gear-id-10.jpeg', // Path disesuaikan
    rating: 4.9, reviews: 220, trending: true, price: 'Rp 60.000', period: '/hari', location: 'Jakarta Timur',
  },
];

// Tambahkan ini di baris paling bawah
module.exports = { allRentalProducts };