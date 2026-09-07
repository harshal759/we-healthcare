import { readBlockConfig } from '../../scripts/aem.js';
import { normalizeAemPath } from '../../scripts/scripts.js';
import { dispatchCustomEvent } from '../../scripts/custom-events.js';
import { submitToWebhook, fetchButtonDataSheet } from '../../scripts/form-data-layer.js';

const TOTAL_STEPS = 4;
const DEFAULT_TIME_SLOTS = ['9 AM', '10 AM', '11 AM', '12 AM'];
const DEFAULT_DAYS_SHOWN = 3;
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const NAV_ARROW_ICON = `
  <svg viewBox="0 0 36 36" focusable="false" aria-hidden="true" role="img">
    <path fill-rule="evenodd" d="M24,18v0a1.988,1.988,0,0,1-.585,1.409l-7.983,7.98a2,2,0,1,1-2.871-2.772l.049-.049L19.181,18l-6.572-6.57a2,2,0,0,1,2.773-2.87l.049.049,7.983,7.98A1.988,1.988,0,0,1,24,18Z"></path>
  </svg>
`;

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function parseList(value, fallback) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function applyButtonConfigToButton(button, config) {
  if (!button) return;
  const eventType = config.buttoneventtype;
  if (eventType && String(eventType).trim()) button.dataset.buttonEventType = String(eventType).trim();
  const webhookUrl = config.buttonwebhookurl;
  if (webhookUrl && String(webhookUrl).trim()) button.dataset.buttonWebhookUrl = String(webhookUrl).trim();
  const formId = config.buttonformid;
  if (formId && String(formId).trim()) button.dataset.buttonFormId = String(formId).trim();
  const buttonData = config.buttondata;
  if (buttonData && String(buttonData).trim()) button.dataset.buttonData = String(buttonData).trim();
}

async function triggerButtonTracking(button) {
  const buttonDataUrl = button?.dataset?.buttonData?.trim();
  if (buttonDataUrl && typeof window.updateDataLayer === 'function') {
    const sheetData = await fetchButtonDataSheet(normalizeAemPath(buttonDataUrl));
    if (sheetData) window.updateDataLayer(sheetData);
  }
  const eventType = button?.dataset?.buttonEventType?.trim();
  if (eventType) dispatchCustomEvent(eventType);
  const webhookUrl = button?.dataset?.buttonWebhookUrl?.trim();
  const formId = button?.dataset?.buttonFormId?.trim();
  if (webhookUrl) await submitToWebhook(null, webhookUrl, formId);
}

// ── Progress dots ─────────────────────────────────────────────────────────

function buildProgress(stepIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'ho-progress Progress Progress--alignment-center';

  const dots = document.createElement('div');
  dots.className = 'ho-progress-dots Progress__dots';
  for (let i = 0; i < TOTAL_STEPS; i += 1) {
    const dot = document.createElement('div');
    dot.className = `ho-progress-dot Progress__dot${i <= stepIndex ? ' active' : ''}`;
    dots.append(dot);
  }

  const label = document.createElement('div');
  label.className = 'ho-progress-label Progress__label';
  label.textContent = `${stepIndex + 1}/${TOTAL_STEPS} step`;

  wrapper.append(dots, label);
  return wrapper;
}

// ── Step 1: Upload your photo ────────────────────────────────────────────

