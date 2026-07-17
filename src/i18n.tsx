import React, { createContext, useContext, useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
type Theme = 'dark' | 'light';
type Lang = 'en' | 'fr';

interface SettingsContextValue {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  setLang: (l: Lang) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const THEME_KEY = 'barber_app_theme';
const LANG_KEY = 'barber_app_lang';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.style.colorScheme = theme;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    return saved === 'light' ? 'light' : 'dark';
  });
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null;
    return saved === 'fr' ? 'fr' : 'en';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <SettingsContext.Provider value={{ theme, lang, toggleTheme, setLang: setLangState }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Translations (keyed by English string; falls back to English)
// ---------------------------------------------------------------------------
const FR: Record<string, string> = {
  // AuthScreen
  'The Executive Parlor': 'Le Salon Exécutif',
  'Client': 'Client',
  'Admin': 'Administrateur',
  'This account is an admin. Please switch to Admin login.': 'Ce compte est un administrateur. Veuillez basculer sur la connexion Admin.',
  'This account is a client. Please switch to Client login.': 'Ce compte est un client. Veuillez basculer sur la connexion Client.',
  'Invalid credentials. Check your email and password.': 'Identifiants invalides. Vérifiez votre e-mail et mot de passe.',
  'Premium Salon & Barberhouse Admin Portal': 'Salon Premium & Portail Admin Barberhouse',
  'Invalid credentials. Try quick logins below for a seamless test!': 'Identifiants invalides. Essayez les connexions rapides ci-dessous !',
  'Please fill in all details.': 'Veuillez remplir tous les champs.',
  'A user with this email already exists.': 'Un utilisateur avec cet e-mail existe déjà.',
  'Full Name': 'Nom complet',
  'E.g., Jack Pierce': 'Ex. Jack Pierce',
  'Account Role': "Rôle du compte",
  'Administrator (Admin Panel Access)': 'Administrateur (accès au panneau admin)',
  'Client Customer Profile': 'Profil client',
  'Email Address': "Adresse e-mail",
  'name@example.com': 'nom@exemple.com',
  'Password': 'Mot de passe',
  'Forgot password?': 'Mot de passe oublié ?',
  'Log Into Portal': 'Se connecter au portail',
  'Create Account': 'Créer un compte',
  'Need a portal account? Create a profile': 'Besoin d\'un compte ? Créez un profil',
  'Already registered? Click here to Log In': 'Déjà inscrit ? Cliquez ici pour vous connecter',
  'Instant Quick-Login': 'Connexion rapide',
  'Barberhouse Admin': 'Admin Barberhouse',
  'Executive Portal': 'Portail exécutif',
  'Protected Secure Environment. Authorized Personnel Only.': 'Environnement sécurisé. Personnel autorisé uniquement.',

  // AdminApp - sidebar / header
  'Barberhouse': 'Barberhouse',
  'Admin Console': 'Console admin',
  'Performance Desk': 'Tableau de bord',
  'Bookings Queue': 'File des réservations',
  'Staff Roster': 'Équipe des barbiers',
  'Service Directory': 'Annuaire des services',
  'Customer Registry': 'Registre des clients',
  'Promotional Desk': 'Bureau promotionnel',
  'Salon Executive': 'Directeur du salon',
  'Terminal Logout': 'Déconnexion',
  'Portal': 'Portail',
  'LIVE METRICS ACTIVE': 'MÉTRIQUES ACTIVES',

  // Dashboard
  'Welcome to Executive Control, {name}': 'Bienvenue au contrôle exécutif, {name}',
  'Monitor parlor performance meters in real-time, update stylist calendars, alter prices, adjust client loyalty balances, and deploy marketing discount campaigns.': 'Surveillez les performances du salon en temps réel, mettez à jour les calendriers des coiffeurs, modifiez les prix, ajustez la fidélité des clients et lancez des campagnes promotionnelles.',
  'Closed Sales': 'Ventes clôturées',
  '+12% this week': '+12% cette semaine',
  'All Bookings': 'Toutes les réservations',
  'pending awaiting review': 'en attente de révision',
  'Client accounts': 'Comptes clients',
  'Unique customer profiles registered': 'Profils clients uniques enregistrés',
  'Audited Star Rating': 'Note étoile auditée',
  'written reviews': 'avis rédigés',
  'Closed Sales & Revenue Analysis': 'Analyse des ventes et revenus',
  'Audit completed service logs, calculate barber splits, and filter performance revenue.': 'Auditez les prestations terminées, calculez les parts des barbiers et filtrez les revenus.',
  'Total Completed: {n}': 'Total terminé : {n}',
  'Barber / Stylist': 'Barbier / Coiffeur',
  'Service Category': 'Catégorie de service',
  'Time Frame': 'Période',
  'Client Search': 'Recherche client',
  'Sort Ledger By': 'Trier par',
  'All Barbers': 'Tous les barbiers',
  'All Categories': 'Toutes les catégories',
  'All Time': 'Tout le temps',
  'Today (Jul 16, 2026)': "Aujourd'hui",
  'This Week (Last 7 Days)': 'Cette semaine (7 derniers jours)',
  'This Month (Last 30 Days)': 'Ce mois-ci (30 derniers jours)',
  'Newest First': 'Plus récents d\'abord',
  'Oldest First': 'Plus anciens d\'abord',
  'Highest Revenue': 'Revenu le plus élevé',
  'Lowest Revenue': 'Revenu le plus bas',
  'Name or email...': 'Nom ou e-mail...',
  'Filtered Sales Revenue': 'Revenu des ventes filtrées',
  'Transaction Count': 'Nombre de transactions',
  'Average Ticket Value': 'Valeur moyenne par ticket',
  'Top Performing Barber': 'Meilleur barbier',
  'Client Profile': 'Profil client',
  'Serviced By': 'Servi par',
  'Service Offered': 'Service offert',
  'Category': 'Catégorie',
  'Execution Date': 'Date d\'exécution',
  'Point Credits': 'Points crédités',
  'Invoice Amt': 'Montant facture',
  'No completed sales matches the selected filters.': 'Aucune vente terminée ne correspond aux filtres sélectionnés.',
  'mins': 'min',
  'PTS': 'PTS',
  'Latest Audited Feedback': 'Derniers avis audités',
  'No client reviews filed yet in this ledger.': 'Aucun avis client enregistré dans ce registre.',
  'Serviced by: {stylist}': 'Servi par : {stylist}',
  'Awaiting Approvals': 'En attente d\'approbation',
  'Pending': 'En attente',
  'Perfect! No pending bookings in the queue.': 'Parfait ! Aucune réservation en attente.',
  'Approve Booking': 'Approuver la réservation',
  'Decline Booking': 'Refuser la réservation',
  'With {barber} on {date} at {time}': 'Avec {barber} le {date à {time}',

  // Appointments
  'Filter by Status:': 'Filtrer par statut :',
  'all': 'tous',
  'pending': 'en attente',
  'confirmed': 'confirmé',
  'completed': 'terminé',
  'cancelled': 'annulé',
  'Client Customer': 'Client',
  'Requested Service': 'Service demandé',
  'Barber Stylist': 'Barbier coiffeur',
  'Date / Time': 'Date / Heure',
  'Paid Charge': 'Montant payé',
  'Booking State': 'État de la réservation',
  'Quick Actions': 'Actions rapides',
  'No appointments found with state matching "{appFilter}".': 'Aucun rendez-vous trouvé avec l\'état « {appFilter} ».',
  'mins duration': 'min de durée',
  'Approve': 'Approuver',
  'Mark Complete': 'Marquer terminé',
  'Cancel Reservation': 'Annuler la réservation',
  'Decline Reservation': 'Refuser la réservation',
  'Archived Session': 'Session archivée',
  'Cancelled': 'Annulé',

  // Barbers
  'Induct New Master Barber': 'Intégrer un nouveau maître barbier',
  'Full Stylist Name': 'Nom complet du coiffeur',
  'Primary Specialty': 'Spécialité principale',
  'Photo Avatar URL': 'URL de la photo (avatar)',
  'Short Professional Bio': 'Courte bio professionnelle',
  'Weekly Shift Slots': 'Créneaux hebdomadaires',
  'e.g. Jack Pierce': 'Ex. Jack Pierce',
  'Unsplash image URL...': 'URL d\'image Unsplash...',
  'Specialized in hot towel shaves with over 10 years experience...': 'Spécialisé dans les rasages à serviette chaude avec plus de 10 ans d\'expérience...',
  '09:00 AM': '09:00',
  '10:00 AM': '10:00',
  '11:00 AM': '11:00',
  '01:00 PM': '13:00',
  '02:00 PM': '14:00',
  '03:00 PM': '15:00',
  '04:00 PM': '16:00',
  'Add Barber': 'Ajouter le barbier',
  'Decommission Barber': 'Retirer le barbier',
  'Skills Catalog': 'Catalogue de compétences',
  'Shift Hours Slots': 'Créneaux horaires',
  'Master Stylist and Grooming Artisan.': 'Maître coiffeur et artisan de la coiffure.',

  // Services
  'Register New Service Offering': 'Enregistrer une nouvelle prestation',
  'Service Name': 'Nom du service',
  'Category Group': 'Groupe de catégorie',
  'Retail Price (TND)': 'Prix de vente (TND)',
  'Duration (minutes)': 'Durée (minutes)',
  'Loyalty Points Credited': 'Points de fidélité crédités',
  'Points Cost to Redeem': 'Coût en points pour échanger',
  'Service Description': 'Description du service',
  'e.g. Classic Beard Trim': 'Ex. Taille de barbe classique',
  '35.00': '35,00',
  '30': '30',
  '15': '15',
  '150': '150',
  'Precision styling with premium hot shave lathers...': 'Coiffure de précision avec mousses de rasage chaud premium...',
  'Create Service Entry': 'Créer la prestation',
  'Create Service Category': 'Créer une catégorie de service',
  'Category Title': 'Titre de la catégorie',
  'Category Brief Description': 'Brève description de la catégorie',
  'e.g. Coloring': 'Ex. Coloration',
  'Premium beard treatments and lines...': 'Soins premium de barbe et contours...',
  'Add Category Group': 'Ajouter le groupe de catégorie',
  'Current Directory Categories': 'Catégories du répertoire actuel',
  'Existing Services Menu': 'Menu des services existants',
  'Delete Offering': 'Supprimer la prestation',
  'No description cataloged.': 'Aucune description cataloguée.',
  'X minutes': 'X minutes',

  // Customers
  'Search clients by name, profile or email...': 'Rechercher des clients par nom, profil ou e-mail...',
  'Registered Accounts': 'Comptes enregistrés',
  'Redeemable PTS': 'PTS échangeables',
  'pts': 'pts',
  'vst': 'vis',
  'Adjust Points': 'Ajuster les points',
  'Push Alert': 'Envoyer une alerte',
  'Adjust Loyalty Points Balance': 'Ajuster le solde de points de fidélité',
  'Manually add or deduct points for {name}. Input positive to award, or negative to debit.': 'Ajoutez ou déduisez manuellement des points pour {name}. Positif pour attribuer, négatif pour débiter.',
  'Points Delta Amount': 'Montant du delta de points',
  'Commit Adjustment': 'Valider l\'ajustement',
  'Dispatch Custom Customer Alert': 'Envoyer une alerte client personnalisée',
  'Send a tailored banner message straight to {name}\'s mobile notification inbox.': 'Envoyez un message personnalisé directement à la boîte de réception de {name}.',
  'Message Topic / Subject': 'Sujet du message',
  'Alert Message Body': 'Corps du message d\'alerte',
  'Your exclusive 20% discount on haircuts is ready for use...': 'Votre remise exclusive de 20% sur les coupes est prête...',
  'Dispatch Push Alert': 'Envoyer l\'alerte',
  'Exclusive Offer for You': 'Offre exclusive pour vous',

  // Promotions
  'Deploy New Promotional Campaign Offer': 'Lancer une nouvelle campagne promotionnelle',
  'Promo Banner Title': 'Titre de la bannière promo',
  'Discount Amount Label': 'Libellé de la remise',
  'Max Bookings Limit': 'Limite maximale de réservations',
  'Offer Summary / Fine Print': 'Résumé de l\'offre',
  'e.g. VIP Haircut Discount': 'Ex. Remise coupe VIP',
  'e.g. 20% OFF or 15 TND OFF': 'Ex. -20% ou -15 TND',
  'e.g. Save 20% on any premium treatment with the crew...': 'Ex. Économisez 20% sur tout soin premium...',
  'Deploy Offer': 'Lancer l\'offre',
  'Active Campaign Directory': 'Répertoire des campagnes actives',
  'Withdraw Promotion': 'Retirer la promotion',
  'Limit: {n} bookings': 'Limite : {n} réservations',
  'Exclusive VIP loyalty point campaign.': 'Campagne exclusive de points de fidélité VIP.',
  'Starts: {date}': 'Début : {date}',
  'Redeemed: {n} times': 'Utilisée : {n} fois',

  // Toasts (from App.tsx)
  'Secure Entrance Verified': 'Entrée sécurisée vérifiée',
  'Access granted as {name}.': 'Accès accordé à {name}.',
  'Access Expired': 'Accès expiré',
  'You have successfully logged out of the parlor portal.': 'Vous vous êtes déconnecté avec succès du portail.',
  'Appointment Approved': 'Rendez-vous approuvé',
  'Approved booking for {clientName}.': 'Réservation approuvée pour {clientName}.',
  'Service Completed': 'Service terminé',
  'Marked complete. +{pointsCredited} loyalty points awarded.': 'Marqué terminé. +{pointsCredited} points de fidélité attribués.',
  'Booking Cancelled': 'Réservation annulée',
  'Cancelled booking for {clientName}.': 'Réservation annulée pour {clientName}.',
  'Notification Sent': 'Notification envoyée',
  'Custom client alert sent successfully.': 'Alerte client personnalisée envoyée.',
  'Points Adjusted': 'Points ajustés',
  'Customer loyalty balance updated.': 'Solde de fidélité client mis à jour.',
  'Barber Added': 'Barbier ajouté',
  '{newBarberName} joined the roster.': '{newBarberName} a rejoint l\'équipe.',
  'Barber Removed': 'Barbier retiré',
  '{targetName} was removed from the roster.': '{targetName} a été retiré de l\'équipe.',
  'Service Added': 'Service ajouté',
  '{newServiceName} has been added.': '{newServiceName} a été ajouté.',
  'Service Removed': 'Service retiré',
  '{targetName} has been removed.': '{targetName} a été retiré.',
  'Category Added': 'Catégorie ajoutée',
  'Category {newCategoryName} was added.': 'La catégorie {newCategoryName} a été ajoutée.',
  'Category Removed': 'Catégorie retirée',
  'Category {targetName} was removed.': 'La catégorie {targetName} a été retirée.',
  'Rate Updated': 'Taux mis à jour',
  'Exchange rate set to {val} TND per point.': 'Taux de change fixé à {val} TND par point.',
  'Promo Created': 'Promo créée',
  'Campaign "{newPromoTitle}" is now live.': 'La campagne « {newPromoTitle} » est en ligne.',
  'Promo Removed': 'Promo retirée',
  'Campaign "{targetTitle}" was removed.': 'La campagne « {targetTitle} » a été retirée.',

  // ClientApp
  'Welcome back': 'Bon retour',
  'Log Out': 'Se déconnecter',
  'Exclusive Store Special Offers [{n}]': 'Offres exclusives du salon [{n}]',
  '🔥 Selling out fast!': '🔥 Part vite !',
  'VVIP Loyalty Club': 'Club de fidélité VVIP',
  'points': 'points',
  'Est. Value: X.XX TND': 'Valeur est. : X.XX TND',
  '1 PT = X TND': '1 PT = X TND',
  'Progress to free treatment': 'Progrès vers un soin gratuit',
  'You have enough points! Redeem points during your next booking.': 'Vous avez assez de points ! Échangez-les lors de votre prochaine réservation.',
  'Earn {n} more points to get a free service of your choosing!': 'Gagnez {n} points de plus pour un soin gratuit de votre choix !',
  'Reserve Appointment Slot': 'Réserver un créneau',
  'Our Elite Barbers': 'Nos barbiers d\'élite',
  'Tap for biography': 'Appuyez pour la biographie',
  'Service Segments': 'Segments de service',
  'All Services': 'Tous les services',
  'Premium Operations': 'Opérations premium',
  'No treatments or services registered in this category.': 'Aucun soin ou service enregistré dans cette catégorie.',
  'Request Custom Appointment': 'Demander un rendez-vous personnalisé',
  'Promo Applied: {discount} on checkout': 'Promo appliquée : {discount} à la caisse',
  '1. Select Operation': '1. Choisir l\'opération',
  'min duration': 'min de durée',
  'Redeem with {n} PTS': 'Échanger avec {n} PTS',
  'Valued: $X': 'Valeur : X TND',
  '2. Choose Stylist': '2. Choisir le coiffeur',
  'No stylist is qualified to perform this service currently.': 'Aucun coiffeur qualified pour ce service actuellement.',
  '3. Appointment Date': '3. Date du rendez-vous',
  'Today': "Aujourd'hui",
  'Tomorrow': 'Demain',
  'Day After': 'Après-demain',
  'No promo range': 'Aucune promo',
  '4. Available Hours': '4. Heures disponibles',
  'Booking Information Invoice': 'Facture d\'information de réservation',
  'Treatment': 'Soin',
  'Barber Master': 'Maître barbier',
  'Date & Hour': 'Date et heure',
  'Spend loyalty points?': 'Dépenser des points de fidélité ?',
  'Avail: {n} PTS ($X)': 'Dispo : {n} PTS ({X} TND)',
  'Redeem {n} PTS (worth X TND) to get this treatment completely FREE!': 'Échangez {n} PTS (valant X TND) pour ce soin entièrement GRATUIT !',
  'Requires {n} PTS to redeem fully free (You are currently short {n} PTS).': 'Nécessite {n} PTS pour un échange gratuit (il vous manque {n} PTS).',
  'Use point balance cash-in: spend {n} PTS to get a direct -X TND partial discount!': 'Utilisez votre solde : dépensez {n} PTS pour une remise partielle de -X TND !',
  'No loyalty points currently available to discount this booking.': 'Aucun point de fidélité disponible pour réduire cette réservation.',
  'Total Price Due:': 'Prix total dû :',
  'Free (Redeemed)': 'Gratuit (échangé)',
  'Promo': 'Promo',
  'Process & Transmit Reservation': 'Traiter et transmettre la réservation',
  'My Reservations': 'Mes réservations',
  'You do not have any active appointments booked yet.': 'Vous n\'avez aucun rendez-vous actif pour le moment.',
  'Book First Slot': 'Réserver un premier créneau',
  'ID: {APPID}': 'ID : {APPID}',
  'Stylist: {name}': 'Coiffeur : {name}',
  'Payment Method': 'Mode de paiement',
  'Cash': 'Espèces',
  'Loyalty Points Redeemed': 'Points de fidélité échangés',
  'Rate Barber': 'Évaluer le barbier',
  'Reviewed': 'Évalué',
  'Request Cancellation': 'Demander l\'annulation',
  'Android System Notifications': 'Notifications système Android',
  'In-App Recipient': 'Destinataire in-app',
  'You have no notification notifications at this moment.': 'Vous n\'avez aucune notification pour le moment.',
  'Rate Your Stylist': 'Évaluez votre coiffeur',
  'How would you rate the precision of your cut?': 'Comment évaluez-vous la précision de votre coupe ?',
  'Tell us more (Optional)': 'Dites-nous en plus (facultatif)',
  'E.g., Marcus was extremely professional and gave me a world class scissor skin fade! Guaranteed to visit again.': 'Ex. Marcus était très professionnel et m\'a fait un dégradé au rasoir de classe mondiale !',
  'Cancel': 'Annuler',
  'Submit Review & Rate': 'Envoyer l\'avis et évaluer',
  'Qualified Operations': 'Opérations qualifiées',
  'All Standard Operations': 'Toutes les opérations standard',
  'Barbershop Log Reviews': 'Avis du salon',
  'No reviews filed yet. Be the first!': 'Aucun avis encore. Soyez le premier !',
  'Book with {name}': 'Réserver avec {name}',
  'Limited Time VIP Campaign': 'Campagne VIP à durée limitée',
  'Starts': 'Début',
  'Terminates': 'Fin',
  'Booking Campaign Roster': 'Liste des réservations de la campagne',
  'Only {n} of {limit} left!': 'Plus que {n} sur {limit} !',
  'Campaign sold out': 'Campagne épuisée',
  'Offer Capacity Reached': 'Capacité atteinte',
  'Claim & Book Special Now': 'Réclamer et réserver l\'offre maintenant',
  'Main Hub': 'Accueil',
  'Reserve Slot': 'Réserver',
  'Bookings': 'Réservations',
  'System Logs': 'Journaux',
};

export function useT() {
  const { lang } = useSettings();
  return (key: string, params?: Record<string, string | number>): string => {
    if (!key) return key;
    let str = lang === 'fr' ? (FR[key] ?? key) : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  };
}
