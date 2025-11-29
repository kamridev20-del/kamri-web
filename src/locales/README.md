# 🌍 Système d'Internationalisation (i18n)

## 📋 Structure

```
src/
  locales/
    fr.json      # Traductions françaises
    en.json      # Traductions anglaises
  contexts/
    LanguageContext.tsx  # Context et Provider
  components/
    LanguageSelector.tsx  # Sélecteur FR/EN
```

## 🚀 Utilisation

### 1. Dans un composant React

```tsx
'use client';

import { useTranslation } from '../contexts/LanguageContext';

export default function MyComponent() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('common.search')}</h1>
      <p>{t('navigation.home')}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('fr')}>Français</button>
    </div>
  );
}
```

### 2. Clés de traduction

Les clés sont organisées par catégories :

- `common.*` - Textes communs (boutons, labels)
- `navigation.*` - Menu de navigation
- `product.*` - Textes liés aux produits
- `cart.*` - Panier
- `checkout.*` - Commande
- `profile.*` - Profil utilisateur
- `footer.*` - Footer
- `errors.*` - Messages d'erreur
- `language.*` - Sélecteur de langue

### 3. Ajouter une nouvelle traduction

1. Ajouter la clé dans `fr.json` :
```json
{
  "common": {
    "my_new_text": "Mon nouveau texte"
  }
}
```

2. Ajouter la traduction dans `en.json` :
```json
{
  "common": {
    "my_new_text": "My new text"
  }
}
```

3. Utiliser dans le code :
```tsx
const { t } = useTranslation();
<p>{t('common.my_new_text')}</p>
```

## 🔧 Détection automatique

Le système détecte automatiquement la langue dans cet ordre :

1. **localStorage** - Préférence sauvegardée de l'utilisateur
2. **Navigateur** - Langue du navigateur (`navigator.language`)
3. **Fallback** - Français par défaut

## 💾 Persistance

La langue choisie est sauvegardée dans `localStorage` et persiste entre les sessions.

## 🎨 Sélecteur de langue

Le sélecteur est déjà intégré dans le header (`ModernHeader`). Il affiche :
- **FR** quand la langue est française
- **EN** quand la langue est anglaise

Cliquer sur le bouton bascule entre les deux langues.