function renderStep1(state, config, goNext) {
  const step = document.createElement('div');
  step.className = 'ho-step ho-step-photo';

  const title = document.createElement('h1');
  title.className = 'ho-title';
  title.textContent = 'Upload your photo';

  const frame = document.createElement('div');
  frame.className = 'ho-photo-frame';
  frame.innerHTML = `
    <span class="ho-photo-corner ho-photo-corner-tl"></span>
    <span class="ho-photo-corner ho-photo-corner-tr"></span>
    <span class="ho-photo-corner ho-photo-corner-bl"></span>
    <span class="ho-photo-corner ho-photo-corner-br"></span>
    <svg class="ho-photo-placeholder" viewBox="0 0 100 100" focusable="false" aria-hidden="true">
      <path d="M50 15a18 18 0 1 1 0 36 18 18 0 0 1 0-36Z" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M20 88c2-20 15-32 30-32s28 12 30 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `;

  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.capture = 'user';
  cameraInput.className = 'ho-visually-hidden';

  const galleryInput = document.createElement('input');
  galleryInput.type = 'file';
  galleryInput.accept = 'image/*';
  galleryInput.className = 'ho-visually-hidden';

  const onFileChosen = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.photo = reader.result;
      frame.querySelector('.ho-photo-placeholder')?.remove();
      frame.querySelectorAll('img.ho-photo-preview').forEach((img) => img.remove());
      const img = document.createElement('img');
      img.className = 'ho-photo-preview';
      img.src = reader.result;
      img.alt = 'Uploaded photo preview';
      frame.append(img);
    };
    reader.readAsDataURL(file);
  };

  cameraInput.addEventListener('change', () => onFileChosen(cameraInput.files?.[0]));
  galleryInput.addEventListener('change', () => onFileChosen(galleryInput.files?.[0]));

  const takePhotoBtn = document.createElement('button');
  takePhotoBtn.type = 'button';
  takePhotoBtn.className = 'ho-btn ho-btn-primary';
  takePhotoBtn.textContent = 'Take a Photo';
  takePhotoBtn.addEventListener('click', () => cameraInput.click());

  const galleryBtn = document.createElement('button');
  galleryBtn.type = 'button';
  galleryBtn.className = 'ho-link-btn';
  galleryBtn.textContent = 'Or choose from the gallery';
  galleryBtn.addEventListener('click', () => galleryInput.click());

  const error = document.createElement('p');
  error.className = 'ho-error';
  error.hidden = true;
  error.textContent = 'Please upload a photo to continue.';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'ho-btn ho-btn-primary ho-btn-next';
  nextBtn.textContent = config['step1-next-label'] || 'Next';
  nextBtn.addEventListener('click', () => {
    if (!state.photo) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    goNext();
  });

  step.append(title, frame, cameraInput, galleryInput, takePhotoBtn, galleryBtn, error, nextBtn);
  return step;
}

// ── Step 2: Schedule 1st check-up ────────────────────────────────────────

function buildSlotPicker(config, state) {
  const dailyOptions = parseList(config['time-slots'], DEFAULT_TIME_SLOTS);
  const daysShown = parseInt(config['days-shown'], 10) || DEFAULT_DAYS_SHOWN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slotData = {};

  const wrapper = document.createElement('div');
  wrapper.className = 'ho-slot-picker';

  const content = document.createElement('div');
  content.className = 'ho-slot-picker-content';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'ho-slot-nav ho-slot-nav-prev';
  prevBtn.setAttribute('aria-label', 'Previous days');
  prevBtn.innerHTML = NAV_ARROW_ICON;

  const columnsEl = document.createElement('div');
  columnsEl.className = 'ho-slot-columns';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'ho-slot-nav';
  nextBtn.setAttribute('aria-label', 'Next days');
  nextBtn.innerHTML = NAV_ARROW_ICON;

  content.append(prevBtn, columnsEl, nextBtn);
  wrapper.append(content);

  let dateOffset = 0;

  function getOrCreateDayData(date) {
    const key = date.toDateString();
    if (!slotData[key]) {
      slotData[key] = {
        key,
        dayName: SHORT_DAY_NAMES[date.getDay()],
        day: date.getDate(),
        monthName: SHORT_MONTH_NAMES[date.getMonth()],
        options: dailyOptions.map((opt) => ({
          value: `${key} - ${opt}`,
          label: opt,
          disabled: Math.random() > 0.7,
        })),
      };
    }
    return slotData[key];
  }

  function render() {
    columnsEl.innerHTML = '';
    for (let i = 0; i < daysShown; i += 1) {
      const date = addDays(today, dateOffset + i);
      const col = getOrCreateDayData(date);

      const colEl = document.createElement('div');
      colEl.className = 'ho-slot-column';

      const header = document.createElement('div');
      header.className = 'ho-slot-col-header';
      header.innerHTML = `<strong>${col.dayName}</strong><em>${col.day} ${col.monthName}</em>`;
      colEl.append(header);

      col.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.label;
        btn.className = 'ho-slot-option'
          + (opt.disabled ? ' is-disabled' : '')
          + (state.selectedSlot === opt.value ? ' is-selected' : '');
        if (!opt.disabled) {
          btn.addEventListener('click', () => {
            state.selectedSlot = opt.value;
            render();
          });
        }
        colEl.append(btn);
      });

      columnsEl.append(colEl);
    }
    prevBtn.disabled = dateOffset <= 0;
  }

  prevBtn.addEventListener('click', () => { dateOffset = Math.max(0, dateOffset - daysShown); render(); });
  nextBtn.addEventListener('click', () => { dateOffset += daysShown; render(); });

  render();
  return wrapper;
}

