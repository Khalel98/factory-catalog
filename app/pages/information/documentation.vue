<template>
  <div class="spacing">
    <Breadcrumbs :items="breadcrumbItems" />
    <section class="section">
      <div class="card">
        <h1>{{ t('information.documentationTitle') }}</h1>
        <p class="muted">
          {{ t('information.documentationSubtitle') }}
        </p>
      </div>
    </section>

    <div class="accordion">
      <section
        v-for="(docSection, idx) in documentationSections"
        :key="idx"
        class="doc-section"
        :class="{ 'doc-section_open': expandedSection === idx }"
      >
        <button
          type="button"
          class="doc-section-header doc-section-header_btn"
          :aria-expanded="expandedSection === idx"
          @click="toggleSection(idx)"
        >
          <span class="doc-section-title">{{ t('information.' + docSection.sectionKey) }}</span>
          <span class="doc-section-count">{{ docSection.items.length }}</span>
          <svg class="doc-section-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div v-show="expandedSection === idx" class="doc-section-body">
          <ul class="doc-download-list">
            <li v-for="(item, itemIdx) in docSection.items" :key="itemIdx">
              <a
                :href="item.url"
                class="doc-download-link"
                :download="getDownloadFilename(item)"
                target="_blank"
                rel="noopener noreferrer"
                @click.prevent="downloadFile(item)"
              >
                <svg class="doc-download-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>{{ t('information.docTitles.' + item.titleKey) }}</span>
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

