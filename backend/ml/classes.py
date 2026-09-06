"""
Crop & Disease Class Definitions for SIH PS 26131
Focus crops: Tomato, Potato, Cotton (Maharashtra Staples)
"""

CLASSES = [
    {
        "id": "tomato_early_blight",
        "crop": "Tomato",
        "crop_mr": "टोमॅटो",
        "crop_hi": "टमाटर",
        "disease": "Early Blight",
        "disease_mr": "लवकर येणारा करपा (अल्टरनेरिया)",
        "disease_hi": "अगेती झुलसा",
        "pathogen": "Alternaria solani",
        "type": "fungal",
        "severity": "high",
        "risk_weather": "Warm temperature (24-30°C) with high humidity or heavy dew",
        "symptoms": [
            "Concentric rings or 'target-board' spots on older leaves",
            "Yellowing halo around dark brown lesions",
            "Premature defoliation starting from the base of the plant"
        ],
        "symptoms_mr": [
            "जुन्या पानांवर गोलाकार वलयी तपकिरी डाग (टार्गेट बोर्ड सारखे)",
            "तपकिरी डागांभोवती पिवळसर कडा",
            "झाडाच्या खालच्या पानांची गळती सुरू होणे"
        ],
        "symptoms_hi": [
            "पुरानी पत्तियों पर गाढ़े भूरे छल्लेदार धब्बे (टारगेट बोर्ड की तरह)",
            "धब्बों के चारों ओर पीला घेरा",
            "पौधे की निचली पत्तियों का समय से पहले झड़ना"
        ]
    },
    {
        "id": "tomato_late_blight",
        "crop": "Tomato",
        "crop_mr": "टोमॅटो",
        "crop_hi": "टमाटर",
        "disease": "Late Blight",
        "disease_mr": "उशिरा येणारा करपा (फायटोफ्थोरा)",
        "disease_hi": "पछेती झुलसा",
        "pathogen": "Phytophthora infestans",
        "type": "fungal/oomycete",
        "severity": "critical",
        "risk_weather": "Cool, wet weather (15-22°C) with persistent humidity > 90%",
        "symptoms": [
            "Water-soaked large dark lesions on leaves and stems",
            "White fungal fuzzy growth on leaf undersides in humid conditions",
            "Rapid collapse and rotting of entire foliage and green fruits"
        ],
        "symptoms_mr": [
            "पाने आणि खोडावर पाणी साचल्यासारखे मोठे काळपट चट्टे",
            "दमट हवेत पानांच्या खालच्या बाजूस पांढरी बुरशी",
            "झाड व फळे वेगाने सडून काळे पडणे"
        ],
        "symptoms_hi": [
            "पत्तियों और तनों पर पानी के भीगे हुए बड़े काले धब्बे",
            "नम मौसम में पत्तियों के नीचे सफेद फफूंद",
            "पौधे और हरे फलों का तेजी से सड़ना"
        ]
    },
    {
        "id": "tomato_bacterial_spot",
        "crop": "Tomato",
        "crop_mr": "टोमॅटो",
        "crop_hi": "टमाटर",
        "disease": "Bacterial Spot",
        "disease_mr": "जिवाणूजन्य ठिपके (बॅक्टेरियल स्पॉट)",
        "disease_hi": "जीवाणु जनित धब्बा",
        "pathogen": "Xanthomonas perforans",
        "type": "bacterial",
        "severity": "medium",
        "risk_weather": "Warm rainy weather (25-32°C) with driving winds",
        "symptoms": [
            "Small angular greasy/water-soaked spots turning black",
            "Leaves appear ragged and torn",
            "Scabby raised black specks on green fruits"
        ],
        "symptoms_mr": [
            "पानांवर लहान कोनीय काळपट ठिपके",
            "पाने फाटलेली किंवा कुरतडल्यासारखी दिसणे",
            "हिरव्या फळांवर खरखरीत काळे ठिपके"
        ],
        "symptoms_hi": [
            "पत्तियों पर छोटे कोणीय काले धब्बे",
            "पत्तियों का कटा-फटा दिखना",
            "हरे फलों पर उभरे हुए काले खुरदुरे चकत्ते"
        ]
    },
    {
        "id": "tomato_healthy",
        "crop": "Tomato",
        "crop_mr": "टोमॅटो",
        "crop_hi": "टमाटर",
        "disease": "Healthy Plant",
        "disease_mr": "निरोगी रोप (कोणताही रोग नाही)",
        "disease_hi": "स्वस्थ पौधा",
        "pathogen": "None",
        "type": "healthy",
        "severity": "none",
        "risk_weather": "Normal growth conditions",
        "symptoms": ["Lush green foliage", "No visible lesions or yellowing", "Normal vigorous vigor"],
        "symptoms_mr": ["हिरवीगार ताजी पाने", "कोणतेही डाग किंवा पिवळेपणा नाही", "निरोगी व जोमदार वाढ"],
        "symptoms_hi": ["हरी-भरी स्वस्थ पत्तियां", "कोई धब्बे या पीलापन नहीं", "पौधे का सामान्य विकास"]
    },
    {
        "id": "potato_early_blight",
        "crop": "Potato",
        "crop_mr": "बटाटा",
        "crop_hi": "आलू",
        "disease": "Early Blight",
        "disease_mr": "लवकर येणारा करपा (बटाटा)",
        "disease_hi": "आलू की अगेती झुलसा",
        "pathogen": "Alternaria solani",
        "type": "fungal",
        "severity": "high",
        "risk_weather": "Dry warm days followed by heavy dew or wet nights",
        "symptoms": [
            "Dark brown concentric rings on lower leaves",
            "Leaf tissue turns brown and dry like paper",
            "Stunted tuber development"
        ],
        "symptoms_mr": [
            "खालच्या पानांवर गडद तपकिरी वलयांकित चट्टे",
            "पाने कागदासारखी कोरडी होऊन वाळतात",
            "बटाट्याचा आकार लहान राहणे"
        ],
        "symptoms_hi": [
            "निचली पत्तियों पर गाढ़े भूरे छल्लेदार चकत्ते",
            "पत्तियां सूखकर पापड़ी जैसी हो जाती हैं",
            "कंद (आलू) का विकास रुकना"
        ]
    },
    {
        "id": "potato_late_blight",
        "crop": "Potato",
        "crop_mr": "बटाटा",
        "crop_hi": "आलू",
        "disease": "Late Blight",
        "disease_mr": "उशिरा येणारा करपा (बटाटा)",
        "disease_hi": "आलू की पछेती झुलसा",
        "pathogen": "Phytophthora infestans",
        "type": "fungal/oomycete",
        "severity": "critical",
        "risk_weather": "Foggy, cloudy days with temperatures between 12-20°C and RH > 85%",
        "symptoms": [
            "Rapidly spreading irregular water-soaked spots",
            "Leaves turn purple-black and curl inwards",
            "Rotting tubers with brown granular flesh inside"
        ],
        "symptoms_mr": [
            "वेगाने पसरणारे अनियमित काळसर चट्टे",
            "पाने जांभळट काळी पडून आकसणे",
            "जमिनीतील बटाटे सडून कुजणे"
        ],
        "symptoms_hi": [
            "अनियमित पानी से भरे तेजी से फैलने वाले काले धब्बे",
            "पत्तियां मुड़कर काली पड़ जाती हैं",
            "आलू के कंद अंदर से सड़ने लगते हैं"
        ]
    },
    {
        "id": "potato_healthy",
        "crop": "Potato",
        "crop_mr": "बटाटा",
        "crop_hi": "आलू",
        "disease": "Healthy Plant",
        "disease_mr": "निरोगी रोप (कोणताही रोग नाही)",
        "disease_hi": "स्वस्थ पौधा",
        "pathogen": "None",
        "type": "healthy",
        "severity": "none",
        "risk_weather": "Optimal growing conditions",
        "symptoms": ["Uniform green canopy", "No leaf lesions", "Healthy stem growth"],
        "symptoms_mr": ["एकसारखा हिरवा विस्तार", "पानांवर कसलेही डाग नाहीत", "मजबूत खोड"],
        "symptoms_hi": ["एकसमान हरी पत्तियां", "कोई रोग नहीं", "मजबूत तना"]
    },
    {
        "id": "cotton_bacterial_blight",
        "crop": "Cotton",
        "crop_mr": "कापूस",
        "crop_hi": "कपास",
        "disease": "Bacterial Blight (Black Arm)",
        "disease_mr": "काळा हात / जिवाणू करपा (कापूस)",
        "disease_hi": "कपास का जीवाणु झुलसा / ब्लैक आर्म",
        "pathogen": "Xanthomonas citri pv. malvacearum",
        "type": "bacterial",
        "severity": "high",
        "risk_weather": "Humid monsoon weather (30-35°C) with continuous wet spells",
        "symptoms": [
            "Angular water-soaked spots bounded by leaf veins",
            "Black lesions girdling petioles and main stems (Black Arm)",
            "Premature shedding of squares and cotton bolls"
        ],
        "symptoms_mr": [
            "पानांच्या शिरांमध्ये मर्यादित कोनीय काळे डाग",
            "फांद्या व देठांवर काळे चट्टे पडून फांद्या वाळणे (काळा हात)",
            "पात्या व बोंडे अकाली गळून पडणे"
        ],
        "symptoms_hi": [
            "पत्तियों की नसों के बीच कोणीय काले धब्बे",
            "तने और टहनियों पर काले घाव (ब्लैक आर्म)",
            "कपास के गूलर और कलियों का असमय गिरना"
        ]
    },
    {
        "id": "cotton_leaf_curl",
        "crop": "Cotton",
        "crop_mr": "कापूस",
        "crop_hi": "कपास",
        "disease": "Leaf Curl / Sucking Pest Damage",
        "disease_mr": "पर्णगुच्छ / चुरडा-मुरडा (पांढरी माशी प्रादुर्भाव)",
        "disease_hi": "पत्ती मरोड़ रोग (सफेद मक्खी प्रकोप)",
        "pathogen": "Cotton Leaf Curl Virus (CLCuV) transmitted by Whitefly",
        "type": "viral/pest-vector",
        "severity": "critical",
        "risk_weather": "Hot dry spells (32-40°C) favoring rapid whitefly multiplication",
        "symptoms": [
            "Upward or downward curling of leaf margins",
            "Thickening and greening of veins (enation)",
            "Severe stunting and minimal boll formation"
        ],
        "symptoms_mr": [
            "पाने वर किंवा खाली वाटीसारखी वळणे (चुरडा मुरडा)",
            "पानांच्या शिरा जाड व गडद हिरव्या होणे",
            "झाडाची वाढ खुंटणे व बोंडे न भरणे"
        ],
        "symptoms_hi": [
            "पत्तियों का ऊपर या नीचे की ओर मुड़ना (मरोड़िया)",
            "पत्तियों की नसें मोटी होना",
            "पौधा बौना रह जाना और पैदावार घटना"
        ]
    },
    {
        "id": "cotton_healthy",
        "crop": "Cotton",
        "crop_mr": "कापूस",
        "crop_hi": "कपास",
        "disease": "Healthy Crop",
        "disease_mr": "निरोगी कापूस पीक",
        "disease_hi": "स्वस्थ कपास की फसल",
        "pathogen": "None",
        "type": "healthy",
        "severity": "none",
        "risk_weather": "Favorable agronomic conditions",
        "symptoms": ["Broad healthy foliage", "No vein clearing or curl", "Normal sympodial branches"],
        "symptoms_mr": ["रुंद निरोगी हिरवी पाने", "पानांवर सुरकुत्या नाहीत", "उत्कृष्ट फांद्या व वाढ"],
        "symptoms_hi": ["चौड़ी स्वस्थ पत्तियां", "कोई सिकुड़न नहीं", "स्वस्थ टहनियां"]
    }
]

CLASS_INDEX = {item["id"]: i for i, item in enumerate(CLASSES)}
INDEX_TO_CLASS = {i: item for i, item in enumerate(CLASSES)}
CLASS_NAMES = [item["id"] for item in CLASSES]
