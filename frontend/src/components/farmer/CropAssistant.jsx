import React, { useEffect, useRef, useState } from "react";
import {
  Bot, Send, Mic, MicOff, Volume2, VolumeX, Leaf, ShieldCheck, LoaderCircle,
  Sparkles, Wind, Droplets, Thermometer, AlertTriangle, CheckCircle2,
  PhoneCall, ShieldAlert
} from "lucide-react";
import { askCropAssistant } from "../../utils/api";

const COPY = {
  en: {
    title: "Farm Saathi AI", subtitle: "Ask in English, हिंदी or मराठी. You can also speak your question.", speedLabel: "Voice speed", voiceHint: "English uses an Indian voice when available on your device.", placeholder: "Ask about your crop, disease or next step…", send: "Send", thinking: "Thinking…", listen: "Speak", stop: "Stop listening", speaking: "Listening…", voice: "Listen to answer", stopVoice: "Stop voice", welcome: "Namaste! I can explain your crop screening and next steps in simple language. Upload a crop photo first for advice specific to your result.",
    prompts: ["Explain my result", "What should I do now?", "Should I spray pesticide?", "How can I prevent spread?"],
    noDiagnosis: "I don't have a crop diagnosis for this session yet. Upload a clear leaf photo first, or tell me the crop and symptoms you see.",
    explain: (crop, disease, confidence, symptoms) => `The photo screening is for ${crop}: ${disease}. The model score is ${confidence || "not available"}. ${symptoms ? `Reported indicators: ${symptoms}. ` : ""}This is a screening result, not a confirmed diagnosis. Check several plants and compare the symptoms with a local agriculture officer or KVK before treatment.`,
    next: "First inspect several plants, including both sides of leaves, and note how many are affected. Do not spray only because of this AI result. If symptoms are spreading or the model is uncertain, ask a KVK or agriculture officer to verify it. Follow only locally approved guidance and the product label.",
    spray: "Do not spray automatically based on one photo. Confirm the pest or disease and whether a locally approved action threshold has been reached. If treatment is needed, use only a product approved for that crop and problem, follow its label and protective-equipment instructions, and check the pre-harvest interval. Ask your KVK or agriculture officer if unsure.",
    spread: "Avoid moving infected plant material between fields. Inspect nearby plants, clean tools after handling affected plants, follow crop-specific sanitation guidance, and report similar symptoms from nearby farms. Do not burn or dispose of plant waste in a way that violates local guidance.",
    weather: (risk) => `The available weather service reports ${risk || "an unavailable risk level"}. Weather risk alone cannot confirm a disease. Scout the crop regularly and use local, crop-specific advisories.`,
    general: "I can help explain the current screening, what to inspect, when to seek expert verification, and safe prevention steps. I cannot confirm a disease from a photo alone or replace a local agricultural expert. Try asking: ‘What should I do now?’",
    voiceUnsupported: "Voice input is not supported by this browser. Try the latest Chrome or Edge, or type your question.", voiceError: "I couldn't hear that clearly. Please try again or type your question.",
  },
  hi: {
    title: "फार्म साथी AI", subtitle: "हिंदी, मराठी या English में पूछें। आप बोलकर भी सवाल कर सकते हैं।", speedLabel: "आवाज़ की गति", voiceHint: "अंग्रेज़ी के लिए आपके डिवाइस पर उपलब्ध होने पर भारतीय आवाज़ चुनी जाएगी।", placeholder: "फसल, बीमारी या अगले कदम के बारे में पूछें…", send: "भेजें", thinking: "सोच रहा है…", listen: "बोलें", stop: "सुनना बंद करें", speaking: "सुन रहा है…", voice: "जवाब सुनें", stopVoice: "आवाज़ बंद करें", welcome: "नमस्ते! मैं आपकी फसल की जाँच और अगले कदम आसान भाषा में समझा सकता हूँ। आपकी रिपोर्ट के अनुसार सलाह के लिए पहले फसल की फोटो अपलोड करें।",
    prompts: ["मेरी रिपोर्ट समझाओ", "अब क्या करना चाहिए?", "क्या कीटनाशक छिड़कूँ?", "बीमारी फैलने से कैसे रोकें?"],
    noDiagnosis: "इस सत्र में अभी फसल की जाँच उपलब्ध नहीं है। पहले पत्ते की साफ फोटो अपलोड करें या फसल और लक्षण बताएं।",
    explain: (crop, disease, confidence, symptoms) => `फोटो की शुरुआती जाँच में फसल ${crop} और संभावित स्थिति ${disease} दिखाई गई है। मॉडल स्कोर ${confidence || "उपलब्ध नहीं"} है। ${symptoms ? `दिखाए गए लक्षण: ${symptoms}। ` : ""}यह पक्की बीमारी की पुष्टि नहीं है। उपचार से पहले कई पौधों की जाँच करें और कृषि अधिकारी या KVK से पुष्टि लें।`,
    next: "पहले खेत के कई पौधों की जाँच करें और पत्तों के दोनों तरफ देखें। केवल AI रिपोर्ट के आधार पर छिड़काव न करें। लक्षण फैल रहे हों या परिणाम स्पष्ट न हो तो KVK या कृषि अधिकारी से पुष्टि कराएँ। स्थानीय रूप से स्वीकृत सलाह और उत्पाद के लेबल का पालन करें।",
    spray: "एक फोटो देखकर तुरंत छिड़काव न करें। पहले बीमारी या कीट की पुष्टि करें और देखें कि स्थानीय कार्रवाई सीमा पूरी हुई है या नहीं। जरूरत होने पर उसी फसल और समस्या के लिए स्वीकृत उत्पाद ही इस्तेमाल करें। लेबल, सुरक्षा उपकरण और कटाई से पहले की प्रतीक्षा अवधि का पालन करें। संदेह हो तो KVK से पूछें।",
    spread: "संक्रमित पौधों का हिस्सा दूसरे खेतों में न ले जाएँ। आसपास के पौधों की जाँच करें, प्रभावित पौधों को छूने के बाद औजार साफ करें और स्थानीय स्वच्छता सलाह अपनाएँ। पास के खेतों में ऐसे लक्षण दिखें तो रिपोर्ट करें।",
    weather: (risk) => `मौसम सेवा के अनुसार जोखिम स्तर ${risk || "उपलब्ध नहीं"} है। केवल मौसम से बीमारी की पुष्टि नहीं होती। फसल की नियमित जाँच करें और स्थानीय फसल-विशिष्ट सलाह लें।`,
    general: "मैं रिपोर्ट, जाँच के अगले कदम, विशेषज्ञ से पुष्टि और सुरक्षित रोकथाम समझा सकता हूँ। केवल फोटो से बीमारी की पक्की पुष्टि नहीं कर सकता। पूछें: ‘अब क्या करना चाहिए?’",
    voiceUnsupported: "इस ब्राउज़र में बोलकर सवाल पूछने की सुविधा नहीं है। नवीनतम Chrome या Edge इस्तेमाल करें, या सवाल टाइप करें।", voiceError: "आवाज़ साफ़ नहीं सुनाई दी। फिर से बोलें या सवाल टाइप करें।",
  },
  mr: {
    title: "फार्म साथी AI", subtitle: "मराठी, हिंदी किंवा English मध्ये विचारा. बोलूनही प्रश्न विचारू शकता.", speedLabel: "आवाजेचा वेग", voiceHint: "तुमच्या डिव्हाइसवर उपलब्ध असल्यास इंग्रजीसाठी भारतीय आवाज निवडला जाईल.", placeholder: "पीक, रोग किंवा पुढील उपायाबद्दल विचारा…", send: "पाठवा", thinking: "विचार करत आहे…", listen: "बोला", stop: "ऐकणे थांबवा", speaking: "ऐकत आहे…", voice: "उत्तर ऐका", stopVoice: "आवाज थांबवा", welcome: "नमस्कार! मी तुमच्या पिकाच्या तपासणीचा निकाल आणि पुढील पावले सोप्या भाषेत समजावू शकतो. तुमच्या निकालानुसार मार्गदर्शनासाठी आधी पिकाचा फोटो अपलोड करा.",
    prompts: ["माझा निकाल समजावून सांगा", "आता काय करावे?", "कीटकनाशक फवारू का?", "रोगाचा प्रसार कसा रोखावा?"],
    noDiagnosis: "या सत्रात पिकाची तपासणी उपलब्ध नाही. आधी पानाचा स्पष्ट फोटो अपलोड करा किंवा पीक आणि लक्षणे सांगा.",
    explain: (crop, disease, confidence, symptoms) => `फोटोच्या प्राथमिक तपासणीत पीक ${crop} आणि संभाव्य स्थिती ${disease} दिसते. मॉडेल स्कोअर ${confidence || "उपलब्ध नाही"} आहे. ${symptoms ? `दिसणारी लक्षणे: ${symptoms}. ` : ""}हा निश्चित निदानाचा पुरावा नाही. उपचारापूर्वी अनेक झाडे तपासा आणि कृषी अधिकारी किंवा KVK कडून खात्री करून घ्या.`,
    next: "आधी शेतातील अनेक झाडे तपासा आणि पानांच्या दोन्ही बाजू पाहा. फक्त AI निकालावरून फवारणी करू नका. लक्षणे वाढत असतील किंवा निकाल अनिश्चित असेल तर KVK किंवा कृषी अधिकाऱ्याकडून खात्री करून घ्या. स्थानिक मान्यताप्राप्त सल्ला आणि उत्पादनाच्या लेबलचे पालन करा.",
    spray: "एका फोटोवरून लगेच फवारणी करू नका. आधी कीड किंवा रोगाची खात्री करा आणि स्थानिक कृती मर्यादा पूर्ण झाली आहे का ते तपासा. गरज असल्यास त्या पिकासाठी आणि समस्येसाठी मंजूर उत्पादनच वापरा. लेबल, सुरक्षा साधने आणि काढणीपूर्व प्रतीक्षा कालावधी पाळा. शंका असल्यास KVK ला विचारा.",
    spread: "बाधित वनस्पतींचे भाग दुसऱ्या शेतात नेऊ नका. जवळच्या झाडांची तपासणी करा, बाधित झाडांना हात लावल्यानंतर साधने स्वच्छ करा आणि स्थानिक स्वच्छता सल्ला पाळा. शेजारच्या शेतात अशी लक्षणे दिसल्यास नोंद करा.",
    weather: (risk) => `हवामान सेवेनुसार जोखीम पातळी ${risk || "उपलब्ध नाही"} आहे. केवळ हवामानावरून रोगाची खात्री होत नाही. पिकाची नियमित पाहणी करा आणि स्थानिक पीक-विशिष्ट सल्ला घ्या.`,
    general: "मी तपासणीचा निकाल, पुढील पावले, तज्ज्ञांकडून खात्री आणि सुरक्षित प्रतिबंध समजावू शकतो. फक्त फोटोवरून रोगाची खात्री देता येत नाही. विचारा: ‘आता काय करावे?’",
    voiceUnsupported: "या ब्राउझरमध्ये आवाजातून प्रश्न विचारण्याची सुविधा नाही. नवीन Chrome किंवा Edge वापरा किंवा प्रश्न टाइप करा.", voiceError: "आवाज स्पष्ट ऐकू आला नाही. पुन्हा प्रयत्न करा किंवा प्रश्न टाइप करा.",
  },
};

