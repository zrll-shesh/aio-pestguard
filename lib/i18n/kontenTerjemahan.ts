/**
 * lib/i18n/kontenTerjemahan.ts
 *
 * Terjemahan Inggris dan Korea untuk ISI DATA (nama hama, gejala, panduan lapangan,
 * catatan pestisida, tahap proyek, dan lain-lain). Kuncinya adalah teks Indonesia
 * persis seperti di file data, sehingga data asli tidak perlu diubah strukturnya.
 * Bila teks Indonesia di data diganti, tambahkan juga terjemahannya di sini
 * (jalankan pemeriksaan di scripts/cek-terjemahan.mts untuk melihat yang belum ada).
 *
 * Format: "teks Indonesia": ["English", "한국어"]
 */
export const TERJEMAHAN_KONTEN: Record<string, [string, string]> = {
  // ---------------- Nama hama dan kelompok ----------------
  "Penggulung daun padi": ["Rice leaf roller", "혹명나방"],
  "Ulat daun padi": ["Rice leaf caterpillar", "벼애나방"],
  "Lalat penggerek pucuk padi": ["Paddy stem maggot", "벼애잎굴파리"],
  "Penggerek batang padi bergaris": ["Asiatic rice borer", "이화명나방"],
  "Penggerek batang padi kuning": ["Yellow rice borer", "삼화명나방"],
  "Ganjur (uret bengkak batang padi)": ["Rice gall midge", "벼혹파리"],
  "Lalat batang padi": ["Rice stem fly", "벼줄기굴파리"],
  "Wereng batang coklat": ["Brown planthopper", "벼멸구"],
  "Wereng punggung putih": ["White-backed planthopper", "흰등멸구"],
  "Wereng coklat kecil": ["Small brown planthopper", "애멸구"],
  "Kumbang moncong air padi": ["Rice water weevil", "벼물바구미"],
  "Wereng hijau": ["Green rice leafhopper", "끝동매미충"],
  "Thrips bulir padi": ["Rice thrips", "벼총채벌레"],
  "Keong mas (siput murbei)": ["Golden apple snail", "왕우렁이"],
  "Penggerek batang jagung": ["Asian corn borer", "조명나방"],
  "Ulat grayak tentara": ["Oriental armyworm", "멸강나방"],
  "Kutu daun jagung": ["Corn leaf aphid", "옥수수테두리진딧물"],
  "Ulat tanah (potong hitam)": ["Black cutworm", "검거세미밤나방"],
  "Ulat tanah besar": ["Large cutworm", "큰거세미나방"],
  "Ulat tanah kuning": ["Yellow cutworm", "거세미나방"],
  "Uret (larva kumbang tanah)": ["White grub", "굼벵이 (풍뎅이 유충)"],
  "Anjing tanah / orong-orong": ["Mole cricket", "땅강아지"],
  "Uret kawat": ["Wireworm", "방아벌레 유충"],
  "Thrips bawang": ["Onion thrips", "파총채벌레"],
  "Ulat daun": ["Leaf caterpillars", "잎 먹는 나방 유충"],
  "Lalat": ["Flies", "파리류"],
  "Penggerek batang": ["Stem borers", "줄기 천공 해충"],
  "Wereng": ["Planthoppers", "멸구·매미충류"],
  "Kumbang": ["Beetles", "딱정벌레류"],
  "Thrips": ["Thrips", "총채벌레류"],
  "Keong": ["Snails", "달팽이류"],
  "Kutu daun": ["Aphids", "진딧물류"],
  "Ulat tanah": ["Cutworms", "거세미류"],
  "Hama tanah": ["Soil pests", "토양 해충"],

  // ---------------- Gejala ----------------
  "Daun padi tergulung memanjang dan tampak bergaris putih karena jaringan hijaunya dimakan dari dalam gulungan.": [
    "Rice leaves are rolled lengthwise and show white streaks because the green tissue is eaten from inside the roll.",
    "벼 잎이 세로로 말리고, 말린 잎 안쪽에서 녹색 조직을 갉아 먹어 흰 줄무늬가 보입니다.",
  ],
  "Daun dimakan dari tepi sehingga tampak bergerigi, pada serangan berat hanya tulang daun yang tersisa.": [
    "Leaves are eaten from the edges and look jagged; in heavy attacks only the leaf veins remain.",
    "잎 가장자리부터 갉아 먹어 톱니 모양이 되며, 심하면 잎맥만 남습니다.",
  ],
  "Daun muda yang baru membuka tampak rusak atau berlubang, anakan bisa layu.": [
    "Newly opened young leaves look damaged or holed, and tillers may wilt.",
    "새로 펼쳐진 어린 잎이 손상되거나 구멍이 나고, 새끼 줄기가 시들 수 있습니다.",
  ],
  "Pucuk tengah mati dan mudah dicabut (sundep) pada fase vegetatif, malai hampa berwarna putih (beluk) pada fase generatif.": [
    "The central shoot dies and pulls out easily (dead heart) in the vegetative stage; empty white panicles (white head) appear in the reproductive stage.",
    "영양생장기에는 가운데 순이 말라 쉽게 뽑히고(심고), 생식생장기에는 이삭이 하얗게 비어 버립니다(백수).",
  ],
  "Gejala sundep dan beluk seperti penggerek lain. Ngengat betina meletakkan kelompok telur berbulu cokelat di ujung daun.": [
    "Dead heart and white head symptoms like other borers. Female moths lay hairy brown egg masses on leaf tips.",
    "다른 천공 해충처럼 심고와 백수 증상이 나타납니다. 암나방은 잎 끝에 갈색 털로 덮인 알 덩어리를 낳습니다.",
  ],
  "Daun pucuk berubah menjadi tabung mirip daun bawang (puru) sehingga anakan tidak membentuk malai.": [
    "The shoot leaf turns into an onion-leaf-like tube (gall), so the tiller produces no panicle.",
    "순 잎이 파 잎 같은 관(혹)으로 변해 새끼 줄기에 이삭이 생기지 않습니다.",
  ],
  "Larva merusak titik tumbuh di dalam batang, daun yang muncul tampak robek atau berlubang memanjang.": [
    "Larvae damage the growing point inside the stem; emerging leaves look torn or have long holes.",
    "유충이 줄기 속 생장점을 해쳐, 새로 나오는 잎이 찢어지거나 길게 구멍이 납니다.",
  ],
  "Menghisap cairan di pangkal batang. Serangan berat membuat tanaman mengering melingkar (hopperburn) dan dapat menularkan virus kerdil.": [
    "Sucks sap at the base of the stem. Heavy attacks cause circular patches of dried plants (hopperburn) and can transmit stunt viruses.",
    "줄기 밑동의 즙을 빨아 먹습니다. 심하면 원형으로 말라 죽는 '멸구 피해(호퍼번)'가 생기고 위축 바이러스를 옮길 수 있습니다.",
  ],
  "Menghisap cairan tanaman muda, daun menguning dari ujung dan pertumbuhan terhambat.": [
    "Sucks sap from young plants; leaves yellow from the tip and growth is stunted.",
    "어린 식물의 즙을 빨아 먹어 잎끝부터 누렇게 변하고 생육이 늦어집니다.",
  ],
  "Kerusakan langsung relatif kecil, bahaya utamanya sebagai penular virus bergaris pada padi.": [
    "Direct damage is fairly small; the main danger is spreading rice stripe virus.",
    "직접 피해는 비교적 작지만, 벼 줄무늬잎마름병 바이러스를 옮기는 것이 가장 큰 위험입니다.",
  ],
  "Kumbang dewasa meninggalkan goresan memanjang di daun, larvanya merusak akar di lahan tergenang.": [
    "Adult weevils leave long scratches on leaves; larvae damage roots in flooded fields.",
    "성충은 잎에 긴 긁힌 자국을 남기고, 유충은 물 댄 논에서 뿌리를 해칩니다.",
  ],
  "Menghisap cairan daun dan menjadi penular utama penyakit tungro (daun menguning oranye, tanaman kerdil).": [
    "Sucks leaf sap and is the main carrier of tungro disease (orange-yellow leaves, stunted plants).",
    "잎 즙을 빨아 먹으며 퉁그로병(잎이 주황빛으로 노래지고 키가 작아짐)의 주요 매개충입니다.",
  ],
  "Ujung daun menggulung dan mengering, terutama pada persemaian dan tanaman muda saat kering.": [
    "Leaf tips curl and dry, especially in nurseries and young plants during dry weather.",
    "건조할 때 특히 못자리와 어린 모에서 잎끝이 말리고 마릅니다.",
  ],
  "Bibit muda terpotong di pangkal dan hilang dalam semalam. Telurnya berwarna merah muda menempel di batang atau pematang.": [
    "Young seedlings are cut at the base and vanish overnight. Its pink eggs stick to stems or field bunds.",
    "어린 모가 밑동에서 잘려 하룻밤 사이에 사라집니다. 분홍색 알이 줄기나 논둑에 붙어 있습니다.",
  ],
  "Daun berlubang kecil berderet, ada serbuk gerekan di ketiak daun, batang patah dan tongkol bisa ikut digerek.": [
    "Rows of small holes in leaves, boring dust in leaf axils, broken stalks, and ears may also be bored.",
    "잎에 작은 구멍이 줄지어 나고, 잎겨드랑이에 갉은 가루가 있으며, 줄기가 꺾이고 이삭까지 뚫릴 수 있습니다.",
  ],
  "Daun habis dimakan dalam waktu singkat, ulat bergerak bergerombol dan aktif pada malam hari.": [
    "Leaves are stripped quickly; caterpillars move in groups and are active at night.",
    "짧은 시간에 잎을 모두 먹어 치우며, 애벌레가 무리 지어 이동하고 밤에 활동합니다.",
  ],
  "Koloni kutu hijau kebiruan di pucuk dan bunga jantan, daun keriting dan berembun madu yang ditumbuhi jamur jelaga.": [
    "Bluish-green colonies on shoots and tassels; leaves curl and are coated with honeydew that grows sooty mould.",
    "순과 수꽃에 청록색 진딧물 무리가 생기고, 잎이 오그라들며 감로에 그을음병이 생깁니다.",
  ],
  "Tanaman muda terpotong di pangkal batang pada malam hari, ulat bersembunyi di tanah dan menggulung bila disentuh.": [
    "Young plants are cut at the stem base at night; caterpillars hide in the soil and curl up when touched.",
    "밤에 어린 식물의 줄기 밑동이 잘리며, 애벌레는 흙 속에 숨어 있다가 건드리면 몸을 맙니다.",
  ],
  "Gejala serupa ulat tanah lain: tanaman muda rebah karena pangkal batang terpotong.": [
    "Same symptoms as other cutworms: young plants fall over because the stem base is cut.",
    "다른 거세미류와 같은 증상으로, 줄기 밑동이 잘려 어린 식물이 쓰러집니다.",
  ],
  "Memotong tanaman muda di pangkal dan memakan bagian tanaman di dalam tanah.": [
    "Cuts young plants at the base and feeds on plant parts below ground.",
    "어린 식물의 밑동을 자르고 땅속 부분을 먹습니다.",
  ],
  "Larva putih berbentuk huruf C memakan akar dan umbi, tanaman layu dan mudah dicabut.": [
    "White C-shaped larvae eat roots and bulbs; plants wilt and pull out easily.",
    "흰색 C자 모양 유충이 뿌리와 알뿌리를 먹어 식물이 시들고 쉽게 뽑힙니다.",
  ],
  "Membuat lorong di permukaan tanah dan memotong akar serta pangkal tanaman muda.": [
    "Digs tunnels near the soil surface and cuts roots and the base of young plants.",
    "흙 표면 가까이 굴을 파고 어린 식물의 뿌리와 밑동을 자릅니다.",
  ],
  "Larva ramping keras berwarna kuning kecokelatan melubangi umbi dan akar.": [
    "Slender, hard, yellowish-brown larvae bore holes into bulbs and roots.",
    "가늘고 단단한 황갈색 유충이 알뿌리와 뿌리에 구멍을 뚫습니다.",
  ],
  "Daun bawang berbercak putih keperakan, ujung daun mengering dan umbi mengecil.": [
    "Onion leaves show silvery-white flecks, leaf tips dry out and bulbs stay small.",
    "파 잎에 은백색 반점이 생기고 잎끝이 마르며 알뿌리가 작아집니다.",
  ],

  // ---------------- Pengendalian tanpa obat ----------------
  "Periksa daun yang tergulung atau berlubang, ambil larva secara manual bila jumlahnya sedikit.": [
    "Check rolled or holed leaves and pick larvae by hand when there are only a few.",
    "말리거나 구멍 난 잎을 살피고, 수가 적으면 유충을 손으로 잡아 없앱니다.",
  ],
  "Hindari pupuk nitrogen berlebih dan jarak tanam terlalu rapat.": [
    "Avoid excess nitrogen fertiliser and overly dense planting.",
    "질소 비료 과다 사용과 너무 촘촘한 재배를 피합니다.",
  ],
  "Utamakan pengendalian hayati, misalnya parasitoid telur, sebelum memakai insektisida.": [
    "Use biological control first, such as egg parasitoids, before insecticides.",
    "살충제를 쓰기 전에 알 기생벌 같은 생물적 방제를 먼저 활용합니다.",
  ],
  "Atur air: genangan yang terus-menerus pada fase awal memudahkan serangan.": [
    "Manage water: continuous flooding in the early stage makes attacks easier.",
    "물 관리: 초기에 계속 물을 대 두면 피해가 쉽게 생깁니다.",
  ],
  "Tanam serempak dengan lahan sekitar agar siklus hama terputus.": [
    "Plant at the same time as neighbouring fields to break the pest cycle.",
    "이웃 논밭과 같은 시기에 심어 해충의 생활사를 끊습니다.",
  ],
  "Cabut dan musnahkan anakan yang rusak berat.": ["Pull out and destroy badly damaged tillers.", "심하게 피해 입은 새끼 줄기는 뽑아서 없앱니다."],
  "Kumpulkan dan musnahkan kelompok telur di daun sebelum menetas.": [
    "Collect and destroy egg masses on leaves before they hatch.",
    "부화하기 전에 잎의 알 덩어리를 모아 없앱니다.",
  ],
  "Cabut dan musnahkan batang yang mati di bagian tengah (sundep atau beluk).": [
    "Pull out and destroy stems with dead centres (dead heart or white head).",
    "가운데가 죽은 줄기(심고·백수)를 뽑아 없앱니다.",
  ],
  "Setelah panen, potong rendah atau benamkan tunggul agar larva tidak bertahan.": [
    "After harvest, cut stubble low or plough it under so larvae cannot survive.",
    "수확 후 그루터기를 낮게 자르거나 갈아엎어 유충이 살아남지 못하게 합니다.",
  ],
  "Pantau pangkal batang padi, wereng berkumpul di sana dan mudah terlewat dari atas.": [
    "Watch the base of rice stems; planthoppers gather there and are easy to miss from above.",
    "벼 줄기 밑동을 살피세요. 멸구는 그곳에 모여 있어 위에서 보면 놓치기 쉽습니다.",
  ],
  "Kurangi pupuk nitrogen berlebih karena tanaman yang terlalu subur disukai wereng.": [
    "Reduce excess nitrogen, because overly lush plants attract planthoppers.",
    "너무 무성한 식물을 멸구가 좋아하므로 질소 비료를 줄입니다.",
  ],
  "Jaga musuh alami (laba-laba, kepik predator) dengan tidak menyemprot sebelum populasi tinggi.": [
    "Protect natural enemies (spiders, predatory bugs) by not spraying before numbers are high.",
    "밀도가 높아지기 전에는 약을 치지 않아 천적(거미, 포식성 노린재)을 보호합니다.",
  ],
  "Keringkan lahan sementara bila anjuran setempat memungkinkan, larva bergantung pada genangan.": [
    "Drain the field for a while if local advice allows; larvae depend on standing water.",
    "지역 지침이 허용하면 잠시 물을 뺍니다. 유충은 고인 물에 의존합니다.",
  ],
  "Hindari tanam terlalu awal saat populasi kumbang dewasa sedang tinggi.": [
    "Avoid planting too early when adult weevil numbers are high.",
    "성충 밀도가 높을 때 너무 일찍 심지 않습니다.",
  ],
  "Bersihkan gulma di pematang yang menjadi tempat berlindung kumbang.": [
    "Clear weeds on bunds where the weevils shelter.",
    "바구미가 숨는 논둑의 잡초를 제거합니다.",
  ],
  "Pasang perangkap lekat berwarna biru atau kuning untuk memantau populasi.": [
    "Set up blue or yellow sticky traps to monitor numbers.",
    "파란색 또는 노란색 끈끈이 트랩을 설치해 밀도를 관찰합니다.",
  ],
  "Penyiraman dari atas pada musim kemarau membantu menekan thrips di daun.": [
    "Overhead watering in the dry season helps suppress thrips on leaves.",
    "건기에 위에서 물을 뿌려 주면 잎의 총채벌레를 줄이는 데 도움이 됩니다.",
  ],
  "Gilir bahan aktif bila terpaksa menyemprot, thrips cepat menjadi kebal.": [
    "Rotate active ingredients if you must spray; thrips quickly become resistant.",
    "꼭 약을 쳐야 한다면 유효성분을 바꿔 가며 쓰세요. 총채벌레는 금방 저항성이 생깁니다.",
  ],
  "Pungut keong dan kelompok telur merah muda secara rutin, terutama pagi dan sore.": [
    "Pick snails and pink egg clusters regularly, especially in the morning and evening.",
    "아침과 저녁에 특히 우렁이와 분홍색 알 덩어리를 정기적으로 주워 냅니다.",
  ],
  "Buat parit kecil di pinggir petak agar keong berkumpul dan mudah dipungut.": [
    "Dig small ditches along plot edges so snails gather there and are easy to collect.",
    "논 가장자리에 작은 도랑을 만들어 우렁이가 모이게 하면 줍기 쉽습니다.",
  ],
  "Tanam bibit yang lebih tua (lebih dari 21 hari) agar tidak mudah terpotong.": [
    "Transplant older seedlings (over 21 days) so they are not easily cut.",
    "잘 잘리지 않도록 더 자란 모(21일 이상)를 옮겨 심습니다.",
  ],
  "Periksa ketiak daun dan rambut tongkol untuk mencari lubang gerekan dan kotoran larva.": [
    "Check leaf axils and silks for bore holes and larval droppings.",
    "잎겨드랑이와 수염을 살펴 뚫은 구멍과 유충 배설물을 찾습니다.",
  ],
  "Potong dan musnahkan bunga jantan sebagian (bila anjuran setempat) karena menjadi tempat awal larva.": [
    "Cut and destroy some tassels (if locally advised), since larvae start there.",
    "지역 지침에 따라 일부 수꽃을 잘라 없앱니다. 유충이 처음 자리 잡는 곳입니다.",
  ],
  "Manfaatkan parasitoid telur Trichogramma bila tersedia dari dinas setempat.": [
    "Use Trichogramma egg parasitoids if available from the local agriculture office.",
    "지역 농업 기관에서 구할 수 있다면 알 기생벌(트리코그라마)을 활용합니다.",
  ],
  "Lindungi kumbang koksi dan larva lalat bunga, keduanya pemakan kutu daun.": [
    "Protect ladybirds and hoverfly larvae, both of which eat aphids.",
    "진딧물을 잡아먹는 무당벌레와 꽃등에 유충을 보호합니다.",
  ],
  "Semprotan air bertekanan dapat merontokkan koloni kecil.": ["A strong water spray can knock off small colonies.", "센 물줄기로 작은 무리를 떨어낼 수 있습니다."],
  "Kurangi nitrogen berlebih karena memicu pertumbuhan koloni.": [
    "Reduce excess nitrogen because it boosts colony growth.",
    "질소가 많으면 무리가 빨리 늘어나므로 줄입니다.",
  ],
  "Periksa pangkal tanaman muda pada pagi atau malam hari, ulat bersembunyi di tanah pada siang hari.": [
    "Check the base of young plants in the morning or at night; caterpillars hide in the soil by day.",
    "애벌레는 낮에 흙 속에 숨으므로 아침이나 밤에 어린 식물의 밑동을 살핍니다.",
  ],
  "Bersihkan gulma sebelum tanam karena menjadi tempat bertelur.": ["Clear weeds before planting because moths lay eggs on them.", "나방이 알을 낳는 곳이므로 심기 전에 잡초를 없앱니다."],
  "Olah tanah dengan baik agar larva dan pupa di dalam tanah terpapar.": [
    "Till the soil well to expose larvae and pupae in the ground.",
    "흙을 잘 갈아 땅속 유충과 번데기를 드러냅니다.",
  ],
  "Olah tanah lebih dalam sebelum tanam agar larva terangkat dan dimakan burung.": [
    "Till deeper before planting so larvae are brought up and eaten by birds.",
    "심기 전에 깊이 갈아 유충이 올라와 새에게 먹히도록 합니다.",
  ],
  "Kumpulkan larva secara manual saat mengolah tanah.": ["Collect larvae by hand while tilling.", "흙을 갈 때 유충을 손으로 모아 없앱니다."],
  "Pertimbangkan jamur entomopatogen (misalnya Metarhizium) sesuai anjuran PPL.": [
    "Consider insect-killing fungi (e.g. Metarhizium) as advised by your extension officer.",
    "지도사의 안내에 따라 곤충병원성 곰팡이(예: 메타리지움) 사용을 고려합니다.",
  ],
  "Genangi lahan sebentar sebelum tanam bila memungkinkan agar orong-orong keluar.": [
    "Briefly flood the field before planting, if possible, to drive mole crickets out.",
    "가능하면 심기 전에 잠시 물을 대어 땅강아지가 밖으로 나오게 합니다.",
  ],
  "Gunakan umpan atau perangkap lampu sesuai anjuran setempat.": ["Use baits or light traps as advised locally.", "지역 지침에 따라 미끼나 등화 트랩을 씁니다."],
  "Olah tanah dengan baik untuk merusak lorong dan sarang telurnya.": ["Till well to destroy tunnels and egg chambers.", "흙을 잘 갈아 굴과 알집을 부숩니다."],
  "Lakukan rotasi tanaman, populasi cenderung tinggi setelah lahan berumput atau bera lama.": [
    "Rotate crops; numbers tend to be high after grassland or long fallow.",
    "돌려짓기를 합니다. 풀밭이나 오래 묵힌 땅 다음에는 밀도가 높아지기 쉽습니다.",
  ],
  "Olah tanah beberapa kali sebelum tanam.": ["Till the soil several times before planting.", "심기 전에 여러 번 흙을 갈아 줍니다."],
  "Pasang umpan potongan umbi di dalam tanah untuk memantau keberadaan larva.": [
    "Bury pieces of tuber as bait to check whether larvae are present.",
    "덩이줄기 조각을 땅에 묻어 유충이 있는지 확인합니다.",
  ],

  // ---------------- Catatan keandalan kelas ----------------
  "Pada data uji, kedua contoh kelas ini tidak terdeteksi oleh YOLO11l.": [
    "In the test data, YOLO11l missed both examples of this class.",
    "시험 데이터에서 YOLO11l은 이 종류의 두 사례를 모두 놓쳤습니다.",
  ],
  "Termasuk lima kelas dengan AP50 terendah lintas model.": ["One of the five classes with the lowest AP50 across models.", "모델 전체에서 AP50이 가장 낮은 5개 종류 중 하나입니다."],
  "Kelas dengan contoh uji terbanyak (45). Koloni rapat membuat sebagian individu tidak terhitung terpisah.": [
    "The class with the most test examples (45). Dense colonies mean some individuals are not counted separately.",
    "시험 사례가 가장 많은 종류(45개)입니다. 무리가 빽빽해 일부 개체는 따로 세어지지 않습니다.",
  ],
  "Ulat tanah besar sering terprediksi sebagai kelas ini (7 kali di matriks kebingungan).": [
    "Large cutworm is often predicted as this class (7 times in the confusion matrix).",
    "큰거세미나방이 이 종류로 자주 예측됩니다(혼동 행렬에서 7회).",
  ],
  "Pasangan kelas yang paling sering tertukar: terprediksi sebagai Ulat tanah (potong hitam) 7 kali.": [
    "The most frequently confused pair: predicted as Black cutworm 7 times.",
    "가장 자주 혼동되는 쌍으로, 검거세미밤나방으로 7회 예측되었습니다.",
  ],
  "AP50 rata-rata lintas model 0, kelas paling lemah pada evaluasi.": ["Average AP50 across models is 0, the weakest class in the evaluation.", "모델 평균 AP50이 0으로, 평가에서 가장 약한 종류입니다."],
  "Kelas bawang masih umum (IP102), sehingga keyakinan cenderung lebih rendah.": [
    "Shallot classes are still general (IP102), so confidence tends to be lower.",
    "샬롯 해충 종류는 아직 일반적인 IP102 분류여서 신뢰도가 낮은 편입니다.",
  ],

  // ---------------- Panduan lapangan per kelompok ----------------
  "Pangkal batang padi dekat permukaan air. Sibak rumpun dan ketuk pelan, wereng akan berloncatan.": [
    "The base of rice stems near the water. Part the clump and tap gently; planthoppers will jump out.",
    "물 표면 가까운 벼 줄기 밑동입니다. 포기를 헤치고 살짝 두드리면 멸구가 튀어 오릅니다.",
  ],
  "Pagi hari, minimal seminggu sekali sejak tanaman muda.": ["In the morning, at least once a week from the young plant stage.", "어린 모 시기부터 적어도 일주일에 한 번, 아침에 살핍니다."],
  "Laba-laba serigala dan kepik predator. Hindari semprot dini agar mereka tidak ikut mati.": [
    "Wolf spiders and predatory bugs. Avoid early spraying so they are not killed too.",
    "늑대거미와 포식성 노린재입니다. 이들이 함께 죽지 않도록 이른 방제는 피하세요.",
  ],
  "Jumlah wereng terus naik dari pemeriksaan ke pemeriksaan, atau mulai ada tanaman menguning mengering melingkar.": [
    "Planthopper numbers keep rising from check to check, or circular patches of yellowing, drying plants appear.",
    "확인할 때마다 멸구 수가 계속 늘거나, 원형으로 누렇게 말라 가는 포기가 보이기 시작할 때입니다.",
  ],
  "Ujung daun (kelompok telur), pucuk tengah yang mati, dan lubang kecil di batang.": [
    "Leaf tips (egg masses), dead central shoots, and small holes in stems.",
    "잎끝(알 덩어리), 죽은 가운데 순, 줄기의 작은 구멍을 살핍니다.",
  ],
  "Saat tanaman muda dan menjelang bunting, ngengat aktif di malam hari.": [
    "During the young stage and just before booting; moths are active at night.",
    "어린 시기와 이삭 배기 직전에 살핍니다. 나방은 밤에 활동합니다.",
  ],
  "Tawon parasitoid telur (Trichogramma) dan laba-laba.": ["Egg parasitoid wasps (Trichogramma) and spiders.", "알 기생벌(트리코그라마)과 거미입니다."],
  "Banyak kelompok telur di daun, atau pucuk mati (sundep) mulai menyebar.": [
    "Many egg masses on leaves, or dead hearts start to spread.",
    "잎에 알 덩어리가 많거나 심고 증상이 퍼지기 시작할 때입니다.",
  ],
  "Daun yang tergulung, berlubang, atau habis dari tepi. Buka gulungan daun untuk melihat ulat.": [
    "Rolled, holed, or edge-eaten leaves. Unroll leaves to find the caterpillars.",
    "말리거나 구멍 나거나 가장자리가 먹힌 잎입니다. 말린 잎을 펼쳐 애벌레를 찾습니다.",
  ],
  "Pagi atau sore. Ulat grayak lebih aktif di malam hari.": ["Morning or evening. Armyworms are more active at night.", "아침이나 저녁에 살핍니다. 멸강나방 애벌레는 밤에 더 활발합니다."],
  "Tawon parasitoid, burung, dan kepik predator.": ["Parasitoid wasps, birds, and predatory bugs.", "기생벌, 새, 포식성 노린재입니다."],
  "Kerusakan daun makin luas dalam beberapa hari, atau ulat terlihat bergerombol.": [
    "Leaf damage spreads within a few days, or caterpillars are seen in groups.",
    "며칠 사이에 잎 피해가 넓어지거나 애벌레가 무리 지어 보일 때입니다.",
  ],
  "Daun muda yang baru membuka dan pucuk anakan.": ["Newly opened young leaves and tiller shoots.", "새로 펼쳐진 어린 잎과 새끼 줄기의 순입니다."],
  "Fase persemaian sampai anakan maksimum.": ["From the nursery stage to maximum tillering.", "못자리부터 최고 분얼기까지입니다."],
  "Tawon parasitoid dan laba-laba.": ["Parasitoid wasps and spiders.", "기생벌과 거미입니다."],
  "Banyak anakan dengan daun rusak atau berubah bentuk.": ["Many tillers with damaged or deformed leaves.", "잎이 손상되거나 모양이 변한 새끼 줄기가 많을 때입니다."],
  "Daun dengan goresan memanjang, dan akar pada tanaman yang pertumbuhannya tertinggal.": [
    "Leaves with long scratches, and roots of plants that lag in growth.",
    "길게 긁힌 잎과, 생육이 뒤처진 포기의 뿌리를 살핍니다.",
  ],
  "Awal tanam di lahan tergenang.": ["Early after planting in flooded fields.", "물 댄 논에서 심은 직후입니다."],
  "Burung, katak, dan ikan di lahan sawah.": ["Birds, frogs, and fish in the paddy.", "논의 새, 개구리, 물고기입니다."],
  "Banyak daun bergores dan tanaman muda tampak kerdil.": ["Many scratched leaves and young plants look stunted.", "긁힌 잎이 많고 어린 포기가 왜소해 보일 때입니다."],
  "Lipatan dan pangkal daun. Ketuk daun di atas kertas putih untuk melihat serangga kecil yang jatuh.": [
    "Leaf folds and bases. Tap leaves over white paper to see the tiny insects fall.",
    "잎 접힌 곳과 밑부분입니다. 흰 종이 위에서 잎을 두드리면 떨어지는 작은 벌레가 보입니다.",
  ],
  "Musim kemarau, saat udara panas dan kering.": ["In the dry season, when it is hot and dry.", "덥고 건조한 건기에 살핍니다."],
  "Kepik predator kecil (Orius) dan tungau predator.": ["Minute pirate bugs (Orius) and predatory mites.", "애꽃노린재(오리우스)와 포식성 응애입니다."],
  "Bercak keperakan meluas dan ujung daun mulai mengering.": ["Silvery flecks spread and leaf tips start drying.", "은빛 반점이 넓어지고 잎끝이 마르기 시작할 때입니다."],
  "Pinggir petak, saluran air, dan pematang. Cari juga telur merah muda di batang.": [
    "Plot edges, water channels, and bunds. Also look for pink eggs on stems.",
    "논 가장자리, 물길, 논둑을 살피고 줄기의 분홍색 알도 찾습니다.",
  ],
  "Pagi dan sore, terutama 2 minggu pertama setelah tanam.": ["Morning and evening, especially in the first 2 weeks after planting.", "특히 심은 뒤 첫 2주 동안 아침과 저녁에 살핍니다."],
  "Itik yang digembalakan setelah tanaman cukup besar.": ["Ducks let into the field once plants are big enough.", "포기가 충분히 자란 뒤 논에 풀어 놓은 오리입니다."],
  "Bibit hilang atau terpotong, dan telur merah muda mudah ditemukan.": ["Seedlings disappear or are cut, and pink eggs are easy to find.", "모가 사라지거나 잘리고 분홍색 알이 쉽게 보일 때입니다."],
  "Pucuk, balik daun, dan bunga jantan jagung. Cari juga semut yang naik turun batang.": [
    "Shoots, leaf undersides, and corn tassels. Also look for ants running up and down the stalk.",
    "순, 잎 뒷면, 옥수수 수꽃을 살피고 줄기를 오르내리는 개미도 찾습니다.",
  ],
  "Saat cuaca kering dan menjelang berbunga.": ["In dry weather and just before flowering.", "건조할 때와 꽃 피기 직전에 살핍니다."],
  "Kumbang koksi (kepik bulat berbintik), larva lalat bunga, dan tawon parasitoid.": [
    "Ladybirds (round spotted beetles), hoverfly larvae, and parasitoid wasps.",
    "무당벌레(점박이 둥근 딱정벌레), 꽃등에 유충, 기생벌입니다.",
  ],
  "Koloni meluas ke banyak tanaman dan daun mulai keriting atau menghitam.": [
    "Colonies spread to many plants and leaves start curling or turning black.",
    "무리가 여러 포기로 퍼지고 잎이 오그라들거나 검게 변하기 시작할 때입니다.",
  ],
  "Tanah di sekitar tanaman yang rebah. Gali dangkal 2 sampai 5 cm, ulat bersembunyi menggulung.": [
    "Soil around fallen plants. Dig 2 to 5 cm deep; caterpillars hide curled up.",
    "쓰러진 포기 주변 흙을 2~5cm 얕게 파 보면 애벌레가 몸을 만 채 숨어 있습니다.",
  ],
  "Pagi sekali atau malam, pada 2 sampai 4 minggu pertama setelah tanam.": [
    "Very early morning or at night, during the first 2 to 4 weeks after planting.",
    "심은 뒤 2~4주 동안 이른 아침이나 밤에 살핍니다.",
  ],
  "Burung, kumbang tanah, dan tawon parasitoid.": ["Birds, ground beetles, and parasitoid wasps.", "새, 딱정벌레(먼지벌레), 기생벌입니다."],
  "Setiap pagi ada tanaman muda baru yang rebah terpotong.": ["Every morning new young plants are found cut and fallen.", "매일 아침 새로 잘려 쓰러진 어린 포기가 보일 때입니다."],
  "Tanah di sekitar akar atau umbi tanaman yang layu. Gali dan periksa akar.": [
    "Soil around the roots or bulbs of wilting plants. Dig and inspect the roots.",
    "시든 포기의 뿌리나 알뿌리 주변 흙을 파서 뿌리를 살핍니다.",
  ],
  "Saat mengolah tanah dan ketika tanaman layu tanpa sebab jelas.": ["While tilling, and when plants wilt for no clear reason.", "흙을 갈 때와 뚜렷한 이유 없이 포기가 시들 때 살핍니다."],
  "Burung yang mengikuti bajak, dan jamur Metarhizium di tanah.": ["Birds that follow the plough, and Metarhizium fungus in the soil.", "쟁기를 따라다니는 새와 흙 속 메타리지움 곰팡이입니다."],
  "Tanaman layu berkelompok dan mudah dicabut karena akarnya habis.": [
    "Plants wilt in patches and pull out easily because the roots are eaten.",
    "포기가 무더기로 시들고 뿌리가 먹혀 쉽게 뽑힐 때입니다.",
  ],

  // ---------------- Cara alami dan catatan pestisida ----------------
  "Ekstrak daun pepaya dan daun sirsak": ["Papaya and soursop leaf extract", "파파야 잎·사워솝 잎 추출물"],
  "Pestisida nabati untuk hama putih palsu.": ["Botanical pesticide for the rice leaf roller.", "혹명나방용 식물성 농약입니다."],
  "Ekstrak daun sirsak": ["Soursop leaf extract", "사워솝 잎 추출물"],
  "Diuji pada ulat grayak Spodoptera frugiperda (kerabat dekat), belum diuji langsung pada Naranga.": [
    "Tested on the fall armyworm Spodoptera frugiperda (a close relative), not yet tested directly on Naranga.",
    "가까운 친척인 열대거세미나방(Spodoptera frugiperda)에서 시험되었으며, 벼애나방에서는 아직 직접 시험되지 않았습니다.",
  ],
  "Kedua bahan kimia di tabel mengandung metomil, yang dilarang untuk padi. Praktis belum ada pilihan kimia yang boleh dipakai untuk hama ini.": [
    "Both chemicals in the table contain methomyl, which is banned for rice. In practice there is no permitted chemical option for this pest yet.",
    "표의 두 약제 모두 벼에 금지된 메토밀을 포함합니다. 사실상 이 해충에 쓸 수 있는 화학 약제가 아직 없습니다.",
  ],
  "Nematoda entomopatogen": ["Entomopathogenic nematodes", "곤충병원성 선충"],
  "Pengendalian hayati. Diuji pada lalat bibit jagung Atherigona (genus sama).": [
    "Biological control. Tested on the corn seedling fly Atherigona (same genus).",
    "생물적 방제입니다. 같은 속인 옥수수 씨앗파리(Atherigona)에서 시험되었습니다.",
  ],
  "Dokumen menulis nama ilmiah Chlorops/Atherigona oryzae, sedangkan glosarium model memakai Hydrellia sasakii.": [
    "The document gives the scientific name Chlorops/Atherigona oryzae, while the model glossary uses Hydrellia sasakii.",
    "문서에는 학명이 Chlorops/Atherigona oryzae로, 모델 용어집에는 Hydrellia sasakii로 적혀 있습니다.",
  ],
  "Batang tembakau": ["Tobacco stems", "담배 줄기"],
  "Dimanfaatkan petani sebagai pestisida nabati penggerek batang padi.": [
    "Used by farmers as a botanical pesticide against rice stem borers.",
    "농민들이 벼 줄기 천공 해충에 쓰는 식물성 농약입니다.",
  ],
  "Ekstrak daging buah maja (konsentrasi 60%)": ["Bael fruit pulp extract (60% concentration)", "벨 열매 과육 추출물(농도 60%)"],
  "Diuji pada penggerek batang padi kuning.": ["Tested on the yellow rice borer.", "삼화명나방에서 시험되었습니다."],
  "Belum ditemukan sumber pestisida nabati terverifikasi untuk hama ini.": [
    "No verified botanical pesticide source has been found for this pest yet.",
    "이 해충에 대해 검증된 식물성 농약 자료가 아직 없습니다.",
  ],
  "Ekstrak daun mimba 30%": ["Neem leaf extract 30%", "님 잎 추출물 30%"],
  "Diuji pada wereng batang coklat.": ["Tested on the brown planthopper.", "벼멸구에서 시험되었습니다."],
  "Ekstrak daun mimba": ["Neem leaf extract", "님 잎 추출물"],
  "Diuji pada wereng batang coklat (sama-sama wereng), belum diuji khusus pada hama ini.": [
    "Tested on the brown planthopper (also a planthopper), not yet tested on this pest specifically.",
    "같은 멸구류인 벼멸구에서 시험되었으며, 이 해충에서는 아직 따로 시험되지 않았습니다.",
  ],
  "Daftar 19 bahan lain di dokumen bersumber dari pesticideresistance.org, yaitu basis data laporan KEKEBALAN hama. Artinya hama ini pernah tercatat kebal terhadap bahan tersebut, sehingga tidak ditampilkan sebagai rekomendasi.": [
    "The other 19 ingredients in the document come from pesticideresistance.org, a database of pest RESISTANCE reports. This pest has been recorded as resistant to them, so they are not shown as recommendations.",
    "문서의 나머지 19개 성분은 해충 '저항성' 보고 데이터베이스인 pesticideresistance.org에서 나왔습니다. 이 해충이 해당 성분에 저항성을 보인 기록이 있어 추천으로 표시하지 않습니다.",
  ],
  "Ekstrak daun mimba 20%": ["Neem leaf extract 20%", "님 잎 추출물 20%"],
  "Diuji pada wereng hijau.": ["Tested on the green rice leafhopper.", "끝동매미충에서 시험되었습니다."],
  "Ekstrak daun limau kuit dan daun gelinggang": ["Kaffir lime leaf and candle bush leaf extract", "카피르라임 잎·촛대초 잎 추출물"],
  "Ekstrak daun mimba (azadiraktin)": ["Neem leaf extract (azadirachtin)", "님 잎 추출물(아자디락틴)"],
  "Bahan aktif nabati yang juga tercantum di tabel kimia.": ["A plant-based active ingredient that is also listed in the chemical table.", "화학 약제 표에도 있는 식물 유래 유효성분입니다."],
  "Serbuk biji pinang muda + daun pepaya": ["Young areca nut powder + papaya leaves", "어린 빈랑 열매 가루 + 파파야 잎"],
  "Diuji pada keong mas di tanaman padi.": ["Tested on golden apple snails in rice.", "벼 논의 왕우렁이에서 시험되었습니다."],
  "Serbuk atau ekstrak biji pinang": ["Areca nut powder or extract", "빈랑 열매 가루 또는 추출물"],
  "Ekstrak kulit buah jengkol": ["Jengkol fruit peel extract", "젱콜 열매 껍질 추출물"],
  "Ekstrak umbi bawang": ["Onion bulb extract", "양파 알뿌리 추출물"],
  "Uji in vitro pada penggerek batang jagung.": ["Lab (in vitro) test on the corn borer.", "조명나방에 대한 실험실(시험관) 시험입니다."],
  "Pestisida nabati penggerek batang jagung": ["Botanical pesticide for the corn borer", "조명나방용 식물성 농약"],
  "Penerapan di petani jagung Karo.": ["Applied by corn farmers in Karo.", "카로 지역 옥수수 농가에서 적용되었습니다."],
  "Ekstrak daun kemangi": ["Lemon basil leaf extract", "레몬바질 잎 추출물"],
  "Mortalitas tertinggi 77,5% pada ulat grayak jagung.": ["Highest mortality 77.5% on corn armyworms.", "옥수수 거세미나방류에서 최고 치사율 77.5%를 보였습니다."],
  "Ekstrak daun gamal": ["Gliricidia leaf extract", "글리리시디아 잎 추출물"],
  "Diuji pada ulat grayak jagung.": ["Tested on corn armyworms.", "옥수수 거세미나방류에서 시험되었습니다."],
  "Ekstrak rimpang kencur": ["Aromatic ginger (kencur) rhizome extract", "켄쿠르(생강과) 뿌리줄기 추출물"],
  "Dokumen merujuk Spodoptera frugiperda (ulat grayak jagung), sedangkan kelas model adalah Mythimna separata. Keduanya ulat pemakan daun jagung, tetapi spesiesnya berbeda.": [
    "The document refers to Spodoptera frugiperda (fall armyworm), while the model class is Mythimna separata. Both eat corn leaves, but they are different species.",
    "문서는 열대거세미나방(Spodoptera frugiperda)을 다루지만 모델의 종류는 멸강나방(Mythimna separata)입니다. 둘 다 옥수수 잎을 먹지만 다른 종입니다.",
  ],
  "Ekstrak daun pepaya": ["Papaya leaf extract", "파파야 잎 추출물"],
  "Diuji pada kutu daun Aphis gossypii di terung (kerabat dekat).": [
    "Tested on the aphid Aphis gossypii on eggplant (a close relative).",
    "가까운 친척인 목화진딧물(Aphis gossypii)을 가지에서 시험했습니다.",
  ],
  "Diuji pada kutu daun Aphis gossypii (kerabat dekat).": ["Tested on the aphid Aphis gossypii (a close relative).", "가까운 친척인 목화진딧물(Aphis gossypii)에서 시험되었습니다."],
  "Perangkap lampu": ["Light trap", "등화 트랩"],
  "Pengendalian mekanis, tanpa bahan kimia. Menarik serangga dewasa yang aktif di malam hari.": [
    "Mechanical control with no chemicals. Attracts adult insects that are active at night.",
    "화학 약제 없는 물리적 방제입니다. 밤에 활동하는 성충을 유인합니다.",
  ],
  "Satu tabel dipakai bersama untuk tiga jenis ulat tanah (hitam, besar, kuning).": [
    "One table is shared by the three cutworm types (black, large, yellow).",
    "세 가지 거세미류(검은, 큰, 노란)가 같은 표를 함께 씁니다.",
  ],
  "Sumber kedua produk adalah halaman produk untuk ulat, bukan uret kawat. Efektivitasnya pada uret kawat perlu dikonfirmasi ke PPL.": [
    "Both product sources are pages for caterpillars, not wireworms. Their effect on wireworms should be confirmed with an extension officer.",
    "두 제품의 출처는 방아벌레 유충이 아닌 나방 애벌레용 페이지입니다. 방아벌레 유충에 대한 효과는 지도사에게 확인해야 합니다.",
  ],
  "Campuran bawang putih, bawang merah, dan bubuk cabai": ["Mix of garlic, shallot, and chilli powder", "마늘·샬롯·고춧가루 혼합액"],
  "Efek pengusir (repellent) dan penghambat makan.": ["Repellent and anti-feeding effect.", "기피 효과와 섭식 억제 효과가 있습니다."],
  "Ekstrak daun paitan (Tithonia)": ["Mexican sunflower (Tithonia) leaf extract", "멕시칸해바라기(티토니아) 잎 추출물"],
  "Diuji pada thrips di tanaman kentang.": ["Tested on thrips on potato.", "감자의 총채벌레에서 시험되었습니다."],
  "Ekoenzim dan bahan nabati lain (serai, tembakau, bawang putih, maja)": [
    "Eco-enzyme and other botanicals (lemongrass, tobacco, garlic, bael)",
    "에코엔자임과 기타 식물 재료(레몬그라스, 담배, 마늘, 벨 열매)",
  ],
  "Diuji pada budidaya bawang merah. Hasil efektivitasnya perlu dicek di jurnal.": [
    "Tested in shallot cultivation. Its effectiveness should be checked in the journal.",
    "샬롯 재배에서 시험되었습니다. 효과는 논문에서 확인이 필요합니다.",
  ],
  "Ulat bawang belum termasuk 24 kelas yang dikenali model, dan bukan wireworm (wireworm adalah larva kumbang klik).": [
    "The beet armyworm is not one of the 24 classes the model recognises, and it is not a wireworm (wireworms are click beetle larvae).",
    "파밤나방은 모델이 인식하는 24종에 포함되지 않으며, 방아벌레 유충(wireworm)이 아닙니다.",
  ],
  "Masih boleh untuk bawang merah, cabai, kedelai, jagung, kapas, sawit, teh, semangka, kubis.": [
    "Still allowed for shallot, chilli, soybean, corn, cotton, oil palm, tea, watermelon, cabbage.",
    "샬롯, 고추, 콩, 옥수수, 목화, 기름야자, 차, 수박, 양배추에는 아직 사용할 수 있습니다.",
  ],
  "Dilarang khusus di padi.": ["Banned for rice only.", "벼에만 사용이 금지되어 있습니다."],
  "Dilarang untuk semua tanaman. Golongan organoklorin (POPs) setara DDT, sangat beracun dan dapat mengganggu hormon, kekebalan, reproduksi, hingga memicu kanker.": [
    "Banned for all crops. An organochlorine (POPs) like DDT: highly toxic and can disrupt hormones, immunity, and reproduction, and even cause cancer.",
    "모든 작물에 금지되어 있습니다. DDT와 같은 유기염소계(잔류성 유기오염물질)로 독성이 매우 강하고 호르몬, 면역, 생식에 해를 주며 암을 일으킬 수 있습니다.",
  ],

  // ---------------- Model ----------------
  "Model utama": ["Main model", "주 모델"],
  "mAP50 tertinggi dan paling jeli menemukan hama (recall 85%). Dipilih notebook sebagai model utama.": [
    "Highest mAP50 and the best at finding pests (85% recall). Chosen in the notebook as the main model.",
    "mAP50이 가장 높고 해충을 가장 잘 찾아냅니다(재현율 85%). 노트북에서 주 모델로 선정되었습니다.",
  ],
  "Pembanding": ["Comparison", "비교용"],
  "F1 bootstrap sedikit lebih tinggi pada ambang 35%, dengan selisih val ke uji paling kecil (paling konsisten).": [
    "Slightly higher bootstrap F1 at the 35% threshold, with the smallest validation-to-test gap (most consistent).",
    "35% 임계값에서 부트스트랩 F1이 약간 더 높고, 검증과 시험 사이 차이가 가장 작습니다(가장 일관적).",
  ],
  "Paling ringan": ["Lightest", "가장 가벼움"],
  "Parameter dan komputasi paling kecil sehingga paling cepat, dengan akurasi sedikit di bawah YOLO11l.": [
    "Fewest parameters and least compute, so it is the fastest, with accuracy slightly below YOLO11l.",
    "파라미터와 연산량이 가장 적어 가장 빠르며, 정확도는 YOLO11l보다 약간 낮습니다.",
  ],

  // ---------------- Stadium ----------------
  "Nimfa instar I": ["Nymph, 1st instar", "약충 1령"],
  "Nimfa instar II": ["Nymph, 2nd instar", "약충 2령"],
  "Nimfa instar III": ["Nymph, 3rd instar", "약충 3령"],
  "Nimfa instar IV": ["Nymph, 4th instar", "약충 4령"],
  "Nimfa instar V": ["Nymph, 5th instar", "약충 5령"],
  "Dewasa betina bersayap pendek": ["Short-winged adult female", "단시형 암컷 성충"],
  "Larva instar I": ["Larva, 1st instar", "유충 1령"],
  "Larva instar II": ["Larva, 2nd instar", "유충 2령"],
  "Larva instar V": ["Larva, 5th instar", "유충 5령"],
  Pupa: ["Pupa", "번데기"],
  "Dewasa betina": ["Adult female", "암컷 성충"],
  "Baru menetas, putih seperti kapas": ["Just hatched, cotton-white", "막 부화해 솜처럼 하얗습니다"],
  "Membesar, bakal sayap mulai terlihat": ["Growing, wing buds starting to show", "커지면서 날개싹이 보이기 시작합니다"],
  "Bakal sayap makin berkembang": ["Wing buds developing further", "날개싹이 더 자랍니다"],
  "Bentuk tubuh makin mirip dewasa": ["Body shape closer to the adult", "몸 모양이 성충에 가까워집니다"],
  "Instar terakhir sebelum dewasa": ["Last instar before adulthood", "성충이 되기 전 마지막 령입니다"],
  "Siap bertelur, pra-oviposisi sekitar 3 hari": ["Ready to lay eggs, pre-oviposition about 3 days", "산란 준비 단계로, 산란 전 기간은 약 3일입니다"],
  "Baru menetas, putih hampir transparan": ["Just hatched, white and almost transparent", "막 부화해 거의 투명한 흰색입니다"],
  "Larva akhir, fase paling merusak batang": ["Late larva, the most stem-damaging stage", "노숙 유충으로 줄기 피해가 가장 큰 시기입니다"],
  "Pupa cokelat": ["Brown pupa", "갈색 번데기"],
  "Putih semi-transparan, mulai makan segera": ["Semi-transparent white, starts feeding right away", "반투명한 흰색이며 바로 먹기 시작합니다"],
  "Kuning, paling melimpah di lapangan": ["Yellow, the most abundant stage in the field", "노란색이며 들에서 가장 많이 보이는 시기입니다"],
  "Umumnya bereproduksi tanpa pejantan": ["Usually reproduces without males", "대개 수컷 없이 번식합니다"],
  "Data_Hama_AIGRA.csv, kelompok brown plant hopper (literatur entomologi)": [
    "Data_Hama_AIGRA.csv, brown planthopper group (entomology literature)",
    "Data_Hama_AIGRA.csv, 벼멸구 항목(곤충학 문헌)",
  ],
  "Data_Hama_AIGRA.csv, kelompok corn borer. Batas bawah ukuran larva instar V adalah perkiraan karena data sumber hanya mencantumkan batas atas 25 mm.": [
    "Data_Hama_AIGRA.csv, corn borer group. The lower size limit for 5th-instar larvae is estimated because the source only lists the upper limit of 25 mm.",
    "Data_Hama_AIGRA.csv, 조명나방 항목. 원자료에 상한 25mm만 있어 5령 유충 크기의 하한은 추정치입니다.",
  ],
  "Data_Hama_AIGRA.csv, kelompok thrips bawang": ["Data_Hama_AIGRA.csv, onion thrips group", "Data_Hama_AIGRA.csv, 파총채벌레 항목"],

  // ---------------- Tahap proyek ----------------
  "Persiapan data hama": ["Pest data preparation", "해충 데이터 준비"],
  "Ribuan foto hama dikumpulkan dan dilabeli supaya sistem belajar mengenali 24 jenis hama.": [
    "Thousands of pest photos were collected and labelled so the system could learn 24 pest types.",
    "시스템이 24종의 해충을 배우도록 수천 장의 해충 사진을 모으고 표시했습니다.",
  ],
  "Dataset IP102, 24 kelas, dipetakan ke padi, jagung, bawang.": ["IP102 dataset, 24 classes, mapped to rice, corn, shallot.", "IP102 데이터셋, 24종, 벼·옥수수·샬롯에 대응."],
  "Pelatihan model pengenal hama": ["Training the pest recognition model", "해충 인식 모델 학습"],
  "Tiga model dibandingkan, lalu dipilih yang paling jeli menemukan hama.": [
    "Three models were compared, and the one best at finding pests was chosen.",
    "세 모델을 비교해 해충을 가장 잘 찾는 모델을 골랐습니다.",
  ],
  "YOLOv8m, YOLO11m, YOLO11l dilatih dan dievaluasi, YOLO11l terbaik dengan mAP50 0,794.": [
    "YOLOv8m, YOLO11m, YOLO11l trained and evaluated; YOLO11l best with mAP50 0.794.",
    "YOLOv8m, YOLO11m, YOLO11l 학습·평가, YOLO11l이 mAP50 0.794로 최고.",
  ],
  "Layanan deteksi (API)": ["Detection service (API)", "탐지 서비스(API)"],
  "Foto dari perangkap dikirim ke sistem dan dijawab dengan jenis hama beserta saran obatnya.": [
    "Trap photos are sent to the system, which replies with the pest type and control advice.",
    "트랩 사진을 시스템에 보내면 해충 종류와 방제 안내를 돌려줍니다.",
  ],
  "FastAPI dengan endpoint /health, /models, /pestisida, /detect, teruji lokal.": [
    "FastAPI with /health, /models, /pestisida, /detect endpoints, tested locally.",
    "/health, /models, /pestisida, /detect 엔드포인트를 갖춘 FastAPI, 로컬 시험 완료.",
  ],
  "Antarmuka web AIO PESTGUARD": ["AIO PESTGUARD web interface", "AIO PESTGUARD 웹 화면"],
  "Tampilan yang sedang Bapak dan Ibu lihat ini. Beranda dan riwayat masih memakai data contoh.": [
    "The screen you are looking at now. Home and history still use sample data.",
    "지금 보고 계신 화면입니다. 홈과 기록은 아직 예시 데이터를 씁니다.",
  ],
  "Next.js, React, Tailwind. Kontrak data sama dengan API asli.": ["Next.js, React, Tailwind. Same data contract as the real API.", "Next.js, React, Tailwind. 실제 API와 같은 데이터 구조."],
  "Cek hama dari foto di browser": ["In-browser pest check from photos", "브라우저에서 사진으로 해충 확인"],
  "Model pengenal hama asli bisa dicoba langsung di ponsel atau laptop, tanpa kirim foto ke server.": [
    "The real pest recognition model runs directly on a phone or laptop, without sending photos to a server.",
    "실제 해충 인식 모델을 사진을 서버로 보내지 않고 휴대폰이나 노트북에서 바로 써 볼 수 있습니다.",
  ],
  "Model ONNX (YOLO11l, YOLOv8m, YOLO11m) dijalankan dengan ONNX Runtime Web, pascaproses NMS meniru Ultralytics.": [
    "ONNX models (YOLO11l, YOLOv8m, YOLO11m) run with ONNX Runtime Web; NMS post-processing mirrors Ultralytics.",
    "ONNX 모델(YOLO11l, YOLOv8m, YOLO11m)을 ONNX Runtime Web으로 실행하며, NMS 후처리는 Ultralytics와 같습니다.",
  ],
  "Kalibrasi ukuran piksel ke sentimeter": ["Pixel-to-centimetre size calibration", "픽셀-센티미터 크기 보정"],
  "Supaya ukuran hama bisa dihitung dengan benar, sehingga umur hama bisa diperkirakan.": [
    "So pest size can be measured correctly and pest age can be estimated.",
    "해충 크기를 정확히 재서 발육 단계를 추정하기 위함입니다.",
  ],
  "Memakai dimensi wadah perangkap sebagai acuan skala.": ["Uses the trap container dimensions as the scale reference.", "트랩 용기 크기를 기준 척도로 씁니다."],
  "Estimasi stadium dan waktu bertelur": ["Life stage and egg-laying time estimate", "발육 단계와 산란 시기 추정"],
  "Sistem memperkirakan hama masih muda atau sudah dewasa, dan kapan mulai bertelur.": [
    "The system estimates whether pests are young or adult, and when they will start laying eggs.",
    "해충이 어린지 성충인지, 언제 알을 낳기 시작할지 추정합니다.",
  ],
  "Data_Hama_AIGRA.csv, 213 baris referensi biologis, belum diimplementasi di backend.": [
    "Data_Hama_AIGRA.csv, 213 rows of biological reference, not yet implemented in the backend.",
    "Data_Hama_AIGRA.csv, 생물학 참고 자료 213행, 백엔드에는 아직 미구현.",
  ],
  "Uji lapangan dengan perangkap asli": ["Field test with real traps", "실제 트랩 현장 시험"],
  "Alat dipasang di lahan sungguhan untuk menguji keakuratan.": ["Devices are installed in real fields to test accuracy.", "정확도를 시험하기 위해 실제 논밭에 장치를 설치합니다."],
  "Citra asli perangkap, uji ketahanan terhadap cahaya dan gangguan citra.": [
    "Real trap images, robustness tests against lighting and image noise.",
    "실제 트랩 이미지로 조명과 영상 잡음에 대한 견고성을 시험합니다.",
  ],

  // ---------------- Lokasi lahan contoh ----------------
  "Sawah Padi Wanasari, Brebes": ["Wanasari rice paddy, Brebes", "브레베스 와나사리 논"],
  "Kebun Jagung Larangan, Brebes": ["Larangan corn field, Brebes", "브레베스 라랑안 옥수수밭"],
  "Kebun Bawang Bulakamba, Brebes": ["Bulakamba shallot field, Brebes", "브레베스 불라캄바 샬롯밭"],
};
