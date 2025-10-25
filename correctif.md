1\. Dashboard (Offre Client)



Afficher les prochaines réservations réelles (issues de la base de données) dans la section “Prochaine réservation”, en bas du tableau de bord.



Supprimer toutes les fausses données ou données de test présentes actuellement.



2\. Blocage d’horaires – Calendrier professionnel

a. Blocage manuel



Le professionnel peut bloquer certaines heures d’une date spécifique.



Les heures bloquées = rouge (non disponibles).



Les heures disponibles = vert (par défaut).



Ces heures bloquées ne doivent pas être visibles/réservables par les clients Singhour’s.



b. Créneaux personnalisés



Le professionnel peut définir ses horaires de disponibilité (ex. 9h–12h / 13h–23h ou 9h–3h).



Seules ces heures apparaissent dans le calendrier.



Les heures en dehors de ces créneaux sont masquées ou marquées comme indisponibles.



L’utilisateur doit pouvoir bloquer individuellement certaines heures à l’intérieur de ces créneaux.



c. Synchronisation Google Calendar



Ajouter une liaison avec Google Calendar (si possible).



Importer automatiquement les événements existants (heures et dates réservées).



Ces événements doivent apparaître en rouge (bloqués) dans l’application.



3\. Réservation



Relier le système de réservation à la base de données Supabase.



Afficher les réservations selon leur statut :



En attente



Confirmées



Nouvelles réservations



Les données doivent venir directement de la database (aucune donnée fictive).



4\. Profil professionnel

a. Photo de profil



Permettre à l’utilisateur de modifier et enregistrer sa photo de profil.



b. Informations utilisateur



Sauvegarder correctement toutes les modifications dans les tables Supabase.



Ajouter un système de localisation d’adresse (Google Maps API ou équivalent).



Permettre de changer le statut en ligne/hors ligne directement depuis le tableau de bord (sous l’adresse), pas via “Modifier profil”.



Afficher les vrais avis clients et la vraie note moyenne depuis la base de données.



c. Portfolio



Permettre à l’utilisateur d’ajouter des photos dans son portfolio.



5\. Paramètres



Mettre en place un système de paiement complet :



Saisie du RIB, BIC et informations fiscales (backend à connecter, table Supabase déjà existante).



Intégration avec API PayPal, 3D Secure, etc.



Activer le système de notifications lorsqu’un client réserve un créneau (alerte pour le professionnel).



6\. Sauvegarde \& Connexions



Vérifier que toutes les données de l’application sont bien enregistrées dans les bonnes tables Supabase.



Corriger les boutons qui ne sauvegardent pas les données (modifier, ajouter, déconnexion, inscription, connexion).



Ajouter la connexion Google et, si possible Apple sur la page connexion 



✅ En résumé

Module	Fonctionnalités principales

Dashboard	Afficher les vraies réservations à venir

Calendrier	Blocage d’heures, créneaux personnalisés, sync Google

Réservation	Lier statuts à la database

Profil	Modifier photo, infos, statut, portfolio

Paramètres	Paiement (RIB, BIC, PayPal, 3D Secure), notifications

Backend global	Vérifier sauvegardes, connexions, boutons, ajout Google login apple

