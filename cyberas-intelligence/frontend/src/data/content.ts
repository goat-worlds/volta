import { Shield, Zap, TrendingUp, GitBranch, CheckCircle, AlertTriangle, Target } from 'lucide-react'
import type { Agent, DemoStep, Sector } from '../types'

export const agents: (Agent & { title: string })[] = [
  {
    id: 1,
    name: 'Audit Assistant',
    title: 'Audit Assistant',
    description: 'Automatise les audits de sécurité',
    capabilities: ['Scanning', 'Reporting', 'Compliance Checking'],
  },
  {
    id: 2,
    name: 'Risk Analyzer',
    title: 'Risk Analyzer',
    description: 'Analyse les risques de sécurité',
    capabilities: ['Risk Assessment', 'Threat Detection', 'Mitigation'],
  },
]

export const modules = [
  {
    id: 1,
    slug: 'audits',
    title: 'Audit Management',
    icon: Shield,
    description: 'Lancez et suivez des audits complets — ISO 27001, NIST, PCI-DSS, etc.',
  },
  {
    id: 2,
    slug: 'risques',
    title: 'Gestion des risques',
    icon: AlertTriangle,
    description: 'Cartographiez vos risques avec la méthode MEHARI.',
  },
  {
    id: 3,
    slug: 'conformite',
    title: 'Conformité',
    icon: CheckCircle,
    description: 'Pilotez votre conformité réglementaire et certifications.',
  },
  {
    id: 4,
    slug: 'vulns',
    title: 'Vulnérabilités',
    icon: GitBranch,
    description: 'Découvrez et priorisez vos vulnérabilités en temps réel.',
  },
  {
    id: 5,
    slug: 'rapports',
    title: 'Rapports intelligents',
    icon: TrendingUp,
    description: 'Générez des rapports exécutifs et détaillés automatiquement.',
  },
]

export const demoTourSteps: DemoStep[] = [
  { step: 1, title: 'Dashboard', description: 'Vue d\'ensemble de vos audits' },
  { step: 2, title: 'Créer une Mission', description: 'Lancez une nouvelle mission d\'audit' },
  { step: 3, title: 'Questionnaire', description: 'Répondez aux questions d\'audit' },
  { step: 4, title: 'Rapport', description: 'Consultez votre rapport complet' },
]

export const plans = [
  {
    id: 1,
    name: 'Starter',
    price: '49900',
    period: 'FCFA/mois',
    description: 'Parfait pour débuter',
    recommended: false,
    features: [
      { label: 'Audits illimités', included: true },
      { label: 'Jusqu\'à 5 utilisateurs', included: true },
      { label: 'Support par email', included: true },
      { label: 'Intégrations & API REST', included: false },
      { label: 'Support technique 24/7', included: false },
      { label: 'Déploiement personnalisé', included: false },
    ],
  },
  {
    id: 2,
    name: 'Pro',
    price: '149900',
    period: 'FCFA/mois',
    description: 'Pour les équipes moyennes',
    recommended: true,
    features: [
      { label: 'Audits illimités', included: true },
      { label: 'Jusqu\'à 20 utilisateurs', included: true },
      { label: 'Support par email', included: true },
      { label: 'Intégrations & API REST', included: true },
      { label: 'Support technique prioritaire', included: true },
      { label: 'Déploiement personnalisé', included: false },
    ],
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 'Devis',
    period: 'personnalisé',
    description: 'Solution sur mesure',
    recommended: false,
    features: [
      { label: 'Audits illimités', included: true },
      { label: 'Utilisateurs illimités', included: true },
      { label: 'Support par email', included: true },
      { label: 'Intégrations & API REST avancées', included: true },
      { label: 'Support technique 24/7', included: true },
      { label: 'Déploiement & infrastructure personnalisés', included: true },
    ],
  },
]

export const sectors: (Sector & { title: string })[] = [
  { id: 1, name: 'Finance', title: 'Finance', icon: Target, description: 'Audits PCI-DSS et conformité bancaire' },
  { id: 2, name: 'Santé', title: 'Santé', icon: Shield, description: 'Conformité HIPAA et protection des données' },
  { id: 3, name: 'Gouvernement', title: 'Gouvernement', icon: CheckCircle, description: 'Audits de sécurité gouvernementale' },
  { id: 4, name: 'Tech', title: 'Tech', icon: Zap, description: 'Audits pour startups et scale-ups' },
]

export const clientLogos: string[] = []

export const whyAuditBenefits = [
  { title: 'Stopper les menaces avant qu\'elles ne frappent', description: 'Detections continues des vulnerabilites critiques et zero-days avant les attaquants' },
  { title: 'Conformite multi-referentiels garantie', description: 'ISO 27001, ISO 27002, RGPD, PCI-DSS, NIST, HIPAA, ANSSI - audit complet et continu' },
  { title: 'Economiser des millions en couts de breach', description: 'Un breach coute en moyenne 4M$ - prevenes-le maintenant avec des audits reguliers' },
  { title: 'Gouvernance et conformite 24/7', description: 'Automatisez 80% des controles et gagnez 10x de productivite pour votre equipe RSSI' },
]

export const stats = [
  { value: '80%', label: 'Automatisation IA', detail: 'des taches manuelles eliminees en audits' },
  { value: '10x', label: 'Plus productive', detail: 'pour votre equipe de cybersecurite' },
  { value: '118', label: 'Controles ISO 27001', detail: 'couverts et evalues automatiquement' },
  { value: '24h', label: 'Rapports executives', detail: 'generes prets pour les decideurs' },
]

export const methodologySteps = [
  { title: 'Planification', description: 'Définition du périmètre et des objectifs' },
  { title: 'Collecte', description: 'Rassemblement des éléments de preuve' },
  { title: 'Analyse', description: 'Évaluation des contrôles et risques' },
  { title: 'Cartographie', description: 'Visualisation de la posture de sécurité' },
  { title: 'Scoring', description: 'Calcul du score de conformité' },
  { title: 'Rapport', description: 'Génération du rapport d\'audit' },
]

export const testimonials = [
  {
    author: 'Armand T.',
    company: 'Acme Corp',
    quote: 'CYBERAS a réduit notre temps d\'audit de 75%. Les rapports sont clairs et prêts pour l\'audit externe.',
  },
  {
    author: 'Marie Martin',
    company: 'TechStart',
    quote: 'Une plateforme incontournable pour gérer la conformité ISO 27001 en continu.',
  },
  {
    author: 'Jean Dupont',
    company: 'BanqueAtlantique',
    quote: 'L\'IA détecte des risques que nous aurions manqués. Un vrai gain en matière de sécurité.',
  },
]

export const comparison = {
  traditional: {
    label: 'Audit traditionnel (lent et dangereux)',
    items: ['Consultants externes couteux', '2-3 mois par mission d\'audit', 'Vulnerabilites manquees entre audits', 'Couts massifs en remediations', 'Zero visibilite entre audit annuels'],
    duration: '2-3 mois',
  },
  cyberas: {
    label: 'CYBERAS Intelligence (continu et intelligent)',
    items: ['Automtisation IA 24/7', 'Audit complet en 3-5 jours', 'Detection continue des menaces', 'Reduction ROI et productivite', 'Dashboard temps-reel et compliance score'],
    duration: '3-5 jours',
  },
}