// Документы для скачивания (хранятся в компоненте в виде JSON)
const documentationSections: { sectionKey: string; items: { titleKey: string; url: string }[] }[] = [
  {
    "sectionKey": "docSectionPassports",
    "items": [
      {
        "titleKey": "doc_0",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FT04-PS100162047.051-PS.pdf"
      },
      {
        "titleKey": "doc_1",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP23-100162047.046-PS.pdf"
      },
      {
        "titleKey": "doc_2",
        "url": "https://pharmec.by/wp-content/uploads/2026/02/Pasport-FP34-100162047.036.1.pdf"
      },
      {
        "titleKey": "doc_3",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-FT35-100162047.046.2-PS-1.pdf"
      },
      {
        "titleKey": "doc_4",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-FD35-100162047.046.1-PS-1.pdf"
      },
      {
        "titleKey": "doc_5",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP33-100162047.032PS.pdf"
      },
      {
        "titleKey": "doc_6",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP11.2K-100162047.021-02.1-PS.pdf"
      },
      {
        "titleKey": "doc_7",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP11.2K-100162047.021-04-PS-5.pdf"
      },
      {
        "titleKey": "doc_8",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP11.2K-100162047.021-03.1-PS-100.pdf"
      },
      {
        "titleKey": "doc_9",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP21-100162047.029PS.pdf"
      },
      {
        "titleKey": "doc_10",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP22-100162047.033-01-PS.pdf"
      },
      {
        "titleKey": "doc_11",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FP-12-100162047.026-06-PS-SN4-S3H8.pdf"
      },
      {
        "titleKey": "doc_12",
        "url": "https://pharmec.by/wp-content/uploads/2025/03/Pasport-FP-12-100162047.026-07-PS-N2.pdf"
      },
      {
        "titleKey": "doc_13",
        "url": "https://pharmec.by/wp-content/uploads/2025/05/Pasport-FT-02V1.1-100162047.030-01-PS.pdf"
      },
      {
        "titleKey": "doc_14",
        "url": "https://pharmec.by/wp-content/uploads/2025/08/Pasport-FT-02V1-100162047.030-03-PS-so-shhupomFigaro.pdf"
      },
      {
        "titleKey": "doc_15",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Pasport-FD-09-100162047.034-PS.pdf"
      },
      {
        "titleKey": "doc_16",
        "url": "https://pharmec.by/wp-content/uploads/2025/10/Pasport-FST-07-BPS-100162047.049-PS-220V.pdf"
      },
      {
        "titleKey": "doc_17",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FST-03M-BPS-100162047.025-03-PS-220V.pdf"
      },
      {
        "titleKey": "doc_18",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FST-03M-BPS-100162047.025-02-PS-24V.pdf"
      },
      {
        "titleKey": "doc_19",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FST-03V-BPS-100162047.031-PS-220V.pdf"
      },
      {
        "titleKey": "doc_20",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/Pasport-FST-03V-BPS-100162047.031-01-PS-24V.pdf"
      },
      {
        "titleKey": "doc_21",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-FST-03V1-BPS-100162047.041-PS-1.pdf"
      },
      {
        "titleKey": "doc_22",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Pasport-FST-03V1-BD.E-100162047.040-PS.pdf"
      },
      {
        "titleKey": "doc_23",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Pasport-FST-03V1-BD.O-100162047.039-PS.pdf"
      },
      {
        "titleKey": "doc_24",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Pasport-FST-03V1-BD.T-100162047.038-PS.pdf"
      },
      {
        "titleKey": "doc_25",
        "url": "https://pharmec.by/wp-content/uploads/2025/07/Pasport-FST-06-100162047.043-PS.pdf"
      },
      {
        "titleKey": "doc_26",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/Pasport-FST-06-I-100162047.043-PS.pdf"
      },
      {
        "titleKey": "doc_27",
        "url": "https://pharmec.by/fileadmin/user_upload/FST-05KB_12.21.pdf"
      },
      {
        "titleKey": "doc_28",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-BRR-100162047.041.2-PS.pdf"
      },
      {
        "titleKey": "doc_29",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Pasport-Tester-A-interfejsa-100162047.041.1-PS.pdf"
      },
      {
        "titleKey": "doc_30",
        "url": "https://pharmec.by/wp-content/uploads/2025/05/Pasport-FN10-v1.pdf"
      },
      {
        "titleKey": "doc_31",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Zaryadnaya-stantsiya-ZS-20-PR-09-10.00.000-PS.pdf"
      },
      {
        "titleKey": "doc_32",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/Pasport-ZC-USB-16-500-PREN.016.00.000-PS.pdf"
      },
      {
        "titleKey": "doc_33",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-IrTecad.pdf"
      },
      {
        "titleKey": "doc_34",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Ustrojstvo-kommutatsionno-diagnosticheskoe.pdf"
      },
      {
        "titleKey": "doc_35",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-BRK-FKD-2.pdf"
      },
      {
        "titleKey": "doc_36",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Generator-davleniya-FGD-20.pdf"
      },
      {
        "titleKey": "doc_37",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Progress-K-3-100162047.042-PS.pdf"
      },
      {
        "titleKey": "doc_38",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-PROGRESS-K2-100162047.048.1-PS.pdf"
      },
      {
        "titleKey": "doc_39",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Generator-FKG-102.1-00162047.047.1-PS.pdf"
      },
      {
        "titleKey": "doc_40",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Generator-FKG-102.2-00162047.047.1-PS.pdf"
      },
      {
        "titleKey": "doc_41",
        "url": "https://pharmec.by/wp-content/uploads/2025/07/Pasport-Generator-FKG-101.pdf"
      },
      {
        "titleKey": "doc_42",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Pasport-Induktor-8025.pdf"
      },
      {
        "titleKey": "doc_43",
        "url": "https://pharmec.by/fileadmin/user_upload/FK-01_pasport_05.22.pdf"
      },
      {
        "titleKey": "doc_44",
        "url": "https://pharmec.by/fileadmin/user_upload/FKG-100_pasport_V3.0.pdf"
      },
      {
        "titleKey": "doc_45",
        "url": "https://pharmec.by/fileadmin/user_upload/FKG-01M_pasport_V3.0_LoRa.pdf"
      },
      {
        "titleKey": "doc_46",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/IDK-95_Pasport_02.pdf"
      },
      {
        "titleKey": "doc_47",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/SKGG_Pasport_02.pdf"
      },
      {
        "titleKey": "doc_48",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2_Pasport_03.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionVerification",
    "items": [
      {
        "titleKey": "doc_49",
        "url": "https://pharmec.by/fileadmin/user_upload/Arkhiv_FST-03.zip"
      },
      {
        "titleKey": "doc_50",
        "url": "https://pharmec.by/fileadmin/user_upload/Arkhiv_FST-03V.zip"
      },
      {
        "titleKey": "doc_51",
        "url": "https://pharmec.by/fileadmin/user_upload/FD-09.zip"
      },
      {
        "titleKey": "doc_52",
        "url": "https://pharmec.by/fileadmin/user_upload/FP21.zip"
      },
      {
        "titleKey": "doc_53",
        "url": "https://pharmec.by/wp-content/uploads/2024/09/Metodiki-poverki-FP22.zip"
      },
      {
        "titleKey": "doc_54",
        "url": "https://pharmec.by/fileadmin/user_upload/MP_FP12.pdf"
      },
      {
        "titleKey": "doc_55",
        "url": "https://pharmec.by/fileadmin/user_upload/FST-03V1_O.zip"
      },
      {
        "titleKey": "doc_56",
        "url": "https://pharmec.by/fileadmin/user_upload/FST-03V1_T.zip"
      },
      {
        "titleKey": "doc_57",
        "url": "https://pharmec.by/fileadmin/user_upload/FST-03V1_EH.zip"
      },
      {
        "titleKey": "doc_58",
        "url": "https://pharmec.by/fileadmin/user_upload/MP_FST-05KB.pdf"
      },
      {
        "titleKey": "doc_59",
        "url": "https://pharmec.by/wp-content/uploads/2024/02/Metodika-poverki-FST-06.pdf"
      },
      {
        "titleKey": "doc_60",
        "url": "https://pharmec.by/fileadmin/user_upload/FP34_03.20.zip"
      },
      {
        "titleKey": "doc_61",
        "url": "https://pharmec.by/wp-content/uploads/2025/09/Metodiki-poverki-FP11.2K.zip"
      },
      {
        "titleKey": "doc_62",
        "url": "https://pharmec.by/fileadmin/user_upload/FP33_2022.zip"
      },
      {
        "titleKey": "doc_63",
        "url": "https://pharmec.by/fileadmin/user_upload/FP11.2K_Metodika_nastroiki_TKS.pdf"
      },
      {
        "titleKey": "doc_64",
        "url": "https://pharmec.by/fileadmin/user_upload/Metodika_nastroiki_FP11.2k__optika_5_.pdf"
      },
      {
        "titleKey": "doc_65",
        "url": "https://pharmec.by/fileadmin/user_upload/Metodika_nastroiki_FP11.2k__optika_100_.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionUserManuals",
    "items": [
      {
        "titleKey": "doc_66",
        "url": "https://pharmec.by/wp-content/uploads/2025/07/Instruktsiya-po-montazhu-i-proverke-FST-07-v2-utv.pdf"
      },
      {
        "titleKey": "doc_67",
        "url": "https://pharmec.by/wp-content/uploads/2025/11/Rukovodstvo-po-ekspluatatsii-PROGRESS-FKG-101.pdf"
      },
      {
        "titleKey": "doc_68",
        "url": "https://pharmec.by/wp-content/uploads/2025/09/Rukovodstvo-po-ekspluatatsii-PROGRESS-FKG-102.pdf"
      },
      {
        "titleKey": "doc_69",
        "url": "https://pharmec.by/wp-content/uploads/2025/12/Rukovodstvo-po-ekspluatatsii-na-PROGRESS-K2-100162047.048.1-RE.pdf"
      },
      {
        "titleKey": "doc_70",
        "url": "https://pharmec.by/wp-content/uploads/2025/03/Rukovodstvo-po-ekspluatatsii-na-Progress-K-3.pdf"
      },
      {
        "titleKey": "doc_71",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/Rukovodstvo-polzovatelya-po-podklyucheniyu-i-rabote-s-prilozheniem-RTK-Transmiter.pdf"
      },
      {
        "titleKey": "doc_72",
        "url": "https://pharmec.by/wp-content/uploads/2024/11/Potreblenie-FST-03m.pdf"
      },
      {
        "titleKey": "doc_73",
        "url": "https://pharmec.by/fileadmin/user_upload/RP_100162047-031_v200.pdf"
      },
      {
        "titleKey": "doc_74",
        "url": "https://pharmec.by/fileadmin/user_upload/fp_22_rukovodstvo.pdf"
      },
      {
        "titleKey": "doc_75",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Rukowodstwo_polzowatelya_04.pdf"
      },
      {
        "titleKey": "doc_76",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Rukowodstwo_polzowatelya_05.pdf"
      },
      {
        "titleKey": "doc_77",
        "url": "https://pharmec.by/wp-content/uploads/2023/11/FP11.2k-5_ruovodstov_ekspluatatsii.pdf"
      },
      {
        "titleKey": "doc_78",
        "url": "https://pharmec.by/wp-content/uploads/2023/11/FP11.2K_rukovodstvo_ekspluatatsii.pdf"
      },
      {
        "titleKey": "doc_79",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Rukovodstvo__fst_03V1_v15.pdf"
      },
      {
        "titleKey": "doc_80",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FD-09_passport_manual.pdf"
      },
      {
        "titleKey": "doc_81",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP10_Rukowodstwo_polzowatelya_02.pdf"
      },
      {
        "titleKey": "doc_82",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/IDK-95_Rukowodstwo_polzowatelya_02.pdf"
      },
      {
        "titleKey": "doc_83",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/TS92WM_Rukowodstwo_polzowatelya_02.pdf"
      },
      {
        "titleKey": "doc_84",
        "url": "https://pharmec.by/fileadmin/user_upload/Rukovodstvo_FK-01_V12.1.pdf"
      },
      {
        "titleKey": "doc_85",
        "url": "https://pharmec.by/fileadmin/user_upload/Instrukcija_FKG-100_V3.0.pdf"
      },
      {
        "titleKey": "doc_86",
        "url": "https://pharmec.by/fileadmin/user_upload/Instrukcija_na_generator_FKG-01M_V3.0.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionSoftware",
    "items": [
      {
        "titleKey": "doc_87",
        "url": "https://pharmec.by/wp-content/uploads/2026/01/FL-Service.zip"
      },
      {
        "titleKey": "doc_88",
        "url": "https://pharmec.by/wp-content/uploads/2025/10/Fp34_GPS_Glonass.zip"
      },
      {
        "titleKey": "doc_89",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/Programma-FP22-novaya.zip"
      },
      {
        "titleKey": "doc_90",
        "url": "https://pharmec.by/fileadmin/user_upload/multi_fp.zip"
      },
      {
        "titleKey": "doc_91",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/PO-dlya-diagnostiki-i-nastrojki-FP23.zip"
      },
      {
        "titleKey": "doc_92",
        "url": "https://pharmec.by/wp-content/uploads/2024/04/ToolFST06KB.zip"
      },
      {
        "titleKey": "doc_93",
        "url": "https://pharmec.by/wp-content/uploads/2024/04/en.stsw-stm32102.zip"
      },
      {
        "titleKey": "doc_94",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/Setup3.22-win10.zip"
      },
      {
        "titleKey": "doc_95",
        "url": "https://pharmec.by/wp-content/uploads/2025/06/RTK-Transmiter.zip"
      },
      {
        "titleKey": "doc_96",
        "url": "https://pharmec.by/fileadmin/user_upload/Setup_V2.13.6.zip"
      },
      {
        "titleKey": "doc_97",
        "url": "https://pharmec.by/fileadmin/user_upload/FGD_PO.zip"
      },
      {
        "titleKey": "doc_98",
        "url": "https://pharmec.by/wp-content/uploads/2024/03/PO-dlya-Android-versiya-10-i-vyshe-.zip"
      },
      {
        "titleKey": "doc_99",
        "url": "https://pharmec.by/fileadmin/user_upload/Driver_FTDI.zip"
      },
      {
        "titleKey": "doc_100",
        "url": "https://pharmec.by/fileadmin/user_upload/FKD_v002_10.19.zip"
      },
      {
        "titleKey": "doc_101",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/TecAd.zip"
      },
      {
        "titleKey": "doc_102",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/SDDInstall.zip"
      },
      {
        "titleKey": "doc_103",
        "url": "https://pharmec.by/fileadmin/user_upload/IrTecAd_FP33_.zip"
      },
      {
        "titleKey": "doc_104",
        "url": "https://pharmec.by/wp-content/uploads/2023/10/IrTecAd_FP21.zip"
      },
      {
        "titleKey": "doc_105",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP_LOAD.rar"
      },
      {
        "titleKey": "doc_106",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/ToolFST03B2.zip"
      }
    ]
  },
  {
    "sectionKey": "docSectionRepair",
    "items": [
      {
        "titleKey": "doc_107",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP10_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_108",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.1_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_109",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_110",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_111",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Rukowodstwo_po_remontu_01.pdf"
      },
      {
        "titleKey": "doc_112",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Rukowodstwo_po_remontu_02.pdf"
      },
      {
        "titleKey": "doc_113",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.3_IM-93__Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_114",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP12_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_115",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/IDK-95_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_116",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/SKGG_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_117",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/TPG-94_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_118",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/TS92WM_Rukowodstwo_po_remontu.pdf"
      },
      {
        "titleKey": "doc_119",
        "url": "https://pharmec.by/wp-content/uploads/2025/11/TPG-94-Remont.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionSchemes",
    "items": [
      {
        "titleKey": "doc_120",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Shemi.pdf"
      },
      {
        "titleKey": "doc_121",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Shemi_01.pdf"
      },
      {
        "titleKey": "doc_122",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Shemi_02.pdf"
      },
      {
        "titleKey": "doc_123",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP21_Shemi_02.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionGasSettings",
    "items": [
      {
        "titleKey": "doc_124",
        "url": "https://pharmec.by/wp-content/uploads/2025/02/Instruktsiya.-Gazovaya-nastrojka-FP23.pdf"
      },
      {
        "titleKey": "doc_125",
        "url": "https://pharmec.by/fileadmin/user_upload/MN_FP34_Multi.pdf"
      },
      {
        "titleKey": "doc_126",
        "url": "https://pharmec.by/wp-content/uploads/2023/07/Instruktsiya-po-gazovoj-nastrojke-FT-02V1.pdf"
      },
      {
        "titleKey": "doc_127",
        "url": "https://pharmec.by/fileadmin/user_upload/Instrukcija_po_gaz_nastroike_FP33_01.pdf"
      },
      {
        "titleKey": "doc_128",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP10_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_129",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.1_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_130",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_131",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_132",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Gazowaya_nastroika_01.pdf"
      },
      {
        "titleKey": "doc_133",
        "url": "https://pharmec.by/fileadmin/user_upload/Instrukcija_po_gazovoi_nastroike_FP22_01.pdf"
      },
      {
        "titleKey": "doc_134",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.2k_Gazowaya_nastroika_02.pdf"
      },
      {
        "titleKey": "doc_135",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP11.3_IM-93__Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_136",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP12_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_137",
        "url": "https://pharmec.by/wp-content/uploads/2025/04/Metodika-nastrojki-FP12-.pdf"
      },
      {
        "titleKey": "doc_138",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/FP21_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_139",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/IDK-95_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_140",
        "url": "https://pharmec.by/fileadmin/_migrated/content_uploads/SKGG_Gazowaya_nastroika.pdf"
      },
      {
        "titleKey": "doc_141",
        "url": "https://pharmec.by/wp-content/uploads/2024/01/FST-03-Gazovaya-nastrojka.pdf"
      }
    ]
  },
  {
    "sectionKey": "docSectionMalfunctions",
    "items": [
      {
        "titleKey": "doc_142",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FST-03M_avarii.pdf"
      },
      {
        "titleKey": "doc_143",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FST-03V_avarii.pdf"
      },
      {
        "titleKey": "doc_144",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FP33_avarii.pdf"
      },
      {
        "titleKey": "doc_145",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FP22_avarii.pdf"
      },
      {
        "titleKey": "doc_146",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FP21_avarii.pdf"
      },
      {
        "titleKey": "doc_147",
        "url": "https://pharmec.by/wp-content/uploads/2023/12/FP12_avarii.pdf"
      }
    ]
  }
];

const breadcrumbItems = computed(() => [
  { label: t('breadcrumbs.home'), to: '/' },
  { label: t('breadcrumbs.information'), to: '/information' },
  { label: t('breadcrumbs.documentation') }
]);

const expandedSection = ref<number | null>(0);

const toggleSection = (idx: number) => {
  expandedSection.value = expandedSection.value === idx ? null : idx;
};

function getDownloadFilename(item: { titleKey: string; url: string }): string {
  try {
    const name = item.url.split('/').pop()?.split('?')[0] || '';
    if (name) return name;
  } catch {
    // ignore
  }
  const title = t('information.docTitles.' + item.titleKey);
  const ext = item.url.toLowerCase().includes('.zip') ? '.zip' : '.pdf';
  return `${String(title).slice(0, 80).replace(/[^\w\s-]/g, '')}${ext}`;
}

async function downloadFile(item: { titleKey: string; url: string }) {
  try {
    const res = await fetch(item.url, { mode: 'cors' });
    if (!res.ok) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDownloadFilename(item);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(item.url, '_blank', 'noopener,noreferrer');
  }
}
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: 25px;
}

.accordion {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  background: var(--card-bg, #fff);
}

.doc-section {
  border-bottom: 1px solid var(--border, #e5e7eb);

  &:last-child {
    border-bottom: none;
  }

  &_open .doc-section-chevron {
    transform: rotate(180deg);
  }
}

.doc-section-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: var(--card-bg, #fff);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary, #1f2933);
  transition: background 0.2s;

  &:hover {
    background: var(--hover-bg, #f9fafb);
  }

  &_btn {
    appearance: none;
  }
}

.doc-section-title {
  flex: 1;
}

.doc-section-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted, #6b7280);
}

.doc-section-chevron {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.doc-section-body {
  padding: 0 18px 16px;
  border-top: 1px solid var(--border, #e5e7eb);
}

.doc-download-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doc-download-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--link-color, #1565c0);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--hover-bg, #f3f4f6);
    color: var(--link-hover, #0d47a1);
  }
}

.doc-download-icon {
  flex-shrink: 0;
  opacity: 0.85;
}
</style>
