"""
Serveur Flask pour le modèle IA de gestion du trafic avec SQLite
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Autoriser les requêtes cross-origin

# Configuration
DB_PATH = 'traffic_ai.db'
IA_ACTIVE = True  # Statut du modèle IA

# Initialiser la base de données SQLite
def init_db():
    """Initialise la base de données SQLite avec les tables nécessaires"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table pour stocker les données de trafic
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS traffic_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            axe TEXT NOT NULL,
            debit REAL,
            occupation REAL,
            vitesse REAL,
            lane_id TEXT,
            duree_vert_sec REAL,
            prediction REAL
        )
    ''')
    
    # Table pour stocker les modèles et leurs métriques
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS model_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            model_name TEXT,
            accuracy REAL,
            mse REAL,
            mae REAL,
            metadata TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"[SQLite] Base de données initialisée : {DB_PATH}")

def get_db_connection():
    """Obtient une connexion à la base de données"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/ia/status', methods=['GET'])
def ia_status():
    """Retourne le statut du modèle IA"""
    return jsonify({
        'ia_active': IA_ACTIVE,
        'message': 'Modèle IA actif' if IA_ACTIVE else 'Modèle IA inactif'
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint pour obtenir une prédiction de durée de feu vert
    Format attendu:
    {
        "axe": "avenue_colonel_mondjiba",
        "debit": 10.0,
        "occupation": 50.0,
        "vitesse": 50.0,
        "lane_id": "AB"
    }
    """
    try:
        data = request.get_json()
        
        # Validation des données
        required_fields = ['axe', 'debit', 'occupation', 'vitesse', 'lane_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Champ manquant: {field}'}), 400
        
        axe = data['axe']
        debit = float(data['debit'])
        occupation = float(data['occupation'])
        vitesse = float(data['vitesse'])
        lane_id = data['lane_id']
        
        # Calcul de la prédiction (modèle simplifié)
        # Vous pouvez remplacer cela par votre vrai modèle ML
        duree_vert_sec = calculate_duration(debit, occupation, vitesse)
        
        # Sauvegarder dans SQLite
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO traffic_data (axe, debit, occupation, vitesse, lane_id, duree_vert_sec, prediction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (axe, debit, occupation, vitesse, lane_id, duree_vert_sec, duree_vert_sec))
        conn.commit()
        conn.close()
        
        return jsonify({
            'duree_vert_sec': duree_vert_sec,
            'axe': axe,
            'lane_id': lane_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_duration(debit, occupation, vitesse):
    """
    Calcule la durée du feu vert en secondes
    Modèle simplifié basé sur le débit et l'occupation
    Vous pouvez remplacer cette fonction par votre vrai modèle ML
    """
    # Durée minimale: 5 secondes
    # Durée maximale: 30 secondes
    # Formule basique: durée = base + (occupation * facteur) + (debit * facteur)
    
    base_duration = 5.0
    occupation_factor = occupation / 10.0  # occupation en %
    debit_factor = debit / 5.0  # ajustement selon le débit
    
    duration = base_duration + occupation_factor + debit_factor
    
    # Limiter entre 5 et 30 secondes
    duration = max(5.0, min(30.0, duration))
    
    return round(duration, 2)

@app.route('/api/data', methods=['GET'])
def get_data():
    """Récupère les données historiques depuis SQLite"""
    try:
        limit = request.args.get('limit', 100, type=int)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM traffic_data 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        data = []
        for row in rows:
            data.append({
                'id': row['id'],
                'timestamp': row['timestamp'],
                'axe': row['axe'],
                'debit': row['debit'],
                'occupation': row['occupation'],
                'vitesse': row['vitesse'],
                'lane_id': row['lane_id'],
                'duree_vert_sec': row['duree_vert_sec'],
                'prediction': row['prediction']
            })
        
        return jsonify({'data': data, 'count': len(data)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Récupère les métriques du modèle depuis SQLite"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM model_metrics 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        metrics = []
        for row in rows:
            metrics.append({
                'id': row['id'],
                'timestamp': row['timestamp'],
                'model_name': row['model_name'],
                'accuracy': row['accuracy'],
                'mse': row['mse'],
                'mae': row['mae'],
                'metadata': json.loads(row['metadata']) if row['metadata'] else None
            })
        
        return jsonify({'metrics': metrics})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de santé pour vérifier que le serveur fonctionne"""
    return jsonify({
        'status': 'ok',
        'ia_active': IA_ACTIVE,
        'database': 'connected' if os.path.exists(DB_PATH) else 'not_found'
    })

if __name__ == '__main__':
    # Initialiser la base de données au démarrage
    init_db()
    
    print("=" * 60)
    print("Serveur IA de gestion du trafic")
    print("=" * 60)
    print(f"Base de données SQLite: {DB_PATH}")
    print(f"Statut IA: {'ACTIF' if IA_ACTIVE else 'INACTIF'}")
    print("=" * 60)
    print("\nEndpoints disponibles:")
    print("  GET  /api/ia/status  - Statut du modèle IA")
    print("  POST /api/predict    - Prédiction de durée de feu vert")
    print("  GET  /api/data       - Données historiques")
    print("  GET  /api/metrics    - Métriques du modèle")
    print("  GET  /health         - Santé du serveur")
    print("\nDémarrage du serveur sur http://127.0.0.1:8000")
    print("=" * 60)
    
    app.run(host='127.0.0.1', port=8000, debug=True)