function renderStep2(state, config, goNext) {
  const step = document.createElement('div');
  step.className = 'ho-step ho-step-schedule';

  const title = document.createElement('h2');
  title.className = 'ho-title';
  title.textContent = 'Schedule 1st check-up';

  const card = document.createElement('div');
  card.className = 'ho-doctor-card';
  const rating = Math.min(5, Math.max(0, parseInt(config['doctor-rating'], 10) || 5));
  const doctorPhoto = config['doctor-photo'] || '';
  card.innerHTML = `
    <div class="ho-doctor-photo">${doctorPhoto ? `<img src="${doctorPhoto}" alt="${config['doctor-name'] || 'Doctor'}">` : ''}</div>
    <div class="ho-doctor-info">
      <div class="ho-doctor-rating" aria-label="${rating} out of 5 stars">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
      <p class="ho-doctor-title">${config['doctor-title'] || 'Doctor'}</p>
      <p class="ho-doctor-name">${config['doctor-name'] || 'Dr. Verma, MD'}</p>
      <a class="ho-doctor-profile-link" href="${config['doctor-profile-url'] || '#'}">Doctor's Profile</a>
    </div>
  `;

  const pickDateLabel = document.createElement('p');
  pickDateLabel.className = 'ho-pick-date-label';
  pickDateLabel.textContent = 'Pick the date';

  const slotPicker = buildSlotPicker(config, state);

  const error = document.createElement('p');
  error.className = 'ho-error';
  error.hidden = true;
  error.textContent = 'Please select an available day and time.';

  const scheduleBtn = document.createElement('button');
  scheduleBtn.type = 'button';
  scheduleBtn.className = 'ho-btn ho-btn-primary';
  scheduleBtn.textContent = config['step2-next-label'] || 'Schedule Appointment';
  scheduleBtn.addEventListener('click', () => {
    if (!state.selectedSlot) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    goNext();
  });

  step.append(title, card, pickDateLabel, slotPicker, error, scheduleBtn);
  return step;
}

// ── Step 3: Transfer Prescriptions ───────────────────────────────────────

