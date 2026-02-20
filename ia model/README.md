# Serveur IA pour la gestion du trafic

Ce serveur Flask fournit une API REST pour le modèle IA de gestion du trafic avec stockage SQLite.

## Installation

1. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

## Démarrage

Lancer le serveur :
```bash
python app.py
```

Le serveur démarre sur `http://127.0.0.1:8000`

## Endpoints API

### GET /api/ia/status
Retourne le statut du modèle IA.
```json
{
  "ia_active": true,
  "message": "Modèle IA actif"
}
```

### POST /api/predict
Effectue une prédiction de durée de feu vert.
**Body:**
```json
{
  "axe": "avenue_colonel_mondjiba",
  "debit": 10.0,
  "occupation": 50.0,
  "vitesse": 50.0,
  "lane_id": "AB"
}
```
**Response:**
```json
{
  "duree_vert_sec": 15.5,
  "axe": "avenue_colonel_mondjiba",
  "lane_id": "AB"
}
```

### GET /api/data
Récupère les données historiques.
**Query params:** `limit` (défaut: 100)

### GET /api/metrics
Récupère les métriques du modèle.

### GET /health
Vérifie l'état du serveur.

## Base de données SQLite

La base de données `traffic_ai.db` est créée automatiquement au premier démarrage.

**Tables:**
- `traffic_data` : Données de trafic et prédictions
- `model_metrics` : Métriques du modèle

## Notes

- Le modèle de prédiction actuel est simplifié. Vous pouvez le remplacer par votre vrai modèle ML.
- La base de données SQLite stocke toutes les prédictions pour analyse future.
