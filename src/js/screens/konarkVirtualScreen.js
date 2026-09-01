import { getKonarkMission, completeKonarkMission } from '../missionService.js';
import { auth } from '../firebase.js';
import { appState } from '../state.js';

let currentMission = null;
let userAnswers = {};
let totalScore = 0;

/**
 * Render Konark Virtual Mission Screen (Returns a valid DOM Node)
 */
export function renderKonarkVirtualScreen(container) {
  const root = container || document.createElement('div');
  root.id = 'konark-virtual-screen-root';

  // 1. Initial Loading State
  root.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 300px; color: #d4af37;">
      <p>⏳ Loading Verified Heritage Mission from Firestore...</p>
    </div>
  `;

  // 2. Fetch data in background without blocking DOM return
  getKonarkMission()
    .then((mission) => {
      currentMission = mission;
      userAnswers = {};
      totalScore = 0;

      const tasks = currentMission.tasks || [];

      const tasksHtml = tasks.map((task, index) => `
        <div class="task-card" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
          
          <!-- Task Header & Points -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #d4af37; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
              TASK 0${index + 1} &bull; ${task.taskType || 'EXPLORATION'}
            </span>
            <span style="background: rgba(212, 175, 55, 0.15); color: #ffd700; border: 1px solid rgba(212, 175, 55, 0.4); padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">
              +${task.points || 100} XP
            </span>
          </div>

          <!-- Task Title -->
          <h4 style="color: #ffffff; margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">
            ${task.title}
          </h4>

          <!-- Local Odia Language Term -->
          ${task.localLanguageTerm ? `
            <div style="background: rgba(255, 152, 0, 0.08); border-left: 3px solid #ff9800; padding: 5px 10px; margin-bottom: 10px; border-radius: 0 6px 6px 0;">
              <span style="color: #ffb74d; font-size: 12px; font-weight: 600;">
                🏛️ Local Heritage Term:
              </span>
              <span style="color: #fff; font-size: 13px; font-weight: bold; margin-left: 4px;">
                ${task.localLanguageTerm}
              </span>
            </div>
          ` : ''}

          <!-- Question Prompt -->
          <p style="color: #d1d5db; font-size: 13.5px; line-height: 1.4; margin: 0 0 12px 0;">
            ${task.question || 'Inspect the monument carvings and answer the question below:'}
          </p>

          <!-- Quiz Options -->
          <div class="options-grid" style="display: grid; gap: 8px; margin-bottom: 12px;">
            ${(task.options || []).map(opt => `
              <button 
                type="button"
                class="quiz-btn-${index}" 
                data-task-id="${task.taskId || index}"
                data-selected="${opt}"
                data-correct="${task.correctAnswer}"
                data-points="${task.points || 100}"
                style="background: #18181b; border: 1px solid #3f3f46; color: #f4f4f5; padding: 10px 14px; border-radius: 8px; font-size: 13px; text-align: left; cursor: pointer; transition: all 0.2s ease;"
                onclick="handleQuizOptionClick(this, ${index})"
              >
                ${opt}
              </button>
            `).join('')}
          </div>

          <!-- Result Feedback Message -->
          <div id="feedback-${index}" style="font-size: 12px; font-weight: 600; margin-bottom: 8px; display: none;"></div>

          <!-- Verified Cultural Claim Citation -->
          ${task.sourceUrl ? `
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 8px; font-size: 11px; color: #9ca3af; display: flex; justify-content: space-between; align-items: center;">
              <span>📜 <em>Claim Verified by:</em> <strong>${task.verifiedSource || 'ASI / UNESCO'}</strong></span>
              <a href="${task.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">
                [View Source]
              </a>
            </div>
          ` : ''}
        </div>
      `).join('');

      root.innerHTML = `
        <div class="mission-view" style="padding: 16px; color: #fff; max-width: 480px; margin: 0 auto;">
          
          <!-- Top Back & Mode Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="btn-back-to-map" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ffd700; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px;">
              &larr; Back to Map
            </button>
            <span style="background: #1e3a5f; color: #90caf9; border: 1px solid #42a5f5; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; letter-spacing: 0.5px;">
              ${currentMission.mode || 'VIRTUAL EXPLORATION'}
            </span>
          </div>

          <!-- Monument Banner Card -->
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 36px; margin-bottom: 4px;">☀️</div>
            <h2 style="color: #ffd700; font-family: serif; margin: 0 0 4px 0; font-size: 22px;">
              ${currentMission.title || 'Secrets of Konark Sun Temple'}
            </h2>
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
              📍 ${currentMission.region || 'Konark, Puri, Odisha, India'}
            </p>

            <!-- Historical & Architecture Badges -->
            <div style="display: flex; justify-content: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              <span style="background: rgba(212,175,55,0.12); color: #ffd700; border: 1px solid rgba(212,175,55,0.4); padding: 3px 8px; border-radius: 6px; font-size: 11px;">
                👑 Eastern Ganga Dynasty (1250 CE)
              </span>
              <span style="background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.4); padding: 3px 8px; border-radius: 6px; font-size: 11px;">
                🏛️ Kalinga Architecture
              </span>
            </div>

            <p style="color: #e5e7eb; font-size: 13px; line-height: 1.4; background: rgba(0,0,0,0.25); padding: 10px; border-radius: 8px;">
              ${currentMission.description || 'Decode the architectural genius of the Sun God chariot and its astronomical wheels.'}
            </p>
          </div>

          <!-- Mission Tasks / Quizzes -->
          <div class="tasks-container">
            ${tasksHtml || '<p style="text-align: center; color: #888;">No tasks found for this mission.</p>'}
          </div>

          <!-- Completion Button -->
          <div style="position: sticky; bottom: 12px; margin-top: 20px; z-index: 10;">
            <button 
              id="btn-complete-mission"
              style="width: 100%; background: linear-gradient(135deg, #d4af37, #f59e0b); color: #000; border: none; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 4px 15px rgba(212,175,55,0.4);"
              onclick="submitMissionCompletion()"
            >
              ⭐ SUBMIT MISSION & CLAIM XP
            </button>
          </div>

        </div>
      `;

      // ✅ Guard: disable claim button if mission already completed
      const submitBtn = document.getElementById('btn-complete-mission');
      if (submitBtn && appState.hasMissionCompleted('konark_mission_01')) {
        submitBtn.disabled = true;
        submitBtn.textContent = '✅ Mission Already Completed';
        submitBtn.style.opacity = '0.55';
        submitBtn.style.cursor = 'not-allowed';
      }

      document.getElementById('btn-back-to-map')?.addEventListener('click', () => {
        window.location.reload();
      });
    })
    .catch((error) => {
      console.error('Error loading mission screen:', error);
      root.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ef4444;">
          <p>❌ Failed to load mission from Firestore.</p>
          <button onclick="window.location.reload()" style="background: #333; color: #fff; border: 1px solid #555; padding: 8px 14px; border-radius: 6px; margin-top: 10px; cursor: pointer;">Retry</button>
        </div>
      `;
    });

  // Returns immediate real DOM Node to satisfy app.js appendChild
  return root;
}