const COMPANION_COPY = {
  en: {
    hubEyebrow: "FIELD INTELLIGENCE & ADVISORY HUB",
    sprayTitle: "Real-Time Spraying Window",
    windLabel: "Wind",
    humidityLabel: "Humidity",
    tempLabel: "Temp",
    quickTitle: "1-Click Voice Consultations",
    quickSub: "Tap any question to ask Farm Saathi AI with instant voice reply",
    queryExplain: "Explain my crop screening report",
    queryOrganic: "Best organic bio-pesticide recipe",
    querySpraySafe: "Is it safe to spray in today's weather?",
    querySpread: "How to stop disease from spreading?",
    queryKvk: "When should I consult a KVK scientist?",
    actionsTitle: "Field Inspection & Quarantine",
    action1: "Inspect leaf undersides on 10 random neighboring plants",
    action2: "Sterilize pruning shears and tools with 1% disinfectant",
    action3: "Avoid walking between wet rows during early morning dew",
    action4: "Flag report for KVK review if symptoms advance in 48h",
    helplineTitle: "Official Farmer Emergency Support",
    kisanCallCenter: "Kisan Call Center (24x7 Toll-Free)",
    callNow: "Call 1800-180-1551",
    tapToAsk: "Tap to ask",
  },
  hi: {
    hubEyebrow: "खेत सुरक्षा एवं स्मार्ट परामर्श केंद्र",
    sprayTitle: "छिड़काव मौसम सुरक्षा सलाह",
    windLabel: "हवा",
    humidityLabel: "नमी",
    tempLabel: "तापमान",
    quickTitle: "1-क्लिक आवाज़ परामर्श",
    quickSub: "बोलकर उत्तर सुनने के लिए किसी भी सवाल पर टैप करें",
    queryExplain: "मेरी फसल की जाँच रिपोर्ट समझाओ",
    queryOrganic: "सर्वोत्तम जैविक/नीम कीटनाशक का नुस्खा",
    querySpraySafe: "क्या आज के मौसम में छिड़काव सुरक्षित है?",
    querySpread: "बीमारी को बाकी पौधों में फैलने से कैसे रोकें?",
    queryKvk: "मुझे KVK वैज्ञानिक से कब संपर्क करना चाहिए?",
    actionsTitle: "खेत निरीक्षण एवं रोकथाम नियम",
    action1: "पास के 10 पौधों में पत्तियों के नीचे की तरफ जाँच करें",
    action2: "कटाई-छँटाई के औजारों को साफ व रोगाणुमुक्त करें",
    action3: "सुबह की ओस में गीले पौधों के बीच आवाजाही से बचें",
    action4: "लक्षण 48 घंटे में बढ़ें तो तुरंत KVK समीक्षा का अनुरोध करें",
    helplineTitle: "आधिकारिक किसान आपातकालीन सहायता",
    kisanCallCenter: "किसान कॉल सेंटर (24x7 निःशुल्क)",
    callNow: "कॉल करें 1800-180-1551",
    tapToAsk: "पूछने के लिए टैप करें",
  },
  mr: {
    hubEyebrow: "शेत सुरक्षा व कृषी संवाद केंद्र",
    sprayTitle: "फवारणी हवामान सुरक्षा सल्ला",
    windLabel: "वारा",
    humidityLabel: "आर्द्रता",
    tempLabel: "तापमान",
    quickTitle: "१-क्लिक आवाज सल्ला",
    quickSub: "बोलून उत्तर ऐकण्यासाठी कोणत्याही प्रश्नावर टॅप करा",
    queryExplain: "माझा पीक तपासणी निकाल समजावून सांगा",
    queryOrganic: "सर्वोत्तम सेंद्रिय/जैविक कीटकनाशक पद्धत",
    querySpraySafe: "आजच्या हवामानात फवारणी करणे सुरक्षित आहे का?",
    querySpread: "रोगाचा इतर झाडांवर होणारा प्रसार कसा रोखावा?",
    queryKvk: "KVK कृषी शास्त्रज्ञांचा सल्ला कधी घ्यावा?",
    actionsTitle: "शेत पाहणी व प्रतिबंधात्मक उपाय",
    action1: "जवळच्या १० झाडांच्या पानांची मागची बाजू काळजीपूर्वक तपासा",
    action2: "छाटणीची हत्यारे व अवजारे १% जंतुनाशकाने स्वच्छ करा",
    action3: "सकाळच्या दवामध्ये ओल्या झाडांमधून जाणे टाळा",
    action4: "४८ तासांत लक्षणे वाढल्यास KVK कडे पुनरावलोकन नोंदवा",
    helplineTitle: "शासकीय शेतकरी आपत्कालीन मदत",
    kisanCallCenter: "किसान कॉल सेंटर (२४x७ विनामूल्य)",
    callNow: "कॉल करा १८००-१८०-१५५१",
    tapToAsk: "विचारण्यासाठी टॅप करा",
  },
};

