
const axios = require('axios');

class TrafficLogic {
    constructor() {
        this.currentState = 'AB_GREEN';
        this.nextState = 'CD_GREEN';
        this.timer = null;
        this.queues = {
            A: 0, B: 0,
            C: 0, D: 0,
            E: 0, F: 0,
            G: 0, H: 0
        };
        // Simplified mapping of phases to lanes they serve
        this.phases = ['AB', 'CD', 'EF', 'GH'];
        this.currentPhaseIndex = 0;

        this.minDuration = 5000; // 5 seconds
        this.maxDuration = 30000; // 30 seconds (increased from 20)
        this.yellowDuration = 3000; // 3 seconds

        this.onLightChange = null; // Callback

        // Mapping phases to axes names known by the Python model
        this.phaseToAxe = {
            'AB': 'avenue_colonel_mondjiba', // Example mapping
            'CD': 'avenue_batetela',
            'EF': 'avenue_huileries',
            'GH': 'boulevard_30_juin'
        };

        this.startCycle();
    }

    setCallback(callback) {
        this.onLightChange = callback;
    }

    updateQueues(newQueues) {
        // Merge updates
        this.queues = { ...this.queues, ...newQueues };
    }

    startCycle() {
        this.transitionToPhase(this.phases[this.currentPhaseIndex]);
    }

    async transitionToPhase(phase) {
        // Set lights for new phase
        const lights = {
            AB: 'RED', CD: 'RED', EF: 'RED', GH: 'RED'
        };
        lights[phase] = 'GREEN';

        this.currentState = phase + '_GREEN';
        if (this.onLightChange) this.onLightChange(lights);

        // Calculate duration based on queues for this phase
        let duration = this.minDuration;
        try {
            duration = await this.calculateDurationWithAI(phase);
            console.log(`Phase ${phase} GREEN for ${duration}ms (AI Decision)`);
        } catch (error) {
            console.error('Error fetching AI decision, using fallback:', error.message);
            duration = this.calculateDurationFallback(phase);
            console.log(`Phase ${phase} GREEN for ${duration}ms (Fallback)`);
        }

        setTimeout(() => {
            this.transitionToYellow(phase);
        }, duration);
    }

    transitionToYellow(phase) {
        const lights = {
            AB: 'RED', CD: 'RED', EF: 'RED', GH: 'RED'
        };
        lights[phase] = 'YELLOW';

        this.currentState = phase + '_YELLOW';
        if (this.onLightChange) this.onLightChange(lights);

        setTimeout(() => {
            this.nextPhase();
        }, this.yellowDuration);
    }

    nextPhase() {
        this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
        const nextPhase = this.phases[this.currentPhaseIndex];

        // Intelligent skip: If next phase has 0 cars, check if we should skip
        // For simplicity in this demo, we just give it minimum duration if empty

        this.transitionToPhase(nextPhase);
    }

    async calculateDurationWithAI(phase) {
        const lane1 = phase[0];
        const lane2 = phase[1];
        const count = (this.queues[lane1] || 0) + (this.queues[lane2] || 0);

        // Approximate debit (vehicles/min) and occupation (%)
        // In a real system these would be measured over time.
        // Here we estimate: count * 6 (assuming 10s window? no, just a snapshot)
        // Let's just send the count as debit for now, or scaled.
        const debit = count * 2;
        const occupation = Math.min(count * 5, 100); // 5% per car approx

        const axeName = this.phaseToAxe[phase] || 'unknown';

        const response = await axios.post('http://127.0.0.1:8000/api/predict', {
            axe: axeName,
            debit: debit,
            occupation: occupation,
            vitesse: 50, // Default assumption
            lane_id: phase
        });

        if (response.data && response.data.duree_vert_sec) {
            return response.data.duree_vert_sec * 1000;
        }
        throw new Error('Invalid response from AI');
    }

    calculateDurationFallback(phase) {
        // Get queues for the current phase (e.g., AB uses lanes A and B)
        const lane1 = phase[0];
        const lane2 = phase[1];
        const count = (this.queues[lane1] || 0) + (this.queues[lane2] || 0);

        if (count === 0) return this.minDuration;

        // Simple linear scaling: 1 car = 1 second extra ? 
        // Let's say baseline 5s + 2s per car, capped at maxDuration
        const calculated = this.minDuration + (count * 2000);
        return Math.min(calculated, this.maxDuration);
    }
}

module.exports = new TrafficLogic();

