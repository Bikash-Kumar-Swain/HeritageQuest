/* ==========================================================================
   HeritageQuest — RAG Knowledge Dataset
   Ported from heritagequest_bot/src/data/heritageKnowledge.ts
   Contains knowledge chunks for: Konark Sun Temple, Taj Mahal,
   Ajanta & Ellora Caves, Kaziranga National Park
   ========================================================================== */

// Knowledge Chunks: each has EN / HI / Hinglish content
export const KNOWLEDGE_CHUNKS = [

  // ─── KONARK SUN TEMPLE ───────────────────────────────────────────────────
  {
    id: 'konark-builder-date',
    siteId: 'konark',
    topic: 'construction_history',
    title: 'Konark Construction, Builder & Date',
    contentEn: 'The Konark Sun Temple was built in the 13th century, around 1250 CE, by King Narasimhadeva I of the Eastern Ganga dynasty in Konark, Odisha.',
    contentHi: 'कोणार्क सूर्य मंदिर का निर्माण 13वीं शताब्दी में, लगभग 1250 ईस्वी में, पूर्वी गंगा राजवंश के राजा नरसिंहदेव प्रथम द्वारा ओडिशा के कोणार्क में करवाया गया था।',
    contentHinglish: 'Konark Sun Temple 13th century me, lagbhag 1250 CE me, Eastern Ganga dynasty ke King Narasimhadeva I ne Odisha ke Konark me banwaya tha.',
    keywords: ['when', 'built', 'builder', 'king', 'narasimhadeva', 'century', 'date', 'year', 'ganga dynasty', 'kab bana', 'kisne banwaya', 'raja', 'itihas', 'history', '1250']
  },
  {
    id: 'konark-architecture-chariot',
    siteId: 'konark',
    topic: 'architecture',
    title: 'Konark Chariot Architecture & 24 Wheels',
    contentEn: 'Konark Sun Temple is designed in the shape of a colossal chariot dedicated to Surya (the Sun God). It features 24 intricately carved stone wheels (approx. 10 feet in diameter) which act as sundials, and is pulled by 7 stone horses representing the days of the week.',
    contentHi: 'कोणार्क सूर्य मंदिर को सूर्य देव के एक विशाल रथ के रूप में डिजाइन किया गया है। इसमें 24 नक्काशीदार पत्थर के पहिए हैं जो धूपघड़ी (sundials) का काम करते हैं, और इसे सप्ताह के 7 दिनों के प्रतीक 7 घोड़ों द्वारा खींचा जाता है।',
    contentHinglish: 'Konark Sun Temple Surya Dev ke colossal chariot ke roop me design kiya gaya hai. Isme 24 intricately carved stone wheels hain jo sundial ki tarah exact time batate hain, aur 7 pathar ke ghode hain jo week ke 7 days ko darshate hain.',
    keywords: ['wheels', 'horses', 'chariot', 'sundial', 'design', 'architecture', 'surya', 'sun god', 'rath', 'pahiya', 'pahie', 'ghode', 'dhup ghadi', 'naksha', 'structure', '24', '7']
  },
  {
    id: 'konark-black-pagoda-unesco',
    siteId: 'konark',
    topic: 'unesco_significance',
    title: 'Konark Black Pagoda & UNESCO Status',
    contentEn: 'Konark Sun Temple was designated a UNESCO World Heritage Site in 1984. European mariners historically called it the "Black Pagoda" because its dark tower served as an essential navigational landmark along the Bay of Bengal coastline.',
    contentHi: 'कोणार्क सूर्य मंदिर को 1984 में यूनेस्को विश्व धरोहर स्थल घोषित किया गया था। यूरोपीय नाविक इसे "ब्लैक पैगोडा" (Black Pagoda) कहते थे क्योंकि इसका गहरा विशाल शिखर बंगाल की खाड़ी के तट पर जहाजों के लिए एक प्रमुख लैंडमार्क था।',
    contentHinglish: 'Konark Sun Temple ko 1984 me UNESCO World Heritage Site declare kiya gaya tha. European sailors ise "Black Pagoda" kehte the kyunki iska dark color tower Bay of Bengal coast par navigation landmark ka kaam karta tha.',
    keywords: ['black pagoda', 'unesco', 'mariners', 'sailors', 'sea', 'coast', 'landmark', 'kala pagoda', 'dharohar', '1984', 'bay of bengal']
  },
  {
    id: 'konark-sculptures-art',
    siteId: 'konark',
    topic: 'art_and_reliefs',
    title: 'Konark Sculptural Art and Erotic Motifs',
    contentEn: 'The temple walls feature elaborate stone carvings depicting mythological scenes, celestial musicians (alasakanyas), animals (elephants, lions), and mithuna (erotic art) embodying the Kalinga school of architecture.',
    contentHi: 'मंदिर की दीवारों पर जटिल नक्काशी है जिसमें पौराणिक दृश्य, संगीतकार, नर्तकियाँ, हाथी, शेर और कामुक मूर्तियां (मिथुन कला) शामिल हैं जो कलिंग वास्तुकला शैली का उत्कृष्ट उदाहरण हैं।',
    contentHinglish: 'Temple ki walls par intricate stone carvings hain jinme dancers, musicians, elephants, lions aur famous mithuna (erotic sculptures) bani hain jo Kalinga architectural style ko dikhati hain.',
    keywords: ['sculpture', 'carvings', 'erotic', 'art', 'mithuna', 'dancers', 'statues', 'murti', 'kala', 'kalinga', 'relief']
  },

  // ─── TAJ MAHAL ────────────────────────────────────────────────────────────
  {
    id: 'taj-builder-history',
    siteId: 'taj-mahal',
    topic: 'construction_history',
    title: 'Taj Mahal Builder, History & Purpose',
    contentEn: 'The Taj Mahal is famous for its stunning Mughal architecture and stands as a timeless symbol of love. It was commissioned in 1631 by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal, completed around 1648-1653 in Agra.',
    contentHi: 'ताजमहल अपनी शानदार वास्तुकला और प्रेम की निशानी के रूप में प्रसिद्ध है, जिसे मुगल सम्राट शाहजहाँ ने अपनी पत्नी मुमताज़ महल की याद में बनवाया था। इसका निर्माण 1631 में शुरू होकर 1648-1653 में आगरा में पूरा हुआ।',
    contentHinglish: 'Taj Mahal apni splendid architecture aur symbol of love ke roop me famous hai, jise Mughal Emperor Shah Jahan ne apni wife Mumtaz Mahal ki memory me Agra me 1631 se 1648-1653 ke beech banwaya tha.',
    keywords: ['why famous', 'built', 'builder', 'shah jahan', 'mumtaz mahal', 'love', 'symbol', 'purpose', 'history', 'agra', 'kyu prasiddh hai', 'kisne banwaya', 'shahjahan', 'mumtaz', 'kab bana', 'pyaar']
  },
  {
    id: 'taj-architecture-marble',
    siteId: 'taj-mahal',
    topic: 'architecture_material',
    title: 'Taj Mahal Marble, Inlay & Architect',
    contentEn: 'The Taj Mahal was crafted primarily from pure white Makrana marble from Rajasthan, adorned with Pietra Dura (parchin kari) gemstone inlay of lapis lazuli, jade, turquoise, and coral. The chief architect was Ustad Ahmad Lahori.',
    contentHi: 'ताजमहल का निर्माण मुख्य रूप से राजस्थान के शुद्ध सफेद मकराना संगमरमर से हुआ है, जिसे लाजवर्त, जेड और फ़िरोज़ा जैसे कीमती पत्थरों की पच्चीकारी (पिएट्रा ड्यूरा) से सजाया गया है। इसके मुख्य वास्तुकार उस्ताद अहमद लाहौरी थे।',
    contentHinglish: 'Taj Mahal Rajasthan ke white Makrana marble se bana hai aur isme Pietra Dura (parchin kari) gemstone inlay work kiya gaya hai. Iske chief architect Ustad Ahmad Lahori the.',
    keywords: ['marble', 'material', 'architect', 'pietra dura', 'lahori', 'gemstones', 'makrana', 'sangmarmar', 'patthar', 'vastukar', 'inlay']
  },
  {
    id: 'taj-symmetry-garden',
    siteId: 'taj-mahal',
    topic: 'layout_and_symmetry',
    title: 'Taj Mahal Symmetry, Charbagh & Minarets',
    contentEn: 'The Taj Mahal complex embodies perfect bilateral symmetry along a central axis, featuring a 300-meter Charbagh (Persian quadrilateral garden) along the Yamuna river. Its four 40-meter minarets are deliberately tilted slightly outward to protect the central dome in case of an earthquake.',
    contentHi: 'ताजमहल परिसर में यमुना नदी के तट पर 300 मीटर का चारबाग (फारसी उद्यान) और पूर्ण द्विपक्षीय समरूपता है। इसकी चारों 40 मीटर ऊंची मीनारें भूकंप की स्थिति में मुख्य गुंबद की सुरक्षा के लिए थोड़ा बाहर की ओर झुकी हुई बनाई गई हैं।',
    contentHinglish: 'Taj Mahal me perfect bilateral symmetry aur Yamuna kinare Charbagh garden hai. Iski charo 40-meter minarets bahar ki taraf halki tilted hain taaki earthquake me main dome safe rahe.',
    keywords: ['symmetry', 'minarets', 'garden', 'charbagh', 'yamuna', 'dome', 'earthquake', 'tilt', 'minaar', 'bageecha', 'gumbad']
  },
  {
    id: 'taj-unesco-wonders',
    siteId: 'taj-mahal',
    topic: 'unesco_heritage',
    title: 'Taj Mahal UNESCO Status & Global Recognition',
    contentEn: 'Inscribed as a UNESCO World Heritage Site in 1983 as "the jewel of Muslim art in India", the Taj Mahal is also celebrated as one of the New 7 Wonders of the World, drawing millions of international visitors annually.',
    contentHi: 'ताजमहल को 1983 में यूनेस्को द्वारा विश्व धरोहर स्थल घोषित किया गया और इसे भारत में मुस्लिम कला का अनमोल रत्न माना गया। यह विश्व के नए 7 अजूबों में भी शामिल है।',
    contentHinglish: 'Taj Mahal 1983 me UNESCO World Heritage Site declare hua tha aur ye New 7 Wonders of the World me shamil hai.',
    keywords: ['unesco', 'wonder', 'world heritage', 'recognition', 'tourism', '1983', 'ajuba', 'seven wonders']
  },

  // ─── AJANTA & ELLORA CAVES ────────────────────────────────────────────────
  {
    id: 'ajanta-ellora-overview',
    siteId: 'ajanta-ellora',
    topic: 'overview_location',
    title: 'Ajanta and Ellora Caves Overview & Location',
    contentEn: 'The Ajanta and Ellora Caves are rock-cut cave monuments located in Maharashtra (near Chhatrapati Sambhaji Nagar/Aurangabad). Inscribed as UNESCO World Heritage Sites in 1983, they represent the pinnacle of ancient Indian rock architecture and religious art.',
    contentHi: 'अजंता और एलोरा की गुफाएं महाराष्ट्र (छत्रपति संभाजी नगर/औरंगाबाद) में स्थित चट्टानों को काटकर बनाए गए प्राचीन गुफा स्मारक हैं। 1983 में इन्हें यूनेस्को विश्व धरोहर घोषित किया गया था।',
    contentHinglish: 'Ajanta aur Ellora caves Maharashtra ke Chhatrapati Sambhaji Nagar (Aurangabad) ke paas rock-cut monuments hain jo 1983 me UNESCO World Heritage Sites bani.',
    keywords: ['location', 'where', 'maharashtra', 'aurangabad', 'unesco', 'kahan hai', 'kaha par hai', 'state', '1983']
  },
  {
    id: 'ajanta-caves-murals',
    siteId: 'ajanta-ellora',
    topic: 'ajanta_murals',
    title: 'Ajanta Caves: What to See & Buddhist Murals',
    contentEn: 'In the Ajanta Caves, you can see 30 rock-cut Buddhist caves featuring world-famous frescoes, murals, and ancient sculptures depicting the life of Buddha and Jataka tales, including the iconic Bodhisattva Padmapani and Vajrapani paintings.',
    contentHi: 'अजंता की गुफाओं में आप 30 बौद्ध गुफाएं, विश्वप्रसिद्ध भित्तिचित्र (म्यूरल्स) और प्राचीन मूर्तियां देख सकते हैं जो भगवान बुद्ध के जीवन और जातक कथाओं को दर्शाती हैं, जिसमें बोधिसत्व पद्मपाणि की प्रसिद्ध पेंटिंग शामिल है।',
    contentHinglish: 'Ajanta caves me aap buddhist murals, ancient sculptures aur world-famous frescoes dekh sakte hain jo Buddha ki life aur Jataka stories ko dikhate hain, jaise Bodhisattva Padmapani ki painting.',
    keywords: ['what to see', 'ajanta', 'murals', 'paintings', 'buddhist', 'padmapani', 'jataka', 'frescoes', 'kya dekhne layak hai', 'gufa me kya hai', 'chitra', 'buddha', 'dekhne']
  },
  {
    id: 'ellora-kailasa-temple',
    siteId: 'ajanta-ellora',
    topic: 'ellora_kailasa',
    title: 'Ellora Caves & Monolithic Kailasa Temple',
    contentEn: 'Ellora features 34 caves representing Buddhism (Caves 1-12), Hinduism (Caves 13-29), and Jainism (Caves 30-34). Its centerpiece is the monolithic Kailasa Temple (Cave 16), carved entirely top-to-bottom from a single massive basalt cliff under the Rashtrakuta King Krishna I.',
    contentHi: 'एलोरा में 34 गुफाएं हैं जो बौद्ध (1-12), हिंदू (13-29), और जैन (30-34) धर्मों का संगम हैं। इसका मुख्य आकर्षण एकाश्म कैलाश मंदिर (गुफा 16) है, जिसे राष्ट्रकूट राजा कृष्ण प्रथम के काल में एक ही विशाल चट्टान को ऊपर से नीचे काटकर बनाया गया था।',
    contentHinglish: 'Ellora me 34 caves hain jo Buddhist, Hindu aur Jain religions ko represent karti hain. Iska main highlight Cave 16 ka monolithic Kailasa Temple hai jo ek single basalt rock ko upar se niche carve karke banaya gaya tha.',
    keywords: ['ellora', 'kailasa temple', 'cave 16', 'monolith', 'rashtrakuta', 'krishna I', 'single rock', 'kailash mandir', 'ekashma', 'religions', 'hindu', 'jain', 'buddhist']
  },
  {
    id: 'ajanta-ellora-difference',
    siteId: 'ajanta-ellora',
    topic: 'differences',
    title: 'Difference Between Ajanta and Ellora Caves',
    contentEn: 'Ajanta (2nd c. BCE - 5th c. CE) is exclusively Buddhist and renowned for delicate wall paintings in a horseshoe-shaped river gorge. Ellora (6th - 10th c. CE) is multi-religious (Buddhist, Hindu, Jain) and celebrated for colossal rock-cut sculptural architecture like the Kailasa temple.',
    contentHi: 'अजंता (दूसरी सदी ईसा पूर्व से 5वीं सदी ईस्वी) विशेष रूप से बौद्ध धर्म से संबंधित है और भित्तिचित्रों के लिए जानी जाती है। जबकि एलोरा (6वीं से 10वीं सदी ईस्वी) बौद्ध, हिंदू और जैन तीनों धर्मों का संगम है और अपनी विशाल शैलकृत वास्तुकला (जैसे कैलाश मंदिर) के लिए प्रसिद्ध है।',
    contentHinglish: 'Ajanta purely Buddhist hai aur apni ancient wall paintings ke liye famous hai, jabki Ellora multi-religious (Buddhist, Hindu, Jain) hai aur monumental rock sculptures jaise Kailasa Temple ke liye jana jata hai.',
    keywords: ['difference', 'compare', 'contrast', 'farak', 'difference between ajanta and ellora']
  },

  // ─── KAZIRANGA NATIONAL PARK ──────────────────────────────────────────────
  {
    id: 'kaziranga-rhinos-bigfive',
    siteId: 'kaziranga',
    topic: 'rhinos_and_wildlife',
    title: 'Kaziranga One-Horned Rhinoceros & Big Five Wildlife',
    contentEn: 'Kaziranga National Park hosts around 2,600+ Great Indian One-Horned Rhinoceroses, which is roughly two-thirds of the world\'s entire population. It also protects the "Big Five" of Indian wildlife: One-Horned Rhino, Royal Bengal Tiger, Asian Elephant, Wild Water Buffalo, and Eastern Swamp Deer (Barasingha).',
    contentHi: 'काजीरंगा राष्ट्रीय उद्यान में लगभग 2,600 से अधिक एक सींग वाले भारतीय गैंडे रहते हैं, जो पूरी दुनिया की आबादी का लगभग दो-तिहाई हिस्सा है। यहाँ "बिग फाइव" वन्यजीव पाए जाते हैं: एक सींग वाला गैंडा, रॉयल बंगाल टाइगर, एशियाई हाथी, जंगली जल भैंस और दलदली हिरण (बारहसिंगा)।',
    contentHinglish: 'Kaziranga National Park me lagbhag 2,600+ one-horned rhinos hain, jo world ki total population ka two-thirds hai. Yahan "Big Five" animals milte hain: One-Horned Rhino, Royal Bengal Tiger, Asian Elephant, Wild Water Buffalo, aur Swamp Deer.',
    keywords: ['rhino', 'rhinoceros', 'one horned', 'big five', 'animals', 'wildlife', 'tiger', 'elephant', 'genda', 'ek seengh', 'janwar', 'kitne gende', 'population', 'two thirds']
  },
  {
    id: 'kaziranga-location-history',
    siteId: 'kaziranga',
    topic: 'location_and_history',
    title: 'Kaziranga Location, History & Establishment',
    contentEn: 'Located in the Golaghat and Nagaon districts of Assam along the Brahmaputra River floodplains, Kaziranga was established as a reserve forest in 1905 following efforts by Mary Curzon (wife of Viceroy Lord Curzon) when she failed to spot a rhino.',
    contentHi: 'असम के गोलाघाट और नगांव जिलों में ब्रह्मपुत्र नदी के कछार में स्थित, काजीरंगा को 1905 में मैरी कर्जन (वायसराय लॉर्ड कर्जन की पत्नी) के प्रयासों के बाद आरक्षित वन घोषित किया गया था।',
    contentHinglish: 'Kaziranga Assam ke Golaghat aur Nagaon districts me Brahmaputra river ke paas situated hai. Ise 1905 me Mary Curzon ke efforts ke baad Reserve Forest banaya gaya tha.',
    keywords: ['location', 'assam', 'where', 'history', 'curzon', 'established', '1905', 'kahan hai', 'kaha par hai', 'itihas', 'mary curzon', 'brahmaputra']
  },
  {
    id: 'kaziranga-unesco-tiger-reserve',
    siteId: 'kaziranga',
    topic: 'conservation_status',
    title: 'Kaziranga UNESCO World Heritage & Tiger Reserve',
    contentEn: 'Kaziranga was declared a UNESCO World Heritage Site in 1985 for its unique natural environment, and later designated a Tiger Reserve in 2006 boasting one of the highest densities of tigers in protected areas worldwide.',
    contentHi: 'काजीरंगा को इसके अद्वितीय प्राकृतिक पर्यावरण के लिए 1985 में यूनेस्को विश्व धरोहर स्थल घोषित किया गया और 2006 में इसे टाइगर रिजर्व का दर्जा दिया गया, जहाँ बाघों का घनत्व विश्व में सर्वाधिक में से एक है।',
    contentHinglish: 'Kaziranga ko 1985 me UNESCO World Heritage Site declare kiya gaya tha aur 2006 me Tiger Reserve banaya gaya jahan world ki highest tiger densities me se ek hai.',
    keywords: ['unesco', 'tiger reserve', 'density', 'conservation', '1985', '2006', 'dharohar', 'tiger']
  },
  {
    id: 'kaziranga-safari-monsoon',
    siteId: 'kaziranga',
    topic: 'tourism_and_safari',
    title: 'Kaziranga Safari Zones & Annual Monsoon Floods',
    contentEn: 'Visitors explore Kaziranga via Jeep and Elephant safaris across four tourism ranges: Kohora (Central), Bagori (Western), Agaratoli (Eastern), and Burapahar. The park remains closed during monsoon months (May-October) due to vital Brahmaputra flooding that regenerates the ecosystem.',
    contentHi: 'पर्यटक चार पर्यटन क्षेत्रों (कोहोरा, बागोरी, अगरातोली, और बुरापहाड़) में जीप और हाथी सफारी के माध्यम से काजीरंगा की सैर करते हैं। मानसून के दौरान (मई से अक्टूबर) ब्रह्मपुत्र की बाढ़ के कारण पार्क बंद रहता है।',
    contentHinglish: 'Visitors Kaziranga me Jeep aur Elephant safari kar sakte hain 4 ranges me: Kohora, Bagori, Agaratoli, aur Burapahar. Monsoon season (May-October) me park close rehta hai.',
    keywords: ['safari', 'visit', 'best time', 'monsoon', 'zones', 'ranges', 'elephant safari', 'jeep', 'ghoomne', 'kab jaye']
  }
];
