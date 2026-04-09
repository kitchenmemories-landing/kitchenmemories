const translations = {
  en: {
    signOut: 'Sign out',
    myRecipes: 'My Recipes',
    myRecipesDesc: 'Your personal recipe collection',
    search: 'Search recipes…',
    allCategories: 'All categories',
    noRecipes: 'No recipes found.',
    servings: 'servings',
    backToRecipes: '← My Cookbook',
    startCooking: '👨‍🍳 Start Cooking',
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    prep: 'Prep',
    cook: 'Cook',
    rest: 'Rest',
    total: 'Total',
    stepOf: (cur, total) => `Step ${cur} of ${total}`,
    exit: '✕ Exit',
    enjoyMeal: 'Enjoy your meal!',
    backToRecipe: '← Back to recipe',
    forgotPassword: 'Forgot password?',
    backToSignIn: '← Back to sign in',
    resetPassword: 'Reset password',
    resetDesc: "Enter your email and we'll send you a reset link",
    sendResetLink: 'Send reset link',
    sending: 'Sending…',
    resetSuccess: '✓ Check your email for the reset link!',
    welcomeBack: 'Welcome back',
    signInDesc: 'Sign in to access your recipes',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    email: 'Email',
    password: 'Password',
  },
  de: {
    signOut: 'Abmelden',
    myRecipes: 'Mein Kochbuch',
    myRecipesDesc: 'Deine persönliche Rezeptsammlung',
    search: 'Rezepte suchen…',
    allCategories: 'Alle Kategorien',
    noRecipes: 'Keine Rezepte gefunden.',
    servings: 'Portionen',
    backToRecipes: '← Mein Kochbuch',
    startCooking: '👨‍🍳 Kochen starten',
    ingredients: 'Zutaten',
    instructions: 'Zubereitung',
    prep: 'Vorbereitung',
    cook: 'Kochen',
    rest: 'Ruhezeit',
    total: 'Gesamt',
    stepOf: (cur, total) => `Schritt ${cur} von ${total}`,
    exit: '✕ Beenden',
    enjoyMeal: 'Guten Appetit!',
    backToRecipe: '← Zurück zum Rezept',
    forgotPassword: 'Passwort vergessen?',
    backToSignIn: '← Zurück zum Login',
    resetPassword: 'Passwort zurücksetzen',
    resetDesc: 'Gib deine E-Mail ein und wir schicken dir einen Reset-Link',
    sendResetLink: 'Reset-Link senden',
    sending: 'Wird gesendet…',
    resetSuccess: '✓ Schau in deine E-Mails für den Reset-Link!',
    welcomeBack: 'Willkommen zurück',
    signInDesc: 'Melde dich an, um auf deine Rezepte zuzugreifen',
    signIn: 'Anmelden',
    signingIn: 'Wird angemeldet…',
    email: 'E-Mail',
    password: 'Passwort',
  },
};

export function getLang() {
  return localStorage.getItem('km_lang') || 'de';
}

export function setLang(lang) {
  localStorage.setItem('km_lang', lang);
}

export function t(key, ...args) {
  const lang = getLang();
  const val = translations[lang]?.[key] ?? translations['en'][key] ?? key;
  return typeof val === 'function' ? val(...args) : val;
}

export function langToggleBtn() {
  const current = getLang();
  return `<button class="btn-ghost" id="lang-btn">${current === 'de' ? 'EN' : 'DE'}</button>`;
}

export function bindLangToggle(onToggle) {
  document.getElementById('lang-btn')?.addEventListener('click', () => {
    setLang(getLang() === 'de' ? 'en' : 'de');
    onToggle();
  });
}