const LOCALES = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

function getSprayingSafety(weatherData, lang) {
  const wind = Number(weatherData?.wind_speed ?? 8);
  const rain = Number(weatherData?.rain_1h ?? 0);
  const humidity = Number(weatherData?.humidity ?? 55);
  const temp = Number(weatherData?.temp ?? 26);

  if (rain > 0.4) {
    return {
      status: "danger",
      badge: lang === "mr" ? "फवारणी टाळा (पाऊस धोका)" : lang === "hi" ? "छिड़काव से बचें (बारिश का जोखिम)" : "Avoid Spraying: Rain Risk",
      desc: lang === "mr" ? "सध्याच्या पावसामुळे औषध धुऊन जाईल. कोरड्या हवामानाची वाट पाहा." : lang === "hi" ? "बारिश से कीटनाशक धुल जाएगा। मौसम साफ होने की प्रतीक्षा करें।" : "Active precipitation will wash away chemical and organic applications.",
      wind, humidity, temp, rain
    };
  }
  if (wind > 14) {
    return {
      status: "warning",
      badge: lang === "mr" ? "सावधान: जास्त वारा (Drift)" : lang === "hi" ? "सावधान: तेज़ हवा (ड्रिफ्ट खतरा)" : "Caution: High Wind Drift",
      desc: lang === "mr" ? `वाऱ्याचा वेग ${wind} km/h आहे. औषध हवेत उडून वाया जाण्याचा धोका.` : lang === "hi" ? `हवा की गति ${wind} km/h है। कीटनाशक उड़ने का गंभीर खतरा है।` : `Wind speed is ${wind} km/h. High drift hazard and wasted pesticide spray.`,
      wind, humidity, temp, rain
    };
  }
  if (temp > 34) {
    return {
      status: "warning",
      badge: lang === "mr" ? "दुपारची फवारणी टाळा" : lang === "hi" ? "दोपहर में छिड़काव न करें" : "Avoid Midday Heat (Evaporation)",
      desc: lang === "mr" ? "तापमान जास्त असल्याने सकाळी ६-९ किंवा संध्याकाळी ४-६ च्या दरम्यान फवारणी करा." : lang === "hi" ? "तेज धूप के कारण सुबह 6-9 बजे या शाम 4-6 बजे छिड़काव करें।" : "High leaf scorch and droplet evaporation risk. Spray in cooler morning/evening hours.",
      wind, humidity, temp, rain
    };
  }
  return {
    status: "good",
    badge: lang === "mr" ? "फवारणीसाठी अनुकूल वेळ" : lang === "hi" ? "छिड़काव के लिए अनुकूल समय" : "Optimal Spraying Window",
    desc: lang === "mr" ? `वाऱ्याचा वेग ${wind} km/h व आर्द्रता ${humidity}% फवारणीसाठी अगदी योग्य आहे.` : lang === "hi" ? `हवा की गति ${wind} km/h व नमी ${humidity}% छिड़काव के लिए पूरी तरह अनुकूल है।` : `Wind ${wind} km/h and humidity ${humidity}% ensure effective leaf absorption and minimal drift.`,
    wind, humidity, temp, rain
  };
}

