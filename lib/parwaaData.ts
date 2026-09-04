/**
 * PARWAA Clinical Recommendation Framework
 * Preventive and Remedial Education for Welfare of Autistic Children Through Ayurveda
 *
 * Clinical Attribution:
 * Dr. Vaibhav Jaisawal, Department of Bala Roga,
 * Faculty of Ayurveda, Institute of Medical Sciences (IMS),
 * Banaras Hindu University (BHU), Varanasi - 221005.
 *
 * Integrated into the Pediatric ASD Screening CDSS developed at IIT BHU
 * under the guidance of Professor Shyam Kamal, Department of Electrical Engineering.
 */

export interface ParwaaPillarItem {
  id: string;
  english: string;
  hindi?: string;
  description?: string;
  category?: string;
}

export interface ParwaaAahar {
  title: string;
  subtitle: string;
  hindiTitle: string;
  avoid: ParwaaPillarItem[];
  incorporate: ParwaaPillarItem[];
  clinicalRationale: string;
}

export interface ParwaaNidra {
  title: string;
  subtitle: string;
  hindiTitle: string;
  rituals: ParwaaPillarItem[];
  clinicalRationale: string;
}

export interface ParwaaBrahmacharya {
  title: string;
  subtitle: string;
  hindiTitle: string;
  rules: ParwaaPillarItem[];
  activities: ParwaaPillarItem[];
  clinicalRationale: string;
}

export interface ParwaaFramework {
  frameworkName: string;
  acronym: string;
  subtitle: string;
  hindiSubtitle: string;
  clinicalAttribution: {
    doctorName: string;
    department: string;
    faculty: string;
    institution: string;
    location: string;
    fullAttribution: string;
  };
  pillars: {
    aahar: ParwaaAahar;
    nidra: ParwaaNidra;
    brahmacharya: ParwaaBrahmacharya;
  };
  guidingPrinciples: {
    title: string;
    hindiTitle: string;
    items: {
      title: string;
      hindiTitle: string;
      description: string;
      icon: string;
    }[];
  };
}

