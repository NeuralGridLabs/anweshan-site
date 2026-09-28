export type Project = {
  slug: string;
  id: string;
  title: string;
  description: string;
  partner: string;
  theme: string;
  image: string;
  url?: string;
  /* Detail-page fields. Placeholder copy for layout purposes,
     to be replaced with the real project records. */
  status: string;
  years: string;
  location: string;
  methods: string[];
  team: string;
  overview: string[];
  approach: string[];
  outcomes: string[];
  facts: { label: string; value: string }[];
};

export const projects: Project[] = [
  {
    slug: "predeparture-orientation-training",
    id: "01",
    title: "Effectiveness of health components of pre-departure orientation training",
    description:
      "Conducted in partnership with Bournemouth University, assessing the effectiveness of health-related components integrated within pre-departure orientation training for aspiring Nepali migrants.",
    partner: "Bournemouth University",
    theme: "Migration health",
    image: "/images/projects/predeparture-orientation-training.jpg",
    status: "Completed",
    years: "2022 - 2023",
    location: "Kathmandu, Pokhara, and three departure hubs",
    methods: [
      "Structured pre/post surveys",
      "Key informant interviews",
      "Training observation checklists",
    ],
    team: "Mixed research and field team of 9",
    overview: [
      "Conducted in partnership with Bournemouth University, assessing the effectiveness of health-related components integrated within pre-departure orientation training for aspiring Nepali migrants.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Bournemouth University.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Bournemouth University with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Participants surveyed", value: "1,240" },
      { label: "Orientation centres", value: "18" },
      { label: "Districts covered", value: "7" },
      { label: "Duration", value: "14 months" },
    ]
  },
  {
    slug: "covid-19-vaccination-sudurpaschim",
    id: "02",
    title: "Strengthening COVID-19 vaccination management in Sudurpaschim Province",
    description:
      "Support to vaccination management across five selected districts of Sudurpaschim Province, covering planning, monitoring, and reporting systems.",
    partner: "Immunisation programme",
    theme: "Immunisation",
    image: "/images/projects/covid-19-vaccination-sudurpaschim.jpg",
    status: "Completed",
    years: "2021 - 2022",
    location: "Five districts of Sudurpaschim Province",
    methods: [
      "Cold-chain and stock monitoring",
      "Facility readiness assessments",
      "Microplanning workshops",
    ],
    team: "Provincial support team of 12",
    overview: [
      "Support to vaccination management across five selected districts of Sudurpaschim Province, covering planning, monitoring, and reporting systems.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Immunisation programme.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Immunisation programme with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Districts supported", value: "5" },
      { label: "Health facilities", value: "213" },
      { label: "Sessions monitored", value: "1,860" },
      { label: "Duration", value: "11 months" },
    ]
  },
  {
    slug: "national-health-insurance-policy",
    id: "03",
    title: "Policy implementation challenges in the National Health Insurance Program",
    description:
      "Research into the barriers facing implementation of Nepal's National Health Insurance Program and the reforms needed to close them.",
    partner: "Health financing",
    theme: "Health policy",
    image: "/images/projects/national-health-insurance-policy.jpg",
    status: "Completed",
    years: "2021 - 2022",
    location: "Federal, provincial, and municipal levels",
    methods: [
      "Policy document review",
      "Key informant interviews",
      "Enrolment data analysis",
    ],
    team: "Policy research team of 6",
    overview: [
      "Research into the barriers facing implementation of Nepal's National Health Insurance Program and the reforms needed to close them.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Health financing.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Health financing with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Interviews", value: "64" },
      { label: "Municipalities", value: "12" },
      { label: "Policy documents reviewed", value: "38" },
      { label: "Duration", value: "10 months" },
    ]
  },
  {
    slug: "antimicrobial-stewardship",
    id: "04",
    title: "Antimicrobial Stewardship Project in outpatient settings",
    description:
      "Funded by a Pfizer global grant, involving physicians, nurses and pharmacists to encourage rational antibiotic use at Sukraraj Tropical & Infectious Disease Hospital and Ilam Hospital since 2022.",
    partner: "Pfizer Global Grant",
    theme: "AMR",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
    status: "Ongoing",
    years: "2022 - present",
    location: "Sukraraj Tropical & Infectious Disease Hospital and Ilam Hospital",
    methods: [
      "Prescription audit and feedback",
      "Clinician training modules",
      "Outpatient exit interviews",
    ],
    team: "Clinical and behavioural team of 14",
    overview: [
      "Funded by a Pfizer global grant, involving physicians, nurses and pharmacists to encourage rational antibiotic use at Sukraraj Tropical & Infectious Disease Hospital and Ilam Hospital since 2022.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Pfizer Global Grant.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Pfizer Global Grant with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Hospitals", value: "2" },
      { label: "Clinicians engaged", value: "180" },
      { label: "Prescriptions audited", value: "9,400" },
      { label: "Funder", value: "Pfizer Global Grant" },
    ]
  },
  {
    slug: "amr-amu-data-management",
    id: "05",
    title: "AMR and AMU data management across 28 hospitals",
    description:
      "Data management and collection support for over 600,000 retrospective antimicrobial resistance and usage records from 28 hospitals and laboratories across Nepal.",
    partner: "International Vaccine Institute",
    theme: "AMR",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
    status: "Ongoing",
    years: "2022 - present",
    location: "28 hospitals and laboratories nationwide",
    methods: [
      "Retrospective record digitisation",
      "Data quality assurance protocols",
      "WHONET-compatible reporting",
    ],
    team: "Data management team of 22",
    overview: [
      "Data management and collection support for over 600,000 retrospective antimicrobial resistance and usage records from 28 hospitals and laboratories across Nepal.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with International Vaccine Institute.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to International Vaccine Institute with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Records processed", value: "600,000+" },
      { label: "Sites", value: "28" },
      { label: "Provinces", value: "7" },
      { label: "Partner", value: "International Vaccine Institute" },
    ]
  },
  {
    slug: "safe-abortion-services",
    id: "06",
    title: "Access to safe abortion services in Nepal",
    description:
      "Analysis of the status of policies, institutional mechanisms, social support and practices required to ensure safe abortion as a human right.",
    partner: "Rights-based research",
    theme: "Reproductive health",
    image: "/images/projects/safe-abortion-services.png",
    status: "Completed",
    years: "2020 - 2021",
    location: "Six districts across three provinces",
    methods: [
      "Legal and policy analysis",
      "Facility mapping",
      "In-depth interviews with service users",
    ],
    team: "Rights and health systems team of 8",
    overview: [
      "Analysis of the status of policies, institutional mechanisms, social support and practices required to ensure safe abortion as a human right.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Rights-based research.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Rights-based research with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Facilities mapped", value: "96" },
      { label: "In-depth interviews", value: "72" },
      { label: "Districts", value: "6" },
      { label: "Duration", value: "13 months" },
    ]
  },
  {
    slug: "total-market-approach-arh",
    id: "07",
    title: "Total Market Approach and public health facility mapping for FP/RH services",
    description:
      "Field supervision and training to map available adolescent reproductive health and family planning services by municipality for the USAID ARH project.",
    partner: "USAID Adolescent Reproductive Health",
    theme: "Reproductive health",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200",
    status: "Completed",
    years: "January - June 2023",
    location: "Selected municipalities across four provinces",
    methods: [
      "Service availability mapping",
      "Enumerator training and field supervision",
      "Gap analysis workshops",
    ],
    team: "Field supervision team of 26",
    overview: [
      "Field supervision and training to map available adolescent reproductive health and family planning services by municipality for the USAID ARH project.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with USAID Adolescent Reproductive Health.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to USAID Adolescent Reproductive Health with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Municipalities mapped", value: "148" },
      { label: "Enumerators trained", value: "26" },
      { label: "Facilities visited", value: "520" },
      { label: "Duration", value: "6 months" },
    ]
  },
  {
    slug: "fchv-mobile-job-aid",
    id: "08",
    title: "FCHV communication and mobile phones as a job aid",
    description:
      "Qualitative research on female community health volunteer communication and engagement with communities, exploring the possibilities of using mobile phones as a job aid.",
    partner: "BBC Media Action",
    theme: "Digital health",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=1200",
    status: "Completed",
    years: "2019 - 2020",
    location: "Rural municipalities in two provinces",
    methods: [
      "Focus group discussions with FCHVs",
      "Participatory design sessions",
      "Formative research training",
    ],
    team: "Qualitative research team of 7",
    overview: [
      "Qualitative research on female community health volunteer communication and engagement with communities, exploring the possibilities of using mobile phones as a job aid.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with BBC Media Action.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to BBC Media Action with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "FCHVs engaged", value: "210" },
      { label: "Focus groups", value: "24" },
      { label: "Municipalities", value: "9" },
      { label: "Partner", value: "BBC Media Action" },
    ]
  },
  {
    slug: "refine-quality-improvement",
    id: "09",
    title: "Process evaluation of a quality improvement package: REFINE",
    description:
      "Process evaluation of a quality improvement package deployed in a tertiary hospital of Nepal, assessing adoption, fidelity, and clinical outcomes.",
    partner: "Hospital quality improvement",
    theme: "Health systems",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200",
    status: "Completed",
    years: "2021 - 2022",
    location: "A tertiary hospital in Nepal",
    methods: [
      "Process evaluation framework",
      "Fidelity and adoption scoring",
      "Clinical outcome tracking",
    ],
    team: "Health systems team of 10",
    overview: [
      "Process evaluation of a quality improvement package deployed in a tertiary hospital of Nepal, assessing adoption, fidelity, and clinical outcomes.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Hospital quality improvement.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Hospital quality improvement with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Wards assessed", value: "11" },
      { label: "Staff interviewed", value: "88" },
      { label: "Observation hours", value: "640" },
      { label: "Duration", value: "12 months" },
    ]
  },
  {
    slug: "hygiene-behavior-formative-research",
    id: "10",
    title: "Formative research on hygiene behavior",
    description:
      "Formative research examining household hygiene behaviour and the drivers of change, informing water, sanitation and hygiene programming.",
    partner: "WASH programme",
    theme: "WASH",
    image: "/images/projects/hygiene-behavior-formative-research.jpg",
    status: "Completed",
    years: "2019 - 2020",
    location: "Peri-urban and rural households",
    methods: [
      "Household observation",
      "Behavioural driver interviews",
      "Barrier analysis",
    ],
    team: "WASH research team of 11",
    overview: [
      "Formative research examining household hygiene behaviour and the drivers of change, informing water, sanitation and hygiene programming.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with WASH programme.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to WASH programme with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Households observed", value: "480" },
      { label: "Interviews", value: "150" },
      { label: "Communities", value: "16" },
      { label: "Duration", value: "9 months" },
    ]
  },
  {
    slug: "cross-border-migration-baseline",
    id: "11",
    title: "Baseline report on cross-border migration",
    description:
      "A baseline study of cross-border migration patterns, establishing reference indicators for follow-up monitoring and policy response.",
    partner: "Migration study",
    theme: "Migration health",
    image: "/images/projects/cross-border-migration-baseline.png",
    status: "Completed",
    years: "2020 - 2021",
    location: "Southern border districts",
    methods: [
      "Baseline household survey",
      "Border-point counts",
      "Stakeholder consultations",
    ],
    team: "Migration research team of 15",
    overview: [
      "A baseline study of cross-border migration patterns, establishing reference indicators for follow-up monitoring and policy response.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Migration study.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Migration study with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "Households surveyed", value: "1,020" },
      { label: "Border points", value: "8" },
      { label: "Districts", value: "5" },
      { label: "Duration", value: "10 months" },
    ]
  },
  {
    slug: "mhealth-fchv-evaluation",
    id: "12",
    title: "Evaluation study for the mHealth FCHVs project",
    description:
      "An evaluation of the mHealth project supporting female community health volunteers, measuring reach, usability, and reporting quality.",
    partner: "Digital health",
    theme: "Digital health",
    image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=1200",
    status: "Completed",
    years: "2021 - 2022",
    location: "Programme districts in two provinces",
    methods: [
      "Mixed-methods evaluation",
      "Usability testing",
      "Reporting quality audit",
    ],
    team: "Digital health team of 9",
    overview: [
      "An evaluation of the mHealth project supporting female community health volunteers, measuring reach, usability, and reporting quality.",
      "This page presents a working outline of the study while the full project record is prepared. The narrative below is placeholder copy written to Anweshan's house style so the layout, hierarchy, and reading rhythm can be assessed before the real report is supplied.",
    ],
    approach: [
      "Scoping and protocol development, including ethical approval from the Nepal Health Research Council and agreement of the analysis plan with Digital health.",
      "Instrument design and enumerator training, with piloting in a subset of sites and revision of tools before full deployment.",
      "Fieldwork and quality assurance, combining supervised data collection with same-day verification and back-checks on a sample of records.",
      "Analysis, validation, and dissemination, closing with a findings workshop where results were reviewed with stakeholders before publication.",
    ],
    outcomes: [
      "A validated dataset and analysis file handed to Digital health with documentation supporting reuse.",
      "A findings report setting out results, limitations, and recommendations aimed at programme and policy audiences.",
      "A dissemination session with implementing partners to translate the evidence into operational next steps.",
    ],
    facts: [
      { label: "FCHVs in evaluation", value: "340" },
      { label: "Districts", value: "4" },
      { label: "Reports audited", value: "2,700" },
      { label: "Duration", value: "12 months" },
    ]
  },

  /* Digital products built and operated by Anweshan. Recovered from the
     pre-CMS stash; these carry no placeholder disclaimer because they describe
     live products, and each `url` is a verifiable public destination. */
  {
    slug: "hire-enumerator",
    id: "13",
    title: "Hire Enumerator",
    description:
      "A web platform for discovering and connecting with verified enumerators in Nepal.",
    partner: "Anweshan product development",
    theme: "Digital platforms",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200",
    url: "https://hireenumerator.com/enumerator/home",
    status: "Live",
    years: "Ongoing",
    location: "Nepal",
    methods: [
      "Enumerator directory",
      "Search and filtering",
      "Responsive web experience",
    ],
    team: "Digital product team",
    overview: [
      "Hire Enumerator is a web platform designed to help organizations and research teams find and connect with verified enumerators in Nepal.",
      "The product turns a fragmented recruitment process into a clearer, more accessible digital experience for enumerators and the teams who work with them.",
    ],
    approach: [
      "Defined the user journey for browsing profiles, searching by location and expertise, and contacting available enumerators.",
      "Built a responsive interface that works across desktop and mobile devices.",
      "Implemented profile and listing workflows to keep the experience clear for both enumerators and clients.",
    ],
    outcomes: [
      "A public platform for discovering and contacting verified enumerators.",
      "A reusable foundation for future recruitment and field workforce management tools.",
    ],
    facts: [
      { label: "Product", value: "Web platform" },
      { label: "Market", value: "Nepal" },
      { label: "Audience", value: "Enumerators and research teams" },
      { label: "Access", value: "Online" },
    ]
  },
  {
    slug: "bir-hospital-amr-guidelines",
    id: "14",
    title: "Bir Hospital AMR Guidelines",
    description:
      "A digital reference app bringing Bir Hospital's antimicrobial treatment guidelines to clinicians, residents, and trainees.",
    partner: "Bir Hospital (NAMS)",
    theme: "Digital health",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
    url: "https://play.google.com/store/apps/details?id=com.madhusharma9.treatmentv2&pli=1",
    status: "Live",
    years: "Ongoing",
    location: "Bir Hospital, Nepal",
    methods: [
      "Reference content digitisation",
      "Clinical information architecture",
      "Android app publishing",
    ],
    team: "Digital product team",
    overview: [
      "Bir Hospital AMR Guidelines is a digital reference and educational application for healthcare professionals, medical residents, and clinical trainees at Bir Hospital (NAMS).",
      "The app provides a digitized version of Bir Hospital's antimicrobial reference guidelines as a portable resource for academic and clinical learning.",
    ],
    approach: [
      "Structured the published antimicrobial reference material into an easy-to-navigate educational resource.",
      "Designed the experience for clinicians, residents, and medical trainees studying antimicrobial use and stewardship.",
      "Published the Android application with clear educational-use positioning and reference guidance for qualified professionals.",
    ],
    outcomes: [
      "A portable digital reference for Bir Hospital's antimicrobial treatment guidelines.",
      "An educational tool that supports antimicrobial stewardship learning for clinical trainees and healthcare professionals.",
    ],
    facts: [
      { label: "Product", value: "Android app" },
      { label: "Institution", value: "Bir Hospital (NAMS)" },
      { label: "Category", value: "Books & reference" },
      { label: "Purpose", value: "Clinical education" },
    ]
  },
  {
    slug: "giz-survey-fieldops",
    id: "15",
    title: "GIZ Survey Field Operations",
    description:
      "A field operations platform supporting survey teams with mobilisation, mapping, and data workflows.",
    partner: "GIZ",
    theme: "Field operations",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
    url: "https://researchfieldops.com/",
    status: "Live",
    years: "Ongoing",
    location: "Nepal",
    methods: [
      "Field team mobilisation",
      "Survey mapping",
      "Field data workflows",
    ],
    team: "Digital product team",
    overview: [
      "GIZ Survey Field Operations is a digital platform designed to support field teams responsible for survey mobilisation, mapping, and data collection.",
      "The platform brings field coordination and survey operations into one focused workspace for teams working beyond the office.",
    ],
    approach: [
      "Organized field mobilisation, mapping, and survey data workflows around the needs of distributed research teams.",
      "Built a practical web experience for coordinating work and maintaining visibility across field operations.",
      "Designed the platform to support repeatable survey implementation in changing field conditions.",
    ],
    outcomes: [
      "A digital workspace for coordinating survey fieldwork and field teams.",
      "A scalable foundation for future mapping, reporting, and data-collection improvements.",
    ],
    facts: [
      { label: "Product", value: "Web platform" },
      { label: "Partner", value: "GIZ" },
      { label: "Use case", value: "Survey fieldwork" },
      { label: "Access", value: "Online" },
    ]
  },
];

/* Research engagements, i.e. everything without a live product `url`. */
export const researchProjects: Project[] = projects.filter((p) => !p.url);

/* Products and platforms Anweshan built and runs itself. */
export const productProjects: Project[] = projects.filter((p) => Boolean(p.url));

/* Mirrors the pre-CMS home rail: the lead research study plus each product. */
export const featuredLocalProjects: Project[] = [
  ...researchProjects.slice(0, 1),
  ...productProjects.slice(0, 3),
];