function createAnswer(question, lang, diagnosisData, weatherData) {
  const c = COPY[lang] || COPY.en;
  const q = question.toLocaleLowerCase();
  const pred = diagnosisData?.prediction;
  const disease = lang === "mr" ? (pred?.disease_mr || pred?.disease) : lang === "hi" ? (pred?.disease_hi || pred?.disease) : pred?.disease;
  const crop = lang === "mr" ? (pred?.crop_mr || pred?.crop) : lang === "hi" ? (pred?.crop_hi || pred?.crop) : pred?.crop;
  if (/result|diagnos|report|रिपोर्ट|निकाल|निदान|बीमारी कौन|कौन सा रोग|काय रोग|कोणता रोग|disease|रोग/.test(q) && pred) {
    return c.explain(crop || "crop", disease || "uncertain condition", pred.confidence_pct, lang === "mr" ? pred.symptoms_mr : lang === "hi" ? pred.symptoms_hi : pred.symptoms);
  }
  if (/spray|pesticide|chemical|छिड़क|स्प्रे|कीटनाशक|फवार|औषध|दवा/.test(q)) return c.spray;
  if (/spread|prevent|control|फैल|रोक|बचाव|प्रसार|प्रतिबंध|कसा रोख|कसे रोख/.test(q)) return c.spread;
  if (/weather|rain|मौसम|बारिश|पाऊस|हवामान|जोखिम|risk/.test(q)) return c.weather(weatherData?.risk_level || weatherData?.risk?.level || weatherData?.risk || "not available");
  if (/what should|what do|next|now what|क्या कर|अब क्या|क्या करना|करना चाहिए|आता काय|काय करावे|पुढे काय|उपाय/.test(q)) return pred ? c.next : c.noDiagnosis;
  if (/kvk|scientist|officer|वैज्ञानिक|शास्त्रज्ञ|अधिकारी/.test(q)) {
    return lang === "mr"
      ? "जवळच्या कृषी विज्ञान केंद्राशी (KVK) संपर्क साधा. शेतात २५% पेक्षा जास्त झाडांवर लक्षणे आढळल्यास वर दिलेल्या 'तज्ज्ञांशी बोला' बटणावर क्लिक करा."
      : lang === "hi"
      ? "अपने निकटतम कृषि विज्ञान केंद्र (KVK) से संपर्क करें। यदि खेत में 25% से अधिक पौधों में लक्षण हैं, तो ऊपर 'वैज्ञानिक से बात करें' बटन दबाएँ।"
      : "Contact your nearest Krishi Vigyan Kendra (KVK). If more than 25% of crops show symptoms or the AI screening is uncertain, use the 'Call Scientist' button above.";
  }
  if (!pred) return c.noDiagnosis;
  return c.general;
}

