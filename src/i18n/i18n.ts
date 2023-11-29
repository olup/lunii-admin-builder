import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import en from './locales/en-GB/translation.json';
import fr from './locales/fr-FR/translation.json';

const isProduction = process.env.NODE_ENV === 'production';

i18n.use(initReactI18next)
    .use(LanguageDetector)
    .init({
        resources: {
            'en': {
                translation: en
            },
            'en-GB': {
                translation: en
            },
            'en-US': {
                translation: en
            },
            'fr': {
                translation: fr
            },
            'fr-FR': {
                translation: fr
            }
        },
        debug: !isProduction,
    });

i18n.languages = ['en', 'fr'];