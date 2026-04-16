document.addEventListener('DOMContentLoaded', () => {
    let myChart = null;
    let completedDays = JSON.parse(localStorage.getItem('roadmapProgress')) || [];

    // --- NAVIGATION LOGIC ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');
            
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            if (target === 'planner-section') renderPlanner();
        });
    });

    // --- THEME TOGGLE ---
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') === 'dark';
        root.setAttribute('data-theme', isDark ? 'light' : 'dark');
    });

    // --- AI ANALYSIS ENGINE ---
    document.getElementById('analyze-btn').addEventListener('click', () => {
        const goal = document.getElementById('goal').value || "Senior Developer";
        const skills = document.getElementById('skills').value || "Core Engineering";

        document.getElementById('loading-overlay').classList.remove('hidden');

        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
            
            // Save context for dynamic sections
            localStorage.setItem('currentUserGoal', goal);
            localStorage.setItem('currentUserSkills', skills);

            // Generate Score based on input length as a dummy logic
            const score = Math.min(95, 65 + (skills.length));

            document.querySelector('[data-section="dashboard-section"]').click();
            renderDashboard(score, goal);
            setupInterviewQuestions(goal);
        }, 1500);
    });

    function renderDashboard(score, goal) {
        document.getElementById('match-percent').innerText = score + "%";
        document.getElementById('path-recommendation').innerHTML = `
            <strong>Expert Analysis:</strong> Your trajectory toward becoming a <u>${goal}</u> shows strong potential. 
            However, moving to the next level requires deep expertise in <strong>System Architecture</strong> and <strong>Scalability</strong>. 
            I have generated a rigorous 30-day curriculum in the Roadmap tab to bridge your current skill gaps.`;
        
        const ctx = document.getElementById('matchChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: { datasets: [{ data: [score, 100-score], backgroundColor: ['#06b6d4', 'rgba(255,255,255,0.05)'], borderWidth: 0 }] },
            options: { cutout: '80%', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { enabled: false } } }
        });
    }

    // --- DYNAMIC ROADMAP GENERATOR ---
    function renderPlanner() {
        const grid = document.getElementById('planner-grid');
        const goal = localStorage.getItem('currentUserGoal') || "Technology Professional";
        grid.innerHTML = ""; // Clear existing
        
        // Expert Phases
        const phases = [
            { name: "Foundations & Audit", task: "Review Core Concepts & Optimization" },
            { name: "Advanced Implementation", task: "Design Patterns & Architecture" },
            { name: "System Integrity", task: "Security, Testing & Performance" },
            { name: "Scale & Delivery", task: "CI/CD, Deployment & Code Reviews" }
        ];

        for (let i = 1; i <= 30; i++) {
            const isDone = completedDays.includes(i);
            const phase = phases[Math.floor((i-1)/7.5)] || phases[3]; // Divides 30 days into 4 phases
            
            const card = document.createElement('div');
            card.className = `dashboard-card roadmap-node ${isDone ? 'completed' : ''}`;
            card.innerHTML = `
                <div class="step-icon">${isDone ? '<i class="fas fa-check"></i>' : i}</div>
                <div class="step-content">
                    <h5 class="day-label">${phase.name}</h5>
                    <p style="font-size:0.8rem; color:var(--text-muted)">Day ${i}: ${phase.task} for ${goal}</p>
                </div>
            `;

            card.onclick = () => toggleDay(i, card);
            grid.appendChild(card);
        }
        updateProgressCount();
    }

    function toggleDay(day, card) {
        if (completedDays.includes(day)) {
            completedDays = completedDays.filter(d => d !== day);
            card.classList.remove('completed');
            card.querySelector('.step-icon').innerText = day;
        } else {
            completedDays.push(day);
            card.classList.add('completed');
            card.querySelector('.step-icon').innerHTML = '<i class="fas fa-check"></i>';
        }
        localStorage.setItem('roadmapProgress', JSON.stringify(completedDays));
        updateProgressCount();
    }

    function updateProgressCount() {
        document.getElementById('completed-count').innerText = completedDays.length;
    }

    // --- DYNAMIC INTERVIEW ENGINE ---
    let interviewQs = [];
    let currentQIdx = 0;

    function setupInterviewQuestions(goal) {
        interviewQs = [
            `As a ${goal}, how would you architect a solution that needs to scale to 10,000 concurrent users?`,
            `Explain the most difficult technical hurdle you faced recently. How did you debug it?`,
            `Describe a scenario where you had to compromise on technical best practices to meet a strict business deadline.`,
            `How do you ensure code maintainability and standard compliance in a team environment?`
        ];
        currentQIdx = 0;
    }

    document.getElementById('start-interview-btn').onclick = () => {
        if(interviewQs.length === 0) setupInterviewQuestions("Senior Professional");
        document.getElementById('interview-start-screen').classList.add('hidden');
        document.getElementById('interview-session').classList.remove('hidden');
        document.getElementById('current-question').innerText = interviewQs[currentQIdx];
    };

    document.getElementById('next-q-btn').onclick = () => {
        currentQIdx = (currentQIdx + 1) % interviewQs.length;
        document.getElementById('current-question').innerText = interviewQs[currentQIdx];
        document.getElementById('interview-feedback').innerHTML = "";
        document.getElementById('user-answer').value = "";
    };

    document.getElementById('evaluate-btn').onclick = () => {
        const ans = document.getElementById('user-answer').value.trim();
        let feedbackHTML = "";

        if (ans.length < 30) {
            feedbackHTML = `<strong>Feedback:</strong> Too brief. In a real technical interview, you need to articulate the 'Why' and the 'How'. Use the STAR method (Situation, Task, Action, Result).`;
        } else {
            feedbackHTML = `<strong>Expert Feedback:</strong> Solid articulation. You addressed the core concept well. To stand out, try mentioning specific industry metrics, tools, or edge cases you considered.`;
        }
        
        document.getElementById('interview-feedback').innerHTML = `<div class="info-node"><i class="fas fa-robot" style="color:var(--primary-color); margin-right:8px;"></i> ${feedbackHTML}</div>`;
    };

    // --- RESUME SCANNER ---
    document.getElementById('analyze-resume-btn').onclick = () => {
        const text = document.getElementById('resume-text').value.toLowerCase();
        if (!text) return alert("Please paste your resume text first.");

        // Dummy ATS Logic
        const score = text.length > 200 ? 85 : 40; 
        
        document.getElementById('resume-results').classList.remove('hidden');
        document.getElementById('resume-progress').style.width = score + "%";
        
        const feedback = score > 70 ? 
            "High ATS Compatibility! Your keyword density is excellent." : 
            "Low ATS Score. Add more specific technical skills and action verbs.";
            
        document.getElementById('resume-feedback').innerHTML = `<div class="info-node mt-1"><strong>ATS Score: ${score}%</strong><br>${feedback}</div>`;
    };
});

// --- GLOBAL UTILITIES ---
window.switchTab = (id) => {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-trigger').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    event.currentTarget.classList.add('active');
};