export function buildSpokenSummary(diagnosisData, lang) {
  const c = COPY[lang] || COPY.en;
  const pred = diagnosisData?.prediction;
  if (!pred) return c.noDiagnosis;
  const crop = lang === "mr" ? (pred.crop_mr || pred.crop) : lang === "hi" ? (pred.crop_hi || pred.crop) : pred.crop;
  const disease = lang === "mr" ? (pred.disease_mr || pred.disease) : lang === "hi" ? (pred.disease_hi || pred.disease) : pred.disease;
  const decision = diagnosisData?.decision?.action;
  const intro = c.explain(crop, disease, pred.confidence_pct, lang === "mr" ? pred.symptoms_mr : lang === "hi" ? pred.symptoms_hi : pred.symptoms);
  const action = decision === "monitor" ? (lang === "mr" ? "सध्या नियमित निरीक्षण करा. अनावश्यक फवारणी टाळा." : lang === "hi" ? "फिलहाल नियमित निगरानी करें और अनावश्यक छिड़काव से बचें।" : "Monitor the crop and avoid unnecessary spraying for now.") : c.next;
  const advisory = diagnosisData?.advisory || {};
  const remedies = Array.isArray(advisory.organic?.remedies) ? advisory.organic.remedies.slice(0, 2) : [];
  const practices = Array.isArray(advisory.cultural_practices) ? advisory.cultural_practices.slice(0, 2) : [];
  const adviceIntro = lang === "mr" ? "अॅपमधील सल्ला:" : lang === "hi" ? "ऐप में दिए गए सुझाव:" : "Suggestions shown in the app:";
  const safety = lang === "mr" ? "फक्त या फोटोवरून फवारणी करू नका. रोगाची खात्री करण्यासाठी स्थानिक कृषी अधिकारी किंवा KVK यांच्याशी संपर्क करा." : lang === "hi" ? "केवल इस फोटो के आधार पर छिड़काव न करें। बीमारी की पुष्टि के लिए स्थानीय कृषि अधिकारी या KVK से संपर्क करें।" : "Do not spray based only on this photo. Contact a local agriculture officer or KVK to verify the condition.";
  const details = [...remedies, ...practices].slice(0, 3).join(" ");
  return `${intro} ${action} ${details ? `${adviceIntro} ${details}` : ""} ${safety}`;
}