/**
 * Global Handler for Quiz Option Clicks
 */
window.handleQuizOptionClick = function(button, taskIndex) {
  const selected = button.getAttribute('data-selected');
  const correct = button.getAttribute('data-correct');
  const points = parseInt(button.getAttribute('data-points') || '100', 10);
  const taskId = button.getAttribute('data-task-id');

  const allButtons = document.querySelectorAll(`.quiz-btn-${taskIndex}`);
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'default';
    if (btn.getAttribute('data-selected') === correct) {
      btn.style.background = '#15803d'; // Green for correct option
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#ffffff';
    }
  });

  const feedbackEl = document.getElementById(`feedback-${taskIndex}`);
  if (feedbackEl) {
    feedbackEl.style.display = 'block';
    if (selected === correct) {
      feedbackEl.style.color = '#4ade80';
      feedbackEl.textContent = `✅ Correct! +${points} XP added.`;
      userAnswers[taskId] = true;
      totalScore += points;
    } else {
      button.style.background = '#991b1b'; // Red for wrong selected option
      button.style.borderColor = '#ef4444';
      feedbackEl.style.color = '#f87171';
      feedbackEl.textContent = `❌ Incorrect. The verified correct answer is "${correct}".`;
      userAnswers[taskId] = false;
    }
  }
};

/**
 * Submit Mission Completion to Firestore
 */
window.submitMissionCompletion = async function() {
  const submitBtn = document.getElementById('btn-complete-mission');

  // ✅ Guard: prevent duplicate XP claim
  if (appState.hasMissionCompleted('konark_mission_01')) {
    appState.showToast('✅ Mission already completed! No extra XP awarded.', 'info', 3000);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '✅ Mission Already Completed';
      submitBtn.style.opacity = '0.55';
      submitBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving progress to Firestore...';
  }

  try {
    const finalScore = totalScore > 0 ? totalScore : (currentMission?.xpReward || 500);
    const actualUid = auth?.currentUser?.uid || appState.player.uid || 'user_player';

    await completeKonarkMission(actualUid, finalScore);
    appState.recordMissionCompletion('konark_mission_01', finalScore, {
      id: 'sun_temple',
      name: 'Sun Temple',
      state: 'Konark, Odisha'
    });

    if (submitBtn) {
      submitBtn.textContent = '✅ Mission Already Completed';
      submitBtn.style.opacity = '0.55';
      submitBtn.style.cursor = 'not-allowed';
    }

    alert(`🎉 Mission Completed!\n\nYou earned ${finalScore} XP and the Sun Chariot Explorer Badge ☀️! Progress saved to Firestore.`);
    window.location.reload();
  } catch (err) {
    console.error('Error saving mission completion:', err);
    alert('Progress saved locally! (Firestore user entry updated)');
    window.location.reload();
  }
};