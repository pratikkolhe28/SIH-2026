// Multilingual UI Dictionary (English, मराठी, हिंदी)
// Tailored for Maharashtra Agriculture and SIH PS 26131

export const TRANSLATIONS = {
  en: {
    app_title: "MahaAgri Guard",
    app_subtitle: "Government of Maharashtra — SIH PS 26131",
    tab_farmer: "Farmer Portal",
    tab_dashboard: "Surveillance Grid",
    live_status: "AI Grid Online",
    
    // Weather
    weather_title: "Agrometeorological Risk Watch",
    select_district: "Select District",
    temp: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    rain: "Rain",
    favorable_msg: "Normal conditions. Standard monitoring advised.",
    
    // Intake
    intake_heading: "Plant Pathology Diagnosis",
    intake_sub: "Photograph diseased leaves or upload a photo for instant AI diagnosis",
    filter_crop: "Crop Focus:",
    all_crops: "All Crops",
    tomato: "Tomato",
    potato: "Potato",
    cotton: "Cotton",
    
    drop_title: "Capture or Drop Leaf Photo",
    drop_sub: "Supports JPG, PNG up to 15MB",
    btn_camera: "Open Camera",
    btn_upload: "Choose Photo",
    btn_analyzing: "Running AI Inference...",
    
    demo_samples_title: "1-Click Test Samples (Demo Presets)",
    
    // Results
    diag_heading: "AI Diagnosis Report",
    confidence_label: "Confidence Score",
    pathogen: "Pathogen",
    symptoms: "Key Symptoms",
    visual_indicators: "Leaf Pathology Indicators",
    necrotic_tissue: "Necrotic Lesions",
    chlorosis_tissue: "Chlorosis (Yellowing)",
    healthy_tissue: "Healthy Tissue",
    differentials: "Differential Diagnoses",
    geotag_synced: "Report automatically geotagged & uploaded to Maharashtra Outbreak Grid",
    
    // Advisory
    advisory_heading: "Treatment Advisory & Prescriptions",
    tab_organic: "🌿 Organic & Biological",
    tab_chemical: "🧪 Chemical (CIBRC)",
    tab_cultural: "🚜 Cultural Practices",
    dosage: "Dosage",
    phi: "Pre-Harvest Interval (PHI)",
    timing: "Application Timing",
    
    // KVK
    kvk_heading: "Nearest Krishi Vigyan Kendra (KVK)",
    kvk_sub: "District plant clinic & agricultural extension laboratory",
    call_scientist: "Call Scientist",
    toll_free: "Toll-Free Helpline",
    flag_expert: "Flag for Expert Review",
    flagged_msg: "Flagged for Agronomist Verification",
    
    // Dashboard
    kpi_reports: "Total Field Reports",
    kpi_hotspots: "Active Hotspots",
    kpi_critical: "High Severity Outbreaks",
    kpi_traps: "Monitored IoT Traps",
    
    filter_all_districts: "All Districts",
    filter_all_crops: "All Crops",
    filter_all_status: "All Statuses",
    
    map_title: "Geospatial Outbreak & Cluster Surveillance",
    btn_broadcast: "Broadcast Advisory to Farmers",
    
    incidents_title: "Recent Field Incident Reports",
    col_id: "Report ID",
    col_crop: "Crop",
    col_disease: "Disease",
    col_location: "Taluka / District",
    col_severity: "Severity",
    col_status: "Status",
    col_actions: "Actions",
    
    iot_heading: "IoT Smart Pheromone & Spore Traps",
    iot_sub: "Simulated real-time automated field trap telemetry"
  },

  mr: {
    app_title: "महा-पीक रक्षक",
    app_subtitle: "महाराष्ट्र शासन — SIH PS 26131",
    tab_farmer: "शेतकरी सेवा",
    tab_dashboard: "रोग नियंत्रण कक्ष",
    live_status: "प्रणाली सक्रिय",
    
    // Weather
    weather_title: "हवामान आधारित पीक रोग पूर्वसूचना",
    select_district: "जिल्हा निवडा",
    temp: "तापमान",
    humidity: "हवेतील आर्द्रता",
    wind: "वारा",
    rain: "पाऊस",
    favorable_msg: "हवामान सामान्य आहे. नियमित शेत पाहणी करावी.",
    
    // Intake
    intake_heading: "पीक रोग व कीड त्वरित निदान",
    intake_sub: "रोगाची लक्षणे असणाऱ्या पानाचा फोटो काढा व त्वरित उपाय मिळवा",
    filter_crop: "पीक निवडा:",
    all_crops: "सर्व पिके",
    tomato: "टोमॅटो",
    potato: "बटाटा",
    cotton: "कापूस",
    
    drop_title: "कॅमेऱ्याने फोटो घ्या किंवा अपलोड करा",
    drop_sub: "स्पष्ट सूर्यप्रकाशात पानाच्या जवळून फोटो घ्यावा",
    btn_camera: "कॅमेरा सुरू करा",
    btn_upload: "गॅलरीतून निवडा",
    btn_analyzing: "एआय (AI) द्वारे तपासणी सुरू आहे...",
    
    demo_samples_title: "१-क्लिक प्रात्यक्षिक नमुने (Demo Samples)",
    
    // Results
    diag_heading: "रोग निदान अहवाल",
    confidence_label: "निदान अचूकता",
    pathogen: "रोगाचा प्रकार",
    symptoms: "प्रमुख लक्षणे",
    visual_indicators: "पानावरील रोगाचे प्रमाण",
    necrotic_tissue: "करपलेले ठिपके (सड)",
    chlorosis_tissue: "पिवळे पडणे (क्लोरोसिस)",
    healthy_tissue: "निरोगी भाग",
    differentials: "इतर संभाव्य रोग",
    geotag_synced: "अहवाल जीपीएस सह महाराष्ट्र कृषी नियंत्रण कक्षाकडे नोंदवला गेला आहे",
    
    // Advisory
    advisory_heading: "शिफारशीत उपाययोजना व औषध फवारणी",
    tab_organic: "🌿 सेंद्रिय व जैविक उपाय",
    tab_chemical: "🧪 रासायनिक औषधे",
    tab_cultural: "🚜 मशागतीचे उपाय",
    dosage: "प्रमाण (डोस)",
    phi: "तोडणी पूर्व कालावधी (PHI)",
    timing: "फवारणीची योग्य वेळ",
    
    // KVK
    kvk_heading: "जवळचे कृषी विज्ञान केंद्र (KVK)",
    kvk_sub: "जिल्हास्तरीय वनस्पती रोग निदान व माती परीक्षण केंद्र",
    call_scientist: "तज्ज्ञांशी बोला",
    toll_free: "टोल-फ्री हेल्पलाईन",
    flag_expert: "कृषी तज्ज्ञांकडे तपासासाठी पाठवा",
    flagged_msg: "तपासणीसाठी पाठवले आहे",
    
    // Dashboard
    kpi_reports: "एकूण शेतकरी नोंदी",
    kpi_hotspots: "रोग प्रादुर्भाव क्षेत्रे (Hotspots)",
    kpi_critical: "गंभीर प्रादुर्भाव",
    kpi_traps: "आयओटी (IoT) ट्रॅप्स",
    
    filter_all_districts: "सर्व जिल्हे",
    filter_all_crops: "सर्व पिके",
    filter_all_status: "सर्व स्थिती",
    
    map_title: "महाराष्ट्र राज्य पीक रोग प्रादुर्भाव नकाशा",
    btn_broadcast: "शेतकऱ्यांना संदेश पाठवा (Broadcast)",
    
    incidents_title: "अलीकडील रोग नोंदणी व स्थिती",
    col_id: "नोंद क्रमांक",
    col_crop: "पीक",
    col_disease: "रोग / कीड",
    col_location: "तालुका / जिल्हा",
    col_severity: "तीव्रता",
    col_status: "स्थिती",
    col_actions: "क्रिया",
    
    iot_heading: "स्मार्ट सोलर कामगंध व स्पोर ट्रॅप्स",
    iot_sub: "स्वयंचलित शेतातील कीड व बुरशी बीजाणू निरीक्षण"
  },

  hi: {
    app_title: "महा-कृषि रक्षक",
    app_subtitle: "महाराष्ट्र शासन — SIH PS 26131",
    tab_farmer: "किसान सेवा",
    tab_dashboard: "रोग नियंत्रण डैशबोर्ड",
    live_status: "प्रणाली सक्रिय",
    
    // Weather
    weather_title: "मौसम आधारित फसल रोग जोखिम चेतावनी",
    select_district: "जिला चुनें",
    temp: "तापमान",
    humidity: "नमी (आर्द्रता)",
    wind: "हवा",
    rain: "वर्षा",
    favorable_msg: "मौसम सामान्य है। खेत की नियमित निगरानी रखें।",
    
    // Intake
    intake_heading: "फसल रोग एवं कीट त्वरित पहचान",
    intake_sub: "संक्रमित पत्ती की फोटो लें और तत्काल उपचार सलाह पाएं",
    filter_crop: "फसल चुनें:",
    all_crops: "सभी फसलें",
    tomato: "टमाटर",
    potato: "आलू",
    cotton: "कपास",
    
    drop_title: "कैमरे से फोटो लें या अपलोड करें",
    drop_sub: "पत्ती के पास से स्पष्ट रोशनी में फोटो लें",
    btn_camera: "कैमरा खोलें",
    btn_upload: "फोटो चुनें",
    btn_analyzing: "एआई द्वारा रोग परीक्षण जारी है...",
    
    demo_samples_title: "1-क्लिक टेस्ट नमूने (डेमो सैंपल्स)",
    
    // Results
    diag_heading: "रोग निदान रिपोर्ट",
    confidence_label: "सटीकता",
    pathogen: "रोग कारक",
    symptoms: "प्रमुख लक्षण",
    visual_indicators: "पत्ती पर संक्रमण अनुपात",
    necrotic_tissue: "झुलसा / काले धब्बे",
    chlorosis_tissue: "पीलापन",
    healthy_tissue: "स्वस्थ भाग",
    differentials: "अन्य संभावित रोग",
    geotag_synced: "रिपोर्ट जीपीएस सहित महाराष्ट्र कृषि नियंत्रण केंद्र में दर्ज हुई",
    
    // Advisory
    advisory_heading: "उपचार सलाह एवं अनुशंसित छिड़काव",
    tab_organic: "🌿 जैविक एवं प्राकृतिक उपचार",
    tab_chemical: "🧪 रासायनिक उपचार",
    tab_cultural: "🚜 कृषि प्रबंधन के उपाय",
    dosage: "मात्रा (डोज़)",
    phi: "तुड़ाई पूर्व अंतराल (PHI)",
    timing: "छिड़काव का समय",
    
    // KVK
    kvk_heading: "निकटतम कृषि विज्ञान केंद्र (KVK)",
    kvk_sub: "जिला पौध रोग निदान एवं विस्तार प्रयोगशाला",
    call_scientist: "वैज्ञानिक से बात करें",
    toll_free: "टोल-फ्री हेल्पलाइन",
    flag_expert: "विशेषज्ञ समीक्षा हेतु भेजें",
    flagged_msg: "समीक्षा हेतु चिन्हित किया गया",
    
    // Dashboard
    kpi_reports: "कुल किसान रिपोर्ट",
    kpi_hotspots: "संक्रमण हॉटस्पॉट",
    kpi_critical: "गंभीर प्रकोप",
    kpi_traps: "सक्रिय आईओटी (IoT) ट्रैप",
    
    filter_all_districts: "सभी जिले",
    filter_all_crops: "सभी फसलें",
    filter_all_status: "सभी स्थिति",
    
    map_title: "महाराष्ट्र राज्य फसल रोग प्रकोप मानचित्र",
    btn_broadcast: "किसानों को अलर्ट संदेश भेजें",
    
    incidents_title: "हालिया फील्ड रिपोर्ट एवं कार्रवाई",
    col_id: "आईडी",
    col_crop: "फसल",
    col_disease: "रोग",
    col_location: "तहसील / जिला",
    col_severity: "तीव्रता",
    col_status: "स्थिति",
    col_actions: "कार्रवाई",
    
    iot_heading: "स्मार्ट सोलर फेरोमोन व स्पोर ट्रैप्स",
    iot_sub: "स्वचालित कीट एवं फफूंद बीजाणु टेलीमेट्री"
  }
};