export default function CropAssistant({ lang = "en", diagnosisData, weatherData }) {
  const c = COPY[lang] || COPY.en;
  const comp = COMPANION_COPY[lang] || COMPANION_COPY.en;
  const spraySafety = getSprayingSafety(weatherData, lang);

  const [messages, setMessages] = useState([{ id: 1, role: "assistant", text: c.welcome }]);
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [replying, setReplying] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages]);
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setMessages([{ id: Date.now(), role: "assistant", text: c.welcome }]);
    setVoiceError("");
  }, [lang]);
  useEffect(() => () => {
    recognitionRef.current?.stop?.();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const speak = (text, id = "answer") => {
    if (!window.speechSynthesis) { setVoiceError("Text-to-speech is not supported by this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALES[lang] || "en-IN";
    utterance.rate = Number(speechRate);
    const voices = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
    const normalized = value => String(value || "").toLowerCase().replace(/_/g, "-");
    const wantedLocale = normalized(utterance.lang);
    const languagePrefix = wantedLocale.split("-")[0];
    let voice;
    if (lang === "en") {
      voice = voices.find(v => normalized(v.lang) === "en-in" && /india|indian|ravi|heera|priya|neerja|google.*english.*india/i.test(v.name))
        || voices.find(v => normalized(v.lang) === "en-in")
        || voices.find(v => /english.*india|india.*english|indian english/i.test(v.name));
    } else {
      voice = voices.find(v => normalized(v.lang) === wantedLocale)
        || voices.find(v => normalized(v.lang).startsWith(`${languagePrefix}-`));
    }
    if (!voice) {
      voice = voices.find(v => normalized(v.lang) === wantedLocale)
        || voices.find(v => normalized(v.lang).startsWith(`${languagePrefix}-`));
    }
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setVoiceError("");
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel?.(); setSpeakingId(null); };

  const sendQuestion = async (raw = question, autoSpeak = false) => {
    const text = String(raw || "").trim();
    if (!text || replying) return;
    stopSpeaking();
    const now = Date.now();
    setMessages(prev => [...prev, { id: now, role: "user", text }]);
    setQuestion("");
    setVoiceError("");
    setReplying(true);
    const pred = diagnosisData?.prediction;
    const context = pred ? {
      crop: lang === "mr" ? (pred.crop_mr || pred.crop) : lang === "hi" ? (pred.crop_hi || pred.crop) : pred.crop,
      disease: lang === "mr" ? (pred.disease_mr || pred.disease) : lang === "hi" ? (pred.disease_hi || pred.disease) : pred.disease,
      confidence: pred.confidence_pct,
      model_status: pred.model_status,
      decision_action: diagnosisData?.decision?.action,
      next_steps: diagnosisData?.decision?.next_steps || [],
      weather_risk: weatherData?.risk_level || weatherData?.risk?.level || weatherData?.risk,
      organic_guidance: diagnosisData?.advisory?.organic?.remedies || [],
      cultural_practices: diagnosisData?.advisory?.cultural_practices || [],
    } : {};
    let answer = "";
    try {
      const response = await askCropAssistant({ question: text, lang, context });
      if (response?.configured && response.answer) answer = response.answer;
    } catch (error) {
      console.warn("AI assistant endpoint unavailable; using guided fallback.", error);
    }
    if (!answer) answer = createAnswer(text, lang, diagnosisData, weatherData);
    const replyId = now + 1;
    setMessages(prev => [...prev, { id: replyId, role: "assistant", text: answer }]);
    setReplying(false);
    if (autoSpeak) {
      speak(answer, replyId);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError(c.voiceUnsupported); return; }
    recognitionRef.current?.stop?.();
    const recognition = new SpeechRecognition();
    recognition.lang = LOCALES[lang] || "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setListening(true); setVoiceError(""); };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQuestion(transcript);
      if (transcript.trim()) sendQuestion(transcript, true);
    };
    recognition.onerror = (event) => { setVoiceError(event.error === "not-allowed" ? "Microphone permission was denied. Allow microphone access in your browser." : c.voiceError); setListening(false); };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setListening(false); setVoiceError(c.voiceError); }
  };

  return (
    <div className="crop-assistant-hub" aria-label={c.title}>
      {/* LEFT COLUMN: Smart Field Intelligence Companion (Directly fills previously empty space) */}
      <aside className="crop-companion-panel" aria-label="Field Companion">
        <div className="companion-header">
          <div className="companion-eyebrow">
            <Sparkles size={14} className="text-emerald-400" />
            <span>{comp.hubEyebrow}</span>
          </div>
          <h3 className="companion-title">{comp.sprayTitle}</h3>
        </div>

        {/* Real-Time Spraying Window Card */}
        {spraySafety && (
          <div className={`spray-window-widget status-${spraySafety.status}`}>
            <div className="spray-widget-top">
              <span className={`spray-status-pill pill-${spraySafety.status}`}>
                {spraySafety.status === "good" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                <strong>{spraySafety.badge}</strong>
              </span>
            </div>
            <p className="spray-widget-desc">{spraySafety.desc}</p>
            <div className="spray-metrics-row">
              <div className="spray-metric-chip">
                <Wind size={13} style={{ color: "#a78bfa" }} />
                <span>{comp.windLabel}: <strong>{spraySafety.wind} km/h</strong></span>
              </div>
              <div className="spray-metric-chip">
                <Droplets size={13} style={{ color: "#60a5fa" }} />
                <span>{comp.humidityLabel}: <strong>{spraySafety.humidity}%</strong></span>
              </div>
              <div className="spray-metric-chip">
                <Thermometer size={13} style={{ color: "#f87171" }} />
                <span>{comp.tempLabel}: <strong>{spraySafety.temp}°C</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Voice Consultations Hub */}
        <div className="companion-section">
          <div className="companion-section-header">
            <h4>{comp.quickTitle}</h4>
            <p>{comp.quickSub}</p>
          </div>
          <div className="quick-consult-grid">
            <button
              type="button"
              className="quick-consult-btn"
              onClick={() => sendQuestion(comp.queryExplain, true)}
              title={comp.queryExplain}
            >
              <Leaf size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>{comp.queryExplain}</span>
              <Volume2 size={14} className="consult-audio-icon" />
            </button>

            <button
              type="button"
              className="quick-consult-btn"
              onClick={() => sendQuestion(comp.queryOrganic, true)}
              title={comp.queryOrganic}
            >
              <ShieldCheck size={15} style={{ color: "#60a5fa", flexShrink: 0 }} />
              <span>{comp.queryOrganic}</span>
              <Volume2 size={14} className="consult-audio-icon" />
            </button>

            <button
              type="button"
              className="quick-consult-btn"
              onClick={() => sendQuestion(comp.querySpraySafe, true)}
              title={comp.querySpraySafe}
            >
              <Wind size={15} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <span>{comp.querySpraySafe}</span>
              <Volume2 size={14} className="consult-audio-icon" />
            </button>

            <button
              type="button"
              className="quick-consult-btn"
              onClick={() => sendQuestion(comp.querySpread, true)}
              title={comp.querySpread}
            >
              <ShieldAlert size={15} style={{ color: "#f87171", flexShrink: 0 }} />
              <span>{comp.querySpread}</span>
              <Volume2 size={14} className="consult-audio-icon" />
            </button>
          </div>
        </div>

        {/* Immediate Field Protocol Checklist */}
        <div className="companion-section">
          <div className="companion-section-header">
            <h4>{comp.actionsTitle}</h4>
          </div>
          <div className="field-protocol-list">
            <div className="protocol-item">
              <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>{comp.action1}</span>
            </div>
            <div className="protocol-item">
              <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>{comp.action2}</span>
            </div>
            <div className="protocol-item">
              <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>{comp.action3}</span>
            </div>
            <div className="protocol-item">
              <CheckCircle2 size={15} style={{ color: "#34d399", flexShrink: 0 }} />
              <span>{comp.action4}</span>
            </div>
          </div>
        </div>

        {/* Emergency Farmer Helpline Dialer */}
        <div className="companion-helpline-box">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PhoneCall size={18} style={{ color: "#34d399" }} />
            <div>
              <strong>{comp.helplineTitle}</strong>
              <p style={{ margin: 0, fontSize: "0.74rem", color: "#94a3b8" }}>{comp.kisanCallCenter}</p>
            </div>
          </div>
          <a href="tel:18001801551" className="btn-helpline-dial">
            {comp.callNow}
          </a>
        </div>
      </aside>

      {/* RIGHT COLUMN: Farm Saathi AI Conversational Console */}
      <section className="crop-assistant-card" aria-label={c.title}>
        <div className="crop-assistant-header">
          <div className="crop-assistant-avatar"><Bot size={23} /></div>
          <div className="crop-assistant-heading">
            <h3>{c.title}</h3>
            <p>{c.subtitle}</p>
          </div>
          <span className="crop-assistant-live"><span /> {lang === "mr" ? "तयार" : lang === "hi" ? "तैयार" : "Ready"}</span>
        </div>

        <div className="crop-assistant-voice-settings">
          <label htmlFor="crop-assistant-speech-rate">{c.speedLabel}</label>
          <select id="crop-assistant-speech-rate" value={speechRate} onChange={e => setSpeechRate(Number(e.target.value))} aria-label={c.speedLabel}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1.0×</option>
            <option value={1.5}>1.5×</option>
            <option value={2}>2.0×</option>
          </select>
          <span>{c.voiceHint}</span>
        </div>

        {diagnosisData?.prediction && (
          <div className="crop-assistant-context">
            <Leaf size={16} />
            <span>{lang === "mr" ? "सध्याचा तपासणी निकाल जोडलेला आहे" : lang === "hi" ? "वर्तमान जाँच रिपोर्ट जुड़ी हुई है" : "Current crop screening is attached"}</span>
            <button type="button" onClick={() => speak(buildSpokenSummary(diagnosisData, lang), "summary")}><Volume2 size={15} /> {speakingId === "summary" ? c.stopVoice : c.voice}</button>
          </div>
        )}

        <div className="crop-assistant-messages" aria-live="polite">
          {messages.map(message => (
            <div className={`crop-chat-row ${message.role}`} key={message.id}>
              <div className={`crop-chat-bubble ${message.role}`}>
                <p>{message.text}</p>
                {message.role === "assistant" && (
                  <button className={`crop-chat-speak ${speakingId === message.id ? "is-speaking" : ""}`} type="button" onClick={() => speakingId === message.id ? stopSpeaking() : speak(message.text, message.id)} aria-label={speakingId === message.id ? c.stopVoice : c.voice}>
                    {speakingId === message.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span>{speakingId === message.id ? c.stopVoice : c.voice}</span>
                    {speakingId === message.id && (
                      <span className="speaking-soundwave">
                        <span /><span /><span />
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {replying && <div className="crop-assistant-thinking"><LoaderCircle size={16} className="crop-assistant-spin" /> {c.thinking}</div>}
          <div ref={endRef} />
        </div>

        <div className="crop-assistant-prompts">
          {c.prompts.map(prompt => (
            <button type="button" key={prompt} onClick={() => sendQuestion(prompt, true)}>
              {prompt}
            </button>
          ))}
        </div>

        {voiceError && <p className="crop-assistant-error" role="status">{voiceError}</p>}

        <form className="crop-assistant-input-row" onSubmit={e => { e.preventDefault(); sendQuestion(); }}>
          <button className={`crop-assistant-mic ${listening ? "active" : ""}`} type="button" onClick={listening ? () => recognitionRef.current?.stop?.() : startListening} aria-label={listening ? c.stop : c.listen} title={listening ? c.stop : c.listen}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder={listening ? c.speaking : c.placeholder} aria-label={c.placeholder} />
          <button className="crop-assistant-send" type="submit" disabled={!question.trim() || replying} aria-label={c.send}><Send size={17} /><span>{c.send}</span></button>
        </form>

        <p className="crop-assistant-disclaimer"><ShieldCheck size={14} /> {lang === "mr" ? "AI सल्ला प्राथमिक आहे. फवारणीपूर्वी स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या." : lang === "hi" ? "AI सलाह प्रारंभिक है। छिड़काव से पहले स्थानीय कृषि विशेषज्ञ से पुष्टि करें।" : "AI guidance is preliminary. Verify locally before applying any treatment."}</p>
      </section>
    </div>
  );
}
