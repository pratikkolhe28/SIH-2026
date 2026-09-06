"""
Krishi Vigyan Kendra (KVK) Directory Service for Maharashtra
Static referral lookup table for agricultural extension labs, agronomists, and soil testing centers.
"""

KVK_CENTERS = [
    {
        "id": "kvk_pune_baramati",
        "district": "Pune",
        "district_mr": "पुणे",
        "name": "KVK Baramati (Agricultural Development Trust)",
        "name_mr": "कृषी विज्ञान केंद्र, बारामती",
        "address": "Malegaon Khurd, Baramati, Dist. Pune - 413115",
        "contact_person": "Dr. Milind Joshi (Senior Scientist & Head)",
        "phone": "+91 2112 255207 / 255227",
        "toll_free": "1800 233 4000",
        "email": "kvkbaramati@yahoo.com",
        "specialties": ["Tissue culture diagnostic lab", "Soil & water testing", "Plant clinic"],
        "lat": 18.1526,
        "lon": 74.5775
    },
    {
        "id": "kvk_pune_narayangaon",
        "district": "Pune",
        "district_mr": "पुणे",
        "name": "KVK Narayangaon (GKD Trust)",
        "name_mr": "कृषी विज्ञान केंद्र, नारायणगाव",
        "address": "At Post Narayangaon, Tal. Junnar, Dist. Pune - 410504 (Tomato Belt)",
        "contact_person": "Dr. Dattatray B. Gaikwad",
        "phone": "+91 2132 242028",
        "toll_free": "1800 180 1551",
        "email": "kvknarayangaon@gmail.com",
        "specialties": ["Tomato disease pathology", "Polyhouse management", "Biological biocontrol production"],
        "lat": 19.1171,
        "lon": 73.9785
    },
    {
        "id": "kvk_nashik_niphad",
        "district": "Nashik",
        "district_mr": "नाशिक",
        "name": "KVK Niphad (YCMOU)",
        "name_mr": "कृषी विज्ञान केंद्र, निफाड (नाशिक)",
        "address": "Agricultural Research Station Campus, Niphad, Dist. Nashik - 422303",
        "contact_person": "Dr. Prakash Patil",
        "phone": "+91 2550 241475",
        "toll_free": "1800 180 1551",
        "email": "kvknashik@gmail.com",
        "specialties": ["Grape & Onion pathology", "Late Blight alert center", "Residue testing"],
        "lat": 20.0782,
        "lon": 74.1121
    },
    {
        "id": "kvk_jalgaon_pal",
        "district": "Jalgaon",
        "district_mr": "जळगाव",
        "name": "KVK Pal (Satpuda Vikas Mandal)",
        "name_mr": "कृषी विज्ञान केंद्र, पाल (जळगाव)",
        "address": "Pal, Tal. Raver, Dist. Jalgaon - 425508",
        "contact_person": "Dr. Hemant Baheti",
        "phone": "+91 2584 276228",
        "toll_free": "1800 180 1551",
        "email": "kvkpal@rediffmail.com",
        "specialties": ["Cotton IPM diagnostics", "Banana tissue lab", "Pheromone trap distributor"],
        "lat": 21.3533,
        "lon": 75.9039
    },
    {
        "id": "kvk_amravati_durgapur",
        "district": "Amravati",
        "district_mr": "अमरावती",
        "name": "KVK Durgapur (Shri Shivaji Education Society)",
        "name_mr": "कृषी विज्ञान केंद्र, दुर्गापूर (अमरावती)",
        "address": "Durgapur, Badnera Road, Dist. Amravati - 444607",
        "contact_person": "Dr. K. P. Singh",
        "phone": "+91 721 2580525",
        "toll_free": "1800 180 1551",
        "email": "kvkamravati@rediffmail.com",
        "specialties": ["Cotton Whitefly & Pink Bollworm surveillance", "Orange gummosis testing"],
        "lat": 20.8931,
        "lon": 77.7214
    },
    {
        "id": "kvk_ahmednagar_babhaleshwar",
        "district": "Ahmednagar",
        "district_mr": "अहिल्यानगर (अहमदनगर)",
        "name": "KVK Babhaleshwar (PIRENS)",
        "name_mr": "कृषी विज्ञान केंद्र, बाभळेश्वर",
        "address": "Babhaleshwar, Tal. Rahata, Dist. Ahmednagar - 413737",
        "contact_person": "Dr. Bhaskar Gaikwad",
        "phone": "+91 2422 252414",
        "toll_free": "1800 180 1551",
        "email": "kvk_babhaleshwar@yahoo.com",
        "specialties": ["Precision farming", "Microbial culture lab", "Community radio station"],
        "lat": 19.6465,
        "lon": 74.5204
    },
    {
        "id": "kvk_solapur",
        "district": "Solapur",
        "district_mr": "सोलापूर",
        "name": "KVK Kegaon (Dr. DY Patil Pratishthan)",
        "name_mr": "कृषी विज्ञान केंद्र, केगाव (सोलापूर)",
        "address": "Kegaon, Solapur-Pune Highway, Solapur - 413255",
        "contact_person": "Dr. L. R. Tambade",
        "phone": "+91 217 2500420",
        "toll_free": "1800 180 1551",
        "email": "kvksolapur@yahoo.co.in",
        "specialties": ["Pomegranate bacterial blight diagnosis", "Dryland horti-pasture"],
        "lat": 17.6891,
        "lon": 75.8522
    },
    {
        "id": "kvk_wardha_selsura",
        "district": "Wardha",
        "district_mr": "वर्धा",
        "name": "KVK Selsura (PDKV Akola)",
        "name_mr": "कृषी विज्ञान केंद्र, सेलसुरा (वर्धा)",
        "address": "At Post Selsura, Tal. Deoli, Dist. Wardha - 442001",
        "contact_person": "Dr. J. P. Deshmukh",
        "phone": "+91 7152 287074",
        "toll_free": "1800 180 1551",
        "email": "kvk.selsura@pdkv.ac.in",
        "specialties": ["Bt Cotton insect scouting", "Organic farm inputs testing"],
        "lat": 20.6721,
        "lon": 78.4735
    }
]


def get_nearest_kvk(district: str = "Pune"):
    """
    Find matching KVK center by district name.
    """
    dist_norm = district.strip().lower()
    for kvk in KVK_CENTERS:
        if dist_norm in kvk["district"].lower() or kvk["district"].lower() in dist_norm:
            return kvk
    return KVK_CENTERS[0] # Default to KVK Pune