function renderStep3(state, config, goNext) {
  const step = document.createElement('div');
  step.className = 'ho-step ho-step-transfer';

  const title = document.createElement('h2');
  title.className = 'ho-title';
  title.textContent = 'Transfer Prescriptions';

  const documentName = config['document-name'] || 'PrescriptionTransferForm';
  const tosUrl = config['tos-url'] || '#';
  const privacyUrl = config['privacy-url'] || '#';

  const panel = document.createElement('div');
  panel.className = 'ho-sign-panel';
  panel.innerHTML = `
    <div class="ho-sign-header">
      <button type="button" class="ho-sign-options">Options ⌄</button>
      <span class="ho-sign-doc-name">Please sign: ${documentName}</span>
      <span class="ho-sign-required">Next required field <b>2</b></span>
    </div>
    <div class="ho-sign-body">
      <button type="button" class="ho-sign-start">Start</button>
      <p class="ho-sign-status">Document loading&hellip;</p>
    </div>
    <div class="ho-sign-footer">
      <p class="ho-sign-consent">By clicking continue, I acknowledge that I have read and agree to the Adobe
        <a href="${tosUrl}">Terms of Use</a>. See our <a href="${privacyUrl}">Privacy Policy</a> for details on our
        privacy practices.</p>
      <button type="button" class="ho-btn ho-btn-primary ho-sign-continue">Continue</button>
    </div>
  `;

  panel.querySelector('.ho-sign-start').addEventListener('click', () => {
    panel.querySelector('.ho-sign-status').textContent = 'Document loaded. Please review and sign below.';
  });

  panel.querySelector('.ho-sign-continue').addEventListener('click', () => {
    state.signed = true;
    panel.querySelector('.ho-sign-status').textContent = `✓ ${documentName} signed`;
    panel.classList.add('is-signed');
  });

  const error = document.createElement('p');
  error.className = 'ho-error';
  error.hidden = true;
  error.textContent = 'Please sign the document to continue.';

  const enrollBtn = document.createElement('button');
  enrollBtn.type = 'button';
  enrollBtn.className = 'ho-btn ho-btn-primary';
  enrollBtn.textContent = config['step3-next-label'] || 'Enroll in Wellness Program';
  enrollBtn.addEventListener('click', () => {
    if (!state.signed) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    goNext();
  });

  step.append(title, panel, error, enrollBtn);
  return step;
}

// ── Step 4: Enroll in Wellness Program ───────────────────────────────────

function renderStep4(state, config, goNext) {
  const step = document.createElement('div');
  step.className = 'ho-step ho-step-wellness';

  const title = document.createElement('h2');
  title.className = 'ho-title ho-title-left';
  title.textContent = 'Enroll in Wellness Program';

  const greetingName = config['greeting-name'] || 'Sarah';
  const steps = config['steps-count'] || '912';
  const sleepHours = config['sleep-hours'] || '7.15';
  const sleepGoal = config['sleep-goal-percent'] || '82';
  const sleepGoalHours = config['sleep-goal-hours'] || '9';
  const heartBpm = config['heart-bpm'] || '71';
  const activities = parseList(config.activities, ['Cycling: 15 miles', 'Yoga: 40 min', 'Jumping Jacks: 20', 'Meditation: 25 min']);

  const greeting = document.createElement('div');
  greeting.className = 'ho-greeting-card';
  greeting.innerHTML = `
    <p class="ho-greeting-today">Today</p>
    <p class="ho-greeting-name">Good day, ${greetingName}!</p>
    <a class="ho-greeting-link" href="#">See your daily challenges</a>
  `;

  const stats = document.createElement('div');
  stats.className = 'ho-stats-grid';
  stats.innerHTML = `
    <div class="ho-stat-card ho-stat-walk">
      <p class="ho-stat-label">Walk</p>
      <div class="ho-stat-ring" style="--ho-ring-value:${Math.min(100, Math.round((steps / 10000) * 100))}">
        <span>${steps}</span>
        <em>Steps</em>
      </div>
    </div>
    <div class="ho-stat-card ho-stat-sleep">
      <p class="ho-stat-label">Sleep</p>
      <p class="ho-stat-warning">Not enough sleep today</p>
      <p class="ho-stat-value">${sleepHours}<span>Hours</span></p>
      <div class="ho-stat-badge">${sleepGoal}%<em>Sleep Goal<br>${sleepGoalHours}hr</em></div>
    </div>
    <div class="ho-stat-card ho-stat-heart">
      <p class="ho-stat-label">Heart</p>
      <p class="ho-stat-value">${heartBpm}<span>bpm</span></p>
    </div>
    <div class="ho-stat-card ho-stat-training">
      <p class="ho-stat-label">Training</p>
      <p class="ho-stat-caption">Planned Activities: ${activities.length}</p>
      <ul class="ho-stat-activities">${activities.map((a) => `<li>${a}</li>`).join('')}</ul>
      <p class="ho-stat-progress"><strong>0</strong> Min <a href="#">START ›</a></p>
    </div>
  `;

  const prescriptionsHeading = document.createElement('p');
  prescriptionsHeading.className = 'ho-prescriptions-heading';
  prescriptionsHeading.textContent = 'Active Prescriptions';

  const prescriptionsList = document.createElement('ul');
  prescriptionsList.className = 'ho-prescriptions-list';

  function renderPrescriptions() {
    prescriptionsList.innerHTML = '';
    state.prescriptions.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'ho-prescription-item';
      li.innerHTML = `<span>${item}</span>`;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'ho-prescription-remove';
      removeBtn.setAttribute('aria-label', `Remove ${item}`);
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => {
        state.prescriptions.splice(index, 1);
        renderPrescriptions();
      });
      li.append(removeBtn);
      prescriptionsList.append(li);
    });
  }
  renderPrescriptions();

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'ho-btn ho-btn-primary ho-btn-confirm';
  confirmBtn.textContent = config['step4-next-label'] || 'Confirm Enrollment';
  applyButtonConfigToButton(confirmBtn, config);
  confirmBtn.addEventListener('click', async () => {
    await triggerButtonTracking(confirmBtn);
    goNext();
  });

  step.append(title, greeting, stats, prescriptionsHeading, prescriptionsList, confirmBtn);
  return step;
}