export const PARWAA_DATA: ParwaaFramework = {
  frameworkName: 'PARWAA',
  acronym: 'Preventive and Remedial Education for Welfare of Autistic Children Through Ayurveda',
  subtitle: 'Holistic Ayurvedic Clinical Protocol for Pediatric Neurodevelopmental Support',
  hindiSubtitle: 'आयुर्वेद के माध्यम से ऑटिस्टिक बच्चों के कल्याण के लिए निवारक एवं उपचारात्मक शिक्षा',
  clinicalAttribution: {
    doctorName: 'Dr. Vaibhav Jaisawal',
    department: 'Department of Bala Roga (Pediatrics)',
    faculty: 'Faculty of Ayurveda',
    institution: 'Institute of Medical Sciences (IMS), Banaras Hindu University (BHU)',
    location: 'Varanasi, Uttar Pradesh, India',
    fullAttribution:
      'Formulated by Dr. Vaibhav Jaisawal, Department of Bala Roga, Faculty of Ayurveda, IMS, BHU, Varanasi.',
  },
  pillars: {
    aahar: {
      title: 'Aahar (Dietary Regimen)',
      subtitle: 'Nourishing the Gut-Brain Axis & Calming Aggravated Vata-Pitta Doshas',
      hindiTitle: 'आहार (संतुलित एवं सात्विक खानपान)',
      clinicalRationale:
        'In Ayurveda, the digestive fire (Agni) dictates metabolic and cognitive clarity. Highly processed foods, gluten, and refined sugars irritate the gut mucosa and destabilize sensory integration, while grounding, nutrient-dense millets and Medhya Rasayanas strengthen neural connectivity.',
      avoid: [
        {
          id: 'av-1',
          english: 'Refined Sugar',
          hindi: 'सफेद चीनी व कृत्रिम मिठास',
          description: 'Triggers rapid blood glucose spikes, hyperactivity, and gut dysbiosis.',
        },
        {
          id: 'av-2',
          english: 'Excess Salt',
          hindi: 'अत्यधिक नमक',
          description: 'Aggravates Pitta and cellular fluid retention.',
        },
        {
          id: 'av-3',
          english: 'A1 Milk',
          hindi: 'A1 पैकेट वाला दूध',
          description: 'Contains BCM-7 peptide which causes gut inflammation in sensitive children.',
        },
        {
          id: 'av-4',
          english: 'Gluten-containing Grains',
          hindi: 'गेहूं व मैदा (ग्लूटेन युक्त अनाज)',
          description: 'Wheat, maida, and semolina that irritate gut permeability.',
        },
        {
          id: 'av-5',
          english: 'Foods with Preservatives & Artificial Colors',
          hindi: 'प्रिजर्वेटिव व कृत्रिम रंग युक्त खाद्य',
          description: 'Excitotoxic additives that impair behavioral regulation.',
        },
        {
          id: 'av-6',
          english: 'Junk & Ultra-processed Foods',
          hindi: 'जंक फूड व पैकेज्ड स्नैक्स',
          description: 'Commercial chips, biscuits, sodas, and fried snacks.',
        },
        {
          id: 'av-7',
          english: 'Vataj & Pittaj Aggravating Foods',
          hindi: 'वात एवं पित्त प्रकोपक आहार',
          description: 'Stale, dry, pungent, sour, fermented, and overly spicy items.',
        },
      ],
      incorporate: [
        {
          id: 'inc-1',
          english: 'Mixed Cereals & Ancient Millets',
          hindi: 'मिश्रित अनाज व मिलेट्स (रागी, ज्वार, बाजरा)',
          description: 'Nutrient-rich, fiber-dense, and naturally gluten-free carbohydrates.',
        },
        {
          id: 'inc-2',
          english: 'Water Chestnut Flour (Singhara Atta)',
          hindi: 'सिंघाड़े का आटा',
          description: 'Cooling, easily digestible, and rich in potassium and zinc.',
        },
        {
          id: 'inc-3',
          english: 'Buckwheat Flour (Kuttu Atta)',
          hindi: 'कुट्टू का आटा',
          description: 'High bioflavonoid and antioxidant protein source for cellular repair.',
        },
        {
          id: 'inc-4',
          english: 'Fresh Coconut Milk',
          hindi: 'ताज़ा नारियल का दूध',
          description: 'Medium-chain triglycerides (MCTs) to fuel cognitive vitality.',
        },
        {
          id: 'inc-5',
          english: 'Pure Desi A2 Cow Ghee',
          hindi: 'शुद्ध देशी A2 गाय का घी',
          description: 'Paramount Medhya substance; crosses the blood-brain barrier to nourish Ojas.',
        },
        {
          id: 'inc-6',
          english: 'Soaked & Peeled Nuts (Walnuts, Almonds)',
          hindi: 'भीगे हुए बादाम व अखरोट',
          description: 'Rich in Omega-3 fatty acids and Vitamin E for neuroprotection.',
        },
        {
          id: 'inc-7',
          english: 'Nutrient Seeds (Chia, Sabja, Jyotishmati, Makhana)',
          hindi: 'चिया, सब्जा, ज्योतिष्मती बीज व मखाना',
          description: 'Makhana (Fox nuts) is light and grounding; Jyotishmati supports memory.',
        },
        {
          id: 'inc-8',
          english: 'Ash Gourd / White Pumpkin Juice',
          hindi: 'पेठा (सफेद कद्दू) का ताज़ा रस',
          description: 'Potent cooling brain tonic that calms temperamental tantrums and heat.',
        },
        {
          id: 'inc-9',
          english: 'Amla Juice or Amla Murabba',
          hindi: 'आंवला रस या आंवला मुरब्बा',
          description: 'Supreme Rasayana rich in bioavailable Vitamin C for immune resilience.',
        },
        {
          id: 'inc-10',
          english: 'Gulkand (Organic Rose Petal Jam)',
          hindi: 'गुलकंद (गुलाब की पंखुड़ियों का मिश्रण)',
          description: 'Soothes nervous irritability, relieves constipation, and cools Pitta.',
        },
      ],
    },
    nidra: {
      title: 'Nidra (Sleep Hygiene & Rest)',
      subtitle: 'Restoring Neuro-Sensory Equilibrium & Deep Tissue Rejuvenation',
      hindiTitle: 'निद्रा (गहरी एवं शांत नींद के नियम)',
      clinicalRationale:
        'Sound, unfragmented sleep allows the glymphatic system to detoxify metabolic waste from the brain. In Ayurveda, proper Nidra supports Dhatuposhana (tissue nourishment), mood stabilization, and reduces autonomic sensory overload.',
      rituals: [
        {
          id: 'nid-1',
          english: 'Uninterrupted Sleep (6–8 Hours)',
          hindi: '6 से 8 घंटे की निर्बाध नींद',
          description: 'Promotes complete circadian rhythm stabilization and hormone balance.',
        },
        {
          id: 'nid-2',
          english: 'Early to Bed & Early Rise',
          hindi: 'समय पर शयन एवं सूर्योदय से पूर्व जागरण',
          description: 'Aligns the child’s physiology with natural Kapha-Vata diurnal cycles.',
        },
        {
          id: 'nid-3',
          english: 'Shiroabhyanga (Calming Head Massage)',
          hindi: 'शिरोअभ्यंग (गुनगुने हर्बल तेल से सिर की मालिश)',
          description: 'Gentle scalp massage with Brahmi, Ksheerabala, or sesame oil to pacify Prana Vata.',
        },
        {
          id: 'nid-4',
          english: 'Padaabhyanga (Foot Massage)',
          hindi: 'पादाभ्यंग (पैरों के तलवों की तेल मालिश)',
          description: 'Stimulates vital Marma points, grounding wandering attention and inducing calm.',
        },
        {
          id: 'nid-5',
          english: 'Warm Foot Soak Before Bedtime',
          hindi: 'सोने से पहले गुनगुने पानी में पैर भिगोना',
          description: '5–10 minutes in lukewarm water relieves somatic restlessness and hyper-reactivity.',
        },
        {
          id: 'nid-6',
          english: 'Brahmari Pranayama / Humming Sound',
          hindi: 'भ्रामरी प्राणायाम या गुंजन ध्वनि',
          description: 'Vibrational humming stimulates the vagus nerve, immediately slowing heart rate.',
        },
        {
          id: 'nid-7',
          english: 'Soothing & Calm Music (Raag Yaman / Nada)',
          hindi: 'शांत एवं कर्णप्रिय शास्त्रीय संगीत',
          description: 'Low-tempo instrumental acoustic sounds to transition brainwaves to delta sleep.',
        },
        {
          id: 'nid-8',
          english: 'Gentle Sleep-Inducing Yoga Asanas',
          hindi: 'शयन पूर्व सुगम योगासन (बालासन, शवासन)',
          description: 'Child’s pose (Balasana) and gentle stretching to release stored muscular tension.',
        },
        {
          id: 'nid-9',
          english: 'Stress-Free & Quiet Sleep Sanctuary',
          hindi: 'शांत, अंधकारमय एवं तनावमुक्त शयन कक्ष',
          description: 'Zero blue light, cool room temperature, and consistent pre-sleep bedtime routines.',
        },
      ],
    },
    brahmacharya: {
      title: 'Brahmacharya (Good Habits, Play & Digital Detox)',
      subtitle: 'Directing Vital Energy into Natural Socialization, Sensory Play & Sun Exposure',
      hindiTitle: 'ब्रह्मचर्य एवं सुआचरण (डिजिटल डिटॉक्स, खेल व अच्छी आदतें)',
      clinicalRationale:
        'Screens flood underdeveloped neural circuits with dopamine spikes and hyper-stimulation. Replacing virtual screens with tactile, natural, and outdoor human interactions builds synaptic connections for joint attention, eye contact, and language.',
      rules: [
        {
          id: 'br-1',
          english: 'Strict Zero Screen Policy (No Mobile, TV, Tablet)',
          hindi: 'सख्त शून्य स्क्रीन नीति (मोबाइल, टीवी, टैबलेट बंद)',
          description: 'Mandatory complete elimination of digital screens for neurological rewiring.',
        },
        {
          id: 'br-2',
          english: 'Morning Sun Exposure (Sun Bath)',
          hindi: 'प्रातःकालीन सूर्य स्नान (धूप सेवन)',
          description: '15–20 minutes of morning sunlight for Vitamin D3 synthesis and melatonin regulation.',
        },
        {
          id: 'br-3',
          english: 'Encourage Group & Parallel Play',
          hindi: 'सहपाठियों व बच्चों के साथ सामूहिक खेल',
          description: 'Fosters spontaneous turn-taking, peer imitation, and social curiosity.',
        },
        {
          id: 'br-4',
          english: 'Active Participation in Household Tasks',
          hindi: 'घरेलू कार्यों में बच्चे की सक्रिय सहभागिता',
          description: 'Sorting vegetables, folding napkins, or watering plants for purposeful engagement.',
        },
      ],
      activities: [
        {
          id: 'act-1',
          english: 'Fine Motor & Tactile Sensory Games',
          hindi: 'सूक्ष्म प्रेरक खेल (पहेलियां, बिल्डिंग ब्लॉक्स, क्ले/मिट्टी के खिलौने)',
          description: 'Puzzles, wooden blocks, play-dough, and kinetic sand to refine bilateral coordination.',
        },
        {
          id: 'act-2',
          english: 'Gross Motor & Outdoor Physical Activities',
          hindi: 'शारीरिक व्यायाम (साइकिल चलाना, तैराकी, सुलभ योग, बॉलिंग)',
          description: 'Cycling, supervised swimming, adaptive pediatric yoga, and rolling ball games.',
        },
      ],
    },
  },
  guidingPrinciples: {
    title: 'Three Golden Principles for Caregivers',
    hindiTitle: 'माता-पिता एवं देखभालकर्ताओं के लिए तीन मूल सिद्धांत',
    items: [
      {
        title: 'Family-Centered Care',
        hindiTitle: 'परिवार केंद्रित देखभाल',
        description:
          'Therapy does not end in the clinic. The home environment and loving parental presence are the most powerful neuro-developmental medicines.',
        icon: '👨‍👩‍👧‍👦',
      },
      {
        title: 'Quality Time with Child',
        hindiTitle: 'बच्चे के साथ गुणवत्तापूर्ण समय',
        description:
          'Dedicate continuous, distraction-free one-on-one hours every day. Engage in direct eye-level conversations, songs, and shared joyful play.',
        icon: '⏳',
      },
      {
        title: 'Patience & Consistency for at least 6 Months',
        hindiTitle: 'कम से कम 6 महीने का धैर्य एवं निरंतरता',
        description:
          'Ayurvedic neuro-sensory rebalancing is gentle and cumulative. Adhere strictly to the dietary and sleep protocols for a minimum of 6 months.',
        icon: '🌱',
      },
    ],
  },
};
