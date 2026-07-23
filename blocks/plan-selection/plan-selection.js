import { readBlockConfig } from "../../scripts/aem.js";
import { normalizeAemPath } from "../../scripts/scripts.js";

function normalizeVariant(value) {
  return String(value || "insurance-plan").trim().toLowerCase();
}

// ============================================================
//  INSURANCE PLAN WIZARD DEFINITION (3 Steps)
// ============================================================
function buildInsurancePlanDef(config = {}) {
  const step1 = {
    id: 'step-1-coverage',
    name: 'step1',
    fieldType: 'panel',
    items: [
      { id: 'step-1-title', fieldType: 'heading', label: { value: 'Are you looking for coverage for yourself or your family?' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'coverageFor', name: 'coverageFor', fieldType: 'radio-group',
        enum: ['myself', 'family'],
        enumNames: ['Myself', 'Family'],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      }
    ],
  };

  const step2 = {
    id: 'step-2-frequency',
    name: 'step2',
    fieldType: 'panel',
    items: [
      { id: 'step-2-title', fieldType: 'heading', label: { value: 'How often do you get care?' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'step-2-sub', fieldType: 'heading', label: { value: 'This includes needing coverage for things like ongoing prescriptions, regular lab tests, etc.' }, appliedCssClassNames: 'wizard-step-subtitle col-12' },
      { id: 'careFrequency', name: 'careFrequency', fieldType: 'radio-group',
        enum: ['never', 'rarely', 'sometimes', 'often'],
        enumNames: ['Never', 'Rarely', 'Sometimes', 'Often'],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      }
    ],
  };

  const step3 = {
    id: 'step-3-preference',
    name: 'step3',
    fieldType: 'panel',
    items: [
      { id: 'step-3-title', fieldType: 'heading', label: { value: 'Would you rather:' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'costPreference', name: 'costPreference', fieldType: 'radio-group',
        enum: ['lower', 'higher'],
        enumNames: [
          'Pay a lower monthly premium and stay in-network for care', 
          'Pay a higher monthly premium and be able to choose any doctor'
        ],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      },
      { id: 'submit-btn', name: 'submitButton', fieldType: 'button', buttonType: 'submit', label: { value: 'Submit' }, appliedCssClassNames: 'submit-wrapper col-12' }
    ],
  };

  return {
    id: 'insurance-plan-form',
    fieldType: 'form',
    appliedCssClassNames: 'plan-selection-form is-wizard',
    items: [
      {
        id: 'panel-wizard', name: 'wizard', fieldType: 'panel',
        ':type': 'fd/panel/wizard',
        items: [step1, step2, step3],
      },
    ],
  };
}

// ============================================================
//  MEDICARE PLAN WIZARD DEFINITION (4 Steps)
// ============================================================
function buildMedicarePlanDef(config = {}) {
  const step1 = {
    id: 'step-1-zip',
    name: 'step1',
    fieldType: 'panel',
    items: [
      { id: 'step-1-title', fieldType: 'heading', label: { value: "Let's get started" }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'step-1-sub', fieldType: 'heading', label: { value: "When choosing your plan, let us know what matters most to you—cost, benefits, or the doctors, medications and facilities you need covered. Based on your selections, we'll show you a list of recommended plans you can choose from before signing up." }, appliedCssClassNames: 'wizard-step-subtitle col-12' },
      { id: 'zipCode', name: 'zipCode', fieldType: 'text-input', label: { value: 'ZIP Code' }, properties: { colspan: 12 }, appliedCssClassNames: 'col-12 center-input' }
    ],
  };

  const step2 = {
    id: 'step-2-payment',
    name: 'step2',
    fieldType: 'panel',
    items: [
      { id: 'step-2-title', fieldType: 'heading', label: { value: 'When you think about your monthly payment, which best describes you?' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'monthlyPaymentPreference', name: 'monthlyPaymentPreference', fieldType: 'radio-group',
        enum: ['lower', 'higher'],
        enumNames: [
          'Pay a lower monthly payment even if it means I have slightly fewer benefits', 
          "I don't mind a higher monthly payment to get more benefits"
        ],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      }
    ],
  };

  const step3 = {
    id: 'step-3-benefits',
    name: 'step3',
    fieldType: 'panel',
    items: [
      { id: 'step-3-title-main', fieldType: 'heading', label: { value: 'Benefits' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'step-3-sub-main', fieldType: 'heading', label: { value: 'Tell us more about what you want your plan to do for you.' }, appliedCssClassNames: 'wizard-step-subtitle col-12' },
      { id: 'step-3-title-sub1', fieldType: 'heading', label: { value: 'Which type of benefits do you want in your plan?' }, appliedCssClassNames: 'wizard-step-subheading col-12' },
      { id: 'preferredBenefits', name: 'preferredBenefits', fieldType: 'radio-group',
        enum: ['all', 'medium', 'basic'],
        enumNames: [
          'I want one convenient plan which bundles all of the benefits from Medicare Parts A , B, and possibly D', 
          'I want a plan that helps fill the gaps by covering costs that Original Medicare does not cover (such as deductibles and coinsurance)',
          'I want a plan which only helps pay the cost of my prescription drugs (Part D only)'
        ],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      },
      { id: 'step-3-title-sub2', fieldType: 'heading', label: { value: "Are there optional benefits that you'd like to add to your plan?" }, appliedCssClassNames: 'wizard-step-subheading col-12' },
      { id: 'additionalBenefits', name: 'additionalBenefits', fieldType: 'checkbox', label: { value: 'I need vision and/or dental options' }, enum: ['true'], type: 'string', appliedCssClassNames: 'col-12', properties: { colspan: 12 } }
    ],
  };

  const step4 = {
    id: 'step-4-access',
    name: 'step4',
    fieldType: 'panel',
    items: [
      { id: 'step-4-title-main', fieldType: 'heading', label: { value: 'Access to Care' }, appliedCssClassNames: 'wizard-step-title col-12' },
      { id: 'step-4-sub-main', fieldType: 'heading', label: { value: 'Tell us when and where you want to access healthcare.' }, appliedCssClassNames: 'wizard-step-subtitle col-12' },
      { id: 'step-4-title-sub', fieldType: 'heading', label: { value: 'Which best describes you?' }, appliedCssClassNames: 'wizard-step-subheading col-12' },
      { id: 'networkPreference', name: 'networkPreference', fieldType: 'radio-group',
        enum: ['network', 'any'],
        enumNames: [
          "I don't mind selecting from a network of doctors and facilities that accept Medicare patients", 
          'I want the flexibility to go to any facility, doctor, or specialist that accepts Medicare patients.'
        ],
        properties: { alignment: 'vertical', colspan: 12 },
        appliedCssClassNames: 'col-12' 
      },
      { id: 'submit-btn', name: 'submitButton', fieldType: 'button', buttonType: 'submit', label: { value: 'Submit' }, appliedCssClassNames: 'submit-wrapper col-12' }
    ],
  };

  return {
    id: 'medicare-plan-form',
    fieldType: 'form',
    appliedCssClassNames: 'plan-selection-form is-wizard',
    items: [
      {
        id: 'panel-wizard', name: 'wizard', fieldType: 'panel',
        ':type': 'fd/panel/wizard',
        items: [step1, step2, step3, step4],
      },
    ],
  };
}

// ============================================================
//  WIZARD STEP INDICATOR
// ============================================================
function setupWizardStepIndicator(block) {
  const wizard = block.querySelector('form .wizard');
  if (!wizard) return;

  const totalSteps = wizard.querySelectorAll('.panel-wrapper').length;
  const btnWrapper = wizard.querySelector('.wizard-button-wrapper');
  if (!btnWrapper || totalSteps === 0) return;

  const progressWrapper = document.createElement('div');
  progressWrapper.className = 'wizard-progress-wrapper';
  
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'wizard-dots';

  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = 'wizard-dot';
    dotsContainer.appendChild(dot);
  }

  progressWrapper.appendChild(dotsContainer);

  const updateDots = () => {
    const current = wizard.querySelector('.current-wizard-step');
    const idx = current ? parseInt(current.dataset.index, 10) : 0;
    dotsContainer.querySelectorAll('.wizard-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i <= idx);
    });
  };

  updateDots();
  wizard.addEventListener('wizard:navigate', updateDots);

  // Position the progress indicator logically inside the button wrapper
  const nextBtn = btnWrapper.querySelector('.wizard-button-next, [id*="wizard-button-next"]');
  if (nextBtn) btnWrapper.insertBefore(progressWrapper, nextBtn);
  else btnWrapper.appendChild(progressWrapper);

  // Move the submit button into the button wrapper logic if necessary
  const submitWrapper = wizard.querySelector('.submit-wrapper');
  if (submitWrapper) btnWrapper.appendChild(submitWrapper);
}

// ============================================================
//  SUBMIT HANDLER
// ============================================================
function attachSubmitHandler(block, config) {
  const form = block.querySelector('form');
  if (!form) return;

  const redirectUrl = config.redirecturl || config.redirectUrl;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {};
    
    // Collect data mapping correctly based on input type
    form.querySelectorAll('input, select, textarea').forEach((el) => {
      const name = el.getAttribute('name');
      if (name) {
        if (el.type === 'radio' && el.checked) formData[name] = el.value;
        else if (el.type === 'checkbox') formData[name] = el.checked;
        else if (el.type !== 'radio' && el.type !== 'checkbox') formData[name] = el.value;
      }
    });

    try {
      // Store result logic - customizable per project needs
      localStorage.setItem("project_plan_selection", JSON.stringify(formData));

      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
      }

      // Redirect logic
      const redirectTo = normalizeAemPath(redirectUrl);
      if (redirectTo) {
        setTimeout(() => { window.location.href = redirectTo; }, 1000);
      } else {
        alert("Success! Form submitted.");
        if (submitBtn) {
          submitBtn.textContent = 'Submit';
          submitBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error("Plan selection submit error:", error);
    }
  });
}

// ============================================================
//  DECORATE
// ============================================================
export default async function decorate(block) {
  const config = readBlockConfig(block) || {};
  const variant = normalizeVariant(config.variant);

  // Hide authored rows
  [...block.children].forEach((row) => { row.style.display = 'none'; });

  // Generate Heading
  const headingText = config.formHeading || config.formheading || "Which type of health insurance should I get?";
  const subtitleText = config.formSubtitle || config.formsubtitle || "Take our free, short quiz to learn which type of health insurance might be best for you!";
  
  const headerDiv = document.createElement('div');
  headerDiv.className = 'plan-selection-header';
  headerDiv.innerHTML = `
    <h1>${headingText}</h1>
    <p>${subtitleText}</p>
  `;

  // Build the Form definition based on variant
  const formDef = variant === 'medicare-plan' ? buildMedicarePlanDef(config) : buildInsurancePlanDef(config);
  
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';

  // Output JSON payload to trigger the form module logic
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = JSON.stringify(formDef);
  pre.append(code);
  formContainer.append(pre);
  
  block.replaceChildren(headerDiv, formContainer);

  // Import headless AEM form module to construct the DOM
  const formModule = await import('../form/form.js');
  await formModule.default(formContainer);

  setTimeout(() => {
    setupWizardStepIndicator(block);
    attachSubmitHandler(block, config);
  }, 100);
}