import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Checkout.css";

const locationData = {
  Central: {
    Kandy: ["Akurana", "Aladeniya", "Alawatugoda", "Aludeniya", "Ambatenna", "Ampitiya", "Angunawala", "Aniwatta", "Ankubura", "Ankumbura", "Aruppola", "Atabage", "Balagolla", "Balana", "Batugoda", "Bawlana", "Bopana", "Bowala", "Bowalawatta", "Dangolla", "Danthure", "Daulagala", "Dedunupitiya", "Dehianga", "Deiyannewela", "Dekinda", "Deltota", "Digana", "Dodamwala", "Dolosbage", "Doluwa", "Doragamuwa", "Eriyagama", "Etulgama", "Galaboda", "Galagedara", "Galaha", "Galhinna", "Gampola", "Gannoruwa", "Gelioya", "Getambe", "Godamunna", "Gonagantenna", "Greenwood", "Guhagoda", "Gunnepana", "Gurudeniya", "Haguranketha", "Halloluwa", "Handaganawa", "Handessa", "Hanguranketha", "Haragama", "Harankahawa", "Harispattuwa", "Hasalaka", "Hatharaliyadda", "Hedeniya", "Heerassagala", "Hewaheta", "Hijrapura", "Hindagala", "Hondiyadeniya", "Hunnasgiriya", "Imbulpitiya", "Inguru Oya", "Jambugahapitiya", "Kadugannawa", "Kahataliyadda", "Kalugala", "Kandy Town", "Kapuliyadde", "Karandagolla", "Katugastota", "Kengalla", "Ketakumbura", "Kiribathkumbura", "Kobbagala", "Kolongahawatte", "Kolongoda", "Kulugammana", "Kumbukkandura", "Kundasale", "Kurunduwatta", "Leemagahakotuwa", "Lewella", "Lunuketiya Maditta", "Madawala", "Madugalla", "Madulkele", "Mahadoraliyadda", "Mahaiyawa", "Mahakanda", "Mahamedagama", "Mailapitiya", "Makuldeniya", "Mallanda", "Mandaram Nuwara", "Mapakanda", "Marassana", "Maturata", "Mawatura", "Mawilmada", "Medamahanuwara", "Medawala Harispattuwa", "Meepitiya", "Menikdiwela", "Menikhinne", "Mimure", "Minigamuwa", "Minipe", "Mulgampola", "Muruthalawa", "Naranpanawa", "Nattarampotha", "Nawalapitiya Town", "Nugaliyadda", "Nugawela", "Pallekele", "Pallekotuwa", "Pallethalawinna", "Panwila", "Panwilatenna", "Paradeka", "Pasbage", "Pattitalawa", "Penithudumulla", "Peradeniya", "Pilawala", "Pilimthalawa", "Poholiyadda", "Polgahamula", "Polgolla", "Poramadulla", "Poththapitiya", "Pujapitiya", "Pupuressa", "Pussellawa", "Rajawella", "Rambukpitiya", "Rangala", "Rantembe", "Rathukohodigala", "Rikillagaskada", "Sangarajapura", "Senarathwela", "Soysakale", "Talatuoya", "Teldeniya", "Thalatuoya", "Thawalanthenna", "Thennekubura", "Uda Bowala", "Udahentenna", "Udahingulwala", "Uda Peradeniya", "Udathalawinna", "Udawatta", "Udispattuwa", "Ududumbara", "Uduwa", "Uduwahinna", "Uduwela", "Ulapane", "Ulpothagama", "Unuwinna", "Valapane", "Velamboda", "Wadiyagoda", "Warakawa", "Watadeniya", "Watapuluwa", "Wattappola", "Wattaranthenna", "Wattegama", "Weligalla", "Weligampola", "Wendaruwa", "Weniwalla", "Werellagama", "Wettawa", "Wilanagama", "Yahalatenna", "Yatihalagala"],
    Matale: ["Akuramboda", "Alawatta", "Ambana", "Ataragallewa", "Bambaragaswewa", "Beligamuwa", "Dambulla", "Dankanda", "Devagiriya", "Dewahuwa", "Dullewa", "Dunkolawatta", "Dunuwilapitiya", "Elkaduwa", "Erawula Junction", "Etanawala", "Galewela", "Gammaduwa", "Gangala", "Gangala Puwakpitiya", "Handungamuwa", "Hattota Amuna", "Hettipola", "Illukkumbura", "Imbulgolla", "Inamaluwa", "Kaikawala", "Kalundawa", "Kandalama", "Karagahinna", "Katudeniya", "Kavudupelella", "Kibissa", "Kiwula", "Kongahawela", "Laggala Pallegama", "Leliambe", "Lenadora", "Madawala Ulpotha", "Madipola", "Mahawela", "Mananwatta", "Maraka", "Matale Town", "Melipitiya", "Metihakka", "Millawana", "Muwandeniya", "Nalanda", "Na ula", "Nugagolla", "Opalgala", "Ovilikanda", "Palapathwela", "Pallepola", "Perakanatta", "Pubbiliya", "Ranamuregama", "Rattota", "Selagama", "Sigiriya", "Talagoda Junction", "Talakiriyagama", "Udasgiriya", "Udatenna", "Ukuwela", "Wahacotte", "Walawela", "Wehigala", "Welangahawatte", "Wewalawewa", "Wilgamuwa", "Yatawatta"],
    "Nuwara Eliya": ["Adhikarigama", "Agarapatana", "Ambagamuwa Udabulathgama", "Ambaliyadda", "Ambatalawa", "Ambewela", "Bambarakelle", "Barawardhanaoya", "Bogahawatta", "Bogawantalawa", "Bopattalawa", "Dagampitiya", "Dayagama Bazaar", "Degampitiya", "Denike", "Dikoya", "Dimbulapatana", "Doragala", "Dunukedeniya", "Galketiwala", "Ginigathena", "Gonakele", "Hakgala", "Halgran Oya", "Hangarapitiya", "Hapugastalawa", "Harangalagama", "Harasbedda", "Hatton", "Hawa Eliya", "Hedunuwewa", "Highforest", "Hitigegama", "Idamegama", "Kalaganwatta", "Kandapola", "Katukitula", "Keerthi Bandarapura", "Kelanigama", "Ketaboola", "Kotagala", "Kothmale New Town", "Kotmale", "Kottellena", "Kudagama", "Kumbalgamuwa", "Kumbukwela", "Kurupanawela", "Labookelle", "Labukele", "Landupita", "Laxapana", "Lindula", "Liyanwela", "Madulla", "Magastota", "Maldeniya", "Mandaramnuwara", "Maskeliya", "Maswela", "Mathurata", "Meethalawa", "Mipanawa", "Mipilimana", "Morahela", "Morahenagama", "Munwatta", "Nanuoya", "Nawathispane", "Nildandahinna", "Niyangandora", "Norwood", "Nuwara Eliya", "Nuwara Eliya Town", "Padiyapelella", "Palena", "Patana", "Pitawala", "Pundaluoya", "Pussalamankada", "Radella", "Ragala", "Ramboda", "Rawanagoda", "Rozella", "Rupaha", "Ruwaneliya", "Sadathenna", "Santhipura", "Talawakele", "Teripeha", "Thunhitiyawa", "Udamadura", "Udapussallawa", "Walapane", "Watagoda", "Watagoda Hanspattuwa", "Watawala", "Widulipura", "Wijebahukanda", "Yatimadura"],
  },

  Eastern: {
    Ampara: ["Addalaichenai", "Akkaraipattu", "Ampara Town", "Bakmitiyawa", "Central Camp", "Dadayamtalawa", "Damana", "Damanewela", "Deegawapiya", "Dehiattakandiya", "Digamadulla", "Dorakumbura", "Gonagolla", "Hingurana", "Hulannuge", "Irakkamama", "Kalmunai", "Karativu", "Koknahara", "Kolamanthalawa", "Komari", "Lahugala", "Mahaoya", "Malwatta", "Mangalagama", "Marathamune", "Mawanagama", "Moragahapallama", "Namaloya", "Navithanveli", "Nawamedagama", "Nintavur", "Oluvil", "Padiyathalawa", "Pahalalanda", "Palamunai", "Panama", "Pannalagama", "Periyaneelavanai", "Pottuvil", "Rajagalatenna", "Sainthamaruthu", "Sammanthurai", "Serankada", "Siripura", "Siyambalawewa", "Tempitiya", "Thambiluvil", "Tirukkovil", "Uhana"],
    Batticaloa: ["Ampilanthurai", "Araipattai", "Ayithiyamalai", "Bakiella", "Batticaloa Town", "Cheddipalayam", "Chenkaladi", "Eravur", "Kalkudah", "Kallar", "Kaluwanchikudi", "Kaluwankemy", "Kannankudah", "Karadiyanaru", "Kathiraveli", "Kattankudy", "Kiran", "Kirankulam", "Koddaikallar", "Koddamunai", "Kokkaddichcholai", "Kurukkalmadam", "Mandur", "Mankemi", "Miravodai", "Murakottanchanai", "Navagirinagar", "Navatkadu", "Oddamavadi", "Panichankemi", "Pankudavely", "Periyaporativu", "Periyapullumalai", "Pillaiyaradi", "Puliyanthivu", "Punanai", "Puthukudiyiruppu", "Puthur", "Thannamunai", "Thettativu", "Thikkodai", "Thirupalugamam", "Thuraineelavanai", "Unnichchai", "Vakaneri", "Vakarai", "Valaichenai", "Vantharumoolai", "Vellavely"],
    Trincomalee: ["Agbopura", "Anna Nagar", "Arunagiri Nagar", "Buckmigama", "Chinabay", "Dehiwatte", "Deva Nagar", "Echchilampattai", "Galmetiyawa", "Gomarankadawala", "Kaddaiparichchan", "Kanniya", "Kantale", "Kavaddikudah", "Kiliveddy", "Kinniya", "Kuchchaveli", "Kumburupiddy", "Kurinchakemy", "Lankapatuna", "Linganagar", "Mahadivulwewa", "Maharugiramam", "Mallikativu", "Matikali", "Mawadichchenai", "Mihindapura", "Mullipothana", "Murugapuri", "Mutur", "Neelapola", "Nelsonpura", "Nilaveli", "Nithiyapuri", "Orrs Hill", "Palaiyoothu", "Pankulam", "Rottawewa", "Sampaltivu", "Sampur", "Samudragama", "Serunuwara", "Seruwila", "Sirajnagar", "Somapura", "Tampalakamam", "Thirukadaloor", "Tiriyayi", "Toppur", "Trincomalee Town", "Uppaveli", "Vellamanal", "Wanela"]
  },

  "North Central": {
    Anuradhapura: ["Andiyagala", "Anuradhapura Town", "Awukana", "Dematawewa", "Dunumadalawa", "Elayapattuwa", "Eppawala", "Etaweeragollewa", "Galenbindunuwewa", "Galkadawala", "Galkiriyagama", "Galnewa", "Gambirigaswewa", "Gemunupura", "Gonahaddenawa", "Habarana", "Halmillawetiya", "Halmillewa", "Hidogama", "Horowpothana", "Hurulunikawewa", "Ihalagama", "Ipalogama", "Kahatagasdigiliya", "Kalaoya", "Kalawedi Ulpotha", "Karagahawewa", "Kebithigollawa", "Kekirawa", "Kendewa", "Kirigalwewa", "Madatugama", "Mahabulankulama", "Maha Elagamuwa", "Mahailluppallama", "Mahawilachchiya", "Mailagaswewa", "Maneruwa", "Maradankadawala", "Medawachchiya", "Meegodawewa", "Megodawewa", "Mihintale", "Morakewa", "Nachchaduwa", "Nochchiyagama", "Nuwaragam Palatha", "Padavi Siripura", "Padavi Siritissapura", "Padaviya", "Parakumpura", "Parangiyawadiya", "Parasangahawewa", "Pemaduwa", "Pulmoddai", "Rajanganaya", "Rambewa", "Ranorawa", "Saliyapura", "Siyambalewa", "Talawa", "Tambuttegama", "Telhiriyawa", "Thalawa", "Thambuttegama", "Thanthirimale", "Thirappane", "Tittagonewa", "Udunuwara Colony", "Wahalkada", "Welimuwapotana", "Welioya Project"],
    Polonnaruwa: ["Aluthwewa", "Alutwewa", "Aralangawila", "Aselapura", "Attanakadawala", "Bakamuna", "Dalukana", "Damminna", "Dewagala", "Dimbulagala", "Divulankadawala", "Divuldamana", "Diyabeduma", "Diyasenpura", "Elahera", "Ellewewa", "Galamuna", "Galoya Junction", "Giritale", "Hansayapalama", "Hingurakdamana", "Hingurakgoda", "Jayanthipura", "Jayasiripura", "Kalingaela", "Kalukele Badanagala", "Kashyapapura", "Kawudulla", "Kawuduluwewa", "Kottapitiya", "Kumaragama", "Lakshauyana", "Maduruoya", "Maha Ambagaswewa", "Mahatalakolawewa", "Mahawela Sinhapura", "Mampitiya", "Manampitiya", "Medirigiriya", "Meegaswewa", "Minneriya", "Mutugala", "Nawasenapura", "Nelumwewa", "Nuwaragala", "Onegama", "Orubendi Siyambalawa", "Palugasdamana", "Parakrama Samudraya", "Pelatiyawa", "Pimburattewa", "Polonnaruwa Town", "Pulastigama", "Sevanapitiya", "Sinhagama", "Sungavila", "Talpotha", "Tamankaduwa", "Tambala", "Unagalavehera", "Welikanda", "Wijayabapura", "Yodaela", "Yudaganawa"],
  },

  Northern: {
    Jaffna: ["Chavakachcheri", "Delft Island", "Eluthumadduval", "Jaffna Town", "Kankesanthurai", "Karainagar", "Kayts", "Kokuvil", "Mandaitivu", "Maviddapuram", "Nallur", "Point Pedro", "Puliyankoodal", "Puloly", "Pungudutheevu", "Saravanai", "Suruvil", "Vadamaradchy", "Valikamam East", "Valikamam North", "Valikamam South", "Valikamam West", "Valvettithurai"],
    Kilinochchi: ["Akkarayankulam", "Aliyavalai", "Elephant Pass", "Iranamadu", "Iyyakachchi", "Jeyanthinagar", "Kaneshapuram", "Kilinochchi", "Mulliyan", "Pallai", "Parantan", "Paranthan", "Pooneryn", "Skanthapuram", "Uruthirapuram", "Vaddakachchi", "Vivekananthanagar"],
    Mannar: ["Mannar", "Moorstreet", "Pallimunai", "Panankaddukoddu", "Perijakadai", "Pesalai", "Sinnakkadai", "Sivapuram", "Thalaimannar", "Uppukkulam"],
    Mullaitivu: ["Alampil", "Chilawattai", "Kallappadu North", "Kallappadu South", "Karuppaddamurippu", "Mankulam", "Mulativu Town", "Mullivaikkal", "Mulliyawalai", "Muththaiyankaddukulam", "Naddan Kandal", "Oddusuddan", "Puthukkudiyiruppu", "Puthuvedduvan", "Selvapuram", "Thunukkai", "Udayarkaddu", "Vavunakkulam", "Visvamadukulam", "Yogapuram"],
    Vavuniya: ["Bogaswewa", "Irattaperiyakulam", "Kachchakodiya", "Kalmadu", "Kalukunnammadu", "Kanagarayamkulam", "Kavutharimunai", "Madukanda", "Mamaduwa", "Murasumoddai", "Nedunkerny", "Omanthai", "Puliyankulam", "Purakari Nallur", "Ramanathapuram", "Thalaiyadi", "Uruthirapuram", "Vavuniya Town", "Veravil", "Weppankulam"],
  },

  "North Western": {
    Kurunegala: ["Alawwa", "Ambanpola", "Ataragalla", "Awulegama", "Balalla", "Bamunukotuwa", "Bandara Koswatta", "Barampola", "Bogahamulla", "Bopitiya", "Bujjomuwa", "Dambadeniya", "Deegalla", "Demataluwa", "Diddeniya", "Divullegoda", "Dodangaslanda", "Etungahakotuwa", "Galgamuwa", "Giriulla", "Gokaralla", "Halmillawewa", "Heraliyawela", "Hettipola", "Hindagolla", "Hiruwalpola", "Horambawa", "Hulogedara", "Hulugalla", "Ibbagamuwa", "Ilukhena", "Indulgodakanda", "Inguruwatta", "Iriyagolla", "Ithanawatta", "Kadigawa", "Kahapathawala", "Kahapathwala", "Kalugamuwa", "Kanadeniyawala", "Kanattewewa", "Katupota", "Kekunagolla", "Keppitiwalana", "Kirimetiyawa", "Kirindigalla", "Kithalawa", "Kobeigane", "Kohilagedara", "Konwewa", "Kosdeniya", "Kosgolla", "Kotawehera", "Kudagalagamuwa", "Kudakathnoruwa", "Kuliyapitiya", "Kumbukgeta", "Kumbukwewa", "Kuratihena", "Kurunegala Town", "Labbala", "Lonahettiya", "Madahapola", "Madakumburumulla", "Madawakkulama", "Maduragoda", "Maeliya", "Mahagalkadawala", "Mahagirilla", "Mahamukalanyaya", "Mahananneriya", "Maharachchimulla", "Maho", "Makulpotha", "Makulwewa", "Malagane", "Malkaduwawa", "Malpitiya", "Mandapola", "Maspotha", "Mawathagama", "Meegalawa", "Meewellawa", "Melsiripura", "Metikumbura", "Metiyagane", "Minhettiya", "Minuwangete", "Mirihanegama", "Moragane", "Moragollagama", "Munamaldeniya", "Nabadewa", "Nagollagama", "Nagollagoda", "Nakkawatta", "Narammala", "Narangoda", "Nawatalwatta", "Nelliya", "Nikadalupotha", "Nikaweratiya", "Padeniya", "Padiwela", "Pahalagiribawa", "Pahamune", "Palukadawala", "Panadaragama", "Panagamuwa", "Panaliya", "Panliyadda", "Pannala", "Pansiyagama", "Periyakadneluwa", "Pihimbiya Ratmale", "Pihimbuwa", "Pilessa", "Polgahawela", "Polpitigama", "Pothuhera", "Puswelitenna", "Ridigama", "Sandalankawa", "Sirisethagama", "Siyambalagamuwa", "Solewewa", "Sunandapura", "Talawattegedara", "Tambutta", "Thalahitimulla", "Thalakolawewa", "Thalwita", "Thambagalla", "Tharana Udawela", "Thimbiriyawa", "Thorayaya", "Tisogama", "Torayaya", "Tuttiripitigama", "Udubaddawa", "Uhumiya", "Usgala Siyabmalangamuwa", "Wadakada", "Wadumunnegedara", "Wannilhalagama", "Wannirasnayakapura", "Warawewa", "Wariyapola", "Watuwatta", "Weerapokuna", "Welawa Junction", "Welipennagahamulla", "Wellagala", "Wellarawa", "Wellawa", "Wennoruwa", "Weuda", "Wewagama", "Yakwila", "Yatakalana"],
    Puttalam: ["Adippala", "Anamaduwa", "Anavilundawa", "Andigama", "Angunawila", "Bangadeniya", "Baranankattuwa", "Battuluoya", "Bingiriya", "Bowatta", "Bujjampola", "Chilaw", "Daluwa", "Dankotuwa", "Dunkannawa", "Eluwankulama", "Ettale", "Ihala Kottaramulla", "Ihala Puliyankulama", "Ismail Puram", "Kakkapalliya", "Kalpitiya", "Karaitivu", "Karativponparappi", "Karuwalagaswewa", "Katuneriya", "Kirimundalama", "Kiula", "Kottukachchiya", "Kudawewa", "Kumarakattuwa", "Kuruketiyawa", "Lihiriyagama", "Lunuwila", "Madampe", "Madurankuliya", "Mahakumbukkadawala", "Mahauswewa", "Maha Uswewa", "Mahawewa", "Marawila", "Mudalakkuliya", "Mundel", "Muttibendivila", "Nainamadama", "Nalladarankattuwa", "Nattandiya", "Nawagattegama", "Norachcholai", "Palaviya", "Pallama", "Palliwasalturai", "Pothuwatawana", "Puttalam Town", "Rajakadaluwa", "Saliyawewa Junction", "Tabbowa", "Talawila Church", "Toduwawa", "Udappu", "Udappuwa", "Uriyawa", "Vanathawilluwa", "Waikkal", "Watugahamulla", "Weerakodiyana", "Wennappuwa", "Wilpotha", "Yogiyana"],
  },

  Sabaragamuwa: {
    Kegalle: ["Alawatura", "Algama", "Aluthnuwara", "Ambalakanda", "Ambulugala", "Amitirigala", "Ampagala", "Anhettigama", "Aranayake", "Aruggammana", "Atale", "Batuwita", "Beligala", "Berannawa", "Bopitiya", "Boralankada", "Bossella", "Bulathkohupitiya", "Damunupola", "Daraniyagala", "Debathgama", "Dedigama", "Dedugala", "Deewala Pallegama", "Dehiowita", "Deldeniya", "Deloluwa", "Deraniyagala", "Dewalegama", "Dewanagala", "Dombemada", "Dorawaka", "Dunumala", "Galapitamada", "Galatara", "Galigamuwa", "Galpatha", "Ganithapura", "Gantuna", "Gonagala", "Hakabellawaka", "Hakahinna", "Hakbellawaka", "Hawadiwela", "Helamada", "Hemmatagama", "Hettimulla", "Hewadiwela", "Hingula", "Hinguralakanda", "Hiriwadunna", "Imbulana", "Imbulgasdeniya", "Kabagamuwa", "Kannattota", "Karawanella", "Kegalle Town", "Kehelpannala", "Kithulgala", "Kitulgala", "Kondeniya", "Kotiyakumbura", "Kudagama", "Lewangama", "Mahapallegama", "Maharangalla", "Makehelwala", "Malalpola", "Maliboda", "Malmaduwa", "Mawanella", "Migastenna", "Miyanawita", "Molagoda", "Morontota", "Nelumdeniya", "Niyadurupola", "Noori", "Parape", "Pattampitiya", "Pitagaldeniya", "Rambukkana", "Ruwanwella", "Seaforth Colony", "Talgaspitiya", "Teligama", "Tholangamuwa", "Thotawella", "Tulhiriya", "Tuntota", "Udagaldeniya", "Udapotha", "Udumulla", "Undugoda", "Ussapitiya", "Wahakula", "Waharaka", "Warakapola", "Watura", "Weeoya", "Wegalla", "Welihelatenna", "Weragala", "Yatagama", "Yatapana", "Yatiyantota", "Yattogoda"],
    Ratnapura: ["Akarella", "Atakalanapnna", "Ayagama", "Balangoda", "Batatota", "Belihuloya", "Bolthumbe", "Bulutota", "Dambuluwana", "Dela", "Delwala", "Demuwatha", "Dodampe", "Doloswalakanda", "Dumbara Manana", "Eheliyagoda", "Ekamuthugama", "Elapatha", "Ellagawa", "Ellawala", "Embilipitiya", "Erathna", "Erepola", "Gabbela", "Gallella", "Gangeyaya", "Gawaragiriya", "Getahetta", "Gillimale", "Godagampola", "Godakawela", "Gurubewilagama", "Halpe", "Halwinna", "Handagiriya", "Hapugastenna", "Hatangala", "Hatarabage", "Hiramadagama", "Ihalagalagama", "Imbulpe", "Ittakanda", "Kahangama", "Kahawatte", "Kalawana", "Kalthota", "Kaltota", "Karandana", "Karangoda", "Karawita", "Kella Junction", "Kiribbanwewa", "Kiriella", "Kolambageara", "Kolombugama", "Kolonna", "Kudawa", "Kuruwita", "Madalagama", "Madampe", "Mahagama Colony", "Mahawalatenna", "Makandura Sabara", "Matuwagalagama", "Meddekanda", "Minipura Dumbara", "Mitipola", "Morahela", "Mulendiyawala", "Nawalakanda", "Nivithigala", "Omalpe", "Opanayaka", "Padalangala", "Pallebedda", "Pambagolla", "Panamura", "Panawala", "Parakaduwa", "Pebotuwa", "Pelmadulla", "Pimbura", "Pinnawala", "Rajawaka", "Rakwana", "Ranwala", "Rassagala", "Ratna Hangamuwa", "Ratnapura Town", "Samanalawewa", "Sevanagala", "Sri Palabaddala", "Sudagala", "Teppanawa", "Tunkama", "Udakarawita", "Udaniriella", "Udawalawe", "Ullinduwawa", "Veddagala", "Vijeriya", "Waleboda", "Watapotha", "Waturawa", "Weligepola", "Welipathayaya", "Wewelwatta", "Wikiliya"],
    
  },

  Southern: {
   Galle: ["Agaliya", "Ahangama", "Ahungalla", "Akmeemana", "Akuressa", "Aluthwala", "Ambalangoda", "Ampegama", "Amugoda", "Anangoda", "Angulugaha", "Ankokkawala", "Atakohota", "Avittawa", "Baddegama", "Balapitiya", "Banagala", "Batapola", "Benthota", "Boossa", "Dikkumbura", "Dodanduwa", "Ella Tanabaddegama", "Elpitiya", "Ethkandura", "Galle Town", "Gintota", "Godahena", "Gonagalpura", "Habaraduwa", "Haburugala", "Halvitigala Colony", "Hawpe", "Hikkaduwa", "Hiniduma", "Hiyare", "Ihalahewessa", "Ihala Walpola", "Imaduwa", "Induruwa", "Kahaduwa", "Kahawa", "Kananke Bazaar", "Karagoda", "Karandeniya", "Karapitiya", "Ketandola", "Koggala", "Kosgoda", "Kothalawala", "Kottawagama", "Kurundugahahethakma", "Madakumburamulla", "Magala North", "Magala South", "Magedara", "Malamura", "Malgalla Talangalla", "Mapalagama", "Mapalagama Central", "Mattaka", "Meda Keembiya", "Meetiyagoda", "Miriswatta", "Nagoda", "Nakiyadeniya", "Nawadagala", "Neluwa", "Nindana", "Opatha", "Panangala", "Pannimulla Panagoda", "Parana Thanayamgoda", "Pitigala", "Pitigala - North", "Poddala", "Porawagama", "Rantotuvila", "Rathgama", "Talagampola", "Talpe", "Tawalama", "Thalgaswala", "Udalamatta", "Udugama", "Unawatuna", "Uragasmanhandiya", "Wackwella", "Walahanduwa", "Wanchawela", "Wanduramba", "Warukandeniya", "Weihena", "Yakkalamulla", "Yatalamatta"],
   Matara: ["Akuressa", "Alapaladeniya", "Aparekka", "Aturaliya", "Bengamuwa", "Beralapanathara", "Bopagoda", "Dampahala", "Deegala Lenama", "Deiyandara", "Dellawa", "Denagama", "Denipitiya", "Deniyaya", "Derangala", "Devinuwara", "Devundara", "Dikwella", "Diyagaha", "Diyalape", "Gandara", "Godagama", "Godapitiya", "Gomila Mawarala", "Hakmana", "Handugala", "Hithetiya", "Horapawita", "Kalubowitiyana", "Kamburugamuwa", "Kamburupitiya", "Karagoda Uyangoda", "Karaputugala", "Karatota", "Kekanadura", "Kiriweldola", "Kiriwelkele", "Kolawenigma", "Kotapola", "Kottegoda", "Lankagama", "Makandura", "Maliduwa", "Malimboda", "Maramba", "Matara", "Matara Town", "Mediripitiya", "Miella", "Mirissa", "Modara", "Moragala Kirillapone", "Morawaka", "Mulatiyana Junction", "Nadugala", "Naimana", "Narawelpita", "Nawimana", "Nupe", "Pahala Millawa", "Palatuwa", "Palena", "Pamburana", "Paragala", "Parapamulla", "Pasgoda", "Penetiyana", "Pitabeddara", "Pothdeniya", "Puhulwella", "Radawela", "Ransegoda", "Ratmale", "Rotumba", "Siyambalagoda", "Sultanagoda", "Talaramba", "Thelijjawila", "Thihagoda", "Thudawa", "Urubokka", "Urugamuwa", "Urumutta", "Uyanwatta", "Viharahena", "Walakanda", "Walasgala", "Walgama", "Wallasmulla", "Waralla", "Weligama", "Welihinda", "Wilpita", "Yatiyana"],
   Hambantota: ["Ambalantota", "Angunakolapalassa", "Bandagiriya Colony", "Barawakumbuka", "Beliatta", "Beragama", "Beralihela", "Bowalagama", "Bundala", "Ellagala", "Gangulandeniya", "Getamanna", "Goda Koggalla", "Gonagamuwa Uduwila", "Gonnoruwa", "Hakuruwela", "Hambantota", "Hambantota Town", "Horewelagoda", "Hungama", "Ihala Beligala", "Ittademaliya", "Julampitiya", "Kahandamodara", "Kariyamaditta", "Katuwana", "Kawantissapura", "Kirama", "Kirinda", "Lunama", "Lunugamwehera", "Magama", "Mahagalwewa", "Mamadala", "Medamulana", "Middeniya", "Migahajandur", "Modarawana", "Mulkirigala", "Nakulugamuwa", "Netolpitiya", "Nihiluwa", "Padawkema", "Pahala Andarawewa", "Pallekanda", "Rammalawarapitiya", "Ranakeliya", "Ranmuduwewa", "Ranna", "Ratmalwala", "Ridiyagama", "Sooriyawewa", "Tangalle", "Tissamaharama", "Uda Gomadiya", "Udamattala", "Uswewa", "Vitharandeniya", "Walasmulla", "Weeraketiya", "Weerawila", "Weerawila New Town", "Wekandawela", "Weligatta", "Yatigala"],
  },

  Uva: {
    Badulla: ["Akkarasiyaya", "Aluketiyawa", "Aluththarama", "Aluttaramma", "Ambadandegama", "Ambagahawatte", "Ambagasdowa", "Amunumulla", "Arawa", "Arawakumbura", "Arawatta", "Atakiriya", "Badulla Town", "Baduluoya", "Ballaketuwa", "Bambarapana", "Bandarawela", "Beramada", "Bibilegama", "Bogahakumbura", "Boragas", "Boralanda", "Bowela", "Dambana", "Demodara", "Diganatenna", "Dikkapitiya", "Dimbulana", "Divulapelessa", "Diyathalawa", "Dulgolla", "Egodawela", "Ella", "Ettempitiya", "Gadunna", "Galahagama", "Galauda", "Galedanda", "Galporuyaya", "Gamewela", "Gawarawela", "Girandurukotte", "Godunna", "Guruthalawa", "Haldummulla", "Hali-ela", "Hangunnawa", "Haputale", "Hawanakumbura", "Hebarawa", "Heeloya", "Helahalpe", "Helapupula", "Hewanakumbura", "Hingurukaduwa", "Hopton", "Idalgashinna", "Jangulla", "Kahataruppa", "Kalubululanda", "Kalugahakandura", "Kalupahana", "Kandaketiya", "Kandegedara", "Kandepuhulpola", "Kebillawela North", "Kebillawela South", "Kendagolla", "Keppetipola", "Keselpotha", "Ketawatta", "Kiriwanagama", "Koslanda", "Kotamuduna", "Kuruwitenna", "Kuttiyagolla", "Landewela", "Liyanagahawela", "Lunugala", "Lunuwatta", "Madulsima", "Mahiyangana", "Mahiyanganaya", "Makulella", "Maliyadda", "Mapakadawewa", "Maspanna", "Maussagolla", "Medawelagama", "Medawela Udukinda", "Meegahakivula", "Metigahatenna", "Mirahawatta", "Miriyabedda", "Miyanakandura", "Namunukula", "Narangala", "Nelumgama", "Nikapotha", "Nugatalawa", "Ohiya", "Pahalarathkinda", "Pallekiruwa", "Passara", "Pathanewatta", "Pattiyagedara", "Pelagahatenna", "Perawella", "Pitamaruwa", "Pitapola", "Poonagala", "Puhulpola", "Ratkarawwa", "Rideemaliyadda", "Rilpola", "Silmiyapura", "Sirimalgoda", "Sorabora Colony", "Soragune", "Soranathota", "Spring Valley", "Taldena", "Tennepanguwa", "Timbirigaspitiya", "Uduhawara", "Uraniya", "Uva Deegalla", "Uva Karandagolla", "Uva Mawelagama", "Uvaparanagama", "Uva Tenna", "Uva Tissapura", "Uva Uduwara", "Welimada", "Wewatta", "Wineethagama", "Yalagamuwa", "Yalwela"],
    Monaragala: ["Angunakolawewa", "Ayiwela", "Badalkumbura", "Baduluwela", "Bakinigahawela", "Balaharuwa", "Bibile", "Buddama", "Buttala", "Dambagalla", "Diyakobala", "Dombagahawela", "Ekamutugama", "Ekiriyankumbura", "Ethimalewewa", "Ettiliwewa", "Galabedda", "Hambegamuwa", "Hulandawa", "Inginiyagala", "Kandaudapanguwa", "Kandawinna", "Kataragama", "Kiriibbanwewa", "Kotagama", "Kotawehera Mankada", "Kotiyagala", "Kudaoya", "Kumbukkana", "Mahagama Colony", "Marawa", "Mariarawa", "Medagana", "Monaragala", "Monaragala Town", "Moretuwegama", "Nakkala", "Nannapurawa", "Nelliyadda", "Nilgala", "Obbegoda", "Okkampitiya", "Pangura", "Pitakumbura", "Randeniya", "Ruwalwela", "Sella Kataragama", "Sewanagala", "Siyambalagane", "Siyambalanduwa", "Suriara", "Tanamalila", "Tanamalwila", "Uva Gangodagama", "Uva Kudaoya", "Uva Pelwatta", "Warunagama", "Wedikumbura", "Weherayaya Handapanagala", "Wellawaya", "Wilaoya"],
  },
 
  Western: {
  "Colombo (1 - 15)": ["Colombo 01 - Fort","Colombo 02 - Slave Island / Union Place","Colombo 03 - Kollupitiya (Colpetty)","Colombo 04 - Bambalapitiya","Colombo 05 - Narahenpita / Havelock Town / Kirulapone North","Colombo 07 - Cinnamon Gardens","Colombo 08 - Borella","Colombo 09 - Dematagoda","Colombo 10 - Maradana / Panchikawatte","Colombo 11 - Pettah","Colombo 12 - Hulftsdorp (Aluthkade)","Colombo 13 - Kotahena / Bloemendhal / Kochchikade","Colombo 14 - Grandpass","Colombo 15 - Mattakkuliya / Modara / Mutwal / Madampitiya"],
  "Colombo - Greater": ["Aggona","Angoda","Angulana","Arawwala","Athurugiriya","Attidiya","Avissawella","Battaramulla","Beddagana","Bellanvila","Bokundara","Bope","Bopitiya","Boralesgamuwa","Borupana","Dahampura","Dedigamuwa","Dehiwala","Delkanda","Egoda Uyana","Embuldeniya","Gangodawila","Godagama","Gothatuwa","Habarakada","Hanwella","Himbutana","Hiripitya","Hokandara","Homagama","Jambugasmulla","Kaduwela","Kahathuduwa","Kaldemulla","Kalubowila","Katubedda","Katuwana","Katuwawala","Kawdana","Kesbewa","Kiriwattuduwa","Kohuwala","Kolonnawa","Kosgama","Koswatta","Kotikawatta","Kottawa","Kotte","Lunawa","Madapatha","Madiwela","Maharagama","Makumbura","Malabe","Mattegoda","Meegoda","Mirihana","Moratuwa","Mount Lavinia","Mullegama","Mulleriyawa","Mulleriyawa New Town","Napawela","Nawala","Nawinna","Nedimala","Niyadagala","Nugegoda","Obesekarapura","Orugodawatta","Padukka","Pagoda","Palanwatta","Peliyagoda","Pannipitiya","Pelawatta","Pepiliyana","Piliyandala","Pitipana Homagama","Polgasowita","Rajagiriya","Rathmalana","Rattanapitiya","Rukmale","Sapugaskande","Sedawatte","Siddamulla","Sri Jayawardenepura Kotte","Talangama","Talawatugoda","Thalawathugoda","Udahamulla","Waga","Watareka","Welikada","Welivita","Wellampitiya","Werahera","Wijerama"],
  "Gampaha": ["Akaragama","Alawala","Aluthepola","Amandoluwa","Ambagaspitiya","Ambepussa","Amuhena","Andiambalama","Aramba","Badalgama","Ballapana","Bambukuliya","Bemmulla","Biyagama","Buthpitiya","Dagonna","Dalupotha","Daluwakotuwa","Dambaduraya","Dandugama","Danowita","Debahera","Dekatana","Delathura","Delgoda","Delpakadawara","Demalagama","Dewalapola","Dikkowita","Divulapitiya","Divuldeniya","Dompe","DRZ - QC Zone","Dunagaha","Dungalpitiya","Duwana","Ekala","Elakanda","Ellakkala","Enderamulla","Essella","Ethgala","Ethukala","Gampaha Town","Ganemulla","Godigomuwa","Gonawala","Gongithota","Heenatiyana","Heiyanthuduwa","Hekitta","Hendala","Henegama","Hiswella","Horampalla","Hunupitiya","Ihala Madampella","Indigahamula","Isuru Uyana","Ja-Ela","K.C De Silva Puraya","Kadawatha","Kadirana","Kalagedihena","Kaleliya","Kaluaggala","Kandana","Kandawala","Katana","Katiyala","Kattuwa","Katunayake","Katuwapitiya","Kelaniya","Kepungoda","Kerawalapitiya","Kimbulapitiya","Kiribathgoda","Kirillawala","Kirindiwela","Kitulwala","Kochchikade","Kotadeniyawa","Kotugada","Kowinna","Kudapaduwa","Kurana","Kuswala","Liyanagemulla","Lunugama","Mabodala","Mabole","Madampella","Madelgamuwa","Mahabage","Mahara","Makevita North","Makevita South","Makola","Malwana","Mawaramandiya","Meethirigala","Mellawagedara","Millathe","Millennium City","Minuwangoda","Mirigama","Miriswatte","Mudungoda","Munnakkara","Muthuwadiya","Nedagamuwa","Negombo","Nittambuwa","Pahala Mapitigama","Pamunugama","Peliyagoda","Pugoda","Radawana","Raddolugama","Ragama","Ranala","Seeduwa","Siyambalape","Thalahena","Thihariya","Udugampola","Veyangoda","Wattala","Weliweriya","Weweldeniya","Yakkala","Yatiyana"],
  "Kalutara": ["Agalawatta","Alubomulla","Aluthgama","Anguruwathota","Arukgoda","Athwelthota","Baduraliya","Bandaragama","Beruwala","Bulathsinhala","China Fort","Dharga Town","Dodangoda","Horana","Ingiriya","Kalutara","Kalutara Town","Matugama","Panadura","Wadduwa","Waskaduwa","Welipenna","Yatadolawatta"]
}
};

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [checkoutData, setCheckoutData] = useState({
  fullName: "",
  email: "",
  phoneNumber1: "",
  phoneNumber2: "",

  addressType: "Home",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  province: "",
  district: "",
  city: "",
  postalCode: "",

  paymentMethod: "Cash on Delivery",
  notes: "",
});

  const navigate = useNavigate();

  const loadUserDetails = useCallback(() => {
    try {
      const savedUser =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("userInfo"));

      if (savedUser) {
        setCheckoutData((prev) => ({
          ...prev,
          fullName:
            savedUser.name ||
            savedUser.fullName ||
            savedUser.username ||
            "",
          email: savedUser.email || "",
          phoneNumber1:
            savedUser.phone ||
            savedUser.phoneNumber ||
            savedUser.mobile ||
            "",
        }));
      }
    } catch (err) {
      console.log("No saved user details found.");
    }
  }, []);

  const loadCart = useCallback(async () => {
  try {
    const selectedCheckoutItems = JSON.parse(
      localStorage.getItem("checkoutItems")
    );

    if (selectedCheckoutItems && selectedCheckoutItems.length > 0) {
      setCart(selectedCheckoutItems);
      setError("");
      return;
    }

    const { data } = await API.get("/cart");
    setCart(data.cart || []);
    setError("");
  } catch (err) {
    setError("Failed to load checkout details.");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadUserDetails();
    loadCart();
  }, [loadUserDetails, loadCart]);

  const cartItemsTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const deliveryFee = cart.length === 0 ? 0 : cartItemsTotal >= 5000 ? 0 : 300;

  const total = cartItemsTotal + deliveryFee;

  const handleChange = (event) => {
  const { name, value } = event.target;

  setCheckoutData((prev) => {
    if (name === "province") {
      return {
        ...prev,
        province: value,
        district: "",
        city: "",
      };
    }

    if (name === "district") {
      return {
        ...prev,
        district: value,
        city: "",
      };
    }

    return {
      ...prev,
      [name]: value,
    };
  });
};

  const provinces = Object.keys(locationData);

  const districts = checkoutData.province
   ? Object.keys(locationData[checkoutData.province])
   : [];

  const cities =
   checkoutData.province && checkoutData.district
    ? locationData[checkoutData.province][checkoutData.district]
    : [];

  const validateForm = () => {
    if (!checkoutData.fullName.trim()) {
      return "Full name is required.";
    }

    if (!checkoutData.email.trim()) {
      return "Email is required.";
    }

    if (!checkoutData.phoneNumber1.trim()) {
     return "Phone number 1 is required.";
    }

    if (!checkoutData.addressLine1.trim()) {
      return "Address line 1 is required.";
    }

    if (!checkoutData.addressLine2.trim()) {
      return "Address line 2 is required.";
    }

    if (!checkoutData.province) {
      return "Province is required.";
    }

    if (!checkoutData.district) {
      return "District is required.";
    }

    if (!checkoutData.city) {
      return "City is required.";
    }

    if (!checkoutData.postalCode.trim()) {
      return "Postal code is required.";
   }

    if (cart.length === 0) {
      return "Your cart is empty.";
    }

    return "";
  };

  const saveDeliveryDetails = () => {
  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

 const checkoutDraft = {
  customer: {
    fullName: checkoutData.fullName.trim(),
    email: checkoutData.email.trim(),

    phone: checkoutData.phoneNumber1.trim(),
    phoneNumber1: checkoutData.phoneNumber1.trim(),
    phoneNumber2: checkoutData.phoneNumber2.trim(),
    
    addressType: checkoutData.addressType,
    addressLine1: checkoutData.addressLine1.trim(),
    addressLine2: checkoutData.addressLine2.trim(),
    landmark: checkoutData.landmark.trim(),
    province: checkoutData.province,
    district: checkoutData.district,
    city: checkoutData.city,
    postalCode: checkoutData.postalCode.trim(),

    address: `${checkoutData.addressLine1.trim()}, ${checkoutData.addressLine2.trim()}, ${checkoutData.city}, ${checkoutData.district}, ${checkoutData.province}`,
    notes: checkoutData.notes.trim(),
  },

  items: cart.map((item) => ({
    productId: item.productId,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    image: item.image,
  })),

  cartItemsTotal,
  deliveryFee,
  total,

  paymentMethod: "Cash on Delivery",
  paymentStatus: "Pending",
  orderStatus: "To Ship",
};

localStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));
navigate("/payment");
};

  const placeOrder = async (event) => {
  event.preventDefault();

  const validationError = validateForm();

  if (validationError) {
    setError(validationError);
    return;
  }

  try {
    setPlacingOrder(true);
    setError("");

    const selectedPaymentMethod = checkoutData.paymentMethod;

    const orderData = {
      customer: {
        fullName: checkoutData.fullName.trim(),
        email: checkoutData.email.trim(),

        phone: checkoutData.phoneNumber1.trim(),
        phoneNumber1: checkoutData.phoneNumber1.trim(),
        phoneNumber2: checkoutData.phoneNumber2.trim(),

        addressType: checkoutData.addressType,
        addressLine1: checkoutData.addressLine1.trim(),
        addressLine2: checkoutData.addressLine2.trim(),
        landmark: checkoutData.landmark.trim(),
        province: checkoutData.province,
        district: checkoutData.district,
        city: checkoutData.city,
        postalCode: checkoutData.postalCode.trim(),

        address: `${checkoutData.addressLine1.trim()}, ${checkoutData.addressLine2.trim()}, ${checkoutData.city}, ${checkoutData.district}, ${checkoutData.province}`,
        notes: checkoutData.notes.trim(),
},

      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
      })),

      cartItemsTotal,
      deliveryFee,
      total,

      paymentMethod: selectedPaymentMethod,
      paymentStatus:
        selectedPaymentMethod === "Cash on Delivery" ? "Pending" : "Paid",

      orderStatus: "To Ship",
    };

    await API.post("/orders", orderData);

    alert("✅ Your order has been confirmed successfully!");

    localStorage.removeItem("checkoutItems");
    setCart([]);
  } catch (err) {
    console.log("ORDER ERROR:", err.response?.data || err.message);

    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to place order. Please try again."
    );
  } finally {
    setPlacingOrder(false);
  }
};

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/cart")}
          >
            <i className="ti ti-arrow-left"></i>
            Back to Cart
          </button>

          <div>
            <h1>Checkout</h1>
            <p>Complete your delivery details and place your tea order.</p>
          </div>
        </div>

        {error && <div className="checkout-error">{error}</div>}

        <form
            className="checkout-layout"
            onSubmit={(event) => {
              event.preventDefault();
              saveDeliveryDetails();
              
            }}
          >
            
          <div className="checkout-form-box">
            <section className="checkout-section">
              <div className="section-title">
                <span>1</span>
                <div>
                  <h2>Customer Details</h2>
                  <p>Enter your contact information.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={checkoutData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={checkoutData.email}
                    onChange={handleChange}
                  />
                </div>

                  <div className="form-group">
                    <label>Phone Number 1</label>
                    <input
                      type="tel"
                      name="phoneNumber1"
                      placeholder="07XXXXXXXX"
                      value={checkoutData.phoneNumber1}
                      onChange={handleChange}
                    />
                  </div>

                   <div className="form-group">
                    <label>Phone Number 2</label>
                    <input
                        type="tel"
                        name="phoneNumber2"
                        placeholder="Optional"
                        value={checkoutData.phoneNumber2}
                        onChange={handleChange}
                      />
                  </div>
              </div>
            </section>

            <section className="checkout-section">
  <div className="section-title">
    <span>2</span>
    <div>
      <h2>Delivery Address</h2>
      <p>Choose your address type and delivery location.</p>
    </div>
  </div>

  <div className="address-type-row">
    {["Home", "Office", "Other"].map((type) => (
      <label
        key={type}
        className={
          checkoutData.addressType === type
            ? "address-type-card active"
            : "address-type-card"
        }
      >
        <input
          type="radio"
          name="addressType"
          value={type}
          checked={checkoutData.addressType === type}
          onChange={handleChange}
        />
        <i
          className={
            type === "Home"
              ? "ti ti-home"
              : type === "Office"
              ? "ti ti-building"
              : "ti ti-map-pin"
          }
        ></i>
        <span>{type}</span>
      </label>
    ))}
  </div>

  <div className="form-grid">
    <div className="form-group">
      <label>Address Line 1 *</label>
      <input
        type="text"
        name="addressLine1"
        placeholder="House no, building name"
        value={checkoutData.addressLine1}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Address Line 2 *</label>
      <input
        type="text"
        name="addressLine2"
        placeholder="Street name, area"
        value={checkoutData.addressLine2}
        onChange={handleChange}
      />
    </div>

    <div className="form-group full-width">
      <label>Landmark</label>
      <input
        type="text"
        name="landmark"
        placeholder="Near school, temple, shop, junction etc. Optional"
        value={checkoutData.landmark}
        onChange={handleChange}
      />
    </div>

    <div className="form-group">
      <label>Province *</label>
      <select
        name="province"
        value={checkoutData.province}
        onChange={handleChange}
      >
        <option value="">Select province</option>
        {provinces.map((province) => (
          <option key={province} value={province}>
            {province}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>District *</label>
      <select
        name="district"
        value={checkoutData.district}
        onChange={handleChange}
        disabled={!checkoutData.province}
      >
        <option value="">Select district</option>
        {districts.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>City *</label>
      <select
        name="city"
        value={checkoutData.city}
        onChange={handleChange}
        disabled={!checkoutData.district}
      >
        <option value="">Select city</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Postal Code *</label>
      <input
        type="text"
        name="postalCode"
        placeholder="Enter postal code"
        value={checkoutData.postalCode}
        onChange={handleChange}
      />
    </div>
  </div>
</section>

          
              
          </div>

          <aside className="checkout-summary-box">
            <h2>My Order Details</h2>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div className="checkout-summary-item" key={item.productId}>
                  <div className="checkout-product-info">
                    <div className="checkout-product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <i className="ti ti-leaf"></i>
                      )}
                    </div>

                    <div>
                      <h3>{item.name}</h3>
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <strong>
                    Rs. {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-line"></div>

            <div className="checkout-price-row">
              <span>Delivery Fee</span>
              <strong>
                {deliveryFee === 0
                  ? "Free"
                  : `Rs. ${deliveryFee.toLocaleString()}`}
              </strong>
            </div>

            <div className="checkout-line"></div>

            <div className="checkout-total-row">
              <span>Total</span>
              <strong>Rs. {total.toLocaleString()}</strong>
            </div>

            <div className="checkout-delivery-box">
              <i className="ti ti-truck-delivery"></i>
              <span>
                Estimated delivery: <b>2 - 4 business days</b>
              </span>
            </div>

           <button
              type="submit"
              className="place-order-btn"
              disabled={placingOrder || cart.length === 0}
            >
              Save & Continue to Payment
              <i className="ti ti-arrow-right"></i>
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default Checkout;