(() => {
  const mount = document.getElementById("app");
  if (!mount) return;

  const type = mount.dataset.app;
  const config = window.APP_CONFIG || {};

  const setHTML = (html) => {
    mount.innerHTML = html;
  };

  const timerApp = () => {
    if (!config.pomodoro) {
      const totalSeconds = (config.minutes || 10) * 60;
      let remaining = totalSeconds;
      let timer = null;

      setHTML(`
        <div class="app-card" style="text-align:center; padding: 2rem;">
          <div style="font-size:3.5rem;font-weight:800;margin-bottom:1.5rem;font-variant-numeric:tabular-nums" id="timer-display">${formatTime(remaining)}</div>
          <div class="progress" style="margin-bottom:1.5rem"><span id="timer-progress"></span></div>
          <div class="control-row" style="justify-content:center; gap:1rem; margin-bottom:1rem">
            <button class="btn" id="timer-start" style="min-width:100px">Start</button>
            <button class="btn btn-ghost" id="timer-reset">Reset</button>
          </div>
          <p style="color:var(--muted);font-size:0.9rem">${config.helper || "Stay in the flow and reset when needed."}</p>
        </div>
      `);

      const display = mount.querySelector("#timer-display");
      const progress = mount.querySelector("#timer-progress");
      const startBtn = mount.querySelector("#timer-start");
      const resetBtn = mount.querySelector("#timer-reset");

      const update = () => {
        display.textContent = formatTime(remaining);
        const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
        progress.style.width = `${pct}%`;
      };

      const tick = () => {
        remaining = Math.max(0, remaining - 1);
        update();
        if (remaining === 0) {
          clearInterval(timer);
          timer = null;
          startBtn.textContent = "Restart";
        }
      };

      startBtn.addEventListener("click", () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
          startBtn.textContent = "Resume";
          return;
        }
        timer = setInterval(tick, 1000);
        startBtn.textContent = "Pause";
      });

      resetBtn.addEventListener("click", () => {
        clearInterval(timer);
        timer = null;
        remaining = totalSeconds;
        startBtn.textContent = "Start";
        update();
      });

      update();
      return;
    }

    const stateKey = "pomodoro-state";
    const intentionKey = "pomodoro-intention";
    const soundKey = "pomodoro-soundscape";
    const moodKey = "pomodoro-mood";
    const autoKey = "pomodoro-auto";
    const chimeKey = "pomodoro-chime";
    const longEveryKey = "pomodoro-long-every";
    const distractionKey = "pomodoro-distractions";
    const sessionLogKey = "pomodoro-session-log";
    const focusCountKey = "pomodoro-focus-count";
    const summaryKey = "pomodoro-summaries";
    const themeKey = "pomodoro-theme";
    const motivationKey = "pomodoro-motivation";
    const tagsKey = "pomodoro-tags";
    const taskKey = "pomodoro-tasks";
    const intensityKey = "pomodoro-sound-intensity";
    const remindKey = "pomodoro-reminders";
    const warmupKey = "pomodoro-warmup";
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const completedKey = `pomodoro-completed-${todayKey()}`;
    const saved = JSON.parse(localStorage.getItem(stateKey) || "{}");
    const modes = {
      focus: { label: "Focus", minutes: saved.focusMinutes || config.focusMinutes || config.minutes || 25 },
      short: { label: "Short Break", minutes: saved.shortMinutes || config.shortBreakMinutes || 5 },
      long: { label: "Long Break", minutes: saved.longMinutes || config.longBreakMinutes || 15 },
    };
    let currentMode = saved.mode || "focus";
    let totalSeconds = modes[currentMode].minutes * 60;
    let remaining = totalSeconds;
    let timer = null;

    setHTML(`
      <div class="pomodoro-shell">
        <div class="pomodoro-top">
          <div class="pomodoro-ring" id="pomo-ring" style="--progress:0%">
            <div class="pomodoro-time" id="timer-display">${formatTime(remaining)}</div>
            <div class="pomodoro-label" id="timer-label">${modes[currentMode].label}</div>
          </div>
          <div class="pomodoro-controls">
            <div class="control-row">
              <button class="btn" id="timer-start">Start</button>
              <button class="btn btn-ghost" id="timer-reset">Reset</button>
            </div>
            <div class="pomodoro-modes">
              <button class="mode-pill" data-mode="focus">Focus</button>
              <button class="mode-pill" data-mode="short">Short Break</button>
              <button class="mode-pill" data-mode="long">Long Break</button>
            </div>
            <div class="pomodoro-message" id="pomo-message">${config.helper || "Settle in and press Start."}</div>
          </div>
        </div>
        <div class="pomodoro-grid">
          <div class="pomodoro-card">
            <h3>Session Settings</h3>
            <div class="pomodoro-field">
              <label>Focus (min)</label>
              <input type="number" min="5" max="90" step="1" value="${modes.focus.minutes}" data-minutes="focus" />
            </div>
            <div class="pomodoro-row pomodoro-mini">
              <button class="mini-pill" data-preset="focus" data-value="15">15</button>
              <button class="mini-pill" data-preset="focus" data-value="25">25</button>
              <button class="mini-pill" data-preset="focus" data-value="50">50</button>
            </div>
            <div class="pomodoro-field">
              <label>Short Break</label>
              <input type="number" min="3" max="30" step="1" value="${modes.short.minutes}" data-minutes="short" />
            </div>
            <div class="pomodoro-row pomodoro-mini">
              <button class="mini-pill" data-preset="short" data-value="5">5</button>
              <button class="mini-pill" data-preset="short" data-value="8">8</button>
              <button class="mini-pill" data-preset="short" data-value="10">10</button>
            </div>
            <div class="pomodoro-field">
              <label>Long Break</label>
              <input type="number" min="5" max="45" step="1" value="${modes.long.minutes}" data-minutes="long" />
            </div>
            <div class="pomodoro-row pomodoro-mini">
              <button class="mini-pill" data-preset="long" data-value="15">15</button>
              <button class="mini-pill" data-preset="long" data-value="20">20</button>
              <button class="mini-pill" data-preset="long" data-value="25">25</button>
            </div>
            <div class="pomodoro-field">
              <label>Goal Sessions</label>
              <input type="number" min="1" max="12" step="1" value="${saved.goal || config.goal || 4}" id="pomo-goal" />
            </div>
          </div>
          <div class="pomodoro-card">
            <h3>Happy Boosts</h3>
            <div class="boost-grid">
              <button class="boost-btn" data-boost="Hydrate">Hydrate</button>
              <button class="boost-btn" data-boost="Stretch">Stretch</button>
              <button class="boost-btn" data-boost="Breathe">Breathe</button>
              <button class="boost-btn" data-boost="Desk Reset">Desk Reset</button>
              <button class="boost-btn" data-boost="Gratitude">Gratitude</button>
              <button class="boost-btn" data-boost="Playlist">Playlist</button>
            </div>
            <p class="pomodoro-note">Tap a boost for a tiny reset. Small wins = happy focus.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Calm Reset</h3>
            <div class="pomodoro-soft-grid">
              <div class="pomodoro-soft-tile">Soft light: dim the room for less glare.</div>
              <div class="pomodoro-soft-tile">Breath: 4 in, 4 hold, 6 out.</div>
              <div class="pomodoro-soft-tile">Sound: pick one gentle loop.</div>
              <div class="pomodoro-soft-tile">Desk: clear one small area.</div>
            </div>
          </div>
          <div class="pomodoro-card">
            <h3>Themes</h3>
            <div class="pomodoro-row pomodoro-themes">
              <button class="theme-chip" data-theme="calm">Calm</button>
              <button class="theme-chip" data-theme="energy">Energy</button>
              <button class="theme-chip" data-theme="night">Night</button>
            </div>
            <p class="pomodoro-note">Theme changes apply instantly.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Mindset</h3>
            <div class="pomodoro-field">
              <label>Focus intention</label>
              <input type="text" id="pomo-intention" placeholder="One clear task for this session" />
            </div>
            <div class="pomodoro-field">
              <label>Session tags</label>
              <div class="pomodoro-row pomodoro-tags">
                <button class="tag-chip" data-tag="deep-work">Deep Work</button>
                <button class="tag-chip" data-tag="study">Study</button>
                <button class="tag-chip" data-tag="admin">Admin</button>
                <button class="tag-chip" data-tag="creative">Creative</button>
                <button class="tag-chip" data-tag="review">Review</button>
              </div>
            </div>
            <div class="pomodoro-field">
              <label>Soundscape</label>
              <select class="pomodoro-select" id="pomo-soundscape">
                <option value="silence">Silence</option>
                <option value="rain">Soft Rain</option>
                <option value="lofi">Lo-fi Drift</option>
                <option value="brown">Brown Noise</option>
                <option value="cafe">Cafe Murmur</option>
              </select>
            </div>
            <div class="pomodoro-meter">
              <label>Sound intensity</label>
              <input type="range" id="pomo-sound-intensity" min="0" max="100" step="1" />
              <div class="pomodoro-note" id="pomo-sound-label">Intensity: 50%</div>
            </div>
            <div class="pomodoro-meter">
              <label>Energy level</label>
              <input type="range" id="pomo-mood" min="1" max="5" step="1" />
              <div class="pomodoro-note" id="pomo-mood-label">Energy: 3 / 5</div>
            </div>
            <div class="pomodoro-field">
              <label>Motivation style</label>
              <select class="pomodoro-select" id="pomo-motivation">
                <option value="gentle">Gentle</option>
                <option value="energetic">Energetic</option>
                <option value="short">Short</option>
                <option value="funny">Funny</option>
              </select>
            </div>
          </div>
          <div class="pomodoro-card">
            <h3>Automation</h3>
            <label class="pomodoro-toggle"><input type="checkbox" id="pomo-auto" /> Auto-advance sessions</label>
            <label class="pomodoro-toggle"><input type="checkbox" id="pomo-chime" /> Gentle finish cue</label>
            <label class="pomodoro-toggle"><input type="checkbox" id="pomo-reminders" /> 10-min reminders</label>
            <label class="pomodoro-toggle"><input type="checkbox" id="pomo-warmup" /> 3-sec warm-up</label>
            <div class="pomodoro-field">
              <label>Long break every</label>
              <input type="number" min="2" max="8" step="1" id="pomo-long-every" />
            </div>
            <p class="pomodoro-note">Auto-advance keeps you in the flow without extra taps.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Task List</h3>
            <div class="pomodoro-row">
              <input type="text" id="pomo-task-input" placeholder="Add a tiny task" />
              <button class="btn btn-ghost" id="pomo-task-add">Add</button>
            </div>
            <div class="pomodoro-log" id="pomo-task-list"></div>
          </div>
          <div class="pomodoro-card">
            <h3>Distraction Log</h3>
            <div class="pomodoro-row">
              <input type="text" id="pomo-distraction-input" placeholder="Note a distraction" />
              <button class="btn btn-ghost" id="pomo-distraction-add">Add</button>
            </div>
            <div class="pomodoro-log" id="pomo-distraction-list"></div>
          </div>
          <div class="pomodoro-card">
            <h3>Notebook</h3>
            <div class="pomodoro-field">
              <label>Mini journal</label>
              <textarea id="pomo-notebook" class="pomodoro-select" placeholder="Write a quick reflection or plan..."></textarea>
            </div>
            <p class="pomodoro-note">Saved automatically on every keystroke.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Mini Breaks</h3>
            <div class="pomodoro-row">
              <button class="btn btn-ghost" data-break="breath" data-seconds="60">Breathing 60s</button>
              <button class="btn btn-ghost" data-break="stretch" data-seconds="90">Stretch 90s</button>
              <button class="btn btn-ghost" data-break="eyes" data-seconds="60">Eye Rest 60s</button>
              <button class="btn btn-ghost" data-break="water" data-seconds="30">Hydrate 30s</button>
            </div>
            <div class="pomodoro-break-status" id="pomo-break-status">Pick a mini break when you need it.</div>
          </div>
          <div class="pomodoro-card">
            <h3>Focus Ritual</h3>
            <div class="ritual-list">
              <label><input type="checkbox" data-ritual="phone"> Phone on silent</label>
              <label><input type="checkbox" data-ritual="water"> Water ready</label>
              <label><input type="checkbox" data-ritual="plan"> One clear task</label>
              <label><input type="checkbox" data-ritual="posture"> Posture check</label>
              <label><input type="checkbox" data-ritual="music"> Soundscape set</label>
            </div>
          </div>
          <div class="pomodoro-card">
            <h3>Session Log</h3>
            <div class="pomodoro-log" id="pomo-session-log"></div>
            <p class="pomodoro-note">Log updates after each focus or break.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Session Summary</h3>
            <div class="pomodoro-log" id="pomo-summary-log"></div>
            <div class="pomodoro-row">
              <button class="btn btn-ghost" id="pomo-export-json">Export JSON</button>
              <button class="btn btn-ghost" id="pomo-export-csv">Export CSV</button>
            </div>
            <p class="pomodoro-note">Exports include mode, duration, intention, and energy.</p>
          </div>
          <div class="pomodoro-card">
            <h3>Insights</h3>
            <div class="pomodoro-stats">
              <div>Focus minutes today: <span id="pomo-focus-mins">0</span></div>
              <div>Focus rating: <span id="pomo-focus-rating">—</span></div>
            </div>
            <div class="pomodoro-meter">
              <label>Rate this session</label>
              <input type="range" id="pomo-rating" min="1" max="5" step="1" />
              <div class="pomodoro-note" id="pomo-rating-label">Rating: 3 / 5</div>
            </div>
          </div>
          <div class="pomodoro-card">
            <h3>Progress</h3>
            <div class="pomodoro-stats">
              <div><span id="pomo-completed">0</span> done today</div>
              <div>Goal: <span id="pomo-goal-label">${saved.goal || config.goal || 4}</span></div>
              <div>Mode: <span id="pomo-mode-label">${modes[currentMode].label}</span></div>
            </div>
            <div class="progress pomodoro-progress"><span id="timer-progress"></span></div>
            <div class="pomodoro-note">Every session counts. Celebrate the finish.</div>
          </div>
        </div>
      </div>
    `);

    const display = mount.querySelector("#timer-display");
    const progress = mount.querySelector("#timer-progress");
    const ring = mount.querySelector("#pomo-ring");
    const modeLabel = mount.querySelector("#timer-label");
    const startBtn = mount.querySelector("#timer-start");
    const resetBtn = mount.querySelector("#timer-reset");
    const messageEl = mount.querySelector("#pomo-message");
    const goalInput = mount.querySelector("#pomo-goal");
    const goalLabel = mount.querySelector("#pomo-goal-label");
    const completedEl = mount.querySelector("#pomo-completed");
    const modeLabelSmall = mount.querySelector("#pomo-mode-label");
    const intentionInput = mount.querySelector("#pomo-intention");
    const soundSelect = mount.querySelector("#pomo-soundscape");
    const soundIntensity = mount.querySelector("#pomo-sound-intensity");
    const soundLabel = mount.querySelector("#pomo-sound-label");
    const moodInput = mount.querySelector("#pomo-mood");
    const moodLabel = mount.querySelector("#pomo-mood-label");
    const motivationSelect = mount.querySelector("#pomo-motivation");
    const autoToggle = mount.querySelector("#pomo-auto");
    const chimeToggle = mount.querySelector("#pomo-chime");
    const remindToggle = mount.querySelector("#pomo-reminders");
    const warmupToggle = mount.querySelector("#pomo-warmup");
    const longEveryInput = mount.querySelector("#pomo-long-every");
    const distractionInput = mount.querySelector("#pomo-distraction-input");
    const distractionAdd = mount.querySelector("#pomo-distraction-add");
    const distractionList = mount.querySelector("#pomo-distraction-list");
    const sessionLog = mount.querySelector("#pomo-session-log");
    const notebookInput = mount.querySelector("#pomo-notebook");
    const summaryLog = mount.querySelector("#pomo-summary-log");
    const exportJson = mount.querySelector("#pomo-export-json");
    const exportCsv = mount.querySelector("#pomo-export-csv");
    const breakStatus = mount.querySelector("#pomo-break-status");
    const taskInput = mount.querySelector("#pomo-task-input");
    const taskAdd = mount.querySelector("#pomo-task-add");
    const taskList = mount.querySelector("#pomo-task-list");
    const focusMinsEl = mount.querySelector("#pomo-focus-mins");
    const focusRatingEl = mount.querySelector("#pomo-focus-rating");
    const ratingInput = mount.querySelector("#pomo-rating");
    const ratingLabel = mount.querySelector("#pomo-rating-label");

    const getCompleted = () => Number(localStorage.getItem(completedKey) || 0);
    const setCompleted = (val) => localStorage.setItem(completedKey, String(val));

    const summaries = () => JSON.parse(localStorage.getItem(summaryKey) || "[]");
    const saveSummaries = (items) => localStorage.setItem(summaryKey, JSON.stringify(items));

    const motivationLines = {
      gentle: [
        "One calm step is still progress.",
        "Keep it light. You’re doing fine.",
        "Small focus beats perfect focus.",
        "Breathe. Then continue.",
        "Soft focus is still focus.",
        "You’re doing enough right now.",
        "Slow is smooth, smooth is fast.",
        "Be kind to your attention.",
        "Return to the next tiny step.",
        "Ease back in—no rush.",
        "Quiet work is real work.",
        "Let the task be simple.",
        "Settle your shoulders and continue.",
        "Gentle effort wins the day.",
        "You can restart this moment.",
        "One page, one line, one click.",
        "Your pace is okay.",
        "Stay present with the next thing.",
        "Breathe out the noise.",
        "You’re building steadiness.",
        "It’s okay to go slower and finish.",
        "Drop the perfect, keep the progress.",
        "Return to your intention.",
        "You’re already back on track.",
        "Soft eyes, steady hands.",
        "Tiny focus is still focus.",
        "You have time for the next step.",
        "Keep it gentle, keep it moving.",
        "You’re safe to focus.",
        "Let the task unfold.",
        "Settle, then proceed.",
        "Quiet attention is powerful.",
        "Small wins add up.",
        "Stay kind, stay focused.",
        "One calm minute more.",
        "You’re allowed to be imperfect.",
        "Keep the breath steady.",
        "It’s okay to do it the easy way.",
        "Focus is a soft return.",
        "You’re doing better than you think.",
        "Let it be simple and steady.",
        "Ease into the next minute.",
        "Quiet focus is enough.",
        "Gently return to the task.",
        "Soft effort, real progress.",
        "Let your attention settle.",
        "A calm mind can finish this.",
        "Take the next small step.",
        "You can be steady here.",
        "Let go of the rush.",
        "One smooth breath, then go.",
        "You’re safe to focus now.",
        "Keep it light and moving.",
        "The next step is clear.",
        "This is a kind pace.",
        "Let the work be gentle.",
        "Your focus can be quiet.",
        "Stay soft, stay steady.",
        "Return to the present task.",
        "The goal is steady progress.",
        "You’re cultivating focus.",
        "Ease the mind, move forward.",
        "Soft eyes, steady hands.",
        "This moment is enough.",
        "One calm minute at a time.",
        "Stay with the smallest action.",
        "Your attention can rest here.",
        "You’re doing fine—continue.",
        "Keep it simple and kind.",
        "A gentle pace still wins.",
      ],
      energetic: [
        "Let’s go—one more minute.",
        "Momentum is building—keep it up.",
        "You’ve got this. Stay on it.",
        "Strong focus, strong finish.",
        "Lock in. One task.",
        "Power through this block.",
        "Push the needle forward.",
        "You’re in the zone—ride it.",
        "Stay sharp. Stay steady.",
        "Make this minute count.",
        "Finish strong—right here.",
        "Don’t let go now.",
        "Your focus is a superpower.",
        "Keep the engine warm.",
        "Bold moves, clean finish.",
        "You’re on a roll.",
        "Stay with it—no drift.",
        "Energy up. Eyes forward.",
        "You’re closer than you think.",
        "Big focus, big payoff.",
        "Own this sprint.",
        "Keep the pace alive.",
        "Bring the heat.",
        "You’re building real momentum.",
        "One more step—go.",
        "Stay fierce, stay focused.",
        "Finish this rep.",
        "You’re driving this session.",
        "Go get the win.",
        "Make the time yours.",
        "You’re a focus machine.",
        "This is your power block.",
        "Eyes on the finish.",
        "Stay intense—stay clean.",
        "Fuel the work.",
        "You’re executing well.",
        "Take control of the clock.",
        "No hesitation—just progress.",
        "You’re crushing it.",
        "Hold the line.",
        "Stay in motion.",
        "You’re powering through.",
        "Lock in and finish clean.",
        "Focus hard—finish proud.",
        "Push the work over the edge.",
        "You’re in execution mode.",
        "Keep the stride.",
        "This is your power block.",
        "Go full focus.",
        "Make this sprint count.",
        "You’re building momentum.",
        "Hit the next checkpoint.",
        "Keep the heat on.",
        "You’re dialed in.",
        "Run the play.",
        "Keep the edge sharp.",
        "You’re on the climb.",
        "Send it.",
        "Stay fast and precise.",
        "Keep the signal strong.",
        "You’re on fire—steady it.",
        "Own the next minute.",
        "Crush this segment.",
        "Eyes locked, hands moving.",
        "Don’t break the streak.",
        "Power to the finish.",
        "Keep the spark alive.",
        "You’re in control here.",
        "Drive it home.",
        "Finish with intention.",
      ],
      short: [
        "Stay on it.",
        "Keep moving.",
        "You’re close.",
        "Deep breath.",
        "One more.",
        "Keep going.",
        "Hold focus.",
        "Stay here.",
        "Keep steady.",
        "Next step.",
        "You’re good.",
        "Do it now.",
        "Keep pace.",
        "Stay sharp.",
        "Almost there.",
        "Just this.",
        "Keep calm.",
        "Stay with it.",
        "Do the thing.",
        "One minute.",
        "Focus now.",
        "Keep it up.",
        "Stay present.",
        "Still moving.",
        "You got this.",
        "Stick to it.",
        "Go again.",
        "Tiny push.",
        "Keep steady.",
        "Just continue.",
        "Hold it.",
        "Stay locked.",
        "Make progress.",
        "One task.",
        "Next line.",
        "Next click.",
        "Keep at it.",
        "Stay in it.",
        "One more minute.",
        "Don’t drift.",
        "Stay steady.",
        "Keep focus.",
        "Be here.",
        "Next action.",
        "Hold steady.",
        "Just now.",
        "Keep the line.",
        "Stay tight.",
        "Keep on.",
        "One task.",
        "Forward.",
        "Keep it.",
        "Keep going.",
        "Now.",
        "Stay.",
        "Push.",
        "One step.",
        "Keep it up.",
        "Stay with it.",
        "Keep calm.",
        "Focus.",
        "Move.",
        "Steady.",
        "Continue.",
        "One more.",
        "Hold.",
        "Keep it steady.",
        "Stick with it.",
        "Next.",
      ],
      funny: [
        "Future you says thanks.",
        "Procrastination can’t sit with us.",
        "Tiny steps, big boss energy.",
        "You vs. distractions: you win.",
        "Brb, being productive.",
        "Work now, snack later.",
        "Plot twist: you finish.",
        "This task fears your focus.",
        "You’re basically a productivity wizard.",
        "Keep going—your plants believe in you.",
        "Distractions? Never heard of them.",
        "You’re doing the thing. Wild.",
        "Focus mode: activated.",
        "Your chair is proud of you.",
        "Main character energy.",
        "You’re speedrunning this task.",
        "Behold, the human doing stuff.",
        "You’re making the clock nervous.",
        "No doomscrolling. Just glow‑scrolling.",
        "This is your villain origin story.",
        "Plot armor for your focus.",
        "Keyboard goes brr.",
        "You’re the reason the task list shrinks.",
        "Tiny victory dance later.",
        "You’re out‑productive your past self.",
        "Let’s bully the to‑do list.",
        "Distraction: denied.",
        "You’re an adult with a plan. Wow.",
        "You vs. the task: cinematic.",
        "Your future self high‑fives you.",
        "Consider this a buff.",
        "Focus is your cheat code.",
        "You’re cooking. Don’t stop.",
        "Your to‑do list is sweating.",
        "You’re doing the thing. Again. Iconic.",
        "This is the montage scene.",
        "Absolutely illegal levels of focus.",
        "Task list: in shambles.",
        "Okay productivity, we see you.",
        "You’re the hero of this spreadsheet.",
        "This task list didn’t know you existed.",
        "Your focus is allergic to chaos.",
        "You’re speed‑solving real life.",
        "Your future self is clapping.",
        "You’re the main quest now.",
        "Distractions are on mute.",
        "You’re a productivity gremlin. The good kind.",
        "You’re basically a focus ninja.",
        "This is your power montage.",
        "You’re out‑scrolling the scroll.",
        "Your to‑do list just blinked.",
        "Task list: defeated in 3…2…",
        "You’re hacking time right now.",
        "Focus mode is a vibe.",
        "You’re the reason deadlines get met.",
        "You’re on a productivity streak.",
        "Your mouse is proud of you.",
        "The task list is trembling.",
        "You’re the plot twist.",
        "Work done? Incredible arc.",
        "You’re a chaos‑tamer.",
        "You’re the boss of this tab.",
        "Your focus has theme music.",
        "You’re making the timer blush.",
        "This is your glow‑up phase.",
        "You just chose effort. Legendary.",
        "Distraction left on read.",
        "You’re speed‑cleaning this to‑do.",
        "The task list fears you.",
      ],
    };

    const pickMotivation = (style) => {
      const list = motivationLines[style] || motivationLines.gentle;
      return list[Math.floor(Math.random() * list.length)];
    };

    const updateMotivation = (styleOverride) => {
      const style = styleOverride || motivationSelect?.value || "gentle";
      messageEl.textContent = pickMotivation(style);
    };

    const update = () => {
      display.textContent = formatTime(remaining);
      const pct = ((totalSeconds - remaining) / totalSeconds) * 100;
      progress.style.width = `${pct}%`;
      ring.style.setProperty("--progress", `${pct}%`);
    };

    const startTimer = () => {
      if (timer) return;
      const warmup = warmupToggle?.checked;
      if (warmup) {
        let countdown = 3;
        startBtn.textContent = "Ready…";
        messageEl.textContent = `Starting in ${countdown}…`;
        const warm = setInterval(() => {
          countdown -= 1;
          if (countdown <= 0) {
            clearInterval(warm);
            timer = setInterval(tick, 1000);
            startBtn.textContent = "Pause";
            messageEl.textContent = pickMotivation(motivationSelect?.value || "gentle");
            return;
          }
          messageEl.textContent = `Starting in ${countdown}…`;
        }, 1000);
        return;
      }
      timer = setInterval(tick, 1000);
      startBtn.textContent = "Pause";
    };

    const setMode = (mode) => {
      currentMode = mode;
      totalSeconds = modes[mode].minutes * 60;
      remaining = totalSeconds;
      modeLabel.textContent = modes[mode].label;
      modeLabelSmall.textContent = modes[mode].label;
      messageEl.textContent = mode === "focus" ? "Deep focus starts now." : "Let your brain recover.";
      mount.querySelectorAll(".mode-pill").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.mode === mode);
      });
      clearInterval(timer);
      timer = null;
      startBtn.textContent = "Start";
      update();
      localStorage.setItem(stateKey, JSON.stringify({
        mode: currentMode,
        focusMinutes: modes.focus.minutes,
        shortMinutes: modes.short.minutes,
        longMinutes: modes.long.minutes,
        goal: Number(goalInput.value || 4),
      }));
    };

    const tick = () => {
      remaining = Math.max(0, remaining - 1);
      update();
      if (remaining % 300 === 0 && remaining !== 0) {
        updateMotivation();
      }
      if (remindToggle?.checked && remaining % 600 === 0 && remaining !== 0) {
        messageEl.textContent = "Gentle reminder: stay with the next action.";
      }
      if (remaining === 0) {
        clearInterval(timer);
        timer = null;
        startBtn.textContent = "Restart";
        const log = JSON.parse(localStorage.getItem(sessionLogKey) || "[]");
        log.unshift(`${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${modes[currentMode].label} complete`);
        localStorage.setItem(sessionLogKey, JSON.stringify(log.slice(0, 10)));
        renderSessionLog();
        const summaryItems = summaries();
        summaryItems.unshift({
          time: new Date().toISOString(),
          mode: modes[currentMode].label,
          minutes: Math.round(totalSeconds / 60),
          intention: intentionInput?.value || "",
          energy: moodInput?.value || "",
          tags: JSON.parse(localStorage.getItem(tagsKey) || "[]"),
          rating: ratingInput?.value || "",
        });
        saveSummaries(summaryItems.slice(0, 20));
        renderSummaries();
        if (currentMode === "focus") {
          const completed = getCompleted() + 1;
          setCompleted(completed);
          completedEl.textContent = completed;
          messageEl.textContent = "Nice work. Take a break you earned.";
          const focusCount = Number(localStorage.getItem(focusCountKey) || 0) + 1;
          localStorage.setItem(focusCountKey, String(focusCount));
          if (autoToggle.checked) {
            const longEvery = Math.max(2, Number(longEveryInput.value || 4));
            const nextMode = focusCount % longEvery === 0 ? "long" : "short";
            setMode(nextMode);
            startTimer();
          }
        } else {
          messageEl.textContent = "Break complete. Ready for the next focus?";
          if (autoToggle.checked) {
            setMode("focus");
            startTimer();
          }
        }
      }
    };

    startBtn.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        startBtn.textContent = "Resume";
        messageEl.textContent = "Paused. Breathe and continue when ready.";
        return;
      }
      startTimer();
      updateMotivation();
    });

    resetBtn.addEventListener("click", () => {
      clearInterval(timer);
      timer = null;
      remaining = totalSeconds;
      startBtn.textContent = "Start";
      messageEl.textContent = "Reset complete. Fresh start.";
      update();
    });

    mount.querySelectorAll(".mode-pill").forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.dataset.mode));
    });

    mount.querySelectorAll("[data-minutes]").forEach((input) => {
      input.addEventListener("change", () => {
        const val = Math.max(1, Number(input.value || 1));
        const key = input.dataset.minutes;
        modes[key].minutes = val;
        if (currentMode === key) {
          totalSeconds = val * 60;
          remaining = totalSeconds;
          update();
        }
        localStorage.setItem(stateKey, JSON.stringify({
          mode: currentMode,
          focusMinutes: modes.focus.minutes,
          shortMinutes: modes.short.minutes,
          longMinutes: modes.long.minutes,
          goal: Number(goalInput.value || 4),
        }));
      });
    });

    mount.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.preset;
        const value = Number(btn.dataset.value || 1);
        modes[key].minutes = value;
        mount.querySelector(`[data-minutes="${key}"]`).value = value;
        if (currentMode === key) {
          totalSeconds = value * 60;
          remaining = totalSeconds;
          update();
        }
        localStorage.setItem(stateKey, JSON.stringify({
          mode: currentMode,
          focusMinutes: modes.focus.minutes,
          shortMinutes: modes.short.minutes,
          longMinutes: modes.long.minutes,
          goal: Number(goalInput.value || 4),
        }));
      });
    });

    goalInput.addEventListener("change", () => {
      goalLabel.textContent = goalInput.value || 4;
      localStorage.setItem(stateKey, JSON.stringify({
        mode: currentMode,
        focusMinutes: modes.focus.minutes,
        shortMinutes: modes.short.minutes,
        longMinutes: modes.long.minutes,
        goal: Number(goalInput.value || 4),
      }));
    });

    const renderSessionLog = () => {
      const items = JSON.parse(localStorage.getItem(sessionLogKey) || "[]");
      sessionLog.innerHTML = items.length
        ? items.map((item) => `<div class="pomodoro-log-item">${item}</div>`).join("")
        : `<div class="pomodoro-log-item">No sessions logged yet.</div>`;
    };

    const renderSummaries = () => {
      const items = summaries();
      summaryLog.innerHTML = items.length
        ? items.map((item) => {
            const when = new Date(item.time).toLocaleString();
            const intention = item.intention ? ` · ${item.intention}` : "";
            const energy = item.energy ? ` · Energy ${item.energy}/5` : "";
            const tags = item.tags && item.tags.length ? ` · ${item.tags.join(", ")}` : "";
            const rating = item.rating ? ` · Rating ${item.rating}/5` : "";
            return `<div class="pomodoro-log-item">${when} · ${item.mode} ${item.minutes}m${intention}${energy}${tags}${rating}</div>`;
          }).join("")
        : `<div class="pomodoro-log-item">No summaries yet.</div>`;
    };

    const downloadFile = (filename, content) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    exportJson?.addEventListener("click", () => {
      downloadFile("pomodoro-summaries.json", JSON.stringify(summaries(), null, 2));
    });

    exportCsv?.addEventListener("click", () => {
      const rows = [["time", "mode", "minutes", "intention", "energy", "tags", "rating"]];
      summaries().forEach((item) => {
        rows.push([item.time, item.mode, item.minutes, item.intention, item.energy, (item.tags || []).join("|"), item.rating || ""]);
      });
      const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/\"/g, '""')}"`).join(",")).join("\n");
      downloadFile("pomodoro-summaries.csv", csv);
    });

    const applyTheme = (theme) => {
      document.body.classList.remove("pomodoro-theme-calm", "pomodoro-theme-energy", "pomodoro-theme-night");
      document.body.classList.add(`pomodoro-theme-${theme}`);
      localStorage.setItem(themeKey, theme);
      mount.querySelectorAll(".theme-chip").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.theme === theme);
      });
    };

    mount.querySelectorAll(".theme-chip").forEach((btn) => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
    });

    const breakTimers = {};
    const startBreak = (label, seconds) => {
      if (breakTimers.active) clearInterval(breakTimers.active);
      let remainingBreak = seconds;
      breakStatus.textContent = `${label} · ${formatTime(remainingBreak)}`;
      breakTimers.active = setInterval(() => {
        remainingBreak -= 1;
        if (remainingBreak <= 0) {
          clearInterval(breakTimers.active);
          breakTimers.active = null;
          breakStatus.textContent = `${label} complete.`;
          return;
        }
        breakStatus.textContent = `${label} · ${formatTime(remainingBreak)}`;
      }, 1000);
    };

    mount.querySelectorAll("[data-break]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const label = btn.textContent.trim();
        const seconds = Number(btn.dataset.seconds || 60);
        startBreak(label, seconds);
      });
    });

    const renderDistractions = () => {
      const items = JSON.parse(localStorage.getItem(distractionKey) || "[]");
      distractionList.innerHTML = items.length
        ? items.map((item) => `<div class="pomodoro-log-item">${item}</div>`).join("")
        : `<div class="pomodoro-log-item">Nothing logged. Stay in the flow.</div>`;
    };

    const renderTasks = () => {
      const items = JSON.parse(localStorage.getItem(taskKey) || "[]");
      taskList.innerHTML = items.length
        ? items.map((item, index) => `
            <div class="pomodoro-log-item">
              <label class="pomodoro-toggle">
                <input type="checkbox" data-task="${index}" ${item.done ? "checked" : ""}/>
                ${item.text}
              </label>
            </div>
          `).join("")
        : `<div class="pomodoro-log-item">No tasks yet. Add one tiny task.</div>`;

      taskList.querySelectorAll("[data-task]").forEach((box) => {
        box.addEventListener("change", () => {
          const idx = Number(box.dataset.task);
          const next = JSON.parse(localStorage.getItem(taskKey) || "[]");
          next[idx].done = box.checked;
          localStorage.setItem(taskKey, JSON.stringify(next));
        });
      });
    };

    distractionAdd.addEventListener("click", () => {
      const value = distractionInput.value.trim();
      if (!value) return;
      const items = JSON.parse(localStorage.getItem(distractionKey) || "[]");
      items.unshift(value);
      localStorage.setItem(distractionKey, JSON.stringify(items.slice(0, 8)));
      distractionInput.value = "";
      renderDistractions();
    });

    intentionInput.value = localStorage.getItem(intentionKey) || "";
    intentionInput.addEventListener("input", () => {
      localStorage.setItem(intentionKey, intentionInput.value);
    });

    soundSelect.value = localStorage.getItem(soundKey) || "silence";
    soundSelect.addEventListener("change", () => {
      localStorage.setItem(soundKey, soundSelect.value);
      messageEl.textContent = `Soundscape set to ${soundSelect.options[soundSelect.selectedIndex].text}.`;
    });

    soundIntensity.value = localStorage.getItem(intensityKey) || "50";
    soundLabel.textContent = `Intensity: ${soundIntensity.value}%`;
    soundIntensity.addEventListener("input", () => {
      soundLabel.textContent = `Intensity: ${soundIntensity.value}%`;
      localStorage.setItem(intensityKey, soundIntensity.value);
    });

    moodInput.value = localStorage.getItem(moodKey) || "3";
    moodLabel.textContent = `Energy: ${moodInput.value} / 5`;
    moodInput.addEventListener("input", () => {
      moodLabel.textContent = `Energy: ${moodInput.value} / 5`;
      localStorage.setItem(moodKey, moodInput.value);
    });

    autoToggle.checked = localStorage.getItem(autoKey) === "true";
    chimeToggle.checked = localStorage.getItem(chimeKey) === "true";
    remindToggle.checked = localStorage.getItem(remindKey) === "true";
    warmupToggle.checked = localStorage.getItem(warmupKey) === "true";
    longEveryInput.value = localStorage.getItem(longEveryKey) || "4";
    autoToggle.addEventListener("change", () => localStorage.setItem(autoKey, String(autoToggle.checked)));
    chimeToggle.addEventListener("change", () => localStorage.setItem(chimeKey, String(chimeToggle.checked)));
    remindToggle.addEventListener("change", () => localStorage.setItem(remindKey, String(remindToggle.checked)));
    warmupToggle.addEventListener("change", () => localStorage.setItem(warmupKey, String(warmupToggle.checked)));
    longEveryInput.addEventListener("change", () => {
      const value = Math.max(2, Number(longEveryInput.value || 4));
      longEveryInput.value = value;
      localStorage.setItem(longEveryKey, String(value));
    });

    const storedTags = JSON.parse(localStorage.getItem(tagsKey) || "[]");
    mount.querySelectorAll(".tag-chip").forEach((btn) => {
      btn.classList.toggle("is-active", storedTags.includes(btn.dataset.tag));
      btn.addEventListener("click", () => {
        const next = new Set(JSON.parse(localStorage.getItem(tagsKey) || "[]"));
        if (next.has(btn.dataset.tag)) {
          next.delete(btn.dataset.tag);
        } else {
          next.add(btn.dataset.tag);
        }
        const arr = Array.from(next);
        localStorage.setItem(tagsKey, JSON.stringify(arr));
        btn.classList.toggle("is-active");
      });
    });

    mount.querySelectorAll(".boost-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        messageEl.textContent = `${btn.dataset.boost} boost: a small reset for a happier session.`;
        btn.classList.add("is-active");
        setTimeout(() => btn.classList.remove("is-active"), 800);
      });
    });

    const ritualKey = "pomodoro-ritual";
    const notebookKey = "pomodoro-notebook";
    const ritualState = JSON.parse(localStorage.getItem(ritualKey) || "{}");
    mount.querySelectorAll("[data-ritual]").forEach((box) => {
      box.checked = !!ritualState[box.dataset.ritual];
      box.addEventListener("change", () => {
        ritualState[box.dataset.ritual] = box.checked;
        localStorage.setItem(ritualKey, JSON.stringify(ritualState));
      });
    });

    completedEl.textContent = getCompleted();
    renderDistractions();
    renderTasks();
    renderSessionLog();
    renderSummaries();
    focusMinsEl.textContent = String(summaries().filter((item) => {
      const date = new Date(item.time).toISOString().slice(0, 10);
      return date === new Date().toISOString().slice(0, 10) && item.mode === "Focus";
    }).reduce((sum, item) => sum + (item.minutes || 0), 0));
    ratingInput.value = "3";
    ratingLabel.textContent = "Rating: 3 / 5";
    ratingInput.addEventListener("input", () => {
      ratingLabel.textContent = `Rating: ${ratingInput.value} / 5`;
      focusRatingEl.textContent = ratingInput.value;
    });
    focusRatingEl.textContent = "—";
    applyTheme(localStorage.getItem(themeKey) || "calm");
    if (notebookInput) {
      notebookInput.value = localStorage.getItem(notebookKey) || "";
      notebookInput.addEventListener("input", () => {
        localStorage.setItem(notebookKey, notebookInput.value);
      });
    }
    taskAdd?.addEventListener("click", () => {
      const value = taskInput.value.trim();
      if (!value) return;
      const items = JSON.parse(localStorage.getItem(taskKey) || "[]");
      items.unshift({ text: value, done: false });
      localStorage.setItem(taskKey, JSON.stringify(items.slice(0, 8)));
      taskInput.value = "";
      renderTasks();
    });
    setMode(currentMode);
  };

  const journalApp = () => {
    const entriesKey = "journal-entries";
    const currentKey = "journal-current";
    const legacyKey = "journal-notebook";

    const loadEntries = () => JSON.parse(localStorage.getItem(entriesKey) || "[]");
    const saveEntries = (items) => localStorage.setItem(entriesKey, JSON.stringify(items));
    const createEntry = (overrides = {}) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      title: overrides.title || "Untitled",
      text: overrides.text || "",
      mood: overrides.mood || "neutral",
      tags: overrides.tags || [],
      createdAt: overrides.createdAt || new Date().toISOString(),
      updatedAt: overrides.updatedAt || new Date().toISOString(),
    });

    let entries = loadEntries();
    if (!entries.length) {
      const legacyText = localStorage.getItem(legacyKey) || "";
      entries = [createEntry({ title: "First entry", text: legacyText })];
      saveEntries(entries);
      localStorage.removeItem(legacyKey);
    }

    setHTML(`
      <div class="journal-shell">
        <div class="journal-sidebar">
          <div class="journal-toolbar">
            <button class="btn btn-ghost" id="journal-new">New</button>
            <button class="btn btn-ghost" id="journal-duplicate">Duplicate</button>
            <button class="btn btn-ghost" id="journal-delete">Delete</button>
          </div>
          <input type="text" id="journal-search" class="journal-input" placeholder="Search entries" />
          <div id="journal-list" class="journal-list"></div>
          <div class="journal-footer" id="journal-count"></div>
        </div>
        <div class="journal-editor">
          <div class="journal-header">
            <input type="text" id="journal-title" class="journal-title" placeholder="Entry title" />
            <div class="journal-meta">
              <select id="journal-mood" class="journal-select">
                <option value="calm">Calm</option>
                <option value="focused">Focused</option>
                <option value="neutral">Neutral</option>
                <option value="energized">Energized</option>
                <option value="tired">Tired</option>
              </select>
              <input type="text" id="journal-tags" class="journal-input" placeholder="Tags (comma separated)" />
            </div>
          </div>
          <textarea id="journal-text" class="journal-text" placeholder="Write your thoughts here..."></textarea>
          <div class="journal-status">
            <span id="journal-status"></span>
            <span id="journal-stats"></span>
          </div>
          <div class="journal-actions">
            <button class="btn btn-ghost" id="journal-export-txt">Export TXT</button>
            <button class="btn btn-ghost" id="journal-export-json">Export JSON</button>
            <button class="btn btn-ghost" id="journal-export-csv">Export CSV</button>
            <label class="btn btn-ghost" style="cursor:pointer">
              Import
              <input type="file" id="journal-import" accept=".txt,.json" style="display:none" />
            </label>
            <button class="btn btn-ghost" id="journal-share">Share</button>
          </div>
        </div>
      </div>
    `);

    const listEl = mount.querySelector("#journal-list");
    const countEl = mount.querySelector("#journal-count");
    const titleEl = mount.querySelector("#journal-title");
    const moodEl = mount.querySelector("#journal-mood");
    const tagsEl = mount.querySelector("#journal-tags");
    const textEl = mount.querySelector("#journal-text");
    const statusEl = mount.querySelector("#journal-status");
    const statsEl = mount.querySelector("#journal-stats");
    const searchEl = mount.querySelector("#journal-search");
    const newBtn = mount.querySelector("#journal-new");
    const dupBtn = mount.querySelector("#journal-duplicate");
    const delBtn = mount.querySelector("#journal-delete");
    const exportTxt = mount.querySelector("#journal-export-txt");
    const exportJson = mount.querySelector("#journal-export-json");
    const exportCsv = mount.querySelector("#journal-export-csv");
    const shareBtn = mount.querySelector("#journal-share");
    const importInput = mount.querySelector("#journal-import");

    const downloadFile = (filename, content) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    };

    const formatEntry = (entry) => ({
      ...entry,
      updatedAt: new Date().toISOString(),
      tags: entry.tags || [],
    });

    let currentId = localStorage.getItem(currentKey) || entries[0].id;

    const getCurrent = () => entries.find((entry) => entry.id === currentId) || entries[0];

    const updateStatus = (entry) => {
      statusEl.textContent = `Last saved: ${new Date(entry.updatedAt).toLocaleString()}`;
      const words = entry.text.trim() ? entry.text.trim().split(/\s+/).length : 0;
      statsEl.textContent = `${words} words · ${entry.text.length} chars`;
    };

    const renderList = () => {
      const query = searchEl.value.trim().toLowerCase();
      const items = entries.filter((entry) => {
        if (!query) return true;
        return `${entry.title} ${entry.text} ${entry.tags.join(" ")}`.toLowerCase().includes(query);
      });
      listEl.innerHTML = items.map((entry) => `
        <button class="journal-item ${entry.id === currentId ? "is-active" : ""}" data-id="${entry.id}">
          <div class="journal-item-title">${entry.title || "Untitled"}</div>
          <div class="journal-item-meta">${new Date(entry.updatedAt).toLocaleDateString()}</div>
        </button>
      `).join("");
      countEl.textContent = `${items.length} entries`;
      listEl.querySelectorAll("[data-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentId = btn.dataset.id;
          localStorage.setItem(currentKey, currentId);
          renderEditor();
          renderList();
        });
      });
    };

    const renderEditor = () => {
      const entry = getCurrent();
      currentId = entry.id;
      titleEl.value = entry.title;
      moodEl.value = entry.mood || "neutral";
      tagsEl.value = (entry.tags || []).join(", ");
      textEl.value = entry.text;
      updateStatus(entry);
    };

    const saveCurrent = () => {
      const entry = getCurrent();
      entry.title = titleEl.value.trim() || "Untitled";
      entry.mood = moodEl.value;
      entry.tags = tagsEl.value.split(",").map((tag) => tag.trim()).filter(Boolean);
      entry.text = textEl.value;
      const updated = formatEntry(entry);
      entries = entries.map((item) => (item.id === entry.id ? updated : item));
      saveEntries(entries);
      updateStatus(updated);
      renderList();
    };

    titleEl.addEventListener("input", saveCurrent);
    moodEl.addEventListener("change", saveCurrent);
    tagsEl.addEventListener("input", saveCurrent);
    textEl.addEventListener("input", saveCurrent);
    searchEl.addEventListener("input", renderList);

    newBtn.addEventListener("click", () => {
      const entry = createEntry({ title: "New entry" });
      entries.unshift(entry);
      saveEntries(entries);
      currentId = entry.id;
      localStorage.setItem(currentKey, currentId);
      renderEditor();
      renderList();
      textEl.focus();
    });

    dupBtn.addEventListener("click", () => {
      const entry = getCurrent();
      const copy = createEntry({
        title: `${entry.title} (Copy)`,
        text: entry.text,
        mood: entry.mood,
        tags: entry.tags,
      });
      entries.unshift(copy);
      saveEntries(entries);
      currentId = copy.id;
      localStorage.setItem(currentKey, currentId);
      renderEditor();
      renderList();
    });

    delBtn.addEventListener("click", () => {
      if (entries.length <= 1) return;
      entries = entries.filter((entry) => entry.id !== currentId);
      saveEntries(entries);
      currentId = entries[0].id;
      localStorage.setItem(currentKey, currentId);
      renderEditor();
      renderList();
    });

    exportTxt.addEventListener("click", () => {
      const entry = getCurrent();
      downloadFile(`${entry.title || "journal"}.txt`, entry.text);
    });

    exportJson.addEventListener("click", () => {
      downloadFile("journal-entries.json", JSON.stringify(entries, null, 2));
    });

    exportCsv.addEventListener("click", () => {
      const rows = [["id", "title", "mood", "tags", "createdAt", "updatedAt", "text"]];
      entries.forEach((entry) => {
        rows.push([
          entry.id,
          entry.title,
          entry.mood,
          (entry.tags || []).join("|"),
          entry.createdAt,
          entry.updatedAt,
          entry.text,
        ]);
      });
      const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/\"/g, '""')}"`).join(",")).join("\n");
      downloadFile("journal-entries.csv", csv);
    });

    shareBtn.addEventListener("click", async () => {
      const entry = getCurrent();
      const text = entry.text.trim();
      if (!text) return;
      try {
        if (navigator.share) {
          await navigator.share({ title: entry.title || "Journal", text });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          statusEl.textContent = "Copied to clipboard for sharing.";
        } else {
          statusEl.textContent = "Sharing not supported here.";
        }
      } catch (err) {
        statusEl.textContent = "Share cancelled.";
      }
    });

    importInput.addEventListener("change", async () => {
      const file = importInput.files?.[0];
      if (!file) return;
      const content = await file.text();
      let imported = [];
      if (file.name.endsWith(".json")) {
        try {
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            imported = data;
          } else if (data && data.text) {
            imported = [createEntry({ title: data.title || "Imported entry", text: data.text })];
          }
        } catch (err) {
          imported = [createEntry({ title: "Imported entry", text: content })];
        }
      } else {
        imported = [createEntry({ title: file.name.replace(/\.[^/.]+$/, "") || "Imported entry", text: content })];
      }
      if (imported.length) {
        entries = [...imported.map((entry) => createEntry(entry)), ...entries];
        saveEntries(entries);
        currentId = entries[0].id;
        localStorage.setItem(currentKey, currentId);
        renderEditor();
        renderList();
      }
    });

    renderEditor();
    renderList();
  };

  const quizApp = () => {
    const questions = config.questions || [];
    let index = 0;
    let score = 0;

    setHTML(`
      <div class="app-card" style="padding:1.5rem">
        <div class="control-row" style="justify-content:space-between;margin-bottom:1rem;color:var(--muted);font-size:0.9rem">
          <div id="quiz-status">Question 1 / ${questions.length}</div>
          <div id="quiz-score">Score: 0</div>
        </div>
        <div id="quiz-question" style="font-size:1.3rem;font-weight:600;margin-bottom:1.5rem;line-height:1.4"></div>
        <div id="quiz-options" style="display:grid;gap:0.75rem;margin-bottom:1.5rem"></div>
        <div style="text-align:right">
          <button class="btn btn-ghost" id="quiz-next">Next Question &rarr;</button>
        </div>
      </div>
    `);

    const status = mount.querySelector("#quiz-status");
    const scoreEl = mount.querySelector("#quiz-score");
    const questionEl = mount.querySelector("#quiz-question");
    const optionsEl = mount.querySelector("#quiz-options");
    const nextBtn = mount.querySelector("#quiz-next");

    let answered = false;

    const render = () => {
      const q = questions[index];
      status.textContent = `Question ${index + 1} / ${questions.length}`;
      questionEl.textContent = q.prompt;
      optionsEl.innerHTML = "";
      answered = false;

      q.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "btn btn-ghost"; 
        btn.style.justifyContent = "flex-start";
        btn.style.textAlign = "left";
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          if (opt === q.answer) {
            score += 1;
            btn.style.borderColor = "#22c55e";
          } else {
            btn.style.borderColor = "#f97316";
          }
          scoreEl.textContent = `Score: ${score}`;
        });
        optionsEl.appendChild(btn);
      });
    };

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % questions.length;
      render();
    });

    render();
  };

  const flashcardApp = () => {
    const cards = config.cards || [];
    let index = 0;
    let flipped = false;

    setHTML(`
      <div class="control-row" style="justify-content:space-between;margin-bottom:1rem;color:var(--muted)">
        <div id="card-index">Card 1 / ${cards.length}</div>
        <button class="btn btn-ghost" id="card-next" style="font-size:0.9rem">Next &rarr;</button>
      </div>
      <div id="card-face" class="app-card" style="min-height:200px;display:grid;place-items:center;font-size:1.5rem;text-align:center;margin-bottom:1.5rem;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.05);transition:transform 0.2s"></div>
      <div style="text-align:center">
        <button class="btn" id="card-flip" style="min-width:120px">Flip Card</button>
      </div>
    `);

    const indexEl = mount.querySelector("#card-index");
    const face = mount.querySelector("#card-face");
    const nextBtn = mount.querySelector("#card-next");
    const flipBtn = mount.querySelector("#card-flip");

    const render = () => {
      const card = cards[index];
      indexEl.textContent = `Card ${index + 1} / ${cards.length}`;
      face.textContent = flipped ? card.back : card.front;
    };

    flipBtn.addEventListener("click", () => {
      flipped = !flipped;
      face.style.transform = "scale(0.98)";
      setTimeout(() => face.style.transform = "scale(1)", 100);
      render();
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % cards.length;
      flipped = false;
      render();
    });

    render();
  };

  const scrambleApp = () => {
    const words = config.words || [];
    let current = "";

    setHTML(`
      <div class="app-card" style="text-align:center;padding:2rem">
        <div style="font-size:2.5rem;font-weight:800;letter-spacing:0.2em;margin-bottom:1.5rem;text-transform:uppercase" id="scramble-word"></div>
        <div class="control-row" style="justify-content:center;gap:0.5rem;margin-bottom:1rem">
          <input class="input" id="scramble-input" placeholder="Type the word" style="max-width:200px;text-align:center" />
          <button class="btn" id="scramble-check">Check</button>
        </div>
        <div id="scramble-feedback" style="height:1.5rem;color:var(--muted);margin-bottom:1rem"></div>
        <button class="btn btn-ghost" id="scramble-next">New Word</button>
      </div>
    `);

    const wordEl = mount.querySelector("#scramble-word");
    const input = mount.querySelector("#scramble-input");
    const feedback = mount.querySelector("#scramble-feedback");

    const pickWord = () => {
      current = words[Math.floor(Math.random() * words.length)];
      wordEl.textContent = shuffle(current);
      input.value = "";
      feedback.textContent = "";
    };

    mount.querySelector("#scramble-check").addEventListener("click", () => {
      const guess = input.value.trim().toLowerCase();
      if (!guess) return;
      feedback.textContent = guess === current ? "Correct!" : `Close — the word was ${current}.`;
    });

    mount.querySelector("#scramble-next").addEventListener("click", pickWord);

    pickWord();
  };

  const typingApp = () => {
    const promptText = config.prompt || "Stay focused and type this line smoothly.";
    let startTime = null;

    setHTML(`
      <div class="app-card" style="font-size:1.1rem;line-height:1.6;margin-bottom:1rem;padding:1.5rem;background:var(--bg-subtle)" id="typing-prompt">${promptText}</div>
      <textarea class="input" id="typing-input" rows="4" placeholder="Start typing here..." style="font-family:monospace;margin-bottom:1rem"></textarea>
      <div class="control-row" style="justify-content:space-between;font-size:0.9rem;color:var(--muted)">
        <div id="typing-wpm">WPM: 0</div>
        <div id="typing-acc">Accuracy: 100%</div>
      </div>
    `);

    const input = mount.querySelector("#typing-input");
    const wpmEl = mount.querySelector("#typing-wpm");
    const accEl = mount.querySelector("#typing-acc");

    input.addEventListener("input", () => {
      if (!startTime) startTime = Date.now();
      const elapsed = (Date.now() - startTime) / 60000;
      const text = input.value;
      const words = text.length / 5;
      const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
      const accuracy = calcAccuracy(promptText, text);
      wpmEl.textContent = `WPM: ${wpm}`;
      accEl.textContent = `Accuracy: ${accuracy}%`;
    });
  };

  const converterApp = () => {
    const units = config.units || { m: 1, km: 1000, cm: 0.01 };
    const keys = Object.keys(units);

    setHTML(`
      <div class="app-card" style="padding:2rem;text-align:center">
        <div class="control-row" style="justify-content:center;gap:0.5rem;margin-bottom:2rem">
          <input class="input" id="conv-input" value="1" type="number" style="width:100px" />
          <select id="conv-from" class="input" style="width:auto"></select>
          <span style="opacity:0.5;padding:0 0.5rem">to</span>
          <select id="conv-to" class="input" style="width:auto"></select>
        </div>
        <div style="font-size:2.5rem;font-weight:800;color:var(--accent)" id="conv-output"></div>
      </div>
    `);

    const from = mount.querySelector("#conv-from");
    const to = mount.querySelector("#conv-to");
    const input = mount.querySelector("#conv-input");
    const output = mount.querySelector("#conv-output");

    keys.forEach((k) => {
      const opt1 = document.createElement("option");
      opt1.value = k;
      opt1.textContent = k;
      from.appendChild(opt1);
      const opt2 = document.createElement("option");
      opt2.value = k;
      opt2.textContent = k;
      to.appendChild(opt2);
    });

    const savedFrom = localStorage.getItem("conv-from");
    const savedTo = localStorage.getItem("conv-to");
    if (savedFrom && keys.includes(savedFrom)) from.value = savedFrom;
    else from.value = keys[0];
    if (savedTo && keys.includes(savedTo)) to.value = savedTo;
    else to.value = keys[1] || keys[0];

    const update = () => {
      localStorage.setItem("conv-from", from.value);
      localStorage.setItem("conv-to", to.value);
      const base = parseFloat(input.value || "0") * units[from.value];
      const result = base / units[to.value];
      output.textContent = `${result.toFixed(4)} ${to.value}`;
    };

    input.addEventListener("input", update);
    from.addEventListener("change", update);
    to.addEventListener("change", update);
    update();
  };

  const colorMixerApp = () => {
    setHTML(`
      <div class="control-row">
        <label>R <input type="range" min="0" max="255" value="120" id="col-r" /></label>
        <label>G <input type="range" min="0" max="255" value="120" id="col-g" /></label>
        <label>B <input type="range" min="0" max="255" value="200" id="col-b" /></label>
      </div>
      <div class="app-card" id="col-preview" style="height:160px"></div>
    `);

    const r = mount.querySelector("#col-r");
    const g = mount.querySelector("#col-g");
    const b = mount.querySelector("#col-b");
    const preview = mount.querySelector("#col-preview");

    const update = () => {
      const color = `rgb(${r.value}, ${g.value}, ${b.value})`;
      preview.style.background = color;
      preview.textContent = color;
      preview.style.display = "grid";
      preview.style.placeItems = "center";
    };

    [r, g, b].forEach((el) => el.addEventListener("input", update));
    update();
  };

  const orbitApp = () => {
    setHTML(`
      <canvas class="canvas-panel" width="700" height="420" id="orbit-canvas"></canvas>
      <div class="control-row">
        <label>Radius <input type="range" min="60" max="220" value="140" id="orbit-radius" /></label>
        <label>Speed <input type="range" min="0.2" max="2" step="0.1" value="1" id="orbit-speed" /></label>
      </div>
    `);

    const canvas = mount.querySelector("#orbit-canvas");
    const ctx = canvas.getContext("2d");
    const radiusInput = mount.querySelector("#orbit-radius");
    const speedInput = mount.querySelector("#orbit-speed");
    let angle = 0;

    const draw = () => {
      const radius = parseFloat(radiusInput.value);
      const speed = parseFloat(speedInput.value);
      angle += 0.01 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(56,189,248,0.35)";
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "#f59e0b";
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.fillStyle = "#38bdf8";
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      requestAnimationFrame(draw);
    };

    draw();
  };

  const particlesApp = () => {
    setHTML(`
      <canvas class="canvas-panel" width="700" height="420" id="particle-canvas"></canvas>
      <div class="control-row">
        <label>Gravity <input type="range" min="-0.1" max="0.4" step="0.01" value="0.06" id="particle-gravity" /></label>
        <button class="btn btn-ghost" id="particle-clear">Clear</button>
      </div>
    `);

    const canvas = mount.querySelector("#particle-canvas");
    const ctx = canvas.getContext("2d");
    const gravityInput = mount.querySelector("#particle-gravity");
    const particles = [];

    const spawn = (x, y) => {
      for (let i = 0; i < 8; i += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 120,
        });
      }
    };

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      spawn(event.clientX - rect.left, event.clientY - rect.top);
    });

    mount.querySelector("#particle-clear").addEventListener("click", () => {
      particles.length = 0;
    });

    const draw = () => {
      ctx.fillStyle = "rgba(6, 10, 20, 0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const gravity = parseFloat(gravityInput.value);
      particles.forEach((p) => {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.fillStyle = `hsla(${200 + p.life}, 80%, 65%, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        if (particles[i].life <= 0) particles.splice(i, 1);
      }
      requestAnimationFrame(draw);
    };

    draw();
  };

  const sortingApp = () => {
    const values = Array.from({ length: 12 }, () => Math.floor(20 + Math.random() * 80));
    let i = 0;
    let j = 0;

    setHTML(`
      <div class="app-card" style="height:240px;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:1rem;margin-bottom:1rem" id="bar-row"></div>
      <div class="control-row" style="justify-content:center;gap:1rem">
        <button class="btn" id="sort-step" style="min-width:100px">Step</button>
        <button class="btn btn-ghost" id="sort-shuffle">Shuffle</button>
      </div>
    `);

    const row = mount.querySelector("#bar-row");

    const render = () => {
      row.innerHTML = "";
      values.forEach((v) => {
        const bar = document.createElement("div");
        bar.style.background = "var(--accent)";
        bar.style.height = `${v * 1.6}px`;
        bar.style.width = "20px";
        bar.style.borderRadius = "4px 4px 0 0";
        bar.style.transition = "height 0.1s";
        row.appendChild(bar);
      });
    };

    const step = () => {
      if (values[j] > values[j + 1]) {
        [values[j], values[j + 1]] = [values[j + 1], values[j]];
      }
      j += 1;
      if (j >= values.length - i - 1) {
        j = 0;
        i += 1;
      }
      render();
    };

    mount.querySelector("#sort-step").addEventListener("click", step);
    mount.querySelector("#sort-shuffle").addEventListener("click", () => {
      values.sort(() => Math.random() - 0.5);
      i = 0;
      j = 0;
      render();
    });

    render();
  };

  const memoryApp = () => {
    const icons = ["🌙", "⭐", "⚡", "🌿", "🔥", "🌊", "🪐", "🎲"];
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    let first = null;
    let lock = false;

    setHTML(`
      <div class="tile-grid" id="memory-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:0.75rem;margin-bottom:1rem"></div>
      <div id="memory-status" style="text-align:center;color:var(--muted)">Find the matching pairs.</div>
    `);

    const grid = mount.querySelector("#memory-grid");
    const status = mount.querySelector("#memory-status");

    deck.forEach((icon, idx) => {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.style.aspectRatio = "1";
      tile.style.fontSize = "1.5rem";
      tile.dataset.icon = icon;
      tile.dataset.index = idx;
      tile.textContent = "?";
      tile.addEventListener("click", () => {
        if (lock || tile.textContent !== "?") return;
        tile.textContent = icon;
        if (!first) {
          first = tile;
          return;
        }
        lock = true;
        if (first.dataset.icon === tile.dataset.icon) {
          status.textContent = "Matched!";
          first = null;
          lock = false;
        } else {
          status.textContent = "Try again.";
          setTimeout(() => {
            first.textContent = "?";
            tile.textContent = "?";
            first = null;
            lock = false;
          }, 600);
        }
      });
      grid.appendChild(tile);
    });
  };

  const mathSprintApp = () => {
    let score = 0;
    let current = null;

    setHTML(`
      <div class="app-card" style="text-align:center;padding:2rem">
        <div class="control-row" style="justify-content:space-between;margin-bottom:2rem;color:var(--muted);font-size:0.9rem">
          <div>Math Sprint</div>
          <div id="math-score">Score: 0</div>
        </div>
        <div id="math-question" style="font-size:3rem;font-weight:800;margin-bottom:2rem"></div>
        <div class="control-row" style="justify-content:center;gap:0.5rem;margin-bottom:1rem">
          <input class="input" id="math-input" type="number" style="width:100px;text-align:center;font-size:1.2rem" autofocus />
          <button class="btn" id="math-submit">Submit</button>
        </div>
        <div id="math-feedback" style="height:1.5rem;color:var(--muted)"></div>
      </div>
    `);

    const question = mount.querySelector("#math-question");
    const scoreEl = mount.querySelector("#math-score");
    const input = mount.querySelector("#math-input");
    const feedback = mount.querySelector("#math-feedback");

    const next = () => {
      const a = Math.floor(2 + Math.random() * 30);
      const b = Math.floor(2 + Math.random() * 20);
      const ops = ["+", "-", "×"];
      const op = ops[Math.floor(Math.random() * ops.length)];
      current = { a, b, op, answer: op === "+" ? a + b : op === "-" ? a - b : a * b };
      question.textContent = `${a} ${op} ${b}`;
      input.value = "";
    };

    mount.querySelector("#math-submit").addEventListener("click", () => {
      const val = Number(input.value);
      if (val === current.answer) {
        score += 1;
        feedback.textContent = "Correct!";
      } else {
        feedback.textContent = `Close — ${current.answer} was the answer.`;
      }
      scoreEl.textContent = `Score: ${score}`;
      next();
    });

    next();
  };

  const brainwaveApp = () => {
    const presets = {
      gamma: { label: "Gamma", base: 220, beat: 41.6, desc: "Peak focus, cognitive energy, binding." },
      beta: { label: "Beta", base: 200, beat: 20, desc: "Focus, active thinking, alertness." },
      alpha: { label: "Alpha", base: 180, beat: 10, desc: "Relaxation, pre-sleep, lucid calm." },
      theta: { label: "Theta", base: 140, beat: 6, desc: "Deep meditation, REM sleep, flow." },
      delta: { label: "Delta", base: 100, beat: 2, desc: "Deep sleep, healing, detachment." },
      epsilon: { label: "Epsilon", base: 70, beat: 0.2, desc: "Suspended state, profound stillness." },
    };
    let active = "beta";
    let ctx = null;
    let oscL = null;
    let oscR = null;
    let gain = null;
    let noiseNode = null;
    let noiseGain = null;
    let whiteNode = null;
    let whiteGain = null;
    let analyser = null;
    let dataArray = null;
    let timer = null;
    let timeLeft = 0;
    let playing = false;

    setHTML(`
      <div class="app-card">
        <div class="control-row" style="justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h3 style="margin:0">Brainwave Tuner</h3>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="btn btn-ghost" id="bw-zen" style="font-size:0.7rem;padding:4px 8px;height:auto">Zen Mode</button>
            <span style="font-size:0.7rem;background:var(--muted);color:#fff;padding:2px 6px;border-radius:4px;opacity:0.7">Headphones Required</span>
          </div>
        </div>
        <div id="bw-main-ui">
        <div class="control-row" style="margin-bottom:1.5rem;gap:0.5rem;flex-wrap:wrap">
          ${Object.keys(presets).map((k) => 
            `<button class="btn btn-ghost ${k === active ? 'is-active' : ''}" data-wave="${k}" style="flex:1;border:1px solid currentColor">${presets[k].label}</button>`
          ).join("")}
        </div>
        <div style="text-align:center;margin-bottom:2rem">
          <div style="font-size:3.5rem;font-weight:800;line-height:1" id="bw-freq">${presets[active].beat} Hz</div>
          <div style="color:var(--muted);margin-top:0.5rem" id="bw-desc">${presets[active].desc}</div>
          <div id="bw-timer-display" style="font-size:1.2rem;color:var(--accent);margin-top:0.5rem;height:1.5rem;font-weight:700"></div>
        </div>
        </div>
        <canvas id="bw-vis" width="600" height="100" style="width:100%;height:80px;background:rgba(0,0,0,0.05);border-radius:8px;margin-bottom:1.5rem;transition:height 0.3s ease"></canvas>
        <div id="bw-controls-ui">
        <div class="control-row" style="margin-bottom:1rem">
          <button class="btn" id="bw-toggle" style="flex:1;height:48px;font-size:1.1rem">Play</button>
          <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
            <label style="font-size:0.8rem;color:var(--muted)">Binaural Volume</label>
            <input type="range" id="bw-vol" min="0" max="100" value="20" style="width:100%" />
          </div>
        </div>
        <div class="control-row" style="margin-bottom:1rem; flex-wrap:wrap; gap:1rem">
           <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;min-width:120px">
            <label style="font-size:0.8rem;color:var(--muted)">Pink Noise</label>
            <input type="range" id="bw-noise" min="0" max="100" value="0" style="width:100%" />
          </div>
           <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;min-width:120px">
            <label style="font-size:0.8rem;color:var(--muted)">White Noise (Masking)</label>
            <input type="range" id="bw-white" min="0" max="100" value="0" style="width:100%" />
          </div>
        </div>
        <div class="control-row" style="margin-bottom:1rem">
           <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
            <label style="font-size:0.8rem;color:var(--muted)">Timer</label>
            <select id="bw-timer-select" class="input" style="padding:4px;height:32px;font-size:0.9rem">
                <option value="0">Infinite</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
            </select>
          </div>
        </div>
        </div>
      </div>
    `);

    const toggleBtn = mount.querySelector("#bw-toggle");
    const zenBtn = mount.querySelector("#bw-zen");
    const mainUi = mount.querySelector("#bw-main-ui");
    const controlsUi = mount.querySelector("#bw-controls-ui");
    const volSlider = mount.querySelector("#bw-vol");
    const noiseSlider = mount.querySelector("#bw-noise");
    const whiteSlider = mount.querySelector("#bw-white");
    const timerSelect = mount.querySelector("#bw-timer-select");
    const timerDisplay = mount.querySelector("#bw-timer-display");
    const freqDisplay = mount.querySelector("#bw-freq");
    const descDisplay = mount.querySelector("#bw-desc");
    const canvas = mount.querySelector("#bw-vis");
    const cCtx = canvas.getContext("2d");
    let animationFrame;

    zenBtn.addEventListener("click", () => {
      const isZen = zenBtn.classList.contains("is-active");
      if (isZen) {
        zenBtn.classList.remove("is-active");
        zenBtn.textContent = "Zen Mode";
        mainUi.style.display = "block";
        controlsUi.style.display = "block";
        canvas.style.height = "80px";
      } else {
        zenBtn.classList.add("is-active");
        zenBtn.textContent = "Exit Zen";
        mainUi.style.display = "none";
        controlsUi.style.display = "none";
        canvas.style.height = "400px";
      }
    });

    const savedTimer = localStorage.getItem("bw-timer");
    if (savedTimer) timerSelect.value = savedTimer;
    timerSelect.addEventListener("change", () => localStorage.setItem("bw-timer", timerSelect.value));

    const createPinkNoise = (ctx) => {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; 
            b6 = white * 0.115926;
        }
        return buffer;
    };

    const createWhiteNoise = (ctx) => {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.5;
        }
        return buffer;
    };

    const stop = () => {
      if (oscL) { oscL.stop(); oscL.disconnect(); oscL = null; }
      if (oscR) { oscR.stop(); oscR.disconnect(); oscR = null; }
      if (noiseNode) { noiseNode.stop(); noiseNode.disconnect(); noiseNode = null; }
      if (whiteNode) { whiteNode.stop(); whiteNode.disconnect(); whiteNode = null; }
      if (gain) { gain.disconnect(); gain = null; }
      if (noiseGain) { noiseGain.disconnect(); noiseGain = null; }
      if (whiteGain) { whiteGain.disconnect(); whiteGain = null; }
      if (analyser) { analyser.disconnect(); analyser = null; }
      playing = false;
      toggleBtn.textContent = "Play";
      toggleBtn.classList.remove("btn-ghost");
      cancelAnimationFrame(animationFrame);
      cCtx.clearRect(0, 0, canvas.width, canvas.height);
      if (timer) { clearInterval(timer); timer = null; }
      timerDisplay.textContent = "";
    };

    const start = () => {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      stop();

      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.connect(ctx.destination);

      const p = presets[active];
      gain = ctx.createGain();
      gain.gain.value = (volSlider.value / 100) * 0.1;
      gain.connect(analyser);
      const merger = ctx.createChannelMerger(2);
      merger.connect(gain);
      oscL = ctx.createOscillator(); oscL.type = "sine"; oscL.frequency.value = p.base; oscL.connect(merger, 0, 0);
      oscR = ctx.createOscillator(); oscR.type = "sine"; oscR.frequency.value = p.base + p.beat; oscR.connect(merger, 0, 1);
      oscL.start(); oscR.start();

      // Noise
      noiseGain = ctx.createGain();
      noiseGain.gain.value = (noiseSlider.value / 100) * 0.05;
      noiseGain.connect(analyser);
      const noiseBuffer = createPinkNoise(ctx);
      noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.connect(noiseGain);
      noiseNode.start();

      // White Noise (Hyper-Masking)
      whiteGain = ctx.createGain();
      whiteGain.gain.value = (whiteSlider.value / 100) * 0.05;
      whiteGain.connect(analyser);
      const whiteBuffer = createWhiteNoise(ctx);
      whiteNode = ctx.createBufferSource();
      whiteNode.buffer = whiteBuffer;
      whiteNode.loop = true;
      whiteNode.connect(whiteGain);
      whiteNode.start();

      playing = true;
      toggleBtn.textContent = "Stop";
      toggleBtn.classList.add("btn-ghost");
      draw();

      // Timer
      const mins = parseInt(timerSelect.value);
      if (mins > 0) {
          timeLeft = mins * 60;
          timerDisplay.textContent = formatTime(timeLeft);
          timer = setInterval(() => {
              timeLeft--;
              timerDisplay.textContent = formatTime(timeLeft);
              if (timeLeft <= 0) stop();
          }, 1000);
      }
    };

    toggleBtn.addEventListener("click", () => { if (playing) stop(); else start(); });
    volSlider.addEventListener("input", () => { if (gain) gain.gain.value = (volSlider.value / 100) * 0.1; });
    noiseSlider.addEventListener("input", () => { if (noiseGain) noiseGain.gain.value = (noiseSlider.value / 100) * 0.05; });
    whiteSlider.addEventListener("input", () => { if (whiteGain) whiteGain.gain.value = (whiteSlider.value / 100) * 0.05; });
    mount.querySelectorAll("[data-wave]").forEach((btn) => {
      btn.addEventListener("click", () => {
        mount.querySelectorAll("[data-wave]").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        active = btn.dataset.wave;
        const p = presets[active];
        freqDisplay.textContent = `${p.beat} Hz`; descDisplay.textContent = p.desc;
        if (playing) start();
      });
    });

    const draw = () => {
      if (!playing) return;
      animationFrame = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      cCtx.clearRect(0, 0, canvas.width, canvas.height);
      cCtx.beginPath(); cCtx.strokeStyle = "#3b82f6"; cCtx.lineWidth = 2;
      
      const sliceWidth = canvas.width * 1.0 / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) cCtx.moveTo(x, y); else cCtx.lineTo(x, y);
        x += sliceWidth;
      }
      cCtx.stroke();
    };
  };

  const apps = {
    timer: timerApp,
    pomodoro: timerApp,
    journal: journalApp,
    quiz: quizApp,
    flashcards: flashcardApp,
    scramble: scrambleApp,
    typing: typingApp,
    converter: converterApp,
    color: colorMixerApp,
    orbit: orbitApp,
    particles: particlesApp,
    sorting: sortingApp,
    memory: memoryApp,
    math: mathSprintApp,
    brainwave: brainwaveApp,
  };

  if (apps[type]) {
    apps[type]();
  } else {
    setHTML(`<p style="color:var(--muted)">Unknown app type: ${type}</p>`);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function shuffle(word) {
    return word.split("").sort(() => Math.random() - 0.5).join("");
  }

  function calcAccuracy(prompt, typed) {
    let correct = 0;
    for (let i = 0; i < typed.length; i += 1) {
      if (typed[i] === prompt[i]) correct += 1;
    }
    return typed.length ? Math.round((correct / typed.length) * 100) : 100;
  }
})();