// ── Step 5: Onboarding complete ──────────────────────────────────────────

function renderComplete(config) {
  const step = document.createElement('div');
  step.className = 'ho-step ho-step-complete';

  const title = document.createElement('h1');
  title.className = 'ho-title';
  title.textContent = config['success-heading'] || 'Onboarding complete';

  const message = document.createElement('p');
  message.className = 'ho-complete-text';
  message.textContent = config['success-message']
    || 'Thank you for completing the onboarding process. You should receive an email with summary and a link to a mobile app which will assist in your Wellness Program.';

  const proceed = document.createElement('p');
  proceed.className = 'ho-complete-text';
  proceed.textContent = 'Proceed to Member Resources to schedule additional appointments and get more information.';

  const memberResourcesBtn = document.createElement('a');
  memberResourcesBtn.className = 'ho-btn ho-btn-primary';
  memberResourcesBtn.href = config['member-resources-url'] || '#';
  memberResourcesBtn.textContent = 'Member Resources';

  step.append(title, message, proceed, memberResourcesBtn);
  return step;
}

// ── decorate ──────────────────────────────────────────────────────────────

export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  block.textContent = '';

  const customClass = config['custom-class']?.trim();
  if (customClass) block.classList.add(...customClass.split(/\s+/));

  const state = {
    step: 0,
    photo: null,
    selectedSlot: '',
    signed: false,
    prescriptions: parseList(config.prescriptions, ['Naproxen 250mg', 'Lisinopril 10mg', 'Levothyroxine 25mg']),
  };

  const progressHolder = document.createElement('div');
  const stepHolder = document.createElement('div');
  stepHolder.className = 'ho-step-holder';
  block.append(progressHolder, stepHolder);

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4];

  function renderCurrentStep() {
    progressHolder.replaceChildren();
    stepHolder.replaceChildren();

    if (state.step >= stepRenderers.length) {
      stepHolder.append(renderComplete(config));
      return;
    }

    progressHolder.append(buildProgress(state.step));
    const goNext = () => {
      state.step += 1;
      renderCurrentStep();
    };
    stepHolder.append(stepRenderers[state.step](state, config, goNext));
  }

  renderCurrentStep();
}
