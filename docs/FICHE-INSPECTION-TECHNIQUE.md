# Fiche de vérification technique

Les points de contrôle auxquels répond le technicien à qui la mission est assignée. Extrait du code en service au 12 novembre 2026 — `VoltaService.CHECKLIST_TEMPLATE`.

## Comment elle se remplit

Le technicien ouvre la mission qui lui a été attribuée par l'administration, puis renseigne chacun des vingt et un points ci-dessous. Chaque point reçoit **un verdict parmi trois** :

| Verdict | Signification |
|---|---|
| Conforme | Le poste contrôlé remplit sa fonction, sans réserve. |
| À surveiller | Fonctionne, mais présente une usure ou un défaut qui appelle un suivi. |
| Non conforme | Ne remplit pas sa fonction, ou présente un risque. |

Un point laissé sans verdict reste ouvert : le rapport ne peut pas être transmis tant qu'il en demeure.

S'ajoutent à la grille une **zone d'observations générale**, les **photos** prises sur place, les **anomalies** relevées et les **documents** joints — tous téléversés depuis l'écran du technicien et conservés sur le serveur.

Le rapport transmis **ne publie pas l'engin**. La décision de référencement et le niveau — Basic, Silver ou Gold — appartiennent à l'administration seule.

---

## 1. Mécanique

Six points.

- **Moteur**
- **Transmission**
- **Hydraulique**
- **Freinage**
- **Direction**
- **Pneus / chenilles**

## 2. Équipement

Quatre points.

- **Godet**
- **Bras**
- **Accessoires**
- **Équipements spécifiques**

## 3. Sécurité

Quatre points.

- **Dispositifs de sécurité**
- **Éclairage**
- **Signalisation**
- **Équipements obligatoires**

## 4. État général

Quatre points.

- **Carrosserie**
- **Corrosion**
- **Usure**
- **Fonctionnement général**

## 5. Mobilité et intervention

Trois points. Cette famille ne figure pas au cahier des charges : elle a été ajoutée parce qu'un engin conforme mais immobilisable à la frontière, ou dont le détenteur met trois jours à dépêcher une équipe, ne rend pas le service attendu.

Ces trois points **exigent une précision écrite**. « Conforme » seul n'y apprend rien : il ne dit ni quels pays sont couverts, ni en combien de temps une équipe se déplace.

| Point | Ce que la précision doit contenir |
|---|---|
| **Certificat de déplacement entre pays** | Pays couverts, numéro, validité |
| **Équipe mobile du détenteur** | Composition, base, moyens de déplacement |
| **Délai d'intervention constaté** | Par exemple : moins de 24 h, 24 à 48 h, 48 à 72 h |

Ailleurs, la zone d'observations générale suffit : un champ par ligne alourdirait une grille de vingt et un points sans rien apporter.

---

## Ce que devient la fiche

1. **Assignation.** L'administration choisit l'entreprise de vérification et lui attribue la mission.
2. **Saisie.** Le technicien renseigne les vingt et un points, ajoute observations, photos et anomalies. Chaque contrôle est enregistré dès qu'il change — un relevé de terrain qui n'atteint pas le serveur est signalé à l'écran plutôt que perdu en silence.
3. **Transmission.** Le rapport part vers l'administration.
4. **Décision.** L'administration confronte le rapport à ce que le détenteur avait déclaré, puis référence ou non, et attribue le niveau.

---

## Deux réserves à connaître

**Cette fiche n'existe pas encore en PDF depuis la plateforme.** Les données sont complètes en base — rapport, grille, observations, photos, anomalies — mais aucune génération de PDF n'est présente dans le dépôt : ni bibliothèque déclarée, ni point d'entrée. Le présent document a été composé à la main depuis le code. Le cahier des charges demande ce rapport au §5.5.

**Les images jointes par le technicien ne s'affichent pas** depuis l'espace de l'équipe. Diagnostic probable : la route qui les sert est réservée aux rôles habilités, or une balise d'image n'envoie jamais de jeton d'authentification — le navigateur reçoit un refus et montre une image cassée. Les photos d'engins y échappent parce que leur route est publique. À confirmer dans l'onglet réseau avant correction.
