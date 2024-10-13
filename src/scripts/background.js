chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = message.tabId;

  if (message.action === 'checkAllAccessibility' || message.action === 'checkSpecificAccessibility') {
    console.log(`Ação recebida: ${message.action}, Tab ID: ${tabId}`);

    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['scripts/axe.min.js']
      },
      () => {
        console.log('axe.min.js injetado na aba:', tabId);

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: runAxeAnalysis,
        });
      }
    );

    return true;
  } else if (message.status === "success") {
    return true;
  } else {
    sendResponse({ status: 'error', message: 'Ação não reconhecida.' });
    return true;
  }
});
function runAxeAnalysis() {
  let highlightedElements = [];
  let currentElementIndex = -1;

  axe.run((err, results) => {
    if (err) {
      console.error('Erro ao executar axe-core:', err);
      chrome.runtime.sendMessage({ status: 'error', message: 'Erro ao executar a análise de acessibilidade.' });
      return;
    }

    console.log('Resultados da análise de acessibilidade:', results);
    chrome.runtime.sendMessage({ status: 'success', results: results });

    if (results.violations.length > 0) {
      createNavigationControls();
      createProgressBox();

      const orderedViolations = results.violations.sort((a, b) => {
        const order = ['critical', 'serious', 'moderate', 'minor'];
        return order.indexOf(a.impact) - order.indexOf(b.impact);
      });

      orderedViolations.forEach((violation) => {
        violation.nodes.forEach((node) => {
          const target = node.target[0];
          const element = document.querySelector(target);
          const tooltipContent = createTooltipContent(violation, node);

            highlightedElements.push({
              element: element,
              tooltipContent: tooltipContent,
              violation: violation
            });
        });
      });

      updateProgressBox(highlightedElements,results.violations.length);

      if (highlightedElements.length > 0) {
        navigateToElement(0);
      }

      createMinimizeButton(document.querySelector('.custom-tooltip'));
      createMinimizeButton(document.getElementById('progress-box'));
    
    }
  });

  function createNavigationControls() {
    const controls = document.createElement('div');
    controls.id = 'navigation-controls';
    controls.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1003;
      display: flex;
      gap: 10px;
    `;

    const prevButton = createButton('Anterior', () => navigateToElement(currentElementIndex - 1));
    const minimizeButton = createButton('−', () => toggleMinimizeElements(minimizeButton));
    const nextButton = createButton('Próximo', () => navigateToElement(currentElementIndex + 1));

    controls.appendChild(prevButton);
    controls.appendChild(minimizeButton);
    
    controls.appendChild(nextButton);
    document.body.appendChild(controls);
  }

  function createProgressBox() {
    const progressBox = document.createElement('div');
    progressBox.id = 'progress-box';
    progressBox.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: calc(100vh - 40px);
      overflow-y: auto;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      padding: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1004;
    `;
    document.body.appendChild(progressBox);
  }

  function toggleMinimize(element) {
    element.classList.toggle('minimized');
    const button = element.querySelector('.minimize-button');
    if (element.classList.contains('minimized')) {
      button.innerHTML = '+';
    } else {
      button.innerHTML = '−';
    }
  }

  function createMinimizeButton(parentElement) {
    const button = document.createElement('button');
    button.classList.add('minimize-button');
    button.innerHTML = '−';
    button.addEventListener('click', () => toggleMinimize(parentElement));
    parentElement.appendChild(button);
  }
  
  function updateProgressBox(elements, lengthTotal) {
    const progressBox = document.getElementById('progress-box');
    
    const impactColors = {
      critical: 'red',
      serious: 'orange',
      moderate: 'yellow',
      minor: 'green',
    };
  
    progressBox.innerHTML = `
      <h3>Problemas de Acessibilidade</h3>
      <h4>Quantidade Diretrizes Afetadas: ${lengthTotal}</h4>
      <h4>Quantidade Total: ${elements.length}</h4>
      <ul id="violation-list" style="list-style-type: none; padding: 0;">
        ${elements.map((item, index) => `
          <li data-index="${index}" style="cursor: pointer; padding: 5px 0; display: flex; align-items: center;">
            <button class="impact-button" style="
              background-color: ${impactColors[item.violation.impact]}; 
              color: white; 
              border: none; 
              border-radius: 50%; 
              display: inline-block; 
              padding: 5px; 
              margin-right: 10px; 
              font-weight: bold;
            ">
            </button>
            ${item.violation.help}
          </li>
        `).join('')}
      </ul>
    `;
  
    document.getElementById('violation-list').addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        const index = parseInt(e.target.getAttribute('data-index'));
        navigateToElement(index);
      }
    });
  }

  function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    button.style.cssText = `
      padding: 10px 20px;
      font-size: 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.1s ease;
    `;
    return button;
  }

  function navigateToElement(index) {
    if (currentElementIndex !== -1) {
      const prevElement = highlightedElements[currentElementIndex].element;
      prevElement.classList.remove('highlighted');
      hideTooltip();
    }

    if (index < 0) {
      currentElementIndex = highlightedElements.length - 1;
    } else if (index >= highlightedElements.length) {
      currentElementIndex = 0;
    } else {
      currentElementIndex = index;
    }

    const currentHighlight = highlightedElements[currentElementIndex];
    currentHighlight.element.classList.add('highlighted');
    currentHighlight.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showTooltip(currentHighlight.tooltipContent, currentHighlight.element);

    updateProgressBoxHighlight();
  }

  function updateProgressBoxHighlight() {
    const listItems = document.querySelectorAll('#violation-list li');
    listItems.forEach((item, index) => {
      if (index === currentElementIndex) {
        item.style.fontWeight = 'bold';
        item.style.backgroundColor = '#e6f2ff';
      } else {
        item.style.fontWeight = 'normal';
        item.style.backgroundColor = 'transparent';
      }
    });
  }

  function toggleMinimizeElements(button) {
    const elementsToMinimize = document.querySelectorAll('.custom-tooltip, #progress-box');
  
    elementsToMinimize.forEach((element) => {
      element.classList.toggle('minimized');
    });
  
    if (button.textContent === '−') {
      button.textContent = '+';
      button.title = 'Maximizar';
    } else {
      button.textContent = '−';
      button.title = 'Minimizar';
    }
  }

  function createTooltipContent(violation, node) {
    const impactColors = {
      minor: '#4CAF50',
      moderate: '#FFC107',
      serious: '#FF9800',
      critical: '#F44336'
    };

    directiveLink = getDirectiveLinkFromTag(violation.tags);

    return `
      <h3>${violation.help}</h3>
      <p><strong>Impacto:</strong> <span style="color: ${impactColors[violation.impact]};">${violation.impact.toUpperCase()}</span></p>
      <p><strong>Descrição:</strong> ${violation.description}</p>
      <p><strong>Elemento:</strong> <br><pre><code>${escapeHtml(node.html)}</code></pre></p>
      <p><strong>Diretriz:</strong> ${directiveLink}</p>
      <p><strong>Como corrigir:</strong> ${node.failureSummary}</p>
      <p><a href="${violation.helpUrl}" target="_blank">Mais informações</a></p>
    `;
  }
  function getDirectiveLinkFromTag (tags) {
    const directiveTag = tags.find((tag) => DIRECTIVES.some((directive) => directive.value === tag));

    if (directiveTag) {
      const directive = DIRECTIVES.find((d) => d.value === directiveTag);

      return `<a href="https://www.w3.org/TR/WCAG21/${directive.tag}" target="_blank" rel="noopener noreferrer"> ${directive.label} </a>`;
    }
  
    return `<a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer"> Best Practice </a>`;
  };

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showTooltip(content, element) {
    let tooltip = document.querySelector('.custom-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.classList.add('custom-tooltip');
      document.body.appendChild(tooltip);
    }
    tooltip.innerHTML = content;
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    let left = rect.right + 10;
    let top = rect.top;
    
    if (left + tooltipRect.width > window.innerWidth) {
      left = rect.left - tooltipRect.width - 10;
    }
    
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 10;
    }
    
    // tooltip.style.left = `${left}px`; // Isso aqui navega até o lugar. Deixar
    // tooltip.style.top = `${top}px`; // Isso aqui navega até o lugar. Deixar
    tooltip.style.display = 'block';
  }

  function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }


  const DIRECTIVES = [
    { value: 'wcag1', tag: '#perceivable', label: 'Perceivable' },
    
    { value: 'wcag11', tag: '#text-alternatives', label: 'Text Alternatives' },
    { value: 'wcag111', tag: '#non-text-content', label: 'Non-text Content' },

    { value: 'wcag12', tag: '#time-based-media', label: 'Time-based Media' },
    { value: 'wcag121', tag: '#audio-only-and-video-only-prerecorded', label: 'Audio-only and Video-only (Prerecorded)' },
    { value: "wcag122", tag: "#time-based-media", label: "Time-based Media" },
    { value: "wcag123", tag: "#audio-description-or-media-alternative-prerecorded", label: "Audio Description or Media Alternative (Prerecorded)" },
    { value: "wcag124", tag: "#captions-live", label: "Captions (Live)" },
    { value: "wcag125", tag: "#audio-description-prerecorded", label: "Audio Description (Prerecorded)" },
    { value: "wcag126", tag: "#sign-language-prerecorded", label: "Sign Language (Prerecorded)" },
    { value: "wcag127", tag: "#extended-audio-description-prerecorded", label: "Extended Audio Description (Prerecorded)" },
    { value: "wcag128", tag: "#media-alternative-prerecorded", label: "Media Alternative (Prerecorded)" },
    { value: "wcag129", tag: "#audio-only-live", label: "Audio-only (Live)" },

    { value: "wcag13", tag: "#adaptable", label: "Adaptable" },
    { value: "wcag131", tag: "#info-and-relationships", label: "Info and Relationships" },
    { value: "wcag132", tag: "#meaningful-sequence", label: "Meaningful Sequence" },
    { value: "wcag133", tag: "#sensory-characteristics", label: "Sensory Characteristics" },
    { value: "wcag134", tag: "#orientation", label: "Orientation" },
    { value: "wcag135", tag: "#identify-input-purpose", label: "Identify Input Purpose" },
    { value: "wcag136", tag: "#identify-purpose", label: "Identify Purpose" },

    { value: "wcag14", tag: "#distinguishable", label: "Distinguishable" },
    { value: "wcag141", tag: "#use-of-color", label: "Use of Color" },
    { value: "wcag142", tag: "#audio-control", label: "Audio Control" },
    { value: "wcag143", tag: "#contrast-minimum", label: "Contrast (Minimum)" },
    { value: "wcag144", tag: "#resize-text", label: "Resize Text" },
    { value: "wcag145", tag: "#images-of-text", label: "Images of Text" },
    { value: "wcag146", tag: "#contrast-enhanced", label: "Contrast (Enhanced)" },
    { value: "wcag147", tag: "#low-or-no-background-audio", label: "Low or No Background Audio" },
    { value: "wcag148", tag: "#visual-presentation", label: "Visual Presentation" },
    { value: "wcag149", tag: "#images-of-text-no-exception", label: "Images of Text (No Exception)" },
    { value: "wcag1410", tag: "#reflow", label: "Reflow" },
    { value: "wcag1411", tag: "#non-text-contrast", label: "Non-text Contrast" },
    { value: 'wcag1412', tag: '#text-spacing', label: 'Text Spacing' },
    { value: 'wcag1413', tag: '#content-on-hover-or-focus', label: 'Content on Hover or Focus' },

    { value: 'wcag2', tag: '#operable', label: 'Operable' },
    { value: 'wcag21', tag: '#keyboard-accessible', label: 'Keyboard Accessible' },
    { value: 'wcag211', tag: '#keyboard', label: 'Keyboard' },
    { value: 'wcag212', tag: '#no-keyboard-trap', label: 'No Keyboard Trap' },
    { value: 'wcag213', tag: '#keyboard-no-exception', label: 'Keyboard (No Exception)' },
    { value: 'wcag214', tag: '#character-key-shortcuts', label: 'Character Key Shortcuts' },

    { value: 'wcag22', tag: '#enough-time', label: 'Enough Time' },
    { value: 'wcag221', tag: '#timing-adjustable', label: 'Timing Adjustable' },
    { value: 'wcag222', tag: '#pause-stop-hide', label: 'Pause, Stop, Hide' },
    { value: 'wcag223', tag: '#no-timing', label: 'No Timing' },
    { value: 'wcag224', tag: '#interruptions', label: 'Interruptions' },
    { value: 'wcag225', tag: '#re-authenticating', label: 'Re-authenticating' },
    { value: 'wcag226', tag: '#timeouts', label: 'Timeouts' },

    { value: 'wcag23', tag: '#seizures-and-physical-reactions', label: 'Seizures and Physical Reactions' },
    { value: 'wcag231', tag: '#three-flashes-or-below-threshold', label: 'Three Flashes or Below Threshold' },
    { value: 'wcag232', tag: '#three-flashes', label: 'Three Flashes' },
    { value: 'wcag233', tag: '#animation-from-interactions', label: 'Animation from Interactions' },

    { value: 'wcag24', tag: '#navigable', label: 'Navigable' },
    { value: 'wcag241', tag: '#bypass-blocks', label: 'Bypass Blocks' },
    { value: 'wcag242', tag: '#page-titled', label: 'Page Titled' },
    { value: 'wcag243', tag: '#focus-order', label: 'Focus Order' },
    { value: 'wcag244', tag: '#link-purpose-in-context', label: 'Link Purpose (In Context)' },
    { value: 'wcag245', tag: '#multiple-ways', label: 'Multiple Ways' },
    { value: 'wcag246', tag: '#headings-and-labels', label: 'Headings and Labels' },
    { value: 'wcag247', tag: '#focus-visible', label: 'Focus Visible' },
    { value: 'wcag248', tag: '#location', label: 'Location' },
    { value: 'wcag249', tag: '#link-purpose-link-only', label: 'Link Purpose (Link Only)' },
    { value: 'wcag2410', tag: '#section-headings', label: 'Section Headings' },

    { value: 'wcag25', tag: '#input-modalities', label: 'Input Modalities' },
    { value: 'wcag251', tag: '#pointer-gestures', label: 'Pointer Gestures' },
    { value: 'wcag252', tag: '#pointer-cancellation', label: 'Pointer Cancellation' },
    { value: 'wcag253', tag: '#label-in-name', label: 'Label in Name' },
    { value: 'wcag254', tag: '#motion-actuation', label: 'Motion Actuation' },
    { value: 'wcag255', tag: '#target-size', label: 'Target Size' },
    { value: 'wcag256', tag: '#concurrent-input-mechanisms', label: 'Concurrent Input Mechanisms' },

    { value: 'wcag31', tag: '#readable', label: 'Readable' },
    { value: 'wcag311', tag: '#language-of-page', label: 'Language of Page' },
    { value: 'wcag312', tag: '#language-of-parts', label: 'Language of Parts' },
    { value: 'wcag313', tag: '#unusual-words', label: 'Unusual Words' },
    { value: 'wcag314', tag: '#abbreviations', label: 'Abbreviations' },
    { value: 'wcag315', tag: '#reading-level', label: 'Reading Level' },
    { value: 'wcag316', tag: '#pronunciation', label: 'Pronunciation' },

    { value: 'wcag32', tag: '#predictable', label: 'Predictable' },
    { value: 'wcag321', tag: '#on-focus', label: 'On Focus' },
    { value: 'wcag322', tag: '#on-input', label: 'On Input' },
    { value: 'wcag323', tag: '#consistent-navigation', label: 'Consistent Navigation' },
    { value: 'wcag324', tag: '#consistent-identification', label: 'Consistent Identification' },
    { value: 'wcag325', tag: '#change-on-request', label: 'Change on Request' },

    { value: 'wcag33', tag: '#input-assistance', label: 'Input Assistance' },
    { value: 'wcag331', tag: '#error-identification', label: 'Error Identification' },
    { value: 'wcag332', tag: '#labels-or-instructions', label: 'Labels or Instructions' },
    { value: 'wcag333', tag: '#error-suggestion', label: 'Error Suggestion' },
    { value: 'wcag334', tag: '#error-prevention-legal-financial-data', label: 'Error Prevention (Legal, Financial, Data)' },
    { value: 'wcag335', tag: '#help', label: 'Help' },
    { value: 'wcag336', tag: '#error-prevention-all', label: 'Error Prevention (All)' },

    { value: 'wcag4', tag: '#robust' , label: 'Robust'},
    { value: 'wcag41', tag: '#compatible', label: 'Compatible'},
    { value: 'wcag411', tag: '#parsing', label: 'Parsing'},
    { value: 'wcag412', tag: '#name-role-value', label: 'Name, Role, Value'},
    { value: 'wcag413', tag: '#status-messages', label: 'Status Messages'},

    { value: 'wcag5', tag: '#conformance', label: 'Conformance'},
    { value: 'wcag51', tag: '#interpreting-normative-requirements', label: 'Interpreting Normative Requirements'},
    { value: 'wcag52', tag: '#conformance-reqs', label: 'Conformance Reqs'},
    { value: 'wcag521', tag: '#cc1', label: 'Conformance Level'},
    { value: 'wcag522', tag: '#cc2', label: 'Full pages'},
    { value: 'wcag523', tag: '#cc3', label: 'Complete processes' },
    { value: 'wcag524', tag: '#cc4', label: 'Only Accessibility-Supported Ways of Using Technologies' },
    { value: 'wcag525', tag: '#cc5', label: 'Non-Interference' },
    { value: 'wcag53', tag: '#conformance-claims', label: 'Conformance Claims'},
    { value: 'wcag531', tag: '#conformance-required', label: 'Required Components of a Conformance Claim'},
    { value: 'wcag532', tag: '#conformance-optional', label: 'Optional Components of a Conformance Claim'},
    { value: 'wcag54', tag: '#conformance-partial', label: 'Statement of Partial Conformance - Third Party Content'},
    { value: 'wcag55', tag: '#conformance-partial-lang', label: 'Statement of Partial Conformance - Language'},
  ];
}